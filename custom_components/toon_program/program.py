"""Toon week program model: switch points, edits and config XML."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from xml.sax.saxutils import escape

DAYS = 7
MINUTES_PER_DAY = 1440
WEEKLY = "weekly_recurring"
HEADER_KEYS = ("package", "uuid", "type", "internalAddress", "visibility")
MAX_STATE = 4


class ProgramError(Exception):
    """Program problem; `key` is a translation key."""

    def __init__(self, key: str) -> None:
        super().__init__(key)
        self.key = key


@dataclass(frozen=True)
class SwitchPoint:
    day: int
    minute: int
    state: int


@dataclass(frozen=True)
class Program:
    uuid: str
    weekly: tuple[SwitchPoint, ...]
    other_entries: tuple[dict, ...]
    extra: tuple[tuple[str, str], ...] = ()


def _single(value: object) -> str:
    if not (isinstance(value, list) and len(value) == 1 and isinstance(value[0], str)):
        raise ProgramError("unsupported_field")
    return value[0]


def parse_program(data: dict) -> Program:
    if any(key not in data for key in HEADER_KEYS):
        raise ProgramError("missing_field")
    extra = tuple(
        (key, _single(value))
        for key, value in data.items()
        if key not in HEADER_KEYS and key != "schedule"
    )
    weekly: list[SwitchPoint] = []
    other: list[dict] = []
    for entry in data["schedule"][0]["entry"]:
        if entry["type"][0] == WEEKLY:
            weekly.append(
                SwitchPoint(
                    int(entry["startDayOfWeek"][0]),
                    int(entry["startHour"][0]) * 60 + int(entry["startMin"][0]),
                    int(entry["targetState"][0]),
                )
            )
        else:
            other.append(entry)
    weekly.sort(key=lambda p: (p.day, p.minute))
    return Program(data["uuid"][0], tuple(weekly), tuple(other), extra)


def _merge(points: list[SwitchPoint]) -> tuple[SwitchPoint, ...]:
    """Drop points that do not change state, wrap-around aware."""
    points = sorted(points, key=lambda p: (p.day, p.minute))
    if not points:
        return ()
    kept = [p for i, p in enumerate(points) if p.state != points[i - 1].state]
    return tuple(kept or points[:1])


def days_view(program: Program) -> list[dict]:
    if not program.weekly:
        raise ProgramError("empty_week")
    view = []
    for day in range(DAYS):
        before = [p for p in program.weekly if p.day < day]
        carry = (before or program.weekly)[-1].state
        points = [
            {"time": f"{p.minute // 60:02d}:{p.minute % 60:02d}", "state": p.state}
            for p in program.weekly
            if p.day == day
        ]
        view.append({"day": day, "carry_in": carry, "points": points})
    return view


def replace_day(program: Program, day: int, points: list[tuple[int, int]]) -> Program:
    weekly = [p for p in program.weekly if p.day != day]
    weekly += [SwitchPoint(day, minute, state) for minute, state in points]
    return Program(program.uuid, _merge(weekly), program.other_entries, program.extra)


def copy_day(program: Program, source: int, targets: list[int]) -> Program:
    points = [(p.minute, p.state) for p in program.weekly if p.day == source]
    for target in targets:
        program = replace_day(program, target, points)
    return program


def validate(program: Program) -> None:
    if not program.weekly:
        raise ProgramError("empty_week")
    seen = set()
    for p in program.weekly:
        if not 0 <= p.state <= MAX_STATE:
            raise ProgramError("invalid_state")
        if not (0 <= p.day < DAYS and 0 <= p.minute < MINUTES_PER_DAY):
            raise ProgramError("invalid_time")
        if (p.day, p.minute) in seen:
            raise ProgramError("duplicate_time")
        seen.add((p.day, p.minute))


def program_hash(program: Program) -> str:
    raw = json.dumps([[p.day, p.minute, p.state] for p in program.weekly])
    return hashlib.sha256(raw.encode()).hexdigest()


def _weekly_xml(start: SwitchPoint, end: SwitchPoint) -> str:
    return (
        f'<entry type="{WEEKLY}"><type>{WEEKLY}</type>'
        f"<startMin>{start.minute % 60}</startMin>"
        f"<startHour>{start.minute // 60}</startHour>"
        f"<startDayOfWeek>{start.day}</startDayOfWeek>"
        f"<targetState>{start.state}</targetState>"
        f"<endMin>{end.minute % 60}</endMin>"
        f"<endHour>{end.minute // 60}</endHour>"
        f"<endDayOfWeek>{end.day}</endDayOfWeek></entry>"
    )


def _other_xml(entry: dict) -> str:
    kind = escape(entry["type"][0], {'"': "&quot;"})
    body = "".join(
        f"<{key}>{escape(value)}</{key}>" for key, values in entry.items() for value in values
    )
    return f'<entry type="{kind}">{body}</entry>'


def build_config_xml(program: Program) -> str:
    weekly = program.weekly
    entries = [
        _weekly_xml(p, weekly[(i + 1) % len(weekly)]) for i, p in enumerate(weekly)
    ]
    entries += [_other_xml(e) for e in program.other_entries]
    extra = "".join(f"<{key}>{escape(value)}</{key}>" for key, value in program.extra)
    return (
        "<Config><device><package>happ_thermstat</package>"
        f"<uuid>{escape(program.uuid)}</uuid><type>program</type>"
        "<internalAddress>thermostatProgram</internalAddress>"
        f"<visibility>1</visibility>{extra}<schedule>{''.join(entries)}</schedule>"
        "</device></Config>"
    )
