import type { Point } from "./types";

export interface Segment {
  state: number;
  fromMin: number;
  toMin: number;
}

export const DAY_MINUTES = 1440;
const MAX_POINT_MIN = 23 * 60 + 50;

// UI order is Monday first; Toon order is Sunday = 0.
const UI_TO_TOON = [1, 2, 3, 4, 5, 6, 0];

export function uiDayToToon(ui: number): number {
  return UI_TO_TOON[ui];
}

export function toonDayToUi(toon: number): number {
  return UI_TO_TOON.indexOf(toon);
}

export function timeToMin(time: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m) throw new Error(`invalid time: ${time}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function nudge(time: string, deltaMin: number): string {
  const next = Math.min(MAX_POINT_MIN, Math.max(0, timeToMin(time) + deltaMin));
  return minToTime(next);
}

// Segments covering 0-1440 min. The day argument is kept for call-site clarity.
export function barSegments(_day: number, carryIn: number, points: Point[]): Segment[] {
  const sorted = [...points].sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
  const segments: Segment[] = [];
  let state = carryIn;
  let from = 0;
  for (const p of sorted) {
    const at = timeToMin(p.time);
    if (at > from) segments.push({ state, fromMin: from, toMin: at });
    state = p.state;
    from = at;
  }
  segments.push({ state, fromMin: from, toMin: DAY_MINUTES });
  return segments;
}

export function formatTemp(value: number, lang: string): string {
  return `${value.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°`;
}
