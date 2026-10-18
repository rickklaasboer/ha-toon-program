import json
import logging

import pytest
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.helpers import device_registry as dr

from custom_components.toon_program.const import DOMAIN
from custom_components.toon_program.program import parse_program, program_hash
from tests.conftest import PROGRAM_UUID
from tests.fake_toon import FIXTURES, FakeToon

SENSOR = "sensor.toon_program"
SWITCH = "switch.toon_program_enabled"


async def _setup(hass, entry):
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def _refresh(hass, entry):
    await entry.runtime_data.async_refresh()
    await hass.async_block_till_done()


async def test_sensor_state_and_attributes(hass, mock_entry):
    await _setup(hass, mock_entry)
    state = hass.states.get(SENSOR)
    assert state.state == "home"
    attrs = state.attributes
    parsed = parse_program(json.loads((FIXTURES / "program_zwolle.json").read_text()))
    assert attrs["program_hash"] == program_hash(parsed)
    assert attrs["days"][3]["points"][0] == {"time": "06:20", "state": 1}
    assert attrs["states"] == {"0": 21.0, "1": 20.0, "2": 15.0, "3": 15.0, "4": 6.0}
    assert attrs["vacation_temperature"] == 6.0
    assert attrs["program_enabled"] is True
    assert attrs["next_state"] == "sleep"
    assert attrs["next_time"] == "2026-09-21T14:13:20+00:00"
    assert attrs["holidays"] == []


async def test_sensor_holidays(hass, mock_entry, fake):
    fake.program = json.loads((FIXTURES / "program_with_holiday.json").read_text())
    await _setup(hass, mock_entry)
    assert hass.states.get(SENSOR).attributes["holidays"] == [
        {
            "entry_id": "a44582e5-536e-4542-bc32-1a8b69cec776",
            "start": "2027-06-01T07:00:00+00:00",
            "end": "2027-06-02T07:00:00+00:00",
        }
    ]


async def test_device(hass, mock_entry):
    await _setup(hass, mock_entry)
    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, PROGRAM_UUID), mock_entry.entry_id
    )
    assert device.name == "Toon"
    assert device.manufacturer == "Eneco"


async def test_switch_on_and_turn_off(hass, mock_entry, fake):
    await _setup(hass, mock_entry)
    assert hass.states.get(SWITCH).state == STATE_ON
    await hass.services.async_call(
        "switch", "turn_off", {"entity_id": SWITCH}, blocking=True
    )
    assert fake.info["programState"] == "0"
    assert hass.states.get(SWITCH).state == STATE_OFF
    await hass.services.async_call(
        "switch", "turn_on", {"entity_id": SWITCH}, blocking=True
    )
    assert fake.info["programState"] == "1"
    assert hass.states.get(SWITCH).state == STATE_ON


async def test_temporary_override_counts_as_on(hass, mock_entry, fake):
    fake.info["programState"] = "2"
    await _setup(hass, mock_entry)
    assert hass.states.get(SWITCH).state == STATE_ON
    assert hass.states.get(SENSOR).attributes["program_enabled"] is True


async def test_program_off(hass, mock_entry, fake):
    fake.info["programState"] = "0"
    await _setup(hass, mock_entry)
    assert hass.states.get(SWITCH).state == STATE_OFF
    assert hass.states.get(SENSOR).attributes["program_enabled"] is False


async def test_vacation_active_state(hass, mock_entry, fake):
    fake.info["activeState"] = "4"
    await _setup(hass, mock_entry)
    assert hass.states.get(SENSOR).state == "vacation"


async def test_unknown_active_state_is_unknown_and_logged_once(
    hass, mock_entry, fake, caplog
):
    fake.info["activeState"] = "9"
    caplog.set_level(logging.WARNING)
    await _setup(hass, mock_entry)
    await _refresh(hass, mock_entry)
    assert hass.states.get(SENSOR).state == STATE_UNKNOWN
    assert caplog.text.count("Unknown activeState") == 1


async def test_failure_makes_entities_unavailable(hass, mock_entry, fake):
    await _setup(hass, mock_entry)
    fake.error = "boom"
    await _refresh(hass, mock_entry)
    assert hass.states.get(SENSOR).state == STATE_UNAVAILABLE
    assert hass.states.get(SWITCH).state == STATE_UNAVAILABLE


async def test_malformed_states_makes_entities_unavailable(hass, mock_entry, fake):
    await _setup(hass, mock_entry)
    fake.malformed_states = True
    await _refresh(hass, mock_entry)
    assert hass.states.get(SENSOR).state == STATE_UNAVAILABLE


@pytest.mark.parametrize("missing", ["activeState", "programState", "nextTime"])
async def test_missing_info_field_makes_entities_unavailable(
    hass, mock_entry, fake, missing
):
    await _setup(hass, mock_entry)
    del fake.info[missing]
    await _refresh(hass, mock_entry)
    assert hass.states.get(SENSOR).state == STATE_UNAVAILABLE


async def test_unknown_next_state_is_none_and_logged_once(
    hass, mock_entry, fake, caplog
):
    fake.info["nextState"] = "9"
    caplog.set_level(logging.WARNING)
    await _setup(hass, mock_entry)
    await _refresh(hass, mock_entry)
    assert hass.states.get(SENSOR).attributes["next_state"] is None
    assert caplog.text.count("Unknown nextState") == 1
