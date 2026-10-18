import { describe, expect, it } from "vitest";
import { barSegments, nudge, toonDayToUi, uiDayToToon } from "../src/helpers";

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
