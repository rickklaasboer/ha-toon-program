"""Config flow: host and port of the Toon."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import ToonApiError, ToonClient
from .const import DOMAIN


class ToonProgramConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            client = ToonClient(
                async_get_clientsession(self.hass),
                user_input[CONF_HOST],
                user_input[CONF_PORT],
            )
            try:
                await client.get_info()
                program = await client.get_program()
            except ToonApiError:
                errors["base"] = "cannot_connect"
            else:
                await self.async_set_unique_id(program.uuid)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(title="Toon", data=user_input)
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_HOST): str,
                    vol.Required(CONF_PORT, default=80): int,
                }
            ),
            errors=errors,
        )
