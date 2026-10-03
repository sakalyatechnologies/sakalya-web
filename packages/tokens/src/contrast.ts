/**
 * Accessibility checks on a theme. A tenant may choose colours that are plain, never colours
 * that are unreadable: errors block saving, warnings advise.
 */

import { contrastRatio, type HexColor } from "./color.js";
import type { Theme } from "./theme.js";

export type IssueSeverity = "error" | "warning";

type ColorKey = keyof Theme["colors"];

export interface ContrastIssue {
  severity: IssueSeverity;
  /** The tokens involved, so an editor can highlight them. */
  tokens: readonly [ColorKey, ColorKey];
  /** What is wrong, in plain words. */
  message: string;
  ratio: number;
  required: number;
}

interface Check {
  label: string;
  foreground: ColorKey;
  background: ColorKey;
  required: number;
}

/** Below this ratio, text is effectively invisible. */
const UNUSABLE = 2;

const CHECKS: readonly Check[] = [
  { label: "Body text on cards", foreground: "text", background: "surface", required: 4.5 },
  { label: "Body text on the page", foreground: "text", background: "background", required: 4.5 },
  { label: "Secondary text on cards", foreground: "textMuted", background: "surface", required: 4.5 },
  { label: "Button label on the button", foreground: "onPrimary", background: "primary", required: 4.5 },
  { label: "Menu text on the sidebar", foreground: "sidebarText", background: "sidebar", required: 4.5 },
  {
    label: "Active menu text on the active menu",
    foreground: "sidebarActiveText",
    background: "sidebarActive",
    required: 4.5,
  },
  { label: "Buttons against cards", foreground: "primary", background: "surface", required: 3 },
  { label: "Form field outlines against cards", foreground: "borderStrong", background: "surface", required: 3 },
];

/** Returns every pairing in `theme` that falls short of WCAG AA, worst first. */
export function checkContrast(theme: Theme): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const check of CHECKS) {
    const fg: HexColor = theme.colors[check.foreground];
    const bg: HexColor = theme.colors[check.background];
    const ratio = contrastRatio(fg, bg);
    if (ratio >= check.required) {
      continue;
    }
    const severity: IssueSeverity = ratio < UNUSABLE ? "error" : "warning";
    issues.push({
      severity,
      tokens: [check.foreground, check.background],
      message: `${check.label} is hard to read (${ratio.toFixed(1)}:1, needs ${String(check.required)}:1)`,
      ratio,
      required: check.required,
    });
  }
  return issues.sort((a, b) => a.ratio - b.ratio);
}
