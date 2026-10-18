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
  errorPrefix: "Fout",
  presets: { "0": "Comfort", "1": "Thuis", "2": "Slapen", "3": "Weg", "4": "Vakantie" },
  daysShort: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  daysLong: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
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
  errorPrefix: "Error",
  presets: { "0": "Comfort", "1": "Home", "2": "Sleep", "3": "Away", "4": "Vacation" },
  daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
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
