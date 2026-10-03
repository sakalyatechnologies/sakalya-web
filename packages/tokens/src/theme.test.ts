import { describe, expect, it } from "vitest";

import {
  PRESETS,
  checkContrast,
  contrastRatio,
  createTheme,
  hex,
  parseHexColor,
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
