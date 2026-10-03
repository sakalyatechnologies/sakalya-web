/**
 * Colour maths for themes. Dependency-free and sRGB-only.
 *
 * Every colour that reaches CSS is a validated `HexColor`: a theme value is written into a
 * stylesheet, so an arbitrary string there would be an injection, not a broken colour.
 */

/** A lowercase `#rrggbb` colour that has been validated. */
export type HexColor = string & { readonly __brand: "HexColor" };

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX = /^#[0-9a-f]{6}$/;

/** Whether `value` is already a lowercase `#rrggbb` colour. */
export function isHexColor(value: string): value is HexColor {
  return HEX.test(value);
}

/** Parses `#rgb` or `#rrggbb` (any case, hash optional) into a `HexColor`, or `null`. */
export function parseHexColor(input: string): HexColor | null {
  let hex = input.trim().toLowerCase().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(hex)) {
    hex = hex.replace(/./g, (c) => c + c);
  }
  const candidate = `#${hex}`;
  return isHexColor(candidate) ? candidate : null;
}

/** Builds a `HexColor` from a literal that is known to be valid. Throws on a programming bug. */
export function hex(literal: string): HexColor {
  const parsed = parseHexColor(literal);
  if (parsed === null) {
    throw new Error(`invalid colour literal ${literal}`);
  }
  return parsed;
}

function toRgb(color: HexColor): Rgb {
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  };
}

function toHex({ r, g, b }: Rgb): HexColor {
  const part = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return hex(`#${part(r)}${part(g)}${part(b)}`);
}

/** Relative luminance per WCAG 2.1. */
export function luminance(color: HexColor): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const { r, g, b } = toRgb(color);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: HexColor, b: HexColor): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mixes two colours; `weight` is the share of `a`, from 0 to 1. */
export function mix(a: HexColor, b: HexColor, weight: number): HexColor {
  const w = Math.max(0, Math.min(1, weight));
  const ra = toRgb(a);
  const rb = toRgb(b);
  return toHex({
    r: ra.r * w + rb.r * (1 - w),
    g: ra.g * w + rb.g * (1 - w),
    b: ra.b * w + rb.b * (1 - w),
  });
}

export const WHITE = hex("#ffffff");
export const INK = hex("#0f172a");

/** Moves `color` towards white by `amount` (0 to 1). */
export function lighten(color: HexColor, amount: number): HexColor {
  return mix(WHITE, color, amount);
}

/** Moves `color` towards black by `amount` (0 to 1). */
export function darken(color: HexColor, amount: number): HexColor {
  return mix(hex("#000000"), color, amount);
}

/** White or ink, whichever reads better on `background`. */
export function readableOn(background: HexColor): HexColor {
  return contrastRatio(background, WHITE) >= contrastRatio(background, INK) ? WHITE : INK;
}

/**
 * Adjusts `background` in small steps until `foreground` reaches `target` contrast on it.
 *
 * Tries moving away from the foreground first (darker under light text, lighter under dark
 * text); if that cannot reach the target, for example black that cannot get darker, it tries
 * the other way. Returns the closest result found.
 */
export function ensureContrast(
  background: HexColor,
  foreground: HexColor,
  target: number,
): HexColor {
  if (contrastRatio(background, foreground) >= target) {
    return background;
  }
  const preferDarker = luminance(foreground) > luminance(background);
  const first = walk(background, foreground, target, preferDarker);
  if (contrastRatio(first, foreground) >= target) {
    return first;
  }
  const second = walk(background, foreground, target, !preferDarker);
  return contrastRatio(second, foreground) > contrastRatio(first, foreground) ? second : first;
}

function walk(start: HexColor, foreground: HexColor, target: number, darker: boolean): HexColor {
  let current = start;
  for (let step = 0; step < 25 && contrastRatio(current, foreground) < target; step += 1) {
    current = darker ? darken(current, 0.05) : lighten(current, 0.05);
  }
  return current;
}
