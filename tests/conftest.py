import pytest

from custom_components.toon_program.const import DOMAIN
from tests.fake_toon import FakeToon
from pytest_homeassistant_custom_component.common import MockConfigEntry

PROGRAM_UUID = "266d7c54-87ce-4139-95d1-e1b5d6b55ce7"


@pytest.fixture(autouse=True)
def _allow_sockets(socket_enabled):
    """Tests talk to a local fake server."""


@pytest.fixture(autouse=True)
def _no_verify_delay(monkeypatch):
    monkeypatch.setattr("custom_components.toon_program.api.VERIFY_DELAY", 0)


@pytest.fixture(autouse=True)
def _enable_custom_integrations(enable_custom_integrations):
    """Let HA load custom_components."""


@pytest.fixture
def fake() -> FakeToon:
    return FakeToon()


@pytest.fixture
async def toon_server(aiohttp_client, fake):
    return await aiohttp_client(fake.app)


@pytest.fixture
def mock_entry(toon_server) -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        unique_id=PROGRAM_UUID,
        data={"host": toon_server.host, "port": toon_server.port},
    )
