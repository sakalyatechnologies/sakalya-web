/**
 * The white-label theme engine: one brand colour becomes a complete, readable palette.
 */

import {
  INK,
  WHITE,
  contrastRatio,
  darken,
  ensureContrast,
  hex,
  lighten,
  mix,
  readableOn,
  type HexColor,
} from "./color.js";

export type ThemeMode = "light" | "dark";

/** How cards and panels look. */
export type SurfaceStyle = "soft" | "flat";

/** CSS font stacks a theme may set. Each is validated as a plain list of family names. */
export interface ThemeFonts {
  /** Body and interface text. */
  sans: string;
  /** Page titles and large numbers; the editorial face. */
  display: string;
  /** Figures, codes and times. */
  mono: string;
  /** Devanagari text, such as a Sanskrit or Hindi name. */
  deva: string;
}

export interface ThemeInput {
  /** The tenant's brand colour. */
  brand: HexColor;
  mode: ThemeMode;
  /** Corner radius for cards, in pixels. */
  radius?: number;
  surface?: SurfaceStyle;
}

/** Every colour and shape token a component may use. */
export interface Theme {
  mode: ThemeMode;
  radius: number;
  surface: SurfaceStyle;
  /** Font stacks. Themes without them use whatever fonts the app's stylesheet sets. */
  fonts?: ThemeFonts;
  colors: {
    brand: HexColor;
    primary: HexColor;
    primaryHover: HexColor;
    primarySoft: HexColor;
    /** Accent-coloured text, such as links: readable on cards and on `primarySoft`. */
    primaryText: HexColor;
    onPrimary: HexColor;
    background: HexColor;
    surface: HexColor;
    surfaceMuted: HexColor;
    /** Dims the page behind dialogs and drawers; used with transparency. */
    scrim: HexColor;
    border: HexColor;
    /** Outlines that identify a control, such as a text field: at least 3:1 against cards. */
    borderStrong: HexColor;
    text: HexColor;
    textMuted: HexColor;
    sidebar: HexColor;
    sidebarText: HexColor;
    sidebarActive: HexColor;
    sidebarActiveText: HexColor;
    /** Status colours for icons, dots and outlines (3:1 on cards). */
    success: HexColor;
    /** Status tints for pill and banner backgrounds. */
    successSoft: HexColor;
    /** Status text: readable (4.5:1) on its tint and on cards. */
    successText: HexColor;
    /** Text on a solid status background. */
    onSuccess: HexColor;
    warning: HexColor;
    warningSoft: HexColor;
    warningText: HexColor;
    onWarning: HexColor;
    danger: HexColor;
    dangerSoft: HexColor;
    dangerText: HexColor;
    onDanger: HexColor;
    info: HexColor;
    infoSoft: HexColor;
    infoText: HexColor;
    onInfo: HexColor;
    chart1: HexColor;
    chart2: HexColor;
    chart3: HexColor;
    chart4: HexColor;
  };
}

export const AA_TEXT = 4.5;
export const AA_UI = 3;

const STATUS = {
  light: { success: hex("#15803d"), warning: hex("#b45309"), danger: hex("#dc2626"), info: hex("#2563eb") },
  dark: { success: hex("#4ade80"), warning: hex("#fbbf24"), danger: hex("#f87171"), info: hex("#60a5fa") },
} as const;

const DARK_BASE = hex("#0b1015");

export type StatusName = "success" | "warning" | "danger" | "info";

export type StatusTokens = Pick<
  Theme["colors"],
  | StatusName
  | `${StatusName}Soft`
  | `${StatusName}Text`
  | "onSuccess"
  | "onWarning"
  | "onDanger"
  | "onInfo"
>;

/**
 * Each status gets its colour, a tint, text that reads on the tint (and so on cards, which are
 * further from the text colour), and a label colour for the solid colour.
 */
export function statusTokens(colors: Record<StatusName, HexColor>, tint: (color: HexColor) => HexColor): StatusTokens {
  const tints = {
    success: tint(colors.success),
    warning: tint(colors.warning),
    danger: tint(colors.danger),
    info: tint(colors.info),
  };
  return {
    success: colors.success,
    successSoft: tints.success,
    successText: ensureContrast(colors.success, tints.success, AA_TEXT),
    onSuccess: readableOn(colors.success),
    warning: colors.warning,
    warningSoft: tints.warning,
    warningText: ensureContrast(colors.warning, tints.warning, AA_TEXT),
    onWarning: readableOn(colors.warning),
    danger: colors.danger,
    dangerSoft: tints.danger,
    dangerText: ensureContrast(colors.danger, tints.danger, AA_TEXT),
    onDanger: readableOn(colors.danger),
    info: colors.info,
    infoSoft: tints.info,
    infoText: ensureContrast(colors.info, tints.info, AA_TEXT),
    onInfo: readableOn(colors.info),
  };
}

