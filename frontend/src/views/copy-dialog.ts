import { html, type TemplateResult } from "lit";
import { fmt, type Strings } from "../localize";
import { errorBox } from "./shared";

export interface CopyProps {
  t: Strings;
  uiDay: number;
  selected: Set<number>;
  busy: boolean;
  error: string | null;
  onToggle(uiDay: number, checked: boolean): void;
  onConfirm(): void;
  onClose(): void;
}

export function copyDialog(p: CopyProps): TemplateResult {
  const { t } = p;
  return html`
    <div class="backdrop" @click=${p.onClose}></div>
    <div class="sheet" role="dialog">
      <div class="head"><h1>${fmt(t.copyTitle, { day: t.daysLong[p.uiDay] })}</h1></div>
      <div class="presets">
        ${t.daysShort.map((label, ui) =>
          ui === p.uiDay
            ? ""
            : html`<label class="preset ${p.selected.has(ui) ? "selected" : ""}">
                <input
                  type="checkbox"
                  .checked=${p.selected.has(ui)}
                  @change=${(e: Event) => p.onToggle(ui, (e.target as HTMLInputElement).checked)}
                />
                ${label}
              </label>`,
        )}
      </div>
      ${errorBox(p.error)}
      <div class="row">
        <button type="button" class="outline" @click=${p.onClose}>${t.cancel}</button>
        <button type="button" class="primary" ?disabled=${p.busy || p.selected.size === 0} @click=${p.onConfirm}>${t.copyAction}</button>
      </div>
    </div>
  `;
}
