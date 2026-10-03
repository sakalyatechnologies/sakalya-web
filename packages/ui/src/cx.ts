/** Joins class names, skipping falsy values. */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Visual tone shared by pills, icons and alerts. */
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

interface ToneClasses {
  /** Tinted background. */
  soft: string;
  /** Text and icons on the tint, or on cards. */
  text: string;
  /** Solid background. */
  solid: string;
  /** Text on the solid background. */
  onSolid: string;
  /** An outline in the tone's colour. */
  border: string;
}

/** Every pairing here is checked for WCAG AA contrast by `checkContrast` in the theme engine. */
export const TONE_CLASSES: Readonly<Record<Tone, ToneClasses>> = {
  neutral: { soft: "bg-surface-muted", text: "text-muted", solid: "bg-text", onSolid: "text-surface", border: "border-border-strong" },
  primary: { soft: "bg-primary-soft", text: "text-primary-text", solid: "bg-primary", onSolid: "text-on-primary", border: "border-primary" },
  success: { soft: "bg-success-soft", text: "text-success-text", solid: "bg-success", onSolid: "text-on-success", border: "border-success" },
  warning: { soft: "bg-warning-soft", text: "text-warning-text", solid: "bg-warning", onSolid: "text-on-warning", border: "border-warning" },
  danger: { soft: "bg-danger-soft", text: "text-danger-text", solid: "bg-danger", onSolid: "text-on-danger", border: "border-danger" },
  info: { soft: "bg-info-soft", text: "text-info-text", solid: "bg-info", onSolid: "text-on-info", border: "border-info" },
};
