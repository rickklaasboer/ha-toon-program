import { html, type TemplateResult } from "lit";
import { formatTemp, timeToMin } from "../helpers";
import { STATE_COLORS, fmt, type Strings } from "../localize";
import type { DayData, Point, ProgramAttributes } from "../types";
import { bar, errorBox } from "./shared";

export interface DayProps {
  t: Strings;
  lang: string;
  attrs: ProgramAttributes;
  uiDay: number;
  day: DayData;
  points: Point[];
  dirty: boolean;
  saving: boolean;
  error: string | null;
  onTab(uiDay: number): void;
  onEdit(index: number): void;
  onAdd(): void;
  onCopy(): void;
  onSave(): void;
  onBack(): void;
}

export function dayView(p: DayProps): TemplateResult {
  const { t } = p;
  const rows = p.points
    .map((pt, index) => ({ pt, index }))
    .sort((a, b) => timeToMin(a.pt.time) - timeToMin(b.pt.time));
  return html`
    <div class="head">
      <button type="button" class="back" aria-label=${t.back} @click=${p.onBack}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
      </button>
      <h1>${t.title}</h1>
    </div>
    <div class="tabs">
      ${t.daysShort.map(
        (label, ui) =>
          html`<button type="button" class="tab ${ui === p.uiDay ? "active" : ""}" @click=${() => p.onTab(ui)}>${label}</button>`,
      )}
    </div>
    ${bar(p.day.carry_in, p.points, 12, 4)}
    <div class="points">
      ${rows.map(
        ({ pt, index }) => html`<button type="button" class="point" @click=${() => p.onEdit(index)}>
          <span class="ptime">${pt.time}</span>
          <i class="dot" style="background:${STATE_COLORS[pt.state]}"></i>
          <span class="pname">${t.presets[String(pt.state) as "0"]}</span>
          <span class="ptemp">${formatTemp(p.attrs.states[String(pt.state)], p.lang)}</span>
        </button>`,
      )}
    </div>
    <div class="row">
      <button type="button" class="outline" @click=${p.onAdd}>${t.addTime}</button>
      <button type="button" class="outline" ?disabled=${p.dirty} title=${p.dirty ? t.copyHint : ""} @click=${p.onCopy}>${t.copyTo}</button>
    </div>
    ${errorBox(p.error)}
    ${p.dirty
      ? html`<div class="savebar">
          <span>${fmt(t.unsaved, { day: t.daysLong[p.uiDay] })}</span>
          <button type="button" class="primary" ?disabled=${p.saving} @click=${p.onSave}>${p.saving ? t.saving : t.save}</button>
        </div>`
      : ""}
  `;
}
