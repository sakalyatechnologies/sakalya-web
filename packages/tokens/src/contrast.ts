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

const STATUSES = [
  { name: "Success", color: "success", soft: "successSoft", text: "successText", on: "onSuccess" },
  { name: "Warning", color: "warning", soft: "warningSoft", text: "warningText", on: "onWarning" },
  { name: "Danger", color: "danger", soft: "dangerSoft", text: "dangerText", on: "onDanger" },
  { name: "Info", color: "info", soft: "infoSoft", text: "infoText", on: "onInfo" },
] as const;

const CHECKS: readonly Check[] = [
  { label: "Body text on cards", foreground: "text", background: "surface", required: 4.5 },
  { label: "Body text on the page", foreground: "text", background: "background", required: 4.5 },
  { label: "Secondary text on cards", foreground: "textMuted", background: "surface", required: 4.5 },
  { label: "Secondary text on muted panels", foreground: "textMuted", background: "surfaceMuted", required: 4.5 },
  { label: "Links and accent text on cards", foreground: "primaryText", background: "surface", required: 4.5 },
  { label: "Accent text on accent tints", foreground: "primaryText", background: "primarySoft", required: 4.5 },
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
  ...STATUSES.flatMap((status): Check[] => [
    { label: `${status.name} text on its tint`, foreground: status.text, background: status.soft, required: 4.5 },
    { label: `${status.name} text on cards`, foreground: status.text, background: "surface", required: 4.5 },
    { label: `Labels on the ${status.name.toLowerCase()} colour`, foreground: status.on, background: status.color, required: 4.5 },
    { label: `${status.name} icons against cards`, foreground: status.color, background: "surface", required: 3 },
  ]),
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
