import { html, type TemplateResult } from "lit";
import { formatTemp } from "../helpers";
import type { Strings } from "../localize";
import type { ProgramAttributes } from "../types";
import { errorBox } from "./shared";

export interface VacationProps {
  t: Strings;
  lang: string;
  attrs: ProgramAttributes;
  from: string;
  to: string;
  temp: string;
  busy: boolean;
  error: string | null;
  onField(field: "from" | "to" | "temp", value: string): void;
  onSubmit(): void;
  onRemove(entryId: string): void;
  onBack(): void;
}

function when(iso: string, lang: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} ${time}`;
}

export function vacationView(p: VacationProps): TemplateResult {
  const { t } = p;
  const editing = p.attrs.holidays.length > 0;
  const field = (label: string, type: string, value: string, key: "from" | "to" | "temp", step?: string) => html`
    <label class="field">${label}
      <input type=${type} step=${step ?? ""} .value=${value} @input=${(e: Event) => p.onField(key, (e.target as HTMLInputElement).value)} />
    </label>`;
  return html`
    <div class="head">
      <button type="button" class="back" aria-label=${t.back} @click=${p.onBack}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
      </button>
      <h1>${t.vacation}</h1>
    </div>
    <h2>${t.planned}</h2>
    ${p.attrs.holidays.length === 0
      ? html`<div class="hint">${t.noVacation}</div>`
      : p.attrs.holidays.map(
          (h) => html`<div class="holiday">
            <div class="htext">
              <span class="htitle">${when(h.start, p.lang)} ${t.rangeTo} ${when(h.end, p.lang)}</span>
              <span class="hsub">${t.presets["4"]}, ${formatTemp(p.attrs.vacation_temperature, p.lang)}</span>
            </div>
            <button type="button" class="icon danger" aria-label=${t.removeVacation} ?disabled=${p.busy} @click=${() => p.onRemove(h.entry_id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg>
            </button>
          </div>`,
        )}
    <h2>${editing ? t.changeVacation : t.newVacation}</h2>
    ${field(t.from, "datetime-local", p.from, "from")}
    ${field(t.until, "datetime-local", p.to, "to")}
    ${field(t.vacationTemp, "number", p.temp, "temp", "0.5")}
    ${errorBox(p.error)}
    <button type="button" class="primary wide" ?disabled=${p.busy || !p.from || !p.to || !p.temp} @click=${p.onSubmit}>${editing ? t.saveVacation : t.scheduleVacation}</button>
  `;
}
