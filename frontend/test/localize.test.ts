import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { errorText, strings } from "../src/localize";

const root = new URL("../../custom_components/toon_program/", import.meta.url);
const keys = (file: string) =>
  Object.keys(JSON.parse(readFileSync(new URL(file, root), "utf8")).exceptions);

describe("errorText", () => {
  it("has an nl and en entry for every backend exception key", () => {
    for (const key of keys("strings.json")) {
      expect(strings("nl").errors[key], key).toBeTruthy();
      expect(strings("en").errors[key], key).toBeTruthy();
    }
  });
  it("matches the nl translation file verbatim", () => {
    const nl = JSON.parse(readFileSync(new URL("translations/nl.json", root), "utf8")).exceptions;
    for (const [key, v] of Object.entries<{ message: string }>(nl)) {
      expect(strings("nl").errors[key]).toBe(v.message);
    }
  });
  it("translates by key", () => {
    expect(errorText(strings("nl"), { message: "x", translation_key: "program_changed" })).toBe(
      "Het programma is op de Toon gewijzigd. Ververs en probeer opnieuw.",
    );
    expect(errorText(strings("en"), { translation_key: "cannot_connect" })).toBe("Cannot connect to the Toon.");
  });
  it("fills placeholders", () => {
    expect(
      errorText(strings("nl"), {
        translation_key: "program_state_failed",
        translation_placeholders: { error: "boom" },
      }),
    ).toBe("Het programma kon niet worden aangepast: boom");
  });
  it("shows the raw message for an unknown or missing key", () => {
    expect(errorText(strings("nl"), { message: "Invalid value", translation_key: "nope" })).toBe("Invalid value");
    expect(errorText(strings("nl"), { message: "extended validation failed" })).toBe("extended validation failed");
  });
});
