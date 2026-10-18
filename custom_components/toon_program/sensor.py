"""Week program sensor."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .api import PROGRAM_ON_STATES
from .const import STATE_KEYS, STATE_VACATION
from .coordinator import ToonProgramConfigEntry
from .entity import ToonProgramEntity
from .program import days_view, program_hash

_LOGGER = logging.getLogger(__name__)


def _iso(epoch: str | int) -> str:
    return dt_util.utc_from_timestamp(int(epoch)).isoformat()


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ToonProgramConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([ToonProgramSensor(entry.runtime_data)])


class ToonProgramSensor(ToonProgramEntity, SensorEntity):
    _attr_translation_key = "program"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = list(STATE_KEYS.values())

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "program")
        self._warned: set[tuple[str, int]] = set()

    def _state_key(self, field: str) -> str | None:
        value = int(self.coordinator.data.info[field])
        if value not in STATE_KEYS:
            if (field, value) not in self._warned:
                self._warned.add((field, value))
                _LOGGER.warning("Unknown %s %s reported by Toon", field, value)
            return None
        return STATE_KEYS[value]

    @property
    def native_value(self) -> str | None:
        return self._state_key("activeState")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        info = data.info
        return {
            "days": days_view(data.program),
            "program_hash": program_hash(data.program),
            "states": {str(key): temp for key, temp in data.states.items()},
            "program_enabled": int(info["programState"]) in PROGRAM_ON_STATES,
            "next_state": self._state_key("nextState"),
            "next_time": _iso(info["nextTime"]),
            "holidays": [
                {
                    "entry_id": h["entryId"],
                    "start": _iso(h["startTimeT"]),
                    "end": _iso(h["endTimeT"]),
                }
                for h in data.holidays
            ],
            "vacation_temperature": data.states[STATE_VACATION],
        }
