/**
 * Reads a theme from untrusted storage, such as a tenant's saved settings. Every value ends up
 * in CSS, so anything that is not exactly a theme is rejected rather than passed through.
 */

import { parseHexColor, type HexColor } from "./color.js";
import type { Theme, ThemeFonts } from "./theme.js";

export type ColorToken = keyof Theme["colors"];

/** Every colour token a theme has. */
export const COLOR_TOKENS = [
  "brand",
  "primary",
  "primaryHover",
  "primarySoft",
  "primaryText",
  "onPrimary",
  "background",
  "surface",
  "surfaceMuted",
  "scrim",
  "border",
  "borderStrong",
  "text",
  "textMuted",
  "sidebar",
  "sidebarText",
  "sidebarActive",
  "sidebarActiveText",
  "success",
  "successSoft",
  "successText",
  "onSuccess",
  "warning",
  "warningSoft",
  "warningText",
  "onWarning",
  "danger",
  "dangerSoft",
  "dangerText",
  "onDanger",
  "info",
  "infoSoft",
  "infoText",
  "onInfo",
  "chart1",
  "chart2",
  "chart3",
  "chart4",
] as const satisfies readonly ColorToken[];

/** The largest corner radius a theme may set, in pixels. */
export const MAX_RADIUS = 48;

/** A font stack is a comma list of family names: letters, digits, spaces, hyphens and quotes. */
const FONT_STACK = /^[\p{L}\p{N} ,"'-]{1,200}$/u;

function isFontStack(value: unknown): value is string {
  return (
    typeof value === "string" &&
    FONT_STACK.test(value) &&
    value.split('"').length % 2 === 1 &&
    value.split("'").length % 2 === 1
  );
}

function parseFonts(input: unknown): ThemeFonts | string {
  if (!isRecord(input)) {
    return "fonts must be an object";
  }
  const { sans, display, mono, deva } = input;
  if (!isFontStack(sans)) {
    return "fonts.sans must be a list of font names";
  }
  if (!isFontStack(display)) {
    return "fonts.display must be a list of font names";
  }
  if (!isFontStack(mono)) {
    return "fonts.mono must be a list of font names";
  }
  if (!isFontStack(deva)) {
    return "fonts.deva must be a list of font names";
  }
  return { sans, display, mono, deva };
}

export type ParseThemeResult = { ok: true; value: Theme } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasEveryColor(colors: Partial<Record<ColorToken, HexColor>>): colors is Theme["colors"] {
  return COLOR_TOKENS.every((token) => colors[token] !== undefined);
}

function fail(error: string): ParseThemeResult {
  return { ok: false, error };
}

/**
 * Checks that `input` is a complete theme with safe values and returns a clean copy (unknown
 * fields dropped, colours normalised to lowercase `#rrggbb`), or says what is wrong.
 */
export function parseTheme(input: unknown): ParseThemeResult {
  if (!isRecord(input)) {
    return fail("a theme must be an object");
  }
  const { mode, radius, surface, colors } = input;
  if (mode !== "light" && mode !== "dark") {
    return fail("mode must be light or dark");
  }
  if (typeof radius !== "number" || !Number.isFinite(radius) || radius < 0 || radius > MAX_RADIUS) {
    return fail(`radius must be a number from 0 to ${String(MAX_RADIUS)}`);
  }
  if (surface !== "soft" && surface !== "flat") {
    return fail("surface must be soft or flat");
  }
  if (!isRecord(colors)) {
    return fail("colors must be an object");
  }
  const parsed: Partial<Record<ColorToken, HexColor>> = {};
  for (const token of COLOR_TOKENS) {
    const value = colors[token];
    const color = typeof value === "string" ? parseHexColor(value) : null;
    if (color === null) {
      return fail(`colors.${token} must be a hex colour`);
    }
    parsed[token] = color;
  }
  if (!hasEveryColor(parsed)) {
    return fail("colors are incomplete");
  }
  if (input.fonts === undefined) {
    return { ok: true, value: { mode, radius, surface, colors: parsed } };
  }
  const fonts = parseFonts(input.fonts);
  if (typeof fonts === "string") {
    return fail(fonts);
  }
  return { ok: true, value: { mode, radius, surface, fonts, colors: parsed } };
}
