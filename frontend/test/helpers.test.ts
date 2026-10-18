import { describe, expect, it } from "vitest";
import { barSegments, freeTime, nudge, vacationDefaults, resolveProgram, toonDayToUi, uiDayToToon } from "../src/helpers";

describe("barSegments", () => {
  it("splits the wednesday fixture into sleep/home/sleep", () => {
    const segs = barSegments(3, 2, [
      { time: "06:20", state: 1 },
      { time: "23:00", state: 2 },
    ]);
    expect(segs).toEqual([
      { state: 2, fromMin: 0, toMin: 380 },
      { state: 1, fromMin: 380, toMin: 1380 },
      { state: 2, fromMin: 1380, toMin: 1440 },
    ]);
  });

  it("covers the whole day with the carry-in state when there are no points", () => {
    expect(barSegments(3, 1, [])).toEqual([{ state: 1, fromMin: 0, toMin: 1440 }]);
  });

  it("skips the carry-in segment when a point sits at 00:00", () => {
    expect(barSegments(3, 2, [{ time: "00:00", state: 1 }])).toEqual([
      { state: 1, fromMin: 0, toMin: 1440 },
    ]);
  });

  it("sorts unsorted points", () => {
    const segs = barSegments(1, 2, [
      { time: "23:00", state: 2 },
      { time: "06:00", state: 1 },
    ]);
    expect(segs.map((s) => s.fromMin)).toEqual([0, 360, 1380]);
  });
});

describe("nudge", () => {
  it("moves by minutes", () => expect(nudge("06:20", -10)).toBe("06:10"));
  it("clamps at 00:00", () => expect(nudge("00:05", -10)).toBe("00:00"));
  it("clamps at 23:50", () => expect(nudge("23:50", 10)).toBe("23:50"));
  it("crosses the hour", () => expect(nudge("06:55", 10)).toBe("07:05"));
});

describe("freeTime", () => {
  it("picks 12:00 for an empty day", () => expect(freeTime([])).toBe("12:00"));
  it("picks the next whole hour after the last point", () => {
    expect(freeTime([{ time: "06:20", state: 1 }])).toBe("07:00");
  });
  it("falls back to the first free 10-minute slot", () => {
    expect(freeTime([{ time: "23:30", state: 1 }])).toBe("00:00");
    expect(
      freeTime([
        { time: "00:00", state: 1 },
        { time: "23:30", state: 2 },
      ]),
    ).toBe("00:10");
  });
});

describe("resolveProgram", () => {
  const ok = { state: "home", attributes: { days: [], program_hash: "x" } };
  const entities = { "sensor.toon_program": { platform: "toon_program" }, "sensor.other": { platform: "x" } };

  it("returns none without a toon_program sensor", () => {
    expect(resolveProgram({}, {}, undefined)).toEqual({ kind: "none" });
  });
  it("finds an available sensor", () => {
    expect(resolveProgram({ "sensor.toon_program": ok }, entities, undefined)).toEqual({
      kind: "ok",
      id: "sensor.toon_program",
    });
  });
  it("reports an unavailable sensor", () => {
    const s = { "sensor.toon_program": { state: "unavailable", attributes: {} } };
    expect(resolveProgram(s, entities, undefined)).toEqual({ kind: "unavailable", id: "sensor.toon_program" });
  });
  it("keeps a sensor with unknown state usable", () => {
    const s = { "sensor.toon_program": { state: "unknown", attributes: ok.attributes } };
    expect(resolveProgram(s, entities, undefined)).toEqual({ kind: "ok", id: "sensor.toon_program" });
    expect(resolveProgram(s, {}, "sensor.toon_program")).toEqual({ kind: "ok", id: "sensor.toon_program" });
  });
  it("reports a sensor without days as unavailable", () => {
    const s = { "sensor.toon_program": { state: "home", attributes: {} } };
    expect(resolveProgram(s, entities, undefined).kind).toBe("unavailable");
  });
  it("uses the configured entity", () => {
    expect(resolveProgram({ "sensor.x": ok }, {}, "sensor.x")).toEqual({ kind: "ok", id: "sensor.x" });
  });
  it("returns none for a configured entity that does not exist", () => {
    expect(resolveProgram({}, {}, "sensor.x")).toEqual({ kind: "none" });
  });
});

describe("day mapping", () => {
  it("maps ui index to toon day", () => {
    expect(uiDayToToon(0)).toBe(1);
    expect(uiDayToToon(6)).toBe(0);
  });
  it("maps toon day to ui index", () => {
    expect(toonDayToUi(1)).toBe(0);
    expect(toonDayToUi(0)).toBe(6);
  });
});

describe("vacationDefaults", () => {
  it("defaults to the next hour plus 24 h without a vacation", () => {
    const v = vacationDefaults([], 6, new Date(2026, 9, 18, 13, 7));
    expect(v).toEqual({ from: "2026-10-18T14:00", to: "2026-10-19T14:00", temp: "6" });
  });
  it("prefills with the existing vacation", () => {
    const h = [{ entry_id: "a", start: "2026-12-20T08:00:00", end: "2027-01-03T18:30:00" }];
    expect(vacationDefaults(h, 7.5, new Date())).toEqual({
      from: "2026-12-20T08:00",
      to: "2027-01-03T18:30",
      temp: "7.5",
    });
  });
});
