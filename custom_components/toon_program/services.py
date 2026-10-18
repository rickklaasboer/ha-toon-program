"""Program and vacation services with conflict check and verified writes."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import datetime
import re
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.util import dt as dt_util

from .api import ToonApiError, ToonWriteNotApplied
from .const import DOMAIN, EDITABLE_STATES, STATE_VACATION
from .coordinator import ToonProgramCoordinator
from .program import (
    MINUTES_PER_DAY,
    Program,
    ProgramError,
    copy_day,
    program_hash,
    replace_day,
    validate,
)

TIME_RE = re.compile(r"^(\d{1,2}):(\d{2})$")

DEVICE = {vol.Required("device_id"): cv.string}
DAY = vol.All(vol.Coerce(int), vol.Range(min=0, max=6))
HASH = {vol.Required("program_hash"): cv.string}

SET_DAY_SCHEMA = vol.Schema(
    {
        **DEVICE,
        vol.Required("day"): DAY,
        vol.Required("points"): [
            {vol.Required("time"): cv.string, vol.Required("state"): vol.Coerce(int)}
        ],
        **HASH,
    }
)
COPY_DAY_SCHEMA = vol.Schema(
    {
        **DEVICE,
        vol.Required("source"): DAY,
        vol.Required("targets"): vol.All([DAY], vol.Length(min=1)),
        **HASH,
    }
)
SET_VACATION_SCHEMA = vol.Schema(
    {
        **DEVICE,
        vol.Required("start"): cv.datetime,
        vol.Required("end"): cv.datetime,
        vol.Required("temperature"): vol.All(
            vol.Coerce(float), vol.Range(min=6.0, max=30.0)
        ),
    }
)
REMOVE_VACATION_SCHEMA = vol.Schema({**DEVICE, vol.Required("entry_id"): cv.string})


def _error(key: str, cls: type[HomeAssistantError] = HomeAssistantError) -> HomeAssistantError:
    return cls(translation_domain=DOMAIN, translation_key=key)


def _coordinator(hass: HomeAssistant, device_id: str) -> ToonProgramCoordinator:
    device = dr.async_get(hass).async_get(device_id)
    entry = (
        hass.config_entries.async_get_entry(device.primary_config_entry)
        if device
        else None
    )
    if entry is None or entry.domain != DOMAIN or not hasattr(entry, "runtime_data"):
        raise _error("invalid_device", ServiceValidationError)
    return entry.runtime_data


async def _guarded(coordinator: ToonProgramCoordinator, action: Callable[[], Awaitable[None]]) -> None:
    try:
        async with coordinator.write_lock:
            await action()
    except ProgramError as err:
        raise _error(err.key, ServiceValidationError) from err
    except ToonWriteNotApplied as err:
        raise _error("write_not_applied") from err
    except ToonApiError as err:
        raise _error("cannot_connect") from err
    await coordinator.async_refresh()


async def _fresh_program(coordinator: ToonProgramCoordinator, expected_hash: str) -> Program:
    program = await coordinator.client.get_program()
    if program_hash(program) != expected_hash:
        await coordinator.async_refresh()
        raise _error("program_changed")
    return program


def _parse_points(program: Program, day: int, points: list[dict]) -> list[tuple[int, int]]:
    """Validate submitted points before merging would hide duplicates."""
    vacation_minutes = {
        p.minute for p in program.weekly if p.day == day and p.state == STATE_VACATION
    }
    parsed: list[tuple[int, int]] = []
    for point in points:
        match = TIME_RE.match(point["time"])
        if not match:
            raise ProgramError("invalid_time")
        minute = int(match[1]) * 60 + int(match[2])
        if int(match[2]) > 59 or minute >= MINUTES_PER_DAY:
            raise ProgramError("invalid_time")
        state = point["state"]
        if state not in EDITABLE_STATES and not (
            state == STATE_VACATION and minute in vacation_minutes
        ):
            raise ProgramError("invalid_state")
        parsed.append((minute, point["state"]))
    if len({minute for minute, _ in parsed}) != len(parsed):
        raise ProgramError("duplicate_time")
    return parsed


def _to_timestamp(value: datetime) -> int:
    if value.tzinfo is None:
        value = value.replace(tzinfo=dt_util.get_default_time_zone())
    return int(value.timestamp())


async def _set_day(call: ServiceCall) -> None:
    coordinator = _coordinator(call.hass, call.data["device_id"])

    async def action() -> None:
        program = await _fresh_program(coordinator, call.data["program_hash"])
        points = _parse_points(program, call.data["day"], call.data["points"])
        updated = replace_day(program, call.data["day"], points)
        validate(updated)
        await coordinator.client.write_program(updated)

    await _guarded(coordinator, action)


async def _copy_day(call: ServiceCall) -> None:
    coordinator = _coordinator(call.hass, call.data["device_id"])

    async def action() -> None:
        program = await _fresh_program(coordinator, call.data["program_hash"])
        if any(
            p.day == call.data["source"] and p.state == STATE_VACATION
            for p in program.weekly
        ):
            raise ProgramError("invalid_state")
        updated = copy_day(program, call.data["source"], call.data["targets"])
        validate(updated)
        await coordinator.client.write_program(updated)

    await _guarded(coordinator, action)


async def _set_vacation(call: ServiceCall) -> None:
    coordinator = _coordinator(call.hass, call.data["device_id"])
    start = _to_timestamp(call.data["start"])
    end = _to_timestamp(call.data["end"])
    if end <= start:
        raise _error("end_before_start", ServiceValidationError)

    async def action() -> None:
        holidays = await coordinator.client.get_holidays()
        entry_id = holidays[0]["entryId"] if holidays else None
        await coordinator.client.set_holiday(
            start, end, call.data["temperature"], entry_id
        )

    await _guarded(coordinator, action)


async def _remove_vacation(call: ServiceCall) -> None:
    coordinator = _coordinator(call.hass, call.data["device_id"])

    async def action() -> None:
        holidays = await coordinator.client.get_holidays()
        if not any(h["entryId"] == call.data["entry_id"] for h in holidays):
            raise _error("unknown_vacation", ServiceValidationError)
        await coordinator.client.remove_holiday(call.data["entry_id"])

    await _guarded(coordinator, action)


def async_register_services(hass: HomeAssistant) -> None:
    services: dict[str, tuple[Any, vol.Schema]] = {
        "set_day": (_set_day, SET_DAY_SCHEMA),
        "copy_day": (_copy_day, COPY_DAY_SCHEMA),
        "set_vacation": (_set_vacation, SET_VACATION_SCHEMA),
        "remove_vacation": (_remove_vacation, REMOVE_VACATION_SCHEMA),
    }
    for name, (handler, schema) in services.items():
        hass.services.async_register(DOMAIN, name, handler, schema=schema)
