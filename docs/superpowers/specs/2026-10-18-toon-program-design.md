# Toon week program in Home Assistant: design

Date: 2026-10-18
Repo: `rickklaasboer/ha-toon-program` (HACS), integration domain `toon_program`
Tracking issue: https://board.klaasboer.org/HZ/1
UI mockups: https://claude.ai/artifact/J2dUXEnPBMZQ1YcNUuMsVV

## Intent

A rooted Toon thermostat runs its own weekly heating program, but it can only be edited on the
Toon itself. The household that prompted this has school-aged kids with changing school hours;
the person who edits the program (Rick's mother) already uses Home Assistant on her phone and
wants to shift wake/sleep times there instead of walking to the Toon.

The integration makes the Toon's own week program and vacations editable from a Home Assistant
dashboard card. The Toon stays the source of truth and keeps running the program when HA is down.
It is published via HACS so other rooted-Toon owners can use it.

## Goals

- View the full week program at a glance on a phone (primary) and desktop (secondary).
- Edit per day: move a switch time, change its preset, add or remove a switch, copy a day to
  other days.
- Manage vacations: list, add, remove.
- Toggle program on/off and show what is active now and what comes next.
- Install via HACS with a UI config flow (host of the Toon); card available without manual
  resource setup.
- Works on any rooted Toon with the stock local web API; nothing installed on the Toon.

## Non-goals

- No automation-driven changes to the program. HA is an editor, not a scheduler. (Services exist
  because the card needs them, but there is no feature to change the program on triggers.)
- No editing of preset temperatures (comfort/home/sleep/away values). Show them, read-only.
- No replacement of `toon_climate`; both run side by side.
- No ToonStore app.
- No cloud / Eneco API support; local rooted API only.

## Anti-goals (failure even if it "works")

- Silently losing or corrupting the program: a write that the Toon ignores, a write that drops
  vacation entries, a week with gaps. Every write must be verified and every failure visible.
- A UI that needs explanation. The primary user is not technical; if she has to ask how it works,
  it failed.
- Overwriting a change someone just made on the Toon itself.

## Constraints and verified facts about the Toon

Tested on 2026-10-18 against a rooted Toon (BusyBox 1.27, kernel 4.9.88, `happ_thermstat`).

**Read the program**
`GET http://<toon>/hcb_config?action=getObjectConfigTree&package=happ_thermstat&internalAddress=thermostatProgram`
Returns JSON where every XML value is a one-element array:
```json
{"package":["happ_thermstat"],"uuid":["266d…"],"type":["program"],"internalAddress":["thermostatProgram"],
 "visibility":["1"],"schedule":[{"entry":[{"type":["weekly_recurring"],"startMin":["30"],"startHour":["9"],
 "startDayOfWeek":["0"],"targetState":["1"],"endMin":["0"],"endHour":["23"],"endDayOfWeek":["0"]}, …]}]}
```
- `startDayOfWeek`/`endDayOfWeek`: 0 = Sunday … 6 = Saturday.
- `targetState`: 0 comfort, 1 home, 2 sleep, 3 away (4 = eco/anti-freeze exists in `thermostatStates`).
- Entries form a closed chain around the week: each entry's end equals the next entry's start;
  entries may cross midnight (e.g. Sat 23:30 → Sun 09:30).
- The `uuid` differs per Toon; read it, never hard-code it.

**Read preset temperatures**
`GET /hcb_config?action=getObjectConfigTree&package=happ_thermstat&internalAddress=thermostatStates`
→ `states[0].state[]` with `id` and `tempValue` in centidegrees.

**Read live status**
`GET /happ_thermstat?action=getThermostatInfo` → `currentTemp`, `currentSetpoint`, `programState`,
`activeState`, `nextState`, `nextTime` (unix), `nextSetpoint`, `randomConfigId`.
`randomConfigId` changes after a real config change. The Toon GUI uses it to reload.

**Write the program**
`GET /hcb_config?action=setObjectConfig&config=<url-encoded XML>`
- Parameter name is `config` (lowercase). `Config` → `{"result":"error","error":"No config in message!"}`.
- The XML MUST have `<Config>` as root. Without it the Toon answers `{"result":"ok"}` and does
  nothing. Never trust `result: ok`; verify by reading back.
- Write `type` both as attribute and as child element, in the order the Toon itself uses:
  ```xml
  <Config><device><package>happ_thermstat</package><uuid>…</uuid><type>program</type>
  <internalAddress>thermostatProgram</internalAddress><visibility>1</visibility><schedule>
  <entry type="weekly_recurring"><type>weekly_recurring</type><startMin>30</startMin>
  <startHour>9</startHour><startDayOfWeek>0</startDayOfWeek><targetState>1</targetState>
  <endMin>0</endMin><endHour>23</endHour><endDayOfWeek>0</endDayOfWeek></entry>…</schedule>
  </device></Config>
  ```
  Writing `type` only as element was accepted and persisted but deviates from the Toon's own
  format; do not do that.
- The write replaces the whole `schedule`. Any entry not sent (including vacation entries) is gone.
- The write replaces the whole config object: any top-level field not sent is deleted (seen with
  `statesSaved` on `thermostatStates`). Pass through every field that was read.
- The object's `uuid` is required: without it the Toon answers `ok` and changes nothing.
- GET with the full program (14 entries) is ~3.3 KB XML, well within URL limits. If a much
  larger program fails over GET, the builder may test POST; not verified.

**Vacations (verified 2026-10-18)**
- Create: `GET /happ_thermstat?action=SetHoliday&startTimeT=<unix>&endTimeT=<unix>&setpoint=<centideg>`
  → `{"result":"ok"}`. The Toon GUI passes `entryId` as well to update an existing vacation.
- List: `GET /happ_thermstat?action=GetHolidays` →
  `{"result":"ok","entry":[{"startTimeT":"…","endTimeT":"…","entryId":"<uuid>"}]}`.
- Remove: `GET /happ_thermstat?action=RemoveHoliday&entryId=<uuid>` → `ok`, entry gone.
  (Action names are case-sensitive: `getHolidays` → "no handler".)
- While a vacation exists, the program gains one extra entry
  `{"type":["holiday"],"startTimeT":[…],"endTimeT":[…],"targetState":["4"],"entryId":[…]}`.
  The `weekly_recurring` entries stay byte-identical, so the weekly chain stays closed.
- Side effect: `setpoint` is stored as the `tempValue` of state 4 in `thermostatStates`, and
  `RemoveHoliday` does not restore it. State 4 is the vacation temperature.
- The Toon GUI handles one vacation at a time.
- Vacations are never written through `setObjectConfig`: holiday entries in the program are
  passed through unchanged on program writes, and created/removed only via the actions above.

**Toon has no auth on this API** and is reached on the LAN over plain HTTP. Nothing to configure
beyond host (and optional port, default 80).

## How it is built (decided)

### One HACS repo, integration + bundled card

- `custom_components/toon_program/`: the integration.
- The Lovelace card is shipped inside the integration (e.g. `custom_components/toon_program/www/`
  or a `frontend/` build output copied there) and registered by the integration on setup
  (static path + `add_extra_js_url`), so users do not add a dashboard resource by hand.
- `hacs.json` for an integration repo.

### Integration

- Config flow: host (+ port). Validate by calling `getThermostatInfo` and reading the program
  `uuid`. Unique id = program `uuid`. Multiple Toons = multiple entries.
- `DataUpdateCoordinator` polling program, states and thermostat info. Interval is the builder's
  call (my suggestion: 60 s; light requests on a LAN device).
- Entities (minimum):
  - one entity that carries the full program + states as attributes, for the card to read
    (e.g. a `sensor` whose state is the active preset and attributes hold the program in a
    normalised form);
  - a `switch` for program on/off (`happ_thermstat?action=changeSchemeState&state=1|0`,
    as `toon_climate` does). The builder should check `toon_climate`'s code for exact values.
- Services (used by the card; documented for others):
  - `toon_program.set_day`: replace one weekday's switch points.
  - `toon_program.copy_day`: copy a weekday's switch points to a list of weekdays.
  - `toon_program.set_program`: replace the whole week (for completeness/testing).
  - `toon_program.add_vacation` / `remove_vacation`: once the vacation format is known.
  All take the config entry / device as target.

### Data model between card and integration

The card works with **switch points per day**: `[{time: "06:20", state: "home"}, …]`, matching
how the Toon UI and the mockups present it ("from 06:20 Home"). The integration converts:

- Toon → switch points: each entry's start becomes a switch point on its `startDayOfWeek`.
- Switch points → Toon entries: sort all switch points over the week; each entry runs from one
  switch point to the next, the last wraps to the first. This rebuilds a closed chain
  automatically, including entries crossing midnight.
- Consecutive switch points with the same state are merged.

### Write path (every write)

1. Re-read the current program from the Toon.
2. Conflict check: if it differs from the program the card was editing (compare a hash sent along
   with the service call), refuse with a clear error ("Het programma is op de Toon gewijzigd,
   ververs en probeer opnieuw"). Prevents overwriting a change made on the Toon.
3. Apply the change to that fresh copy. Keep every non-`weekly_recurring` entry (vacations)
   untouched.
4. Validate: at least one switch point per week, times on whole minutes, valid states, no two
   switch points at the same moment. (Chain closure is guaranteed by construction.)
5. Build XML exactly as above; `setObjectConfig` with `config=`.
6. Read back and compare the schedule with what was sent. Mismatch → raise
   `HomeAssistantError` with a clear message; log the sent XML and the response at debug level.
7. Refresh the coordinator.

Fail loud: no swallowed exceptions, no silent fallbacks. Network errors → the card shows the
error; the entity goes unavailable on read failure.

### Card (see mockups)

Four views, phone first (390 px wide baseline), works at desktop width:

1. **Week overview**: per weekday a 0–24 h bar coloured by preset; "now X, at HH:MM to Y";
   program on/off; legend with preset temperatures; tap a day → day view; Vacation button.
2. **Day view**: weekday tabs (Ma–Zo); the day's bar; list of switch points (time, preset,
   temperature); "Tijd toevoegen", "Kopieer naar…"; edits are local until **Opslaan**, which
   sends one service call. Unsaved state is visible.
3. **Edit switch point** (bottom sheet): time input with −10 / +10 min buttons; preset choice
   (4 presets with colour and temperature); delete.
4. **Vacation**: list of planned vacations with delete; form with from, to and (if the Toon
   supports it) temperature.

Presets keep fixed colours that also differ in lightness (sleep dark blue, home amber, comfort
dark orange, away grey). Touch targets ≥ 44 px. Card text in Dutch and English via HA language;
the integration ships `nl` and `en` translations.

Card tech is the builder's call (Lit, as most HA cards, is the obvious default).

## Open research (do first, before building the vacation part)

1. **Vacation format**: done, see "Vacations (verified)" above. Still open: the exact XML the
   Toon expects for a `holiday` entry when a program write passes it through. Verify on the
   device (write the unchanged program while a future test vacation exists, read back, remove
   the vacation, restore state 4's temperature).
2. **Toon screen refresh**: after a write from HA, check whether the Toon's own program screen
   shows the change without a reboot. If not, document it in the README.

Testing on the real Toon: always back up first
(`/mnt/data/qmf/config/config_happ_thermstat.xml`; a backup from 2026-10-18 exists at
`/mnt/data/qmf/config_happ_thermstat.xml.bak-20261018`) and restore the original program after
each experiment.

## Testing

- Unit tests for conversion (Toon entries ⇄ switch points), including midnight crossing, merging,
  vacation entries preserved, and XML building (byte-for-byte expected output for a known program).
- Integration tests with a fake Toon HTTP server reproducing the quirks above (`Config` vs
  `config`, missing `<Config>` root → `ok` but no change), so the read-back verification is tested.
- Manual end-to-end on the real Toon in Zwolle, phone and desktop.

## Decisions from design review (my calls, check these)

1. **Vacations**: verified that a vacation does not reshape the weekly entries. Conversion and
   validation only ever operate on `weekly_recurring` entries; all other entries are passed
   through in their original order with their original fields. One vacation at a time, like the
   Toon GUI: adding a vacation while one exists updates it (`entryId`). The vacation temperature
   shown and edited in the card is state 4's `tempValue`.
2. **Conflict hash** = hash of the normalised `weekly_recurring` entries only (sorted, as
   `(startDay, startHour, startMin, targetState)` tuples). Exposed as an entity attribute and
   sent with every program service call. Vacation services carry their own check on the vacation
   list. Program on/off and `randomConfigId` are not part of it.
3. **Day ownership**: a switch point belongs to the day of its start (`startDayOfWeek`); Sat 23:30
   → Sun 09:30 is Saturday's 23:30 point. Each day exposes a `carry_in` state (the state active
   at 00:00, from the previous switch point) so the card can draw the 0–24 h bar. A day may have
   zero switch points (the carry-in state runs all day); the week needs at least one. Merging of
   consecutive equal states happens in the integration on save; the card re-renders from the
   saved program.
4. **State 4 (eco/anti-freeze)**: preserved on write, shown read-only in the card with its own
   colour and label, not offered as a choice in the editor.
5. **Program on/off**: the switch maps `programState` using `toon_climate`'s constants (builder
   verifies them in its source and on the device); after `changeSchemeState`, read back
   `getThermostatInfo` and raise if `programState` did not change as requested. Values other than
   on/off are shown as on/off per `toon_climate`'s mapping and logged at debug.
6. **Error text** lives in the integration: `HomeAssistantError` with `translation_key`, nl and en
   in `strings.json`/translations. The card shows the error message as HA delivers it.
7. **Card ↔ device**: the card is configured with (or defaults to) one `toon_program` entity and
   derives the device/config entry and the conflict hash from that entity.
8. **Card distribution**: register via static path + `add_extra_js_url` and set
   `window.customCards` so it appears in the card picker.

## Left to the builder

- Polling interval, entity naming, exact service schemas.
- Card framework and build setup.
- Repo license (my call: MIT).
- How the card discovers its entity (config option on the card, defaulting to the first
  `toon_program` entity).
