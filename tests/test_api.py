import socket

import aiohttp
import pytest

from custom_components.toon_program.api import (
    ToonApiError,
    ToonClient,
    ToonWriteNotApplied,
)
from custom_components.toon_program.program import (
    ProgramError,
    parse_program,
    replace_day,
)
from tests.fake_toon import FakeToon


@pytest.fixture(autouse=True)
def _allow_sockets(socket_enabled):
    """Tests talk to a local fake server."""


@pytest.fixture(autouse=True)
def _no_verify_delay(monkeypatch):
    monkeypatch.setattr("custom_components.toon_program.api.VERIFY_DELAY", 0)


@pytest.fixture
def fake() -> FakeToon:
    return FakeToon()


@pytest.fixture
def make_client(aiohttp_client):
    async def _make(fake: FakeToon) -> ToonClient:
        server = await aiohttp_client(fake.app)
        return ToonClient(server.session, server.host, server.port)

    return _make


async def test_get_program_parses(fake, make_client):
    client = await make_client(fake)
    program = await client.get_program()
    assert program == parse_program(fake.program)


async def test_get_states_celsius(fake, make_client):
    client = await make_client(fake)
    assert await client.get_states() == {0: 21.0, 1: 20.0, 2: 15.0, 3: 15.0, 4: 6.0}


async def test_get_info_raw(fake, make_client):
    client = await make_client(fake)
    info = await client.get_info()
    assert info["programState"] == "1"


async def test_write_program_applies(fake, make_client):
    client = await make_client(fake)
    program = await client.get_program()
    changed = replace_day(program, 3, [(6 * 60 + 40, 1), (22 * 60, 2)])
    await client.write_program(changed)
    assert await client.get_program() == changed
    hours = [
        (e["startHour"][0], e["startMin"][0])
        for e in fake.program["schedule"][0]["entry"]
        if e["startDayOfWeek"][0] == "3"
    ]
    assert ("6", "40") in hours


async def test_write_program_detects_ignored_write(fake, make_client):
    client = await make_client(fake)
    program = await client.get_program()
    fake.ignore_writes = True
    with pytest.raises(ToonWriteNotApplied):
        await client.write_program(replace_day(program, 3, [(400, 1), (1300, 2)]))


async def test_write_program_keeps_holiday(make_client):
    fake = FakeToon("program_with_holiday.json")
    client = await make_client(fake)
    program = await client.get_program()
    assert program.other_entries
    changed = replace_day(program, 3, [(400, 1), (1300, 2)])
    await client.write_program(changed)
    after = await client.get_program()
    assert after.other_entries == program.other_entries
    assert len(await client.get_holidays()) == 1


async def test_set_and_remove_holiday(fake, make_client):
    client = await make_client(fake)
    await client.set_holiday(1790000000, 1790100000, 6.0, None)
    holidays = await client.get_holidays()
    assert len(holidays) == 1
    assert holidays[0]["startTimeT"] == "1790000000"
    assert holidays[0]["endTimeT"] == "1790100000"
    set_call = [q for _, q in fake.requests if q["action"] == "SetHoliday"][0]
    assert set_call["setpoint"] == "600"
    assert "entryId" not in set_call
    await client.set_holiday(1790000000, 1790200000, 6.0, holidays[0]["entryId"])
    holidays = await client.get_holidays()
    assert [h["endTimeT"] for h in holidays] == ["1790200000"]
    await client.remove_holiday(holidays[0]["entryId"])
    assert await client.get_holidays() == []


async def test_holiday_not_applied(fake, make_client):
    client = await make_client(fake)
    fake.ignore_writes = True
    with pytest.raises(ToonApiError):
        await client.set_holiday(1790000000, 1790100000, 6.0, None)


async def test_set_program_enabled_verifies(fake, make_client):
    client = await make_client(fake)
    await client.set_program_enabled(False, 1)
    assert fake.info["programState"] == "0"
    await client.set_program_enabled(True, 1)
    assert fake.info["programState"] == "1"
    calls = [q for _, q in fake.requests if q["action"] == "changeSchemeState"]
    assert all("temperatureState" not in q for q in calls)
    fake.ignore_writes = True
    with pytest.raises(ToonApiError):
        await client.set_program_enabled(False, 1)


async def test_disable_while_vacation_sets_temperature_state(fake, make_client):
    client = await make_client(fake)
    await client.set_program_enabled(False, 4)
    call = [q for _, q in fake.requests if q["action"] == "changeSchemeState"][0]
    assert call["temperatureState"] == "1"


async def test_error_result_raises_with_toon_text(fake, make_client):
    client = await make_client(fake)
    fake.error = "device busy"
    with pytest.raises(ToonApiError, match="device busy"):
        await client.get_info()


async def test_unreachable_raises():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    async with aiohttp.ClientSession() as session:
        client = ToonClient(session, "127.0.0.1", port)
        with pytest.raises(ToonApiError) as exc:
            await client.get_info()
    assert isinstance(exc.value.__cause__, aiohttp.ClientError)


async def test_get_holidays_raw_body_has_toon_newline(fake, aiohttp_client):
    server = await aiohttp_client(fake.app)
    resp = await server.get("/happ_thermstat", params={"action": "GetHolidays"})
    assert '"ok",\n"entry"' in await resp.text()


async def test_missing_key_raises_api_error(fake, make_client):
    client = await make_client(fake)
    fake.ignore_writes = True
    del fake.info["programState"]
    with pytest.raises(ToonApiError) as exc:
        await client.set_program_enabled(True, 1)
    assert isinstance(exc.value.__cause__, KeyError)


async def test_malformed_states_raises_api_error(fake, make_client):
    client = await make_client(fake)
    fake.malformed_states = True
    with pytest.raises(ToonApiError):
        await client.get_states()


async def test_scheme_change_verified_on_retry(fake, make_client):
    client = await make_client(fake)
    fake.delay_scheme_change = True
    await client.set_program_enabled(False, 1)
    assert fake.info["programState"] == "0"


async def test_invalid_device_program_raises_api_error(fake, make_client):
    client = await make_client(fake)
    del fake.program["schedule"]
    with pytest.raises(ToonApiError) as exc:
        await client.get_program()
    assert isinstance(exc.value.__cause__, ProgramError)


async def test_holiday_verified_on_retry(fake, make_client):
    client = await make_client(fake)
    original = client.get_holidays
    calls = []

    async def flaky():
        calls.append(1)
        return [] if len(calls) == 1 else await original()

    client.get_holidays = flaky
    await client.set_holiday(1790000000, 1790100000, 6.0, None)
    assert len(calls) == 2
