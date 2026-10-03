/** Joins class names, skipping falsy values. */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Visual tone shared by pills, icons and alerts. */
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export const TONE_CLASSES: Readonly<Record<Tone, { soft: string; solid: string; text: string }>> = {
  neutral: { soft: "bg-surface-muted", solid: "bg-muted", text: "text-muted" },
  primary: { soft: "bg-primary-soft", solid: "bg-primary", text: "text-primary" },
  success: { soft: "bg-success-soft", solid: "bg-success", text: "text-success" },
  warning: { soft: "bg-warning-soft", solid: "bg-warning", text: "text-warning" },
  danger: { soft: "bg-danger-soft", solid: "bg-danger", text: "text-danger" },
  info: { soft: "bg-info-soft", solid: "bg-info", text: "text-info" },
};
