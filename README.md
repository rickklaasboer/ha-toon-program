# Toon Program

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Entities](#entities)
- [The Card](#the-card)
- [Services](#services)
- [How It Works](#how-it-works)
- [Known Limitations](#known-limitations)

<a name="introduction"></a>
## Introduction

A rooted Toon thermostat runs its own weekly heating program, but out of the box you can only change that program on the Toon itself. Toon Program lets you view and edit the program from Home Assistant instead, using a Lovelace card that is bundled with the integration.

The Toon remains the source of truth. Home Assistant only edits the program; the Toon keeps running it, even while Home Assistant is offline. Nothing needs to be installed on the Toon, and the integration runs alongside `toon_climate` without conflict.

To use Toon Program, you need a rooted Toon whose local web API is reachable from Home Assistant over plain HTTP. The integration does not use the Eneco cloud.

<a name="installation"></a>
## Installation

The easiest way to install Toon Program is through HACS. Open HACS, choose **Custom repositories** from the menu, and add the following repository with the category **Integration**:

```text
https://github.com/rickklaasboer/ha-toon-program
```

Next, install **Toon Program** and restart Home Assistant.

If you would rather install the integration manually, copy the `custom_components/toon_program` directory into the `custom_components` directory of your Home Assistant configuration and restart Home Assistant.

<a name="configuration"></a>
## Configuration

Once installed, add the integration via **Settings > Devices & services > Add integration**. Home Assistant will ask for two values:

- **Host**: the IP address or hostname of your Toon.
- **Port**: the port of the Toon's web API. In most cases, this is `80`.

Each Toon is configured as its own entry, so you may add more than one. The integration polls every Toon once a minute.

<a name="entities"></a>
## Entities

Every Toon receives two entities:

| Entity | Description |
| --- | --- |
| `sensor.toon_program` | The active preset: `comfort`, `home`, `sleep`, `away` or `vacation`. Its attributes contain the full week program, the next switch time and the program hash used by the card and services. |
| `switch.toon_program_enabled` | Turns the Toon's program on or off. A temporary override on the Toon counts as on. |

> [!NOTE]
> Home Assistant derives entity IDs from the translated entity names. When your Home Assistant instance runs in Dutch, these entities are named `sensor.toon_weekprogramma` and `switch.toon_programma` instead.

<a name="the-card"></a>
## The Card

The card is shipped with the integration and registered automatically, so you do not need to add a dashboard resource. To place it on a dashboard, add the following card:

```yaml
type: custom:toon-program-card
```

The card shows the week at a glance. Tapping a day opens the day editor, where you can move, add and remove switch times, change presets and copy a day to other days. Changes stay local until you press **Save**. The card also lets you plan a vacation and turn the program on or off.

By default, the card uses the first Toon it finds. If you have more than one Toon, you may point the card at a specific one using the `entity` option:

```yaml
type: custom:toon-program-card
entity: sensor.toon_program
```

The card follows the language of your Home Assistant user and is available in Dutch and English.

> [!NOTE]
> If the card shows "Configuration error" right after installing the integration, your browser is still using a cached copy of the frontend. Reloading the page solves this. In the Companion app, go to **Settings > Companion app > Debugging**, choose **Reset frontend cache** and restart the app.

<a name="services"></a>
## Services

The card uses the following services, but you are free to call them yourself, for example from a script. Every service requires the `device_id` of the Toon.

| Service | Fields |
| --- | --- |
| `toon_program.set_day` | `device_id`, `day`, `points`, `program_hash` |
| `toon_program.copy_day` | `device_id`, `source`, `targets`, `program_hash` |
| `toon_program.set_vacation` | `device_id`, `start`, `end`, `temperature` |
| `toon_program.remove_vacation` | `device_id`, `entry_id` |

Days are numbered the way the Toon numbers them: `0` is Sunday and `6` is Saturday. Presets are numbered as well: `0` is comfort, `1` home, `2` sleep and `3` away. For example, the following call makes Wednesday start at 06:40 and go to sleep at 23:00:

```yaml
action: toon_program.set_day
data:
  device_id: 0123456789abcdef0123456789abcdef
  day: 3
  points:
    - time: "06:40"
      state: 1
    - time: "23:00"
      state: 2
  program_hash: "{{ state_attr('sensor.toon_program', 'program_hash') }}"
```

The `program_hash` tells the integration which version of the program your change is based on. If the program was changed in the meantime, for example on the Toon itself, the call fails and nothing is written.

When planning a vacation, `start` and `end` are local date-times, and `temperature` is a value between 6 and 30 degrees in steps of 0.5. Calling `set_vacation` while a vacation is already planned updates that vacation.

<a name="how-it-works"></a>
## How It Works

<a name="where-the-program-lives"></a>
### Where the Program Lives

The Toon stores its week program as the `thermostatProgram` config object of its `happ_thermstat` package. The program is a closed chain of entries: each entry has a start day and time, an end day and time, and a preset. The last entry of the week runs into the first one. A planned vacation is stored as one additional entry of type `holiday` in the same object, while the preset temperatures live in a separate object named `thermostatStates`.

<a name="reading-the-program"></a>
### Reading the Program

Once a minute, the integration reads three things from the Toon's local web API:

- The program and the preset temperatures, via `/hcb_config?action=getObjectConfigTree`.
- The live status, such as the active preset and the next switch time, via `/happ_thermstat?action=getThermostatInfo`.
- The planned vacations, via `/happ_thermstat?action=GetHolidays`.

All of this is exposed on the program sensor, which is where the card gets its data from.

<a name="switch-times"></a>
### Switch Times

The Toon thinks in entries, but the card and services think in switch times per day, just like the Toon's own screen: "from 06:20 Home, from 23:00 Sleep". Each entry's start becomes a switch time on the day it starts, so a Saturday 23:30 to Sunday 09:30 block belongs to Saturday. A day without any switch times simply continues the preset that was active at midnight.

When writing a change, the integration sorts every switch time of the week and turns them back into entries. Each entry runs until the next switch time, and the last one wraps around to the first. Neighbouring switch times with the same preset are merged.

<a name="writing-the-program"></a>
### Writing the Program

Every change goes through the same steps, and only one change is written at a time:

1. The program is read from the Toon again.
2. Its hash is compared with the `program_hash` of the call. If they differ, the integration refreshes its data and the call fails, so a change made on the Toon is never overwritten.
3. The change is applied and the week is validated. Times and presets must be valid, no two switch times may share the same moment, and the week must contain at least one switch time.
4. The program is converted to XML in the same format the Toon's own screen uses, and sent to `/hcb_config?action=setObjectConfig`.
5. The program is read back and compared with what was sent. If they do not match, the call fails.

That last step matters, because the Toon replies `{"result":"ok"}` even when it ignores a write. This happens, for instance, when the XML is missing its `<Config>` root or the object's `uuid`. A write also replaces the entire object on the Toon, so the integration sends back every field it read, including vacation entries.

<a name="vacations-and-the-program-switch"></a>
### Vacations and the Program Switch

Vacations are managed through the Toon's own `SetHoliday`, `RemoveHoliday` and `GetHolidays` actions, and the program is turned on or off with `changeSchemeState`. Since the Toon may apply these with a short delay, the integration reads the result back a few times before deciding whether the change was applied.

<a name="known-limitations"></a>
## Known Limitations

- Only one vacation can be planned at a time, just like on the Toon's own screen.
- The Toon stores the vacation temperature as the temperature of its fifth preset. That temperature keeps its value after the vacation has been removed.
- Preset temperatures are shown, but cannot be changed from Home Assistant.
- It has not yet been verified whether the Toon's own screen picks up a change made from Home Assistant without a reboot.

Toon Program is not affiliated with Eneco. Keep a backup of your Toon's configuration before you start making changes.

## License

Toon Program is open-source software licensed under the [MIT license](LICENSE).
