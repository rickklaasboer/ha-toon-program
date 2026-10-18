"""Local HTTP client for the Toon."""

from __future__ import annotations

import json
from typing import Any

import aiohttp

from .program import Program, build_config_xml, parse_program

TIMEOUT = aiohttp.ClientTimeout(total=10)
PROGRAM_ON_STATES = (1, 2)


class ToonApiError(Exception):
    """Toon unreachable, answered an error, or did not apply a change."""


class ToonWriteNotApplied(ToonApiError):
    """Toon answered ok but the read-back differs from what was written."""


class ToonClient:
    def __init__(self, session: aiohttp.ClientSession, host: str, port: int = 80) -> None:
        self._session = session
        self._base = f"http://{host}:{port}"

    async def _get(self, path: str, params: dict[str, Any], *, has_result: bool) -> dict:
        try:
            async with self._session.get(
                f"{self._base}{path}", params=params, timeout=TIMEOUT
            ) as resp:
                resp.raise_for_status()
                text = await resp.text()
        except (aiohttp.ClientError, TimeoutError) as err:
            raise ToonApiError(f"Toon request {path} failed: {err!r}") from err
        try:
            data = json.loads(text)
        except json.JSONDecodeError as err:
            raise ToonApiError(f"Toon request {path} returned invalid JSON") from err
        if not isinstance(data, dict):
            raise ToonApiError(f"Toon request {path} returned unexpected JSON")
        if has_result or "result" in data:
            if data.get("result") != "ok":
                raise ToonApiError(data.get("error", f"Toon request {path} failed: {data}"))
        return data

    async def _tree(self, address: str) -> dict:
        return await self._get(
            "/hcb_config",
            {
                "action": "getObjectConfigTree",
                "package": "happ_thermstat",
                "internalAddress": address,
            },
            has_result=False,
        )

    async def _action(self, action: str, **params: Any) -> dict:
        return await self._get(
            "/happ_thermstat", {"action": action, **params}, has_result=True
        )

    async def get_program(self) -> Program:
        return parse_program(await self._tree("thermostatProgram"))

    async def get_states(self) -> dict[int, float]:
        data = await self._tree("thermostatStates")
        return {
            int(state["id"][0]): int(state["tempValue"][0]) / 100
            for state in data["states"][0]["state"]
        }

    async def get_info(self) -> dict[str, Any]:
        return await self._action("getThermostatInfo")

    async def get_holidays(self) -> list[dict]:
        return (await self._action("GetHolidays"))["entry"]

    async def write_program(self, program: Program) -> None:
        await self._get(
            "/hcb_config",
            {"action": "setObjectConfig", "config": build_config_xml(program)},
            has_result=True,
        )
        stored = await self.get_program()
        if stored.weekly != program.weekly or stored.other_entries != program.other_entries:
            raise ToonWriteNotApplied("Toon did not apply the program")

    async def set_program_enabled(self, enabled: bool, active_state: int) -> None:
        params: dict[str, Any] = {"state": int(enabled)}
        if not enabled and active_state == 4:
            params["temperatureState"] = 1
        await self._action("changeSchemeState", **params)
        info = await self.get_info()
        is_on = int(info["programState"]) in PROGRAM_ON_STATES
        if is_on != enabled:
            raise ToonApiError("Toon did not apply the program state")

    async def set_holiday(
        self, start: int, end: int, temperature: float, entry_id: str | None
    ) -> None:
        params: dict[str, Any] = {
            "startTimeT": start,
            "endTimeT": end,
            "setpoint": round(temperature * 100),
        }
        if entry_id is not None:
            params["entryId"] = entry_id
        await self._action("SetHoliday", **params)
        for holiday in await self.get_holidays():
            if (
                int(holiday["startTimeT"]) == start
                and int(holiday["endTimeT"]) == end
                and (entry_id is None or holiday["entryId"] == entry_id)
            ):
                return
        raise ToonApiError("Toon did not apply the vacation")

    async def remove_holiday(self, entry_id: str) -> None:
        await self._action("RemoveHoliday", entryId=entry_id)
        if any(h["entryId"] == entry_id for h in await self.get_holidays()):
            raise ToonApiError("Toon did not remove the vacation")
