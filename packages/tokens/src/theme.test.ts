import { describe, expect, it } from "vitest";

import {
  COLOR_TOKENS,
  PRESETS,
  checkContrast,
  contrastRatio,
  createTheme,
  hex,
  parseHexColor,
  parseTheme,
  toCssText,
  toCssVariables,
} from "./index.js";

describe("parseHexColor", () => {
  it("accepts short and long forms in any case", () => {
    expect(parseHexColor("#1AB")).toBe("#11aabb");
    expect(parseHexColor("14A89A")).toBe("#14a89a");
  });

  it("rejects anything that could inject CSS", () => {
    expect(parseHexColor("red; } body { display:none")).toBeNull();
    expect(parseHexColor("url(//evil)")).toBeNull();
    expect(parseHexColor("#12345")).toBeNull();
  });
});

describe("createTheme", () => {
  it.each(PRESETS.flatMap((p) => [
    [p.name, p.brand, "light"],
    [p.name, p.brand, "dark"],
  ] as const))("%s (%s) in %s mode has no contrast issues", (_name, brand, mode) => {
    expect(checkContrast(createTheme({ brand, mode }))).toEqual([]);
  });

  it("keeps button labels readable even for light brand colours", () => {
    for (const brand of ["#ffeb3b", "#7dd3fc", "#14b8a6", "#a3e635"]) {
      const theme = createTheme({ brand: hex(brand), mode: "light" });
      expect(contrastRatio(theme.colors.onPrimary, theme.colors.primary)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("never produces an unreadable theme for any brand colour a tenant might pick", () => {
    const samples = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffeb3b", "#8b5cf6", "#f97316", "#64748b", "#06b6d4"];
    for (const brand of samples) {
      for (const mode of ["light", "dark"] as const) {
        const errors = checkContrast(createTheme({ brand: hex(brand), mode })).filter(
          (issue) => issue.severity === "error",
        );
        expect(errors, `${brand} ${mode}`).toEqual([]);
      }
    }
  });

  it("keeps a recognisable brand when only a small adjustment is needed", () => {
    const theme = createTheme({ brand: hex("#2563eb"), mode: "light" });
    expect(theme.colors.primary).toBe("#2563eb");
  });
});

describe("status and accent text", () => {
  const STATUSES = [
    { color: "success", soft: "successSoft", text: "successText", on: "onSuccess" },
    { color: "warning", soft: "warningSoft", text: "warningText", on: "onWarning" },
    { color: "danger", soft: "dangerSoft", text: "dangerText", on: "onDanger" },
    { color: "info", soft: "infoSoft", text: "infoText", on: "onInfo" },
  ] as const;
  const cases = PRESETS.flatMap((p) => [
    [p.name, "light", p.brand],
    [p.name, "dark", p.brand],
  ] as const);

  it.each(cases)("%s in %s mode: pills, badges and links meet WCAG AA", (_name, mode, brand) => {
    const { colors } = createTheme({ brand, mode });
    for (const status of STATUSES) {
      expect(contrastRatio(colors[status.text], colors[status.soft]), `${status.text} on its tint`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(colors[status.text], colors.surface), `${status.text} on cards`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(colors[status.on], colors[status.color]), `${status.on} on ${status.color}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(colors.primaryText, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.primaryText, colors.primarySoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.borderStrong, colors.surface)).toBeGreaterThanOrEqual(3);
  });

  it("puts dark labels on the light dark-mode danger colour instead of white", () => {
    const { colors } = createTheme({ brand: hex("#14a89a"), mode: "dark" });
    expect(colors.onDanger).not.toBe("#ffffff");
    expect(contrastRatio(colors.onDanger, colors.danger)).toBeGreaterThanOrEqual(4.5);
  });

  it("checks status pairs, so a tenant cannot save an unreadable pill", () => {
    const theme = createTheme({ brand: hex("#14a89a"), mode: "light" });
    const broken = { ...theme, colors: { ...theme.colors, dangerText: theme.colors.dangerSoft } };
    expect(checkContrast(broken).map((issue) => issue.tokens)).toContainEqual(["dangerText", "dangerSoft"]);
  });
});

describe("checkContrast", () => {
  it("reports unreadable pairs as errors", () => {
    const theme = createTheme({ brand: hex("#14a89a"), mode: "light" });
    const broken = { ...theme, colors: { ...theme.colors, sidebarText: theme.colors.sidebar } };
    const issues = checkContrast(broken);
    expect(issues[0]?.severity).toBe("error");
    expect(issues[0]?.tokens).toEqual(["sidebarText", "sidebar"]);
  });
});

describe("CSS output", () => {
  it("names every token as an --sk- variable", () => {
    const variables = toCssVariables(createTheme({ brand: hex("#14a89a"), mode: "light", radius: 12 }));
    expect(variables["--sk-radius"]).toBe("12px");
    expect(variables["--sk-primary-soft"]).toMatch(/^#[0-9a-f]{6}$/);
    expect(variables["--sk-chart-1"]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("renders a rule for a selector", () => {
    const css = toCssText(createTheme({ brand: hex("#14a89a"), mode: "dark" }), "[data-tenant]");
    expect(css.startsWith("[data-tenant] {")).toBe(true);
    expect(css).toContain("--sk-surface:");
  });
});

describe("parseTheme", () => {
  const theme = createTheme({ brand: hex("#14a89a"), mode: "dark", radius: 12, surface: "flat" });

  it("reads back a stored theme exactly", () => {
    const stored: unknown = JSON.parse(JSON.stringify(theme));
    expect(parseTheme(stored)).toEqual({ ok: true, value: theme });
  });

  it("knows every colour token the engine produces", () => {
    expect([...COLOR_TOKENS].sort()).toEqual(Object.keys(theme.colors).sort());
  });

  it("normalises colours and drops unknown fields", () => {
    const result = parseTheme({ ...theme, extra: "<script>", colors: { ...theme.colors, primary: "#ABCDEF", note: 1 } });
    expect(result.ok && result.value.colors.primary).toBe("#abcdef");
    expect(result.ok && "extra" in result.value).toBe(false);
    expect(result.ok && "note" in result.value.colors).toBe(false);
  });

  it.each([
    ["not an object", null, "a theme must be an object"],
    ["a list", [], "a theme must be an object"],
    ["an unknown mode", { ...theme, mode: "sepia" }, "mode must be light or dark"],
    ["a radius that is not a number", { ...theme, radius: "12px" }, "radius must be a number from 0 to 48"],
    ["a negative radius", { ...theme, radius: -1 }, "radius must be a number from 0 to 48"],
    ["an unknown surface", { ...theme, surface: "glass" }, "surface must be soft or flat"],
    ["no colours", { ...theme, colors: "red" }, "colors must be an object"],
    ["a missing colour", { ...theme, colors: { ...theme.colors, danger: undefined } }, "colors.danger must be a hex colour"],
    [
      "a colour that injects CSS",
      { ...theme, colors: { ...theme.colors, primary: "red; } body { display: none" } },
      "colors.primary must be a hex colour",
    ],
  ])("rejects %s", (_case, input, error) => {
    expect(parseTheme(input)).toEqual({ ok: false, error });
  });
});

describe("CSS output safety", () => {
  const theme = createTheme({ brand: hex("#14a89a"), mode: "light" });

  it("accepts ordinary selectors", () => {
    expect(toCssText(theme, '[data-tenant="acme"] .portal').startsWith('[data-tenant="acme"] .portal {')).toBe(true);
    expect(toCssText(theme, "html:root, .theme-preview > *")).toContain("--sk-primary:");
  });

  it.each([
    ["a selector that closes the rule", ":root { } body"],
    ["a selector that closes the style element", "</style><script>alert(1)</script>"],
    ["a selector with a comment", ":root /* x */"],
    ["an unbalanced quote", '[data-x="a]'],
    ["an empty selector", "  "],
  ])("refuses %s", (_case, selector) => {
    expect(() => toCssText(theme, selector)).toThrow("unsafe CSS selector");
  });

  it("refuses a theme that skipped validation", () => {
    const tampered = structuredClone(theme);
    Reflect.set(tampered.colors, "primary", "red; } body { display: none");
    expect(() => toCssText(tampered)).toThrow("colors.primary must be a hex colour");
    expect(() => toCssVariables(tampered)).toThrow("refusing to write an invalid theme");
  });
});
