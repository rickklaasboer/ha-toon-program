# Toon Program Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A HACS integration `toon_program` plus bundled Lovelace card that lets a non-technical user view and edit a rooted Toon's week program and vacation from Home Assistant.

**Architecture:** Pure-Python model (`program.py`) converts Toon schedule entries ⇄ per-day switch points, validates, hashes and builds XML. A thin aiohttp client (`api.py`) talks to the Toon's local HTTP API. A `DataUpdateCoordinator` polls; a sensor exposes the program to the card, a switch toggles the program; services perform verified writes. The card is a Lit web component built to one JS file and registered by the integration.

**Tech Stack:** Python 3.13+ (HA 2026.9 runs 3.14), Home Assistant custom integration APIs, aiohttp, pytest + `pytest-homeassistant-custom-component`, TypeScript + Lit + Rollup for the card.

**Spec:** `docs/superpowers/specs/2026-10-18-toon-program-design.md` (read it; the verified API facts there are authoritative).

## Global Constraints

- Domain `toon_program`; repo `rickklaasboer/ha-toon-program`; license MIT.
- No auth, plain HTTP to `http://<host>:<port>` (port default 80).
- Program write: `GET /hcb_config?action=setObjectConfig&config=<urlencoded XML>`; XML root `<Config>`; `<entry type="weekly_recurring">` with `<type>` child too; child order `type,startMin,startHour,startDayOfWeek,targetState,endMin,endHour,endDayOfWeek`; device header order `package,uuid,type,internalAddress,visibility` then `schedule`.
- Never trust `{"result":"ok"}`: every write is followed by a read-back comparison; mismatch raises `HomeAssistantError`.
- Day numbering is the Toon's: 0 = Sunday … 6 = Saturday. Card displays Ma…Zo (Monday first).
- States: 0 comfort, 1 home, 2 sleep, 3 away, 4 vacation/eco. Card editor offers 0–3 only; 4 is shown read-only and preserved.
- Non-`weekly_recurring` entries (e.g. `holiday`) pass through program writes unchanged, in original order, all original fields.
- Vacations only via `SetHoliday` / `RemoveHoliday` / `GetHolidays` on `happ_thermstat` (case-sensitive). One vacation at a time.
- `programState`: 0 off, 1 on, 2 temporary override (counts as on). Program on/off via `happ_thermstat?action=changeSchemeState&state=1|0`; when turning off while `activeState == 4`, append `&temperatureState=1` (as `toon_climate` does).
- Fail loud: no bare `except`, no silent fallbacks, no default values masking missing fields.
- User-facing strings via translations (`nl`, `en`); errors use `HomeAssistantError(translation_domain=DOMAIN, translation_key=…)`.
- Commits follow Angular convention, English, no attribution lines.
- Touch targets ≥ 44 px; card baseline width 390 px.

## Review Focus

- Toon unreachable or slow during save → card shows a clear error and keeps unsaved edits; nothing half-written.
- Program edited on the Toon while the card has unsaved edits → save refused with `program_changed` error, not overwritten.
- A day emptied of switch points / all switch points on one day → valid week, carry-in rendered correctly on the other days.
- A program containing state 4 or a `holiday` entry → round-trips unchanged through a day edit.
- Toon replies `ok` but ignores the write → detected by read-back, error raised.

---

### Task 1: Repo scaffold and program model

**Files:**
- Create: `custom_components/toon_program/__init__.py` (empty stub for now), `custom_components/toon_program/manifest.json`, `custom_components/toon_program/const.py`, `custom_components/toon_program/program.py`, `hacs.json`, `LICENSE` (MIT, "Rick Klaasboer"), `.gitignore`, `requirements_test.txt`, `pyproject.toml` (pytest config: `asyncio_mode = "auto"`, testpaths `tests`)
- Test: `tests/test_program.py`, `tests/fixtures/program_zwolle.json` (copy of the real program JSON below)

