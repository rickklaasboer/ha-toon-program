from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.toon_program.const import DOMAIN
from tests.conftest import PROGRAM_UUID


async def _start(hass: HomeAssistant, host: str, port: int):
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    return await hass.config_entries.flow.async_configure(
        result["flow_id"], {"host": host, "port": port}
    )


async def test_user_flow_creates_entry(hass, toon_server):
    result = await _start(hass, toon_server.host, toon_server.port)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"] == {"host": toon_server.host, "port": toon_server.port}
    assert result["result"].unique_id == PROGRAM_UUID


async def test_unreachable_shows_cannot_connect(hass, toon_server, fake):
    fake.error = "boom"
    result = await _start(hass, toon_server.host, toon_server.port)
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "cannot_connect"}


async def test_malformed_program_shows_cannot_connect(hass, toon_server, fake):
    del fake.program["uuid"]
    result = await _start(hass, toon_server.host, toon_server.port)
    assert result["errors"] == {"base": "cannot_connect"}


async def test_duplicate_aborts(hass, toon_server, mock_entry):
    mock_entry.add_to_hass(hass)
    result = await _start(hass, toon_server.host, toon_server.port)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"
