import type { ReactNode } from "react";

import { TONE_CLASSES, cx, type Tone } from "../cx.js";

export type BadgeVariant = "soft" | "solid" | "outline";

export interface BadgeProps {
  tone?: Tone;
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A compact status label, such as in a table cell. Every tone and variant uses text tokens
 * that the theme engine checks for WCAG AA contrast. Pair colour with a word, never colour alone.
 */
export function Badge({ tone = "neutral", variant = "soft", icon, children, className }: BadgeProps) {
  const classes = TONE_CLASSES[tone];
  const look =
    variant === "soft"
      ? cx(classes.soft, classes.text)
      : variant === "solid"
        ? cx(classes.solid, classes.onSolid)
        : cx("border bg-transparent", classes.border, classes.text);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        variant === "outline" && "py-px",
        look,
        className,
      )}
    >
      {icon !== undefined ? (
        <span aria-hidden="true" className="flex [&>svg]:size-3.5">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