**Interfaces:**
- Produces (`program.py`):
  - `@dataclass(frozen=True) class SwitchPoint: day: int; minute: int; state: int` (`minute` = minutes since 00:00, 0–1439)
  - `@dataclass(frozen=True) class Program: uuid: str; weekly: tuple[SwitchPoint, ...]; other_entries: tuple[dict, ...]` (`weekly` sorted by `(day, minute)`; `other_entries` are raw JSON entry dicts as received)
  - `parse_program(data: dict) -> Program` (input = `getObjectConfigTree` JSON)
  - `days_view(program: Program) -> list[dict]` → 7 items in Toon day order, each `{"day": int, "carry_in": int, "points": [{"time": "HH:MM", "state": int}]}`
  - `replace_day(program: Program, day: int, points: list[tuple[int, int]]) -> Program` (points = `(minute, state)`)
  - `copy_day(program: Program, source: int, targets: list[int]) -> Program`
  - `validate(program: Program) -> None` raises `ProgramError(key: str)` with keys `empty_week`, `invalid_state`, `invalid_time`, `duplicate_time`
  - `program_hash(program: Program) -> str` (sha256 hex of `weekly` tuples)
  - `build_config_xml(program: Program) -> str`
  - `const.py`: `DOMAIN = "toon_program"`, `STATE_COMFORT=0, STATE_HOME=1, STATE_SLEEP=2, STATE_AWAY=3, STATE_VACATION=4`, `EDITABLE_STATES = (0, 1, 2, 3)`

- [ ] **Step 1: Scaffold.** `manifest.json`: `domain`, `name: "Toon Program"`, `config_flow: true`, `iot_class: "local_polling"`, `integration_type: "device"`, `version: "0.1.0"`, `codeowners: ["@rickklaasboer"]`, `documentation`/`issue_tracker` pointing at the GitHub repo, `requirements: []`, `dependencies: ["http", "frontend"]`. `hacs.json`: `{"name": "Toon Program", "homeassistant": "2026.9.0"}`. `requirements_test.txt`: `pytest-homeassistant-custom-component` (pin to the newest release compatible with HA 2026.9; check PyPI, do not guess). Create a venv, install, confirm `pytest --version` runs.

- [ ] **Step 2: Fixture.** `tests/fixtures/program_zwolle.json` = the real program: entries (start day/hour/min → end day/hour/min, state):
  Sun 9:30→Sun 23:00 1; Sun 23:00→Mon 6:50 2; Mon 6:50→Mon 23:00 1; Mon 23:00→Tue 6:50 2; Tue 6:50→Tue 23:00 1; Tue 23:00→Wed 6:20 2; Wed 6:20→Wed 23:00 1; Wed 23:00→Thu 6:50 2; Thu 6:50→Thu 23:00 1; Thu 23:00→Fri 6:50 2; Fri 6:50→Fri 23:30 1; Fri 23:30→Sat 7:00 2; Sat 7:00→Sat 23:30 1; Sat 23:30→Sun 9:30 2.
  In Toon JSON shape (every value a one-element string array, `type` = `weekly_recurring`, header `uuid` `266d7c54-87ce-4139-95d1-e1b5d6b55ce7`, `type` `program`, `internalAddress` `thermostatProgram`, `visibility` `1`, `package` `happ_thermstat`). Also a variant fixture `program_with_holiday.json` = same plus `{"type":["holiday"],"startTimeT":["1811833200"],"endTimeT":["1811919600"],"targetState":["4"],"entryId":["a44582e5-536e-4542-bc32-1a8b69cec776"]}` appended.

