import type { ComponentProps, ReactNode } from "react";

import { TONE_CLASSES, cx, type Tone } from "../cx.js";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const BUTTON: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-sm",
  secondary: "bg-surface text-text border border-border hover:bg-surface-muted",
  ghost: "text-primary-text hover:bg-primary-soft",
};

/** A button in one of three variants, with an optional leading icon. */
export function Button({ variant = "primary", icon, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
        BUTTON[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ComponentProps<"button"> {
  /** Accessible name; icon buttons have no visible text. */
  label: string;
  /** A count shown as a badge, such as unread notifications. */
  badge?: number;
  children: ReactNode;
}

/** A round icon-only button with an accessible label and an optional count badge. */
export function IconButton({ label, badge, children, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={badge ? `${label}, ${String(badge)} new` : label}
      className={cx(
        "relative inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-surface text-text transition-colors hover:bg-surface-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...rest}
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-on-danger">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export interface PillProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

/** A small rounded status label. */
export function Pill({ tone = "neutral", icon, children }: PillProps) {
  const classes = TONE_CLASSES[tone];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", classes.soft, classes.text)}>
      {icon}
      {children}
    </span>
  );
}

export interface IconBubbleProps {
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const BUBBLE_SIZE = { sm: "size-9 rounded-xl", md: "size-12 rounded-2xl", lg: "size-16 rounded-full" } as const;

/** An icon on a soft tinted circle, as used on stat cards and alerts. */
export function IconBubble({ tone = "primary", size = "md", children }: IconBubbleProps) {
  const classes = TONE_CLASSES[tone];
  return (
    <span aria-hidden="true" className={cx("inline-flex shrink-0 items-center justify-center", BUBBLE_SIZE[size], classes.soft, classes.text)}>
      {children}
    </span>
  );
}

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md";
}

/** A person's photo, or their initials on a tinted circle. */
export function Avatar({ name, imageUrl, size = "md" }: AvatarProps) {
  const initials = name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const dimension = size === "sm" ? "size-8 text-xs" : "size-10 text-sm";
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={cx("shrink-0 rounded-full object-cover", dimension)} />;
  }
  return (
    <span role="img" aria-label={name} className={cx("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-text", dimension)}>
      {initials}
    </span>
  );
}
