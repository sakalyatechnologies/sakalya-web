/** Turns a theme into CSS custom properties. */

import type { Theme } from "./theme.js";

/** CSS variable names are `--sk-` plus the token name in kebab case. */
export type CssVariables = Record<`--sk-${string}`, string>;

function kebab(name: string): string {
  return name.replace(/[A-Z0-9]/g, (match) => `-${match.toLowerCase()}`);
}

/** All theme tokens as `--sk-*` custom properties, ready for a `style` attribute. */
export function toCssVariables(theme: Theme): CssVariables {
  const variables: CssVariables = {
    "--sk-radius": `${String(theme.radius)}px`,
    "--sk-shadow":
      theme.surface === "soft"
        ? "0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.12)"
        : "none",
  };
  for (const [name, value] of Object.entries(theme.colors)) {
    variables[`--sk-${kebab(name)}`] = value;
  }
  return variables;
}

/** The same variables as a CSS rule body, for server-rendered pages and boot scripts. */
export function toCssText(theme: Theme, selector = ":root"): string {
  const body = Object.entries(toCssVariables(theme))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}