- [ ] **Step 3: Write failing tests** in `tests/test_program.py`:
  - `test_parse_zwolle`: 14 weekly points; first is `SwitchPoint(0, 570, 1)`; `other_entries == ()`.
  - `test_parse_keeps_holiday`: holiday fixture → `len(other_entries) == 1`, equals the raw dict.
  - `test_days_view_carry_in`: Sunday `carry_in == 2` (from Sat 23:30), points `[("09:30",1),("23:00",2)]`; Wednesday points `[("06:20",1),("23:00",2)]`.
  - `test_replace_day_moves_time`: replace Wednesday with `[(6*60+40, 1), (23*60, 2)]` → Wednesday view shows `06:40`; other days unchanged.
  - `test_replace_day_empty`: Wednesday `[]` → Wednesday points `[]`, carry_in `2`; Thursday carry_in `2`; `validate` passes.
  - `test_merge_equal_neighbours`: replace Monday with `[(6*60+50,1),(12*60,1),(23*60,2)]` → Monday points `[("06:50",1),("23:00",2)]`.
  - `test_copy_day`: copy Wednesday to `[1,2,4]` → those days show `06:20`.
  - `test_validate_errors`: empty weekly → `empty_week`; state 7 → `invalid_state`; minute 1440 → `invalid_time`; two points same day+minute → `duplicate_time`.
  - `test_hash_ignores_holiday`: `program_hash` equal for both fixtures; differs after a `replace_day`.
  - `test_build_xml_roundtrip_exact`: `build_config_xml(parse_program(zwolle))` starts with `<Config><device><package>happ_thermstat</package><uuid>266d7c54-87ce-4139-95d1-e1b5d6b55ce7</uuid><type>program</type><internalAddress>thermostatProgram</internalAddress><visibility>1</visibility><schedule><entry type="weekly_recurring"><type>weekly_recurring</type><startMin>30</startMin><startHour>9</startHour><startDayOfWeek>0</startDayOfWeek><targetState>1</targetState><endMin>0</endMin><endHour>23</endHour><endDayOfWeek>0</endDayOfWeek></entry>`, ends with `</schedule></device></Config>`, has 14 `<entry ` occurrences; values numeric without leading zeros.
  - `test_build_xml_holiday_passthrough`: holiday fixture → XML contains `<entry type="holiday"><type>holiday</type><startTimeT>1811833200</startTimeT><endTimeT>1811919600</endTimeT><targetState>4</targetState><entryId>a44582e5-536e-4542-bc32-1a8b69cec776</entryId></entry>` after the weekly entries (field order = order in the received dict).

- [ ] **Step 4: Run** `pytest tests/test_program.py -v` → all FAIL (import errors).

- [ ] **Step 5: Implement `program.py` and `const.py`.** Entries → points: each weekly entry's start becomes a point; ignore its end. Points → entries: sort by `(day, minute)`, each entry ends at the next point, last wraps to the first. Merge: drop a point whose state equals the previous point's state in week order (wrap-around aware). `replace_day`/`copy_day` return a new `Program` with merging applied. Escape XML text with `xml.sax.saxutils.escape`.

- [ ] **Step 6: Run** `pytest tests/test_program.py -v` → PASS.

- [ ] **Step 7: Commit** `feat(program): add toon program model and xml builder` (scaffold files included).

### Task 2: Toon HTTP client

**Files:**
- Create: `custom_components/toon_program/api.py`
- Test: `tests/test_api.py`, `tests/fake_toon.py`

**Interfaces:**
- Consumes: `parse_program`, `build_config_xml`, `Program` (Task 1).
- Produces (`api.py`):
  - `class ToonApiError(Exception)`; `class ToonWriteNotApplied(ToonApiError)`
  - `class ToonClient: __init__(self, session: aiohttp.ClientSession, host: str, port: int = 80)`
  - `async get_program() -> Program`; `async get_states() -> dict[int, float]` (°C); `async get_info() -> dict[str, Any]` (raw `getThermostatInfo` JSON); `async get_holidays() -> list[dict]` (`entry` list)
  - `async write_program(program: Program) -> None` (send, re-read, compare `weekly` and `other_entries`; raise `ToonWriteNotApplied` on mismatch)
  - `async set_program_enabled(enabled: bool, active_state: int) -> None` (verifies via `get_info`)
  - `async set_holiday(start: int, end: int, temperature: float, entry_id: str | None) -> None` (verifies via `get_holidays`)
  - `async remove_holiday(entry_id: str) -> None` (verifies)
