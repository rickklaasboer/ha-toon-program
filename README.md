# Toon Program

Home Assistant integration to view and edit the weekly heating program of a rooted Toon thermostat, plus a Lovelace card for it. Without this, the program can only be changed on the Toon itself.

The Toon stays the source of truth and keeps running its program when Home Assistant is down. Nothing is installed on the Toon. It runs side by side with `toon_climate`.

## Requirements

A rooted Toon with its local web API reachable from Home Assistant over plain HTTP (no authentication). Eneco cloud accounts are not supported.

## Installation

### HACS (custom repository)

1. In HACS, open the menu and choose Custom repositories.
2. Add `https://github.com/rickklaasboer/ha-toon-program` with category Integration.
3. Install Toon Program and restart Home Assistant.

### Manual

Copy `custom_components/toon_program` to the `custom_components` folder of your Home Assistant configuration and restart Home Assistant.

## Configuration

Add the integration under Settings, Devices & services. The setup asks for:

- Host: the address of the Toon.
- Port: the web API port of the Toon (default 80).

Each Toon is one config entry. The Toon is polled every 60 seconds.

## Entities

- `sensor.toon_program`: the active preset (comfort, home, sleep, away, vacation). Attributes hold the week program, the next switch and the program hash used by the card and services.
- `switch.toon_program_enabled`: turns the Toon's program on or off. A temporary override counts as on.

These are the ids with Home Assistant set to English. Entity ids are created from the translated names, so with Home Assistant in Dutch they are `sensor.toon_weekprogramma` and `switch.toon_programma`.

## Card

The card is bundled with the integration and registered automatically, no dashboard resource is needed. It shows the week, a day editor (move, add and remove switch times, change presets, copy a day to other days), vacations and the program switch.

```yaml
type: custom:toon-program-card
entity: sensor.toon_program
```

`entity` is optional. Without it the card uses the first `toon_program` entity. Card text follows the Home Assistant language (Dutch and English).

If the card shows "Configuration error" right after installing, the frontend still runs from a cache made before the integration was added. Reload the page. In the Home Assistant Companion app, use Settings, Companion app, Debugging, Reset frontend cache, then restart the app.

## Services

All services take `device_id`, the Toon device. Days are numbered as the Toon does: 0 = Sunday to 6 = Saturday.

| Service | Fields |
| --- | --- |
| `toon_program.set_day` | `device_id`, `day`, `points` (list of `{time: "HH:MM", state: 0-3}`), `program_hash` |
| `toon_program.copy_day` | `device_id`, `source`, `targets` (list of days), `program_hash` |
| `toon_program.set_vacation` | `device_id`, `start`, `end`, `temperature` (6 to 30, step 0.5) |
| `toon_program.remove_vacation` | `device_id`, `entry_id` |

States: 0 comfort, 1 home, 2 sleep, 3 away. `program_hash` is the `program_hash` attribute of `sensor.toon_program`. If the program on the Toon changed since that value was read, the call fails and nothing is written.

## How it works

### Where the program lives

The Toon stores its week program as the config object `thermostatProgram` of its `happ_thermstat` package. The program is a closed chain of entries. Each entry has a start (day, hour, minute), an end and a preset (`targetState`), and the last entry of the week runs into the first. A planned vacation is one extra entry of type `holiday` in the same object. The preset temperatures live in a separate object, `thermostatStates`.

### Reading

Every 60 seconds the integration reads, over the Toon's local web API:

- the program and the preset temperatures (`/hcb_config?action=getObjectConfigTree`),
- the live status: active preset, next switch, program on or off (`/happ_thermstat?action=getThermostatInfo`),
- the planned vacations (`/happ_thermstat?action=GetHolidays`).

The result is exposed on the program sensor. The card reads everything from that sensor.

### From entries to switch times

The card and the services work with switch times per day, like the Toon's own screen: "from 06:20 Home, from 23:00 Sleep". Each entry's start becomes a switch time on its start day, so the Saturday 23:30 to Sunday 09:30 block belongs to Saturday. A day without switch times keeps the preset that was active at midnight.

When writing, the integration sorts all switch times of the week and turns them back into entries: each one runs until the next switch time, and the last one of the week wraps around to the first. Neighbouring switch times with the same preset are merged.

### Writing

A change goes through these steps, one write at a time:

1. Read the program from the Toon again.
2. Compare it with the `program_hash` the change was based on. If the program was changed in the meantime (for example on the Toon itself), stop with an error and refresh, so nothing made on the Toon is overwritten.
3. Apply the change and validate the week: valid times and presets, no two switch times at the same moment, at least one switch time in the week.
4. Build the XML the way the Toon's own screen does and send it with `/hcb_config?action=setObjectConfig`.
5. Read the program back and compare it with what was sent.

The last step exists because the Toon answers `{"result":"ok"}` even when it ignored a write, for example when the XML lacks the `<Config>` root or the object's `uuid`. A write also replaces the whole object, so every field that was read is sent back, and vacation entries are passed through unchanged. A mismatch raises an error in Home Assistant.

### Vacations and program switch

Vacations use the Toon's own actions: `SetHoliday` (start, end, temperature), `RemoveHoliday` and `GetHolidays`. Turning the program on or off uses `changeSchemeState`. Both are read back afterwards, a few times with a short pause, because the Toon may apply them with a small delay.

### Card

The card is a single JavaScript file inside the integration. On startup the integration serves it at `/toon_program/toon-program-card.js` and adds it to every page, so no dashboard resource is needed. The card keeps edits local until you save, then calls one service. Errors come back as translated messages. When the program changed on the Toon in the meantime, the card offers to reload.

## Known limitations

- One vacation at a time, like the Toon's own screen. Setting a vacation while one exists updates it.
- The vacation temperature is stored as the temperature of the Toon's state 4. It stays at that value after the vacation is removed.
- Preset temperatures are shown but cannot be edited.
- Whether the Toon's own screen shows a change made from Home Assistant without a reboot is not yet verified.

## Disclaimer

Not affiliated with Eneco. Use at your own risk and keep a backup of your Toon's configuration.

## License

MIT
