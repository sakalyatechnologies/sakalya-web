/** Turns a theme into CSS custom properties. */

import { parseTheme } from "./parse.js";
import type { Theme } from "./theme.js";

/** CSS variable names are `--sk-` plus the token name in kebab case. */
export type CssVariables = Record<`--sk-${string}`, string>;

function kebab(name: string): string {
  return name.replace(/[A-Z0-9]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Re-checks a theme before it is written into CSS. A `Theme` from `createTheme` or
 * `parseTheme` always passes; one that skipped them (say, a stored object cast to `Theme`)
 * could carry CSS or HTML, so it is refused as a programming error.
 */
function checked(theme: Theme): Theme {
  const result = parseTheme(theme);
  if (!result.ok) {
    throw new Error(`refusing to write an invalid theme to CSS: ${result.error}`);
  }
  return result.value;
}

/** All theme tokens as `--sk-*` custom properties, ready for a `style` attribute. */
export function toCssVariables(theme: Theme): CssVariables {
  const safe = checked(theme);
  const variables: CssVariables = {
    "--sk-radius": `${String(safe.radius)}px`,
    "--sk-shadow":
      safe.surface === "soft"
        ? "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.12)"
        : "none",
  };
  for (const [name, value] of Object.entries(safe.colors)) {
    variables[`--sk-${kebab(name)}`] = value;
  }
  return variables;
}

/**
 * Characters a selector may use. Braces, semicolons, `<`, `/`, `\` and `@` are excluded, so a
 * selector can neither end the rule nor the `<style>` element it is served in.
 */
const SELECTOR = /^[\w .#:()[\]="'>+~*,^$|-]+$/;

function isSafeSelector(selector: string): boolean {
  const quotesBalanced = selector.split('"').length % 2 === 1 && selector.split("'").length % 2 === 1;
  return selector.trim() !== "" && SELECTOR.test(selector) && quotesBalanced;
}

/**
 * The same variables as a CSS rule body, for server-rendered pages and boot scripts. Throws on
 * an unsafe selector or an invalid theme, which are programming errors.
 */
export function toCssText(theme: Theme, selector = ":root"): string {
  if (!isSafeSelector(selector)) {
    throw new Error(`refusing an unsafe CSS selector: ${JSON.stringify(selector)}`);
  }
  const body = Object.entries(toCssVariables(theme))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}
