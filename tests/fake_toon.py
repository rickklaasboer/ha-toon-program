"""Fake Toon HTTP API with the quirks verified on the real device."""

from __future__ import annotations

import json
from pathlib import Path
import uuid
from xml.etree import ElementTree

from aiohttp import web

FIXTURES = Path(__file__).parent / "fixtures"
STATE_TEMPS = {"0": "2100", "1": "2000", "2": "1500", "3": "1500", "4": "600"}


def _json(body: dict, newline: bool = False) -> web.Response:
    text = json.dumps(body)
    if newline:
        text = text.replace(',"', ',\n"', 1)
    return web.Response(text=text)


def _error(message: str) -> web.Response:
    return _json({"result": "error", "error": message})


def _element_to_json(element: ElementTree.Element) -> dict:
    out: dict[str, list] = {}
    for child in element:
        out.setdefault(child.tag, []).append(
            _element_to_json(child) if len(child) else (child.text or "")
        )
    return out


class FakeToon:
    """Holds program JSON, states, info; `ignore_writes` simulates a Toon that says ok and does nothing."""

    def __init__(self, program_fixture: str = "program_zwolle.json") -> None:
        self.program: dict = json.loads((FIXTURES / program_fixture).read_text())
        self.states = dict(STATE_TEMPS)
        self.info: dict[str, str] = {
            "currentTemp": "2050",
            "currentSetpoint": "2000",
            "programState": "1",
            "activeState": "1",
            "nextState": "2",
            "nextTime": "1790000000",
            "nextSetpoint": "1500",
            "randomConfigId": "1",
        }
        self.ignore_writes = False
        self.error: str | None = None
        self.requests: list[tuple[str, dict[str, str]]] = []
        self.app = web.Application()
        self.app.router.add_get("/hcb_config", self.hcb_config)
        self.app.router.add_get("/happ_thermstat", self.happ_thermstat)

    @property
    def _entries(self) -> list[dict]:
        return self.program["schedule"][0]["entry"]

    @property
    def holidays(self) -> list[dict]:
        return [e for e in self._entries if e["type"][0] == "holiday"]

    async def hcb_config(self, request: web.Request) -> web.Response:
        query = dict(request.query)
        self.requests.append(("hcb_config", query))
        action = query.get("action")
        if action == "getObjectConfigTree":
            if query.get("internalAddress") == "thermostatProgram":
                return _json(self.program)
            if query.get("internalAddress") == "thermostatStates":
                return _json(
                    {
                        "states": [
                            {
                                "state": [
                                    {"id": [i], "tempValue": [t]}
                                    for i, t in self.states.items()
                                ]
                            }
                        ]
                    }
                )
            return _error("unknown object")
        if action == "setObjectConfig":
            if "config" not in query:
                return _error("No config in message!")
            try:
                root = ElementTree.fromstring(query["config"])
            except ElementTree.ParseError:
                return _error("bad xml")
            if root.tag != "Config" or root.find("device") is None:
                return _json({"result": "ok"})
            device = root.find("device")
            if device.find("uuid") is None:
                return _json({"result": "ok"})
            if not self.ignore_writes:
                self.program = _element_to_json(device)
                self.program["schedule"] = [self.program["schedule"][0]]
            return _json({"result": "ok"})
        return _error("no handler")

    async def happ_thermstat(self, request: web.Request) -> web.Response:
        query = dict(request.query)
        self.requests.append(("happ_thermstat", query))
        action = query.get("action")
        if self.error:
            return _error(self.error)
        if action == "getThermostatInfo":
            return _json({**self.info, "result": "ok"})
        if action == "GetHolidays":
            entries = [
                {
                    "startTimeT": e["startTimeT"][0],
                    "endTimeT": e["endTimeT"][0],
                    "entryId": e["entryId"][0],
                }
                for e in self.holidays
            ]
            return _json({"result": "ok", "entry": entries}, newline=True)
        if action == "SetHoliday":
            if not self.ignore_writes:
                self._set_holiday(query)
            return _json({"result": "ok"})
        if action == "RemoveHoliday":
            if not self.ignore_writes:
                entry_id = query["entryId"]
                self.program["schedule"][0]["entry"] = [
                    e
                    for e in self._entries
                    if not (e["type"][0] == "holiday" and e["entryId"][0] == entry_id)
                ]
            return _json({"result": "ok"})
        if action == "changeSchemeState":
            if not self.ignore_writes:
                self.info["programState"] = query["state"]
            return _json({"result": "ok"})
        return _error("no handler")

    def _set_holiday(self, query: dict[str, str]) -> None:
        entry_id = query.get("entryId") or str(uuid.uuid4())
        entry = {
            "type": ["holiday"],
            "startTimeT": [query["startTimeT"]],
            "endTimeT": [query["endTimeT"]],
            "targetState": ["4"],
            "entryId": [entry_id],
        }
        entries = [
            e
            for e in self._entries
            if not (e["type"][0] == "holiday" and e["entryId"][0] == entry_id)
        ]
        self.program["schedule"][0]["entry"] = [*entries, entry]
        self.states["4"] = query["setpoint"]
