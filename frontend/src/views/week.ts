import { html, type TemplateResult } from "lit";
import { formatTemp, uiDayToToon } from "../helpers";
import { STATE_COLORS, STATE_KEYS, type Strings } from "../localize";
import type { ProgramAttributes } from "../types";
import { bar } from "./shared";

export interface WeekProps {
  t: Strings;
  lang: string;
  attrs: ProgramAttributes;
  stateKey: string;
  onToggle(enabled: boolean, input: HTMLInputElement): void;
  onDay(uiDay: number): void;
  onVacation(): void;
}

function clock(iso: string, lang: string): string {
  return new Date(iso).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function weekView(p: WeekProps): TemplateResult {
  const { t, attrs } = p;
  const nowId = STATE_KEYS.indexOf(p.stateKey as (typeof STATE_KEYS)[number]);
  const temp = (id: number) => formatTemp(attrs.states[String(id)], p.lang);
  const nextId = attrs.next_state ? STATE_KEYS.indexOf(attrs.next_state as (typeof STATE_KEYS)[number]) : -1;
  return html`
    <div class="head">
      <h1>${t.title}</h1>
      <label class="toggle">
        <input
          type="checkbox"
          .checked=${attrs.program_enabled}
          @change=${(e: Event) => p.onToggle((e.target as HTMLInputElement).checked, e.target as HTMLInputElement)}
        />
        ${t.on}
      </label>
    </div>
    ${nowId >= 0
      ? html`<div class="sub">
          ${t.now} <strong>${t.presets[String(nowId) as "0"]} ${temp(nowId)}</strong>${attrs.next_time && nextId >= 0
            ? html`, ${t.at} ${clock(attrs.next_time, p.lang)} ${t.to} ${t.presets[String(nextId) as "0"]} ${temp(nextId)}`
            : ""}
        </div>`
      : ""}
    <div class="weekbars">
      <div class="axis"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      ${t.daysShort.map((label, ui) => {
        const day = attrs.days[uiDayToToon(ui)];
        return html`<button type="button" class="dayrow" @click=${() => p.onDay(ui)}>
          <span class="daylabel">${label}</span>
          ${bar(day.carry_in, day.points, 28, 6)}
        </button>`;
      })}
    </div>
    <div class="legend">
      ${[0, 1, 2, 3].map(
        (id) =>
          html`<span><i style="background:${STATE_COLORS[id]}"></i>${t.presets[String(id) as "0"]}
            ${temp(id)}</span>`,
      )}
    </div>
    <div class="row">
      <button type="button" class="outline" @click=${p.onVacation}>${t.vacation}</button>
    </div>
    <div class="hint">${t.tapDay}</div>
  `;
}
