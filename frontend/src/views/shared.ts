import { html, type TemplateResult } from "lit";
import { barSegments, DAY_MINUTES } from "../helpers";
import { STATE_COLORS } from "../localize";
import type { Point } from "../types";

export function bar(carryIn: number, points: Point[], height: number, radius: number): TemplateResult {
  const segs = barSegments(0, carryIn, points);
  return html`<span class="bar" style="height:${height}px;border-radius:${radius}px">
    ${segs.map(
      (s) =>
        html`<span
          style="flex:0 0 ${(((s.toMin - s.fromMin) / DAY_MINUTES) * 100).toFixed(2)}%;background:${STATE_COLORS[s.state]}"
        ></span>`,
    )}
  </span>`;
}

export function errorBox(message: string | null): TemplateResult | string {
  return message ? html`<div class="error" role="alert">${message}</div>` : "";
}
