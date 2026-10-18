from unittest.mock import patch

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.loader import async_get_integration
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.toon_program.const import DOMAIN
from tests.conftest import PROGRAM_UUID

CARD_PATH = "/toon_program/toon-program-card.js"


async def _setup(hass, entry):
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_card_is_served_and_registered(hass, hass_client, mock_entry):
    await _setup(hass, mock_entry)
    version = (await async_get_integration(hass, DOMAIN)).version

    assert f"{CARD_PATH}?v={version}" in hass.data[DATA_EXTRA_MODULE_URL].urls
    client = await hass_client()
    resp = await client.get(CARD_PATH)
    assert resp.status == 200
    assert "toon-program-card" in await resp.text()


async def test_card_registered_once_for_two_entries(hass, mock_entry, toon_server):
    second = MockConfigEntry(
        domain=DOMAIN,
        unique_id=PROGRAM_UUID + "-2",
        data={"host": toon_server.host, "port": toon_server.port},
    )
    assert await async_setup_component(hass, "http", {})
    with patch(
        "custom_components.toon_program.add_extra_js_url"
    ) as add_url, patch.object(
        hass.http, "async_register_static_paths", wraps=hass.http.async_register_static_paths
    ) as register:
        await _setup(hass, mock_entry)
        await _setup(hass, second)

    assert add_url.call_count == 1
    card_registrations = [
        cfg
        for call in register.call_args_list
        for cfg in call.args[0]
        if cfg.url_path == CARD_PATH
    ]
    assert len(card_registrations) == 1
