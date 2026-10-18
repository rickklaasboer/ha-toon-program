import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { freeTime, resolveProgram, uiDayToToon } from "./helpers";
import { fmt, strings } from "./localize";
import type { CardConfig, Hass, Point, ProgramAttributes } from "./types";
import { copyDialog } from "./views/copy-dialog";
import { dayView } from "./views/day";
import { editSheet } from "./views/edit-sheet";
import { vacationView } from "./views/vacation";
import { weekView } from "./views/week";

type View = "week" | "day" | "vacation";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function localInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
}

export class ToonProgramCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _view: { state: true },
    _uiDay: { state: true },
    _draft: { state: true },
    _draftHash: { state: true },
    _editIdx: { state: true },
    _copySel: { state: true },
    _copyOpen: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _conflict: { state: true },
    _vac: { state: true },
  };

  hass!: Hass;
  _config?: CardConfig;
  _view: View = "week";
  _uiDay = 0;
  _draft: Point[] | null = null;
  _draftHash = "";
  _editIdx: number | null = null;
  _copySel = new Set<number>();
  _copyOpen = false;
  _busy = false;
  _error: string | null = null;
  _conflict = false;
  _vac: { from: string; to: string; temp: string } | null = null;

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  getCardSize(): number {
    return 6;
  }

  static getStubConfig(): Partial<CardConfig> {
    return {};
  }

  private attrs(id: string): ProgramAttributes {
    const st = this.hass.states[id];
    if (!st) throw new Error(`entity not found: ${id}`);
    return st.attributes as unknown as ProgramAttributes;
  }

  private deviceId(id: string): string {
    const dev = this.hass.entities[id]?.device_id;
    if (!dev) throw new Error(`no device for ${id}`);
    return dev;
  }

  private switchId(id: string): string {
    const dev = this.deviceId(id);
    const sw = Object.keys(this.hass.entities).find(
      (e) => e.startsWith("switch.") && this.hass.entities[e].device_id === dev && this.hass.entities[e].platform === "toon_program",
    );
    if (!sw) throw new Error("program switch entity not found");
    return sw;
  }

  private async call(service: string, data: Record<string, unknown>, id: string): Promise<boolean> {
    this._busy = true;
    this._error = null;
    this._conflict = false;
    try {
      await this.hass.callService("toon_program", service, { device_id: this.deviceId(id), ...data });
      return true;
    } catch (e) {
      this._error = errMessage(e);
      const err = e as { translation_key?: string };
      this._conflict = err.translation_key === "program_changed";
      return false;
    } finally {
      this._busy = false;
    }
  }

  private async toggle(id: string, enabled: boolean, input: HTMLInputElement): Promise<void> {
    this._error = null;
    try {
      await this.hass.callService("switch", enabled ? "turn_on" : "turn_off", { entity_id: this.switchId(id) });
    } catch (e) {
      // Lit does not re-apply an unchanged .checked binding, so reset the DOM state by hand.
      input.checked = !enabled;
      this._error = errMessage(e);
    }
  }

  // Backend refreshes the coordinator before raising program_changed; next edit reads the fresh hash.
  private reload(): void {
    this._draft = null;
    this._editIdx = null;
    this._error = null;
    this._conflict = false;
  }

  private selectDay(ui: number): void {
    this._uiDay = ui;
    this._error = null;
    this._view = "day";
  }

  private tab(ui: number): void {
    if (ui === this._uiDay) return;
    if (this._draft) {
      const t = strings(this.hass.language);
      if (!window.confirm(fmt(t.discardConfirm, { day: t.daysLong[this._uiDay] }))) return;
      this._draft = null;
    }
    this.selectDay(ui);
  }

  private points(id: string): Point[] {
    return this._draft ?? this.attrs(id).days[uiDayToToon(this._uiDay)].points;
  }

  private setDraft(id: string, points: Point[]): void {
    if (!this._draft) this._draftHash = this.attrs(id).program_hash;
    this._draft = points;
  }

  private async save(id: string): Promise<void> {
    if (!this._draft) return;
    const ok = await this.call(
      "set_day",
      { day: uiDayToToon(this._uiDay), points: this._draft, program_hash: this._draftHash },
      id,
    );
    if (ok) {
      this._draft = null;
      this._editIdx = null;
    }
  }

  private async copy(id: string): Promise<void> {
    const ok = await this.call(
      "copy_day",
      {
        source: uiDayToToon(this._uiDay),
        targets: [...this._copySel].map(uiDayToToon),
        program_hash: this.attrs(id).program_hash,
      },
      id,
    );
    if (ok) {
      this._copyOpen = false;
      this._copySel = new Set();
    }
  }

  private vac(attrs: ProgramAttributes): { from: string; to: string; temp: string } {
    if (this._vac) return this._vac;
    const from = new Date();
    from.setMinutes(0, 0, 0);
    from.setHours(from.getHours() + 1);
    const to = new Date(from.getTime() + 24 * 3600 * 1000);
    return { from: localInput(from), to: localInput(to), temp: String(attrs.vacation_temperature) };
  }

  private async scheduleVacation(id: string, attrs: ProgramAttributes): Promise<void> {
    const v = this.vac(attrs);
    const ok = await this.call(
      "set_vacation",
      { start: `${v.from}:00`, end: `${v.to}:00`, temperature: Number(v.temp) },
      id,
    );
    if (ok) this._vac = null;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("_view")) this._error = null;
  }

  protected override render(): TemplateResult {
    if (!this.hass || !this._config) return html``;
    const t = strings(this.hass.language);
    const lang = this.hass.language;
    const resolved = resolveProgram(this.hass.states, this.hass.entities, this._config.entity);
    if (resolved.kind === "none") return html`<ha-card><div class="body hint">${t.noEntity}</div></ha-card>`;
    if (resolved.kind === "unavailable") return html`<ha-card><div class="body error" role="alert">${t.unreachable}</div></ha-card>`;
    const id = resolved.id;
    const attrs = this.attrs(id);
    const stateKey = this.hass.states[id].state;

    let body: TemplateResult;
    let overlay: TemplateResult | typeof nothing = nothing;

    if (this._view === "vacation") {
      const v = this.vac(attrs);
      body = vacationView({
        t,
        lang,
        attrs,
        ...v,
        busy: this._busy,
        error: this._error,
        onField: (f, value) => (this._vac = { ...v, [f]: value }),
        onSubmit: () => void this.scheduleVacation(id, attrs),
        onRemove: (entryId) => void this.call("remove_vacation", { entry_id: entryId }, id),
        onBack: () => (this._view = "week"),
      });
    } else if (this._view === "day") {
      const day = attrs.days[uiDayToToon(this._uiDay)];
      const pts = this.points(id);
      body = dayView({
        t,
        lang,
        attrs,
        uiDay: this._uiDay,
        day,
        points: pts,
        dirty: this._draft !== null,
        saving: this._busy,
        error: this._copyOpen || this._editIdx !== null ? null : this._error,
        onTab: (ui) => this.tab(ui),
        onEdit: (i) => (this._editIdx = i),
        onAdd: () => {
          try {
            this.setDraft(id, [...pts, { time: freeTime(pts), state: 1 }]);
            this._editIdx = pts.length;
          } catch (e) {
            this._error = errMessage(e);
          }
        },
        onCopy: () => {
          this._error = null;
          this._copyOpen = true;
        },
        onSave: () => void this.save(id),
        conflict: this._conflict,
        onReload: () => this.reload(),
        onBack: () => {
          if (this._draft) {
            if (!window.confirm(fmt(t.discardConfirm, { day: t.daysLong[this._uiDay] }))) return;
            this._draft = null;
          }
          this._view = "week";
        },
      });
      if (this._editIdx !== null && pts[this._editIdx]) {
        const idx = this._editIdx;
        overlay = editSheet({
          t,
          lang,
          attrs,
          uiDay: this._uiDay,
          point: pts[idx],
          onChange: (p) => this.setDraft(id, pts.map((x, i) => (i === idx ? p : x))),
          onDelete: () => {
            this.setDraft(id, pts.filter((_, i) => i !== idx));
            this._editIdx = null;
          },
          onClose: () => (this._editIdx = null),
        });
      } else if (this._copyOpen) {
        overlay = copyDialog({
          t,
          uiDay: this._uiDay,
          selected: this._copySel,
          busy: this._busy,
          error: this._error,
          onToggle: (ui, checked) => {
            const next = new Set(this._copySel);
            if (checked) next.add(ui);
            else next.delete(ui);
            this._copySel = next;
          },
          onConfirm: () => void this.copy(id),
          onClose: () => (this._copyOpen = false),
        });
      }
    } else {
      body = weekView({
        t,
        lang,
        attrs,
        stateKey,
        onToggle: (on, input) => void this.toggle(id, on, input),
        onDay: (ui) => this.selectDay(ui),
        onVacation: () => (this._view = "vacation"),
      });
    }

    return html`<ha-card class=${overlay === nothing ? "" : "sheet-open"}><div class="body">${body}${this._view === "week" && this._error ? html`<div class="error" role="alert">${this._error}</div>` : nothing}</div>${overlay}</ha-card>`;
  }

  static override styles = css`
    :host { display: block; }
    ha-card { position: relative; overflow: hidden; }
    ha-card.sheet-open { min-height: 560px; }
    .body { padding: 16px; display: flex; flex-direction: column; gap: 14px; color: var(--primary-text-color); }
    h1, h2 { margin: 0; font-size: 18px; font-weight: 600; }
    button { font: inherit; cursor: pointer; color: inherit; }
    button:disabled { opacity: 0.5; cursor: default; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .head h1 { flex: 1; }
    .toggle { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--secondary-text-color); min-height: 44px; }
    .toggle input { width: 20px; height: 20px; accent-color: var(--primary-color); }
    .sub, .hint { font-size: 14px; color: var(--secondary-text-color); }
    .sub strong { color: var(--primary-text-color); }
    .weekbars { display: flex; flex-direction: column; gap: 6px; }
    .axis { display: flex; padding-left: 36px; font-size: 11px; color: var(--secondary-text-color); justify-content: space-between; }
    .dayrow { display: flex; align-items: center; gap: 8px; min-height: 44px; background: none; border: none; padding: 0; text-align: left; }
    .daylabel { width: 28px; font-size: 14px; font-weight: 600; }
    .bar { flex: 1; display: flex; overflow: hidden; }
    .legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--secondary-text-color); }
    .legend span { display: flex; align-items: center; gap: 6px; }
    .legend i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    .row { display: flex; gap: 8px; }
    .row button { flex: 1; }
    .outline, .primary { min-height: 44px; border-radius: 8px; font-size: 15px; padding: 0 18px; }
    .outline { border: 1.5px solid var(--primary-color); background: var(--card-background-color); color: var(--primary-color); font-weight: 500; }
    .primary { border: none; background: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .primary.wide { min-height: 48px; }
    .danger { color: var(--error-color); }
    button.danger { min-height: 44px; border: none; background: none; font-size: 15px; font-weight: 500; align-self: flex-start; padding: 0; }
    .back, .icon { width: 44px; height: 44px; border: none; background: none; display: flex; align-items: center; justify-content: center; padding: 0; }
    .link { min-height: 44px; padding: 0 8px; border: none; background: none; color: var(--primary-color); font-size: 15px; }
    .tabs { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
    .tab { min-height: 44px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 1px solid var(--divider-color); background: var(--card-background-color); }
    .tab.active { border-color: var(--primary-color); background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .points { display: flex; flex-direction: column; }
    .point { display: flex; align-items: center; gap: 12px; min-height: 56px; background: none; border: none; border-bottom: 1px solid var(--divider-color); padding: 0; text-align: left; }
    .ptime { font-size: 22px; font-weight: 600; width: 64px; font-variant-numeric: tabular-nums; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
    .pname { flex: 1; font-size: 16px; }
    .ptemp { font-size: 15px; color: var(--secondary-text-color); }
    .savebar { display: flex; align-items: center; gap: 12px; padding-top: 4px; }
    .savebar span { flex: 1; font-size: 14px; color: var(--secondary-text-color); }
    .error { color: var(--error-color); font-size: 14px; }
    .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); }
    .sheet { position: absolute; left: 0; right: 0; bottom: 0; background: var(--card-background-color); border-radius: 16px 16px 0 0; padding: 20px 16px 28px; box-sizing: border-box; max-height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
    .timepick { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .round { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid var(--primary-color); background: var(--card-background-color); color: var(--primary-color); font-size: 15px; font-weight: 600; }
    .timefield { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); }
    .timefield input { font-size: 36px; font-weight: 600; border: none; background: none; text-align: center; width: 150px; font-family: inherit; color: var(--primary-text-color); font-variant-numeric: tabular-nums; }
    fieldset.presets, div.presets { border: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    legend { font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px; padding: 0; }
    .preset { min-height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border: 1px solid var(--divider-color); border-radius: 8px; box-sizing: border-box; }
    .preset.selected { border: 2px solid var(--primary-color); font-weight: 600; }
    .preset input { accent-color: var(--primary-color); }
    .holiday { display: flex; align-items: center; gap: 12px; min-height: 56px; border-top: 1px solid var(--divider-color); }
    .htext { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .htitle { font-size: 16px; font-weight: 600; }
    .hsub { font-size: 14px; color: var(--secondary-text-color); }
    .field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--secondary-text-color); }
    .field input { min-height: 44px; border: 1px solid var(--divider-color); border-radius: 8px; padding: 0 12px; font-size: 16px; font-family: inherit; color: var(--primary-text-color); background: var(--card-background-color); box-sizing: border-box; }
  `;
}

customElements.define("toon-program-card", ToonProgramCard);

const w = window as unknown as { customCards?: Record<string, unknown>[] };
w.customCards = w.customCards ?? [];
w.customCards.push({
  type: "toon-program-card",
  name: strings(document.documentElement.lang || "en").cardName,
  description: strings(document.documentElement.lang || "en").cardDescription,
});
