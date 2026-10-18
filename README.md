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

## How writes are verified

The Toon answers `{"result":"ok"}` even when it ignored a write, so that answer is not trusted. Every write re-reads the program from the Toon and compares it with what was sent. A mismatch raises an error in Home Assistant. Vacation and program on/off changes are verified the same way. Vacation entries in the program are passed through unchanged when the weekly program is written.

## Known limitations

- One vacation at a time, like the Toon's own screen. Setting a vacation while one exists updates it.
- The vacation temperature is stored as the temperature of the Toon's state 4. It stays at that value after the vacation is removed.
- Preset temperatures are shown but cannot be edited.
- Whether the Toon's own screen shows a change made from Home Assistant without a reboot is not yet verified.

## Disclaimer

Not affiliated with Eneco. Use at your own risk and keep a backup of your Toon's configuration.

## License

MIT
