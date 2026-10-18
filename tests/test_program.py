import json
from pathlib import Path

import pytest

from custom_components.toon_program.program import (
    Program,
    ProgramError,
    SwitchPoint,
    build_config_xml,
    copy_day,
    days_view,
    parse_program,
    program_hash,
    replace_day,
    validate,
)

FIXTURES = Path(__file__).parent / "fixtures"


def load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


@pytest.fixture
def zwolle() -> Program:
    return parse_program(load("program_zwolle.json"))


@pytest.fixture
def holiday() -> Program:
    return parse_program(load("program_with_holiday.json"))


def day_points(program: Program, day: int) -> list[tuple[str, int]]:
    return [(p["time"], p["state"]) for p in days_view(program)[day]["points"]]


def test_parse_zwolle(zwolle):
    assert len(zwolle.weekly) == 14
    assert zwolle.weekly[0] == SwitchPoint(0, 570, 1)
    assert zwolle.other_entries == ()


def test_parse_keeps_holiday(holiday):
    assert len(holiday.other_entries) == 1
    raw = load("program_with_holiday.json")["schedule"][0]["entry"][-1]
    assert holiday.other_entries[0] == raw


def test_days_view_carry_in(zwolle):
    view = days_view(zwolle)
    assert len(view) == 7
    assert view[0]["carry_in"] == 2
    assert day_points(zwolle, 0) == [("09:30", 1), ("23:00", 2)]
    assert day_points(zwolle, 3) == [("06:20", 1), ("23:00", 2)]


def test_replace_day_moves_time(zwolle):
    new = replace_day(zwolle, 3, [(6 * 60 + 40, 1), (23 * 60, 2)])
    assert day_points(new, 3) == [("06:40", 1), ("23:00", 2)]
    for day in (0, 1, 2, 4, 5, 6):
        assert days_view(new)[day] == days_view(zwolle)[day]


def test_replace_day_empty(zwolle):
    new = replace_day(zwolle, 3, [])
    view = days_view(new)
    assert view[3]["points"] == []
    assert view[3]["carry_in"] == 2
    assert view[4]["carry_in"] == 2
    validate(new)


def test_merge_equal_neighbours(zwolle):
    new = replace_day(zwolle, 1, [(6 * 60 + 50, 1), (12 * 60, 1), (23 * 60, 2)])
    assert day_points(new, 1) == [("06:50", 1), ("23:00", 2)]


def test_copy_day(zwolle):
    new = copy_day(zwolle, 3, [1, 2, 4])
    for day in (1, 2, 4):
        assert day_points(new, day)[0] == ("06:20", 1)


def test_validate_errors():
    def key(weekly):
        with pytest.raises(ProgramError) as exc:
            validate(Program("u", tuple(weekly), ()))
        return exc.value.key

    assert key([]) == "empty_week"
    assert key([SwitchPoint(0, 0, 7)]) == "invalid_state"
    assert key([SwitchPoint(0, 1440, 1)]) == "invalid_time"
    assert key([SwitchPoint(0, 60, 1), SwitchPoint(0, 60, 2)]) == "duplicate_time"


def test_validate_accepts_state_4(holiday):
    validate(Program("u", (SwitchPoint(0, 0, 4), SwitchPoint(0, 60, 1)), ()))


def test_hash_ignores_holiday(zwolle, holiday):
    assert program_hash(zwolle) == program_hash(holiday)
    assert program_hash(replace_day(zwolle, 3, [(7 * 60, 1)])) != program_hash(zwolle)


def test_build_xml_roundtrip_exact(zwolle):
    xml = build_config_xml(zwolle)
    assert xml.startswith(
        "<Config><device><package>happ_thermstat</package>"
        "<uuid>266d7c54-87ce-4139-95d1-e1b5d6b55ce7</uuid><type>program</type>"
        "<internalAddress>thermostatProgram</internalAddress>"
        "<visibility>1</visibility><schedule>"
        '<entry type="weekly_recurring"><type>weekly_recurring</type>'
        "<startMin>30</startMin><startHour>9</startHour>"
        "<startDayOfWeek>0</startDayOfWeek><targetState>1</targetState>"
        "<endMin>0</endMin><endHour>23</endHour><endDayOfWeek>0</endDayOfWeek>"
        "</entry>"
    )
    assert xml.endswith("</schedule></device></Config>")
    assert xml.count("<entry ") == 14


def test_build_xml_holiday_passthrough(holiday):
    xml = build_config_xml(holiday)
    holiday_xml = (
        '<entry type="holiday"><type>holiday</type><startTimeT>1811833200</startTimeT>'
        "<endTimeT>1811919600</endTimeT><targetState>4</targetState>"
        "<entryId>a44582e5-536e-4542-bc32-1a8b69cec776</entryId></entry>"
    )
    assert holiday_xml in xml
    assert xml.index(holiday_xml) > xml.rindex('<entry type="weekly_recurring">')


def test_parse_keeps_extra_fields():
    data = load("program_zwolle.json")
    data["foo"] = ["bar"]
    program = parse_program(data)
    assert program.extra == (("foo", "bar"),)
    assert "<visibility>1</visibility><foo>bar</foo><schedule>" in build_config_xml(program)


def test_parse_extra_field_unsupported_shape():
    data = load("program_zwolle.json")
    data["foo"] = ["a", "b"]
    with pytest.raises(ProgramError) as exc:
        parse_program(data)
    assert exc.value.key == "unsupported_field"


def test_parse_missing_uuid_raises():
    data = load("program_zwolle.json")
    del data["uuid"]
    with pytest.raises(ProgramError) as exc:
        parse_program(data)
    assert exc.value.key == "missing_field"


@pytest.mark.parametrize(
    ("key", "value"),
    [("package", "other"), ("type", "other"), ("internalAddress", "other")],
)
def test_parse_rejects_wrong_header(key, value):
    data = load("program_zwolle.json")
    data[key] = [value]
    with pytest.raises(ProgramError) as exc:
        parse_program(data)
    assert exc.value.key == "unexpected_value"


@pytest.mark.parametrize("missing", ["schedule", "entry"])
def test_parse_missing_schedule_or_entry(missing):
    data = load("program_zwolle.json")
    if missing == "schedule":
        del data["schedule"]
    else:
        del data["schedule"][0]["entry"]
    with pytest.raises(ProgramError) as exc:
        parse_program(data)
    assert exc.value.key == "missing_field"


def test_visibility_kept():
    data = load("program_zwolle.json")
    data["visibility"] = ["0"]
    program = parse_program(data)
    assert program.visibility == "0"
    assert "<visibility>0</visibility>" in build_config_xml(program)
