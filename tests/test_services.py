import pytest
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import device_registry as dr
from homeassistant.util import dt as dt_util

from custom_components.toon_program.const import DOMAIN
from custom_components.toon_program.program import days_view, parse_program
from tests.conftest import PROGRAM_UUID

SENSOR = "sensor.toon_program"
START = "2027-06-01T07:00:00"
END = "2027-06-10T18:00:00"


async def _setup(hass, entry):
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, PROGRAM_UUID), entry.entry_id
    )
    return device.id


def _hash(hass):
    return hass.states.get(SENSOR).attributes["program_hash"]


async def _call(hass, service, data):
    await hass.services.async_call(DOMAIN, service, data, blocking=True)


def _fake_days(fake):
    return days_view(parse_program(fake.program))


async def _set_day(hass, device_id, day, points, program_hash=None):
    await _call(
        hass,
        "set_day",
        {
            "device_id": device_id,
            "day": day,
            "points": points,
            "program_hash": program_hash or _hash(hass),
        },
    )


async def test_set_day_changes_program(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    old_hash = _hash(hass)
    await _set_day(hass, device_id, 3, [{"time": "07:00", "state": 0}])
    assert _fake_days(fake)[3]["points"] == [{"time": "07:00", "state": 0}]
    assert _hash(hass) != old_hash
    assert hass.states.get(SENSOR).attributes["days"][3]["points"] == [
        {"time": "07:00", "state": 0}
    ]


async def test_set_day_stale_hash(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    before = fake.program
    with pytest.raises(HomeAssistantError) as err:
        await _set_day(hass, device_id, 3, [{"time": "07:00", "state": 0}], "stale")
    assert err.value.translation_key == "program_changed"
    assert fake.program is before
    assert not [r for r in fake.requests if r[1].get("action") == "setObjectConfig"]


async def test_set_day_write_not_applied(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    fake.ignore_writes = True
    with pytest.raises(HomeAssistantError) as err:
        await _set_day(hass, device_id, 3, [{"time": "07:00", "state": 0}])
    assert err.value.translation_key == "write_not_applied"


async def test_set_day_cannot_connect(hass, mock_entry, fake, toon_server):
    device_id = await _setup(hass, mock_entry)
    hash_ = _hash(hass)
    await toon_server.close()
    with pytest.raises(HomeAssistantError) as err:
        await _set_day(hass, device_id, 3, [{"time": "07:00", "state": 0}], hash_)
    assert err.value.translation_key == "cannot_connect"


@pytest.mark.parametrize(
    ("points", "key"),
    [
        ([{"time": "07:00", "state": 0}, {"time": "07:00", "state": 0}], "duplicate_time"),
        ([{"time": "7h", "state": 0}], "invalid_time"),
        ([{"time": "24:00", "state": 0}], "invalid_time"),
        ([{"time": "07:00", "state": 5}], "invalid_state"),
        ([{"time": "07:00", "state": 4}], "invalid_state"),
        ([], "empty_week"),
    ],
)
async def test_set_day_invalid_points(hass, mock_entry, fake, points, key):
    device_id = await _setup(hass, mock_entry)
    # all other days emptied would also be invalid; only day 3 is replaced here
    if key == "empty_week":
        for day in (0, 1, 2, 4, 5, 6):
            if _fake_days(fake)[day]["points"]:
                await _set_day(hass, device_id, day, [])
        points = []
    before = fake.program
    with pytest.raises(HomeAssistantError) as err:
        await _set_day(hass, device_id, 3, points)
    assert err.value.translation_key == key
    if key != "empty_week":
        assert fake.program is before


async def test_set_day_keeps_holiday(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    await _call(
        hass,
        "set_vacation",
        {"device_id": device_id, "start": START, "end": END, "temperature": 12},
    )
    await _set_day(hass, device_id, 3, [{"time": "07:00", "state": 0}])
    assert len(fake.holidays) == 1


def _with_state4(fake, day):
    entries = fake.program["schedule"][0]["entry"]
    entry = next(e for e in entries if e["startDayOfWeek"] == [str(day)])
    entry["targetState"] = ["4"]
    return entry


async def test_state4_preserved_and_accepted_on_same_day(hass, mock_entry, fake):
    entry = _with_state4(fake, 2)
    minute = int(entry["startHour"][0]) * 60 + int(entry["startMin"][0])
    time = f"{minute // 60:02d}:{minute % 60:02d}"
    device_id = await _setup(hass, mock_entry)
    await _set_day(hass, device_id, 3, [{"time": "07:00", "state": 0}])
    assert {"time": time, "state": 4} in _fake_days(fake)[2]["points"]
    await _set_day(
        hass, device_id, 2, [{"time": time, "state": 4}, {"time": "23:00", "state": 2}]
    )
    assert _fake_days(fake)[2]["points"][0] == {"time": time, "state": 4}


async def test_copy_day(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    source = _fake_days(fake)[1]["points"]
    await _call(
        hass,
        "copy_day",
        {"device_id": device_id, "source": 1, "targets": [3, 5], "program_hash": _hash(hass)},
    )
    days = _fake_days(fake)
    assert days[3]["points"] == source
    assert days[5]["points"] == source


async def test_copy_day_stale_hash(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    with pytest.raises(HomeAssistantError) as err:
        await _call(
            hass,
            "copy_day",
            {"device_id": device_id, "source": 1, "targets": [3], "program_hash": "x"},
        )
    assert err.value.translation_key == "program_changed"


async def test_set_vacation_and_update(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    data = {"device_id": device_id, "start": START, "end": END, "temperature": 12.5}
    await _call(hass, "set_vacation", data)
    assert len(fake.holidays) == 1
    entry_id = fake.holidays[0]["entryId"][0]
    start = int(dt_util.parse_datetime(START).replace(tzinfo=dt_util.get_default_time_zone()).timestamp())
    assert fake.holidays[0]["startTimeT"] == [str(start)]
    assert fake.states["4"] == "1250"
    await _call(hass, "set_vacation", {**data, "end": "2027-06-12T18:00:00"})
    assert len(fake.holidays) == 1
    assert fake.holidays[0]["entryId"][0] == entry_id
    assert len(hass.states.get(SENSOR).attributes["holidays"]) == 1


async def test_set_vacation_end_before_start(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    with pytest.raises(ServiceValidationError) as err:
        await _call(
            hass,
            "set_vacation",
            {"device_id": device_id, "start": END, "end": START, "temperature": 12},
        )
    assert err.value.translation_key == "end_before_start"
    assert fake.holidays == []


async def test_remove_vacation(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    await _call(
        hass,
        "set_vacation",
        {"device_id": device_id, "start": START, "end": END, "temperature": 12},
    )
    entry_id = fake.holidays[0]["entryId"][0]
    await _call(hass, "remove_vacation", {"device_id": device_id, "entry_id": entry_id})
    assert fake.holidays == []
    assert hass.states.get(SENSOR).attributes["holidays"] == []


async def test_vacation_write_not_applied(hass, mock_entry, fake):
    device_id = await _setup(hass, mock_entry)
    fake.ignore_writes = True
    with pytest.raises(HomeAssistantError) as err:
        await _call(
            hass,
            "set_vacation",
            {"device_id": device_id, "start": START, "end": END, "temperature": 12},
        )
    assert err.value.translation_key == "write_not_applied"


async def test_foreign_device(hass, mock_entry):
    await _setup(hass, mock_entry)
    with pytest.raises(ServiceValidationError) as err:
        await _call(
            hass,
            "remove_vacation",
            {"device_id": "nope", "entry_id": "x"},
        )
    assert err.value.translation_key == "invalid_device"
