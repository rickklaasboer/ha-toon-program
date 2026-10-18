import { html, type TemplateResult } from "lit";
import { formatTemp, nudge } from "../helpers";
import { STATE_COLORS, fmt, type Strings } from "../localize";
import type { Point, ProgramAttributes } from "../types";

export interface SheetProps {
  t: Strings;
  lang: string;
  attrs: ProgramAttributes;
  uiDay: number;
  point: Point;
  onChange(point: Point): void;
  onDelete(): void;
  onClose(): void;
}

export function editSheet(p: SheetProps): TemplateResult {
  const { t, point } = p;
  const readOnly = point.state === 4;
  return html`
    <div class="backdrop" @click=${p.onClose}></div>
    <div class="sheet" role="dialog">
      <div class="head">
        <h1>${fmt(t.fromDay, { day: t.daysLong[p.uiDay].replace(/^./, (c) => c.toUpperCase()) })}</h1>
        <button type="button" class="link" @click=${p.onClose}>${t.done}</button>
      </div>
      <div class="timepick">
        <button type="button" class="round" aria-label=${t.earlier} @click=${() => p.onChange({ ...point, time: nudge(point.time, -10) })}>−10</button>
        <label class="timefield">
          <span>${t.time}</span>
          <input
            type="time"
            step="600"
            .value=${point.time}
            @change=${(e: Event) => {
              const v = (e.target as HTMLInputElement).value;
              if (v) p.onChange({ ...point, time: v });
            }}
          />
        </label>
        <button type="button" class="round" aria-label=${t.later} @click=${() => p.onChange({ ...point, time: nudge(point.time, 10) })}>+10</button>
      </div>
      ${readOnly
        ? html`<div class="hint">${t.presets["4"]}: ${t.readOnlyState}</div>`
        : html`<fieldset class="presets">
            <legend>${t.preset}</legend>
            ${[0, 1, 2, 3].map(
              (id) => html`<label class="preset ${point.state === id ? "selected" : ""}">
                <input
                  type="radio"
                  name="state"
                  .checked=${point.state === id}
                  @change=${() => p.onChange({ ...point, state: id })}
                />
                <i class="dot" style="background:${STATE_COLORS[id]}"></i>
                ${t.presets[String(id) as "0"]} ${formatTemp(p.attrs.states[String(id)], p.lang)}
              </label>`,
            )}
          </fieldset>`}
      ${readOnly ? "" : html`<button type="button" class="danger" @click=${p.onDelete}>${t.removeBlock}</button>`}
    </div>
  `;
}
