import { describe, expect, it } from "vitest";

import { STUDIO_EXTRA_PAIRS, checkContrast, contrastRatio, parseTheme, studioTheme, toCssVariables } from "./index.js";

describe("studioTheme", () => {
  it.each(["light", "dark"] as const)("%s passes every shared contrast check", (mode) => {
    expect(checkContrast(studioTheme(mode))).toEqual([]);
  });

  it.each(["light", "dark"] as const)("%s passes the pairings Studio components add", (mode) => {
    const { colors } = studioTheme(mode);
    for (const [foreground, background, required] of STUDIO_EXTRA_PAIRS) {
      expect(contrastRatio(colors[foreground], colors[background]), `${foreground} on ${background}`).toBeGreaterThanOrEqual(required);
    }
  });

  it("round-trips through parseTheme, fonts included", () => {
    const theme = studioTheme("dark");
    const stored: unknown = JSON.parse(JSON.stringify(theme));
    expect(parseTheme(stored)).toEqual({ ok: true, value: theme });
  });

  it("writes its font stacks as variables", () => {
    const variables = toCssVariables(studioTheme("light"));
    expect(variables["--sk-font"]).toContain("IBM Plex Sans");
    expect(variables["--sk-font-display"]).toContain("Newsreader");
    expect(variables["--sk-font-mono"]).toContain("IBM Plex Mono");
    expect(variables["--sk-font-deva"]).toContain("Tiro Devanagari");
  });

  it("refuses a font stack that could inject CSS", () => {
    const theme = studioTheme("light");
    const bad = { ...theme, fonts: { ...theme.fonts, sans: "x; } body { display: none" } };
    expect(parseTheme(bad)).toEqual({ ok: false, error: "fonts.sans must be a list of font names" });
    expect(parseTheme({ ...theme, fonts: "serif" })).toEqual({ ok: false, error: "fonts must be an object" });
  });
});