/** Derives the full palette from a brand colour. */
export function createTheme(input: ThemeInput): Theme {
  const { brand, mode } = input;
  const radius = input.radius ?? 16;
  const surfaceStyle = input.surface ?? "soft";
  return {
    mode,
    radius,
    surface: surfaceStyle,
    colors: mode === "light" ? lightColors(brand) : darkColors(brand),
  };
}

function lightColors(brand: HexColor): Theme["colors"] {
  const background = mix(brand, WHITE, 0.045);
  const surface = WHITE;
  const text = mix(brand, INK, 0.12);
  // White labels on the brand, darkened just enough to read: this also keeps buttons
  // visible on white cards, which a light brand with ink labels would not.
  const onPrimary = WHITE;
  const primary = ensureContrast(brand, onPrimary, AA_TEXT);
  const primarySoft = lighten(brand, 0.86);
  return {
    brand,
    primary,
    primaryHover: darken(primary, 0.1),
    primarySoft,
    primaryText: ensureContrast(primary, primarySoft, AA_TEXT),
    onPrimary,
    background,
    surface,
    surfaceMuted: mix(brand, WHITE, 0.05),
    scrim: INK,
    border: mix(brand, hex("#e2e8f0"), 0.12),
    borderStrong: ensureContrast(mix(brand, hex("#94a3b8"), 0.1), surface, AA_UI),
    text,
    textMuted: mix(brand, hex("#55657a"), 0.1),
    sidebar: mix(brand, WHITE, 0.06),
    sidebarText: mix(brand, hex("#334155"), 0.15),
    sidebarActive: primarySoft,
    sidebarActiveText: ensureContrast(darken(brand, 0.35), primarySoft, AA_TEXT),
    ...statusTokens(STATUS.light, (color) => lighten(color, 0.89)),
    chart1: primary,
    chart2: lighten(brand, 0.45),
    chart3: darken(brand, 0.3),
    chart4: lighten(brand, 0.7),
  };
}

function darkColors(brand: HexColor): Theme["colors"] {
  const background = mix(brand, DARK_BASE, 0.06);
  const surface = mix(brand, hex("#131a21"), 0.06);
  const text = hex("#e6edf3");
  const lifted = ensureContrast(brand, surface, AA_UI);
  // White labels may need a darker button, which can sink into dark cards; then use ink
  // labels on a lighter button instead.
  const withWhite = ensureContrast(lifted, WHITE, AA_TEXT);
  const whiteWorks =
    readableOn(lifted) === WHITE && contrastRatio(withWhite, surface) >= AA_UI;
  const onPrimary = whiteWorks ? WHITE : INK;
  const primary = whiteWorks ? withWhite : ensureContrast(lifted, INK, AA_TEXT);
  const primarySoft = mix(brand, surface, 0.22);
  return {
    brand,
    primary,
    primaryHover: lighten(primary, 0.1),
    primarySoft,
    primaryText: ensureContrast(primary, primarySoft, AA_TEXT),
    onPrimary,
    background,
    surface,
    surfaceMuted: mix(brand, hex("#18212a"), 0.08),
    scrim: hex("#000000"),
    border: mix(brand, hex("#263241"), 0.12),
    borderStrong: ensureContrast(mix(brand, hex("#4b5b6e"), 0.1), surface, AA_UI),
    text,
    textMuted: hex("#97a6b6"),
    sidebar: mix(brand, DARK_BASE, 0.08),
    sidebarText: hex("#c3cdd8"),
    sidebarActive: primarySoft,
    sidebarActiveText: ensureContrast(lighten(brand, 0.45), primarySoft, AA_TEXT),
    ...statusTokens(STATUS.dark, (color) => mix(color, surface, 0.16)),
    chart1: primary,
    chart2: mix(brand, surface, 0.55),
    chart3: lighten(brand, 0.35),
    chart4: mix(brand, surface, 0.3),
  };
}
