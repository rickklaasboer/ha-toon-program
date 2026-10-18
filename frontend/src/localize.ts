const nl = {
  title: "Weekprogramma",
  on: "Aan",
  now: "Nu",
  at: "om",
  to: "naar",
  tapDay: "Tik op een dag om de tijden aan te passen.",
  vacation: "Vakantie",
  back: "Terug",
  addTime: "Tijd toevoegen",
  copyTo: "Kopieer naar…",
  save: "Opslaan",
  saving: "Opslaan…",
  unsaved: "Wijziging op {day} nog niet opgeslagen",
  discardConfirm: "De wijziging op {day} is nog niet opgeslagen. Weggooien?",
  copyHint: "Sla eerst je wijziging op om te kopiëren.",
  done: "Klaar",
  fromDay: "{day}, vanaf",
  time: "Tijd",
  earlier: "10 minuten eerder",
  later: "10 minuten later",
  preset: "Stand",
  removeBlock: "Dit blok verwijderen",
  readOnlyState: "Deze stand kan hier niet gewijzigd worden.",
  copyTitle: "Kopieer {day} naar",
  copyAction: "Kopiëren",
  cancel: "Annuleren",
  planned: "Gepland",
  noVacation: "Geen vakantie gepland.",
  newVacation: "Nieuwe vakantie",
  from: "Van",
  until: "Tot",
  vacationTemp: "Temperatuur tijdens vakantie",
  scheduleVacation: "Vakantie inplannen",
  removeVacation: "Vakantie verwijderen",
  noEntity: "Geen Toon-programma gevonden. Stel de entiteit in de kaartconfiguratie in.",
  unreachable: "Toon niet bereikbaar",
  reload: "Opnieuw laden",
  rangeTo: "tot",
  presets: { "0": "Comfort", "1": "Thuis", "2": "Slapen", "3": "Weg", "4": "Vakantie" },
  daysShort: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  daysLong: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
  errors: {
    program_state_failed: "Het programma kon niet worden aangepast: {error}",
    program_changed: "Het programma is op de Toon gewijzigd. Ververs en probeer opnieuw.",
    write_not_applied: "De Toon heeft de wijziging niet overgenomen.",
    cannot_connect: "De Toon is niet bereikbaar.",
    empty_week: "Het programma moet minstens één tijd bevatten.",
    duplicate_time: "Twee tijden op hetzelfde moment.",
    invalid_time: "Ongeldige tijd.",
    invalid_state: "Ongeldige stand.",
    end_before_start: "Het einde van de vakantie moet na het begin liggen.",
    invalid_device: "Dit apparaat hoort niet bij Toon Program.",
    unknown_vacation: "Deze vakantie bestaat niet (meer) op de Toon.",
  } as Record<string, string>,
  cardName: "Toon weekprogramma",
  cardDescription: "Bekijk en bewerk het weekprogramma van je Toon.",
};

const en: typeof nl = {
  title: "Week program",
  on: "On",
  now: "Now",
  at: "at",
  to: "to",
  tapDay: "Tap a day to edit its times.",
  vacation: "Vacation",
  back: "Back",
  addTime: "Add time",
  copyTo: "Copy to…",
  save: "Save",
  saving: "Saving…",
  unsaved: "Change on {day} not saved yet",
  discardConfirm: "The change on {day} is not saved yet. Discard it?",
  copyHint: "Save your change first to copy.",
  done: "Done",
  fromDay: "{day}, from",
  time: "Time",
  earlier: "10 minutes earlier",
  later: "10 minutes later",
  preset: "Preset",
  removeBlock: "Remove this block",
  readOnlyState: "This preset cannot be changed here.",
  copyTitle: "Copy {day} to",
  copyAction: "Copy",
  cancel: "Cancel",
  planned: "Planned",
  noVacation: "No vacation planned.",
  newVacation: "New vacation",
  from: "From",
  until: "Until",
  vacationTemp: "Temperature during vacation",
  scheduleVacation: "Schedule vacation",
  removeVacation: "Remove vacation",
  noEntity: "No Toon program found. Set the entity in the card configuration.",
  unreachable: "Toon not reachable",
  reload: "Reload",
  rangeTo: "to",
  presets: { "0": "Comfort", "1": "Home", "2": "Sleep", "3": "Away", "4": "Vacation" },
  daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  errors: {
    program_state_failed: "Could not change the program state: {error}",
    program_changed: "The program was changed on the Toon. Refresh and try again.",
    write_not_applied: "The Toon did not accept the change.",
    cannot_connect: "Cannot connect to the Toon.",
    empty_week: "The program must contain at least one time.",
    duplicate_time: "Two times at the same moment.",
    invalid_time: "Invalid time.",
    invalid_state: "Invalid state.",
    end_before_start: "The end of the vacation must be after the start.",
    invalid_device: "This device does not belong to Toon Program.",
    unknown_vacation: "This vacation no longer exists on the Toon.",
  } as Record<string, string>,
  cardName: "Toon week program",
  cardDescription: "View and edit the week program of your Toon.",
};

export type Strings = typeof nl;

export function strings(language: string): Strings {
  return language.toLowerCase().startsWith("nl") ? nl : en;
}

export function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`missing placeholder ${k}`);
    return vars[k];
  });
}

export const STATE_KEYS = ["comfort", "home", "sleep", "away", "vacation"] as const;

export const STATE_COLORS: Record<number, string> = {
  0: "#c4561f",
  1: "#f2b04a",
  2: "#27407a",
  3: "#a9b0b8",
  4: "#6b8f71",
};

export interface ServiceError {
  message?: string;
  translation_key?: string;
  translation_placeholders?: Record<string, string>;
}

// Backend messages are English only; map the exception key to the card language.
export function errorText(t: Strings, err: ServiceError): string {
  const template = err.translation_key ? t.errors[err.translation_key] : undefined;
  if (template === undefined) return err.message ?? String(err);
  return fmt(template, err.translation_placeholders ?? {});
}