- `tests/fake_toon.py`: `FakeToon` aiohttp app fixture holding a program JSON, states, info, holidays; implements the quirks: `setObjectConfig` with `Config=` → `No config in message!` error JSON; with `config=` but without `<Config>` root → `{"result":"ok"}` and no change; with valid XML → parse with `xml.etree` and update program; `SetHoliday` adds entry + holiday program entry + sets state 4 temp; `RemoveHoliday` removes both; lowercase `getHolidays` → "no handler" error. Option `ignore_writes=True` to simulate the Toon ignoring a valid write. Note: the real Toon returns `getHolidays`-style bodies with a newline after `"result":"ok",`; use `json.loads` on text, not `resp.json()` content-type checks (Toon sends no JSON content-type; verify and use `content_type=None`).

- [ ] **Step 1: Failing tests** (`tests/test_api.py`, all against `FakeToon` via `aiohttp_client`/`aiohttp_server`):
  - `test_get_program_parses`; `test_get_states_celsius` (`{0:21.0,1:20.0,2:15.0,3:15.0,4:6.0}`)
  - `test_write_program_applies` (replace Wednesday, write, fake's program now shows 06:40)
  - `test_write_program_detects_ignored_write` (`ignore_writes=True` → `ToonWriteNotApplied`)
  - `test_write_program_keeps_holiday`
  - `test_set_and_remove_holiday` (set → `get_holidays` has 1 entry with the given times; remove → empty)
  - `test_set_program_enabled_verifies` (fake info `programState` flips; when fake does not flip → `ToonApiError`)
  - `test_unreachable_raises` (closed port → `ToonApiError`, original exception chained)
- [ ] **Step 2: Run** `pytest tests/test_api.py -v` → FAIL.
- [ ] **Step 3: Implement `api.py`.** Timeouts 10 s per request. Non-`ok` `result` → `ToonApiError` with the Toon's `error` text. URL-encode `config` via `params=`.
- [ ] **Step 4: Run** `pytest tests -v` → PASS.
- [ ] **Step 5: Commit** `feat(api): add local toon http client with verified writes`.

### Task 3: Config flow, coordinator, entities

**Files:**
- Create: `custom_components/toon_program/config_flow.py`, `coordinator.py`, `sensor.py`, `switch.py`, `entity.py`, `strings.json`, `translations/en.json`, `translations/nl.json`
- Modify: `custom_components/toon_program/__init__.py`
- Test: `tests/conftest.py`, `tests/test_config_flow.py`, `tests/test_entities.py`

**Interfaces:**
- Consumes: `ToonClient` and errors (Task 2), `days_view`, `program_hash` (Task 1).
- Produces:
  - `@dataclass class ToonData: program: Program; states: dict[int, float]; info: dict[str, Any]; holidays: list[dict]`
  - `class ToonProgramCoordinator(DataUpdateCoordinator[ToonData])` with `.client: ToonClient`, `update_interval=timedelta(seconds=60)`; `ToonApiError` → `UpdateFailed`.
  - `entry.runtime_data: ToonProgramCoordinator` (typed `ToonProgramConfigEntry = ConfigEntry[ToonProgramCoordinator]`).
  - Sensor `sensor.<name>_program`, translation key `program`: state = active state key (`comfort|home|sleep|away|vacation`) from `info["activeState"]`; attributes: `days` (= `days_view`), `program_hash`, `states` (id → °C), `program_enabled` (bool, `programState != 0`), `next_state`, `next_time` (ISO), `holidays` (list of `{entry_id, start, end}` ISO), `vacation_temperature` (= states[4]).
  - Switch `switch.<name>_program_enabled`, translation key `program_enabled`.
  - Device: identifiers `(DOMAIN, program uuid)`, name "Toon", manufacturer "Eneco".
- Config flow: user step fields `host` (str), `port` (int, default 80). Validate with `get_info()` + `get_program()`; unique id = program uuid; abort `already_configured`; error `cannot_connect`.

- [ ] **Step 1: Failing tests:** config flow happy path creates entry with unique id `266d7c54-…`; unreachable → `cannot_connect`; duplicate → abort. Entities: sensor state `home` with fake `activeState=1`, attributes `program_hash` equals `program_hash(parsed fixture)`, `days[3]["points"][0] == {"time":"06:20","state":1}`; switch on; `switch.turn_off` calls fake and turns off; coordinator failure → sensor `unavailable`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Use `async_get_clientsession(hass)`. Platforms `SENSOR`, `SWITCH`. `has_entity_name = True`.
- [ ] **Step 4: Run** `pytest tests -v` → PASS.
- [ ] **Step 5: Commit** `feat(integration): add config flow, coordinator and entities`.

### Task 4: Services with conflict check

**Files:**
- Create: `custom_components/toon_program/services.py`, `services.yaml`
- Modify: `__init__.py` (register services once in `async_setup`), `strings.json` + translations (service and exception texts)
- Test: `tests/test_services.py`

**Interfaces:**
- Consumes: coordinator (Task 3), model (Task 1), client (Task 2).
- Produces services (all require `device_id` of a `toon_program` device):
  - `toon_program.set_day`: `day` (0–6), `points` (list of `{time: "HH:MM", state: 0–3}`; state 4 accepted only if it was already present on that day), `program_hash` (str)
  - `toon_program.copy_day`: `source` (0–6), `targets` (list 0–6), `program_hash`
  - `toon_program.set_vacation`: `start` (datetime), `end` (datetime), `temperature` (float, 6.0–30.0); updates existing vacation (`entryId`) if one exists
  - `toon_program.remove_vacation`: `entry_id` (str)
- Write path per spec: re-read program → hash mismatch → `HomeAssistantError(translation_key="program_changed")` → apply → `validate` (`ProgramError.key` → translation key) → `write_program` → `ToonWriteNotApplied` → `translation_key="write_not_applied"`; `ToonApiError` → `translation_key="cannot_connect"` → coordinator refresh.
- Translations (nl): `program_changed`: "Het programma is op de Toon gewijzigd. Ververs en probeer opnieuw."; `write_not_applied`: "De Toon heeft de wijziging niet overgenomen."; `cannot_connect`: "De Toon is niet bereikbaar."; `empty_week`: "Het programma moet minstens één tijd bevatten."; `duplicate_time`: "Twee tijden op hetzelfde moment."; `invalid_state`/`invalid_time` similar. (en equivalents.) `end_before_start` for vacation.

- [ ] **Step 1: Failing tests:** `set_day` happy path changes fake program; stale hash → `program_changed`, fake untouched; `ignore_writes` → `write_not_applied`; holiday preserved after `set_day`; `copy_day`; `set_vacation` with end ≤ start → `end_before_start`; `set_vacation` twice → still one holiday (updated times); `remove_vacation`; state 4 point preserved through `set_day` of another day.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** `pytest tests -v` → PASS.
- [ ] **Step 5: Commit** `feat(services): add verified program and vacation services`.

### Task 5: Lovelace card

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/rollup.config.mjs`, `frontend/src/toon-program-card.ts`, `frontend/src/views/*.ts` (week, day, edit-sheet, vacation), `frontend/src/localize.ts` (nl/en strings)
- Create (build output, committed): `custom_components/toon_program/frontend/toon-program-card.js`
- Modify: `custom_components/toon_program/__init__.py` (register static path `/toon_program/toon-program-card.js` with cache headers off for dev and `add_extra_js_url`; once per HA instance)
- Test: `frontend/test/*.test.ts` (Vitest + `@open-wc/testing` or happy-dom; builder's choice) for the pure helpers

**Interfaces:**
- Consumes: sensor attributes and services from Tasks 3–4.
- Card type `custom:toon-program-card`; config `{entity?: string}` (default: first `sensor.*` whose `attributes.days` and `program_hash` exist and whose entity id belongs to platform `toon_program`; use `hass.entities[id].platform`).
- `window.customCards.push({type: "toon-program-card", name: "Toon weekprogramma", description: …})`.
- Views and behaviour exactly as the mockups (https://claude.ai/artifact/J2dUXEnPBMZQ1YcNUuMsVV) and the spec's "Card" section. Day order Ma…Zo maps to Toon days `[1,2,3,4,5,6,0]`. Preset colours: comfort `#c4561f`, home `#f2b04a`, sleep `#27407a`, away `#a9b0b8`, vacation `#6b8f71`. Edit sheet −10/+10 minute buttons clamp within 00:00–23:50. "Opslaan" calls `set_day` with the `program_hash` of the data the edit started from; on error shows the HA error message inline and keeps edits. "Kopieer naar…" opens a weekday multi-select then calls `copy_day`. Vacation view: one vacation at a time; form `datetime-local` from/to, temperature (default current `vacation_temperature`).
- Use HA theme CSS variables where they exist (`--primary-color`, `--card-background-color`, `--primary-text-color`, `--secondary-text-color`, `--divider-color`, `--error-color`) instead of the mockup's hex values.

- [ ] **Step 1: Failing helper tests:** `barSegments(day, carryIn, points)` returns `[ {state, fromMin, toMin} ]` covering 0–1440 (Wednesday fixture → 3 segments 2/1/2); `nudge("06:20", -10) === "06:10"`, `nudge("00:05", -10) === "00:00"`, `nudge("23:50", 10) === "23:50"`; `uiDayToToon(0) === 1`, `uiDayToToon(6) === 0`.
- [ ] **Step 2: Run** `npm test` → FAIL. **Step 3: Implement** helpers and the card. **Step 4:** `npm test` → PASS; `npm run build` produces `custom_components/toon_program/frontend/toon-program-card.js`.
- [ ] **Step 5:** Python test `tests/test_frontend.py`: after setup, `GET /toon_program/toon-program-card.js` returns 200 and the JS URL is in `hass.data["frontend_extra_module_url"]` (or the current HA equivalent; check HA source, do not guess the key).
- [ ] **Step 6: Commit** `feat(card): add toon program lovelace card`.

### Task 6: CI, README, release prep

**Files:**
- Create: `.github/workflows/validate.yml` (hassfest `home-assistant/actions/hassfest@master`, HACS `hacs/action@main` with `category: integration`), `.github/workflows/tests.yml` (pytest + `npm ci && npm test && npm run build` and fail if the built JS differs from the committed one), `README.md`
- README (English): what it does, requirement "rooted Toon with local web API", HACS custom repository install, config, card YAML `type: custom:toon-program-card`, services, known limitations (one vacation; vacation temperature is stored as the Toon's state 4; Toon screen refresh result from Task 7).

- [ ] **Step 1:** Write files. **Step 2:** `pytest tests -v` and `cd frontend && npm test && npm run build` pass locally; `git diff --exit-code custom_components/toon_program/frontend/` clean.
- [ ] **Step 3: Commit** `ci: add hassfest, hacs and test workflows` and separately `docs: add readme`.

### Task 7: On-device verification (controller, not a subagent)

Runs against the real Toon at `192.168.2.117` from the HA VM `100.104.228.86`; needs Rick's go-ahead per write because the auto-mode classifier blocks device writes.

- [ ] Back up `config_happ_thermstat.xml` again (date-stamped).
- [ ] Install the integration on the HA VM (copy `custom_components/toon_program`), restart HA, add via UI, add the card to the "Thuis" dashboard.
- [ ] Holiday pass-through: set a test vacation in 2027, save a one-minute change on Saturday via the card, read back program (holiday intact), revert, remove vacation, restore state 4 to 600.
- [ ] Check whether the Toon's own program screen shows the change; record result in README.
- [ ] Phone check (390 px) of all four views; screenshot each.
