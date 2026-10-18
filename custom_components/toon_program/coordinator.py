"""Polls the Toon and holds the combined program data."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import ToonApiError, ToonClient
from .const import DOMAIN
from .program import Program

_LOGGER = logging.getLogger(__name__)

INFO_FIELDS = ("activeState", "programState", "nextState", "nextTime")

type ToonProgramConfigEntry = ConfigEntry[ToonProgramCoordinator]


@dataclass
class ToonData:
    program: Program
    states: dict[int, float]
    info: dict[str, Any]
    holidays: list[dict]


class ToonProgramCoordinator(DataUpdateCoordinator[ToonData]):
    config_entry: ToonProgramConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ToonProgramConfigEntry,
        client: ToonClient,
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=60),
        )
        self.client = client

    async def _async_update_data(self) -> ToonData:
        try:
            data = ToonData(
                program=await self.client.get_program(),
                states=await self.client.get_states(),
                info=await self.client.get_info(),
                holidays=await self.client.get_holidays(),
            )
        except ToonApiError as err:
            raise UpdateFailed(f"Toon update failed: {err}") from err
        missing = [key for key in INFO_FIELDS if key not in data.info]
        if missing:
            raise UpdateFailed(f"Toon thermostat info lacks {missing}")
        return data
