/**
 * "Studio": an editorial workspace look. Warm ivory and sage on a deep green rail, with a
 * serif display face for titles and a mono face for figures. Unlike `createTheme` it is not
 * derived from a brand colour; every value is chosen, then checked by `checkContrast`.
 */

import { WHITE, ensureContrast, hex, mix } from "./color.js";
import { AA_TEXT, AA_UI, statusTokens, type Theme, type ThemeFonts, type ThemeMode } from "./theme.js";

/**
 * Newsreader for titles, IBM Plex Sans for the interface, IBM Plex Mono for figures and Tiro
 * Devanagari for Devanagari names. The app loads the font files; these stacks fall back to
 * system fonts until they arrive.
 */
export const STUDIO_FONTS: ThemeFonts = {
  sans: '"IBM Plex Sans", -apple-system, "Segoe UI", Roboto, sans-serif',
  display: 'Newsreader, "Iowan Old Style", Georgia, serif',
  mono: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
  deva: '"Tiro Devanagari Sanskrit", "Noto Serif Devanagari", serif',
};

/** The Google Fonts stylesheet URL for `STUDIO_FONTS`, for a `<link>` in the app's head. */
export const STUDIO_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Tiro+Devanagari+Sanskrit&display=swap";

const RADIUS = 24;

function lightStudio(): Theme["colors"] {
  const surface = WHITE;
  const primary = hex("#115b43");
  const primarySoft = hex("#d9ece1");
  const rail = hex("#0b1f18");
  const railText = hex("#dae9e0");
  const sidebarActive = mix(railText, rail, 0.16);
  return {
    brand: primary,
    primary,
    primaryHover: hex("#0d4a37"),
    primarySoft,
    primaryText: ensureContrast(primary, primarySoft, AA_TEXT),
    onPrimary: hex("#fcfaf4"),
    background: hex("#edf1ee"),
    surface,
    surfaceMuted: hex("#eff1e9"),
    scrim: hex("#0b1f18"),
    border: hex("#d9e0da"),
    borderStrong: ensureContrast(hex("#d1dad2"), surface, AA_UI),
    text: hex("#18201c"),
    textMuted: hex("#5a675f"),
    sidebar: rail,
    sidebarText: railText,
    sidebarActive,
    sidebarActiveText: WHITE,
    ...statusTokens(
      { success: hex("#2b7d5a"), warning: hex("#9c600f"), danger: hex("#ab413a"), info: hex("#2c7f8a") },
      (color) => mix(color, WHITE, 0.12),
    ),
    chart1: primary,
    chart2: hex("#c39146"),
    chart3: hex("#359792"),
    chart4: hex("#93b99a"),
  };
}

function darkStudio(): Theme["colors"] {
  const surface = hex("#14211d");
  const primary = hex("#51b48d");
  const primarySoft = hex("#1a3a2d");
  const rail = hex("#030e0a");
  const sidebarActive = mix(hex("#d3e2d9"), rail, 0.16);
  return {
    brand: primary,
    primary,
    primaryHover: hex("#68c4a0"),
    primarySoft,
    primaryText: ensureContrast(primary, primarySoft, AA_TEXT),
    onPrimary: hex("#061a14"),
    background: hex("#0d1613"),
    surface,
    surfaceMuted: hex("#1e2b26"),
    scrim: hex("#000000"),
    border: hex("#2c3933"),
    borderStrong: ensureContrast(hex("#5c6e65"), surface, AA_UI),
    text: hex("#e7ede8"),
    textMuted: hex("#a1afa6"),
    sidebar: rail,
    sidebarText: hex("#d3e2d9"),
    sidebarActive,
    sidebarActiveText: WHITE,
    ...statusTokens(
      { success: hex("#59d38c"), warning: hex("#f0ba59"), danger: hex("#f47c70"), info: hex("#67c0d5") },
      (color) => mix(color, surface, 0.16),
    ),
    chart1: primary,
    chart2: hex("#f0ba59"),
    chart3: hex("#67c0d5"),
    chart4: hex("#7fae92"),
  };
}

/** The Studio theme in `mode`, with its fonts. Pass it to `ThemeScope` like any other theme. */
export function studioTheme(mode: ThemeMode): Theme {
  return {
    mode,
    radius: RADIUS,
    surface: "soft",
    fonts: STUDIO_FONTS,
    colors: mode === "light" ? lightStudio() : darkStudio(),
  };
}

/** Pairings Studio's own components rely on beyond the shared checks: the page, hero and rail. */
export const STUDIO_EXTRA_PAIRS: readonly (readonly [keyof Theme["colors"], keyof Theme["colors"], number])[] = [
  ["textMuted", "background", AA_TEXT],
  ["primary", "background", AA_UI],
  ["onPrimary", "primaryHover", AA_TEXT],
];

