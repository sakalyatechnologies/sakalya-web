import type { ReactNode } from "react";

import { TONE_CLASSES, cx, type Tone } from "../cx.js";

export type TagTone = Tone | "inverse";

export interface TagProps {
  /** "inverse" is a dark tag using the sidebar colours; the rest follow the shared tones. */
  tone?: TagTone;
  children: ReactNode;
}

/**
 * A compact label for a row or tile, such as "New" or "Follow-up". Smaller than `Pill` and
 * allowed to wrap on narrow screens, so a long tag never forces the row wider.
 */
export function Tag({ tone = "neutral", children }: TagProps) {
  const classes = tone === "inverse" ? "bg-sidebar text-sidebar-text" : cx(TONE_CLASSES[tone].soft, TONE_CLASSES[tone].text);
  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:whitespace-nowrap",
        classes,
      )}
    >
      {children}
    </span>
  );
}
