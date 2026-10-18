"""Program on/off switch."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import PROGRAM_ON_STATES, ToonApiError
from .const import DOMAIN
from .coordinator import ToonProgramConfigEntry, ToonProgramCoordinator
from .entity import ToonProgramEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ToonProgramConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([ToonProgramSwitch(entry.runtime_data)])


class ToonProgramSwitch(ToonProgramEntity, SwitchEntity):
    _attr_translation_key = "program_enabled"

    def __init__(self, coordinator: ToonProgramCoordinator) -> None:
        super().__init__(coordinator, "program_enabled")

    @property
    def is_on(self) -> bool:
        return int(self.coordinator.data.info["programState"]) in PROGRAM_ON_STATES

    async def _set(self, enabled: bool) -> None:
        active = int(self.coordinator.data.info["activeState"])
        try:
            await self.coordinator.client.set_program_enabled(enabled, active)
        except ToonApiError as err:
            raise HomeAssistantError(
                translation_domain=DOMAIN,
                translation_key="program_state_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_refresh()

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._set(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._set(False)
