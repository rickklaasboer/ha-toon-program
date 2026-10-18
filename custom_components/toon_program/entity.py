"""Shared entity base."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import ToonProgramCoordinator


class ToonProgramEntity(CoordinatorEntity[ToonProgramCoordinator]):
    _attr_has_entity_name = True

    def __init__(self, coordinator: ToonProgramCoordinator, key: str) -> None:
        super().__init__(coordinator)
        uuid = coordinator.data.program.uuid
        self._attr_unique_id = f"{uuid}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, uuid)}, name="Toon", manufacturer="Eneco"
        )
