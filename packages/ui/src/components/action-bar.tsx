import type { ReactNode } from "react";

import { cx } from "../cx.js";

export interface ActionBarProps {
  /** Names the bar for screen readers, such as "Visit actions". */
  label: string;
  /**
   * What the bar reports, such as "3 selected" or "Saved offline". It is a polite live region,
   * so changes are announced without taking focus.
   */
  status?: ReactNode;
  /** The buttons. Put the main action last. */
  children: ReactNode;
  /**
   * "sticky" keeps the bar at the foot of its scroll area; "fixed" pins it to the viewport's
   * foot. Both leave room for a phone's home indicator.
   */
  position?: "sticky" | "fixed";
  className?: string;
}

/**
 * A floating bar of actions that stays in view while a long page scrolls under it, such as
 * Save and Cancel for a form, or what to do with a selection. A named group with a polite
 * status line.
 */
export function ActionBar({ label, status, children, position = "sticky", className }: ActionBarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(
        position === "fixed" ? "fixed inset-x-3 bottom-3 z-40" : "sticky bottom-3 z-30",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 rounded-full border border-border bg-surface py-2 pr-2 pl-5 text-text shadow-xl">
        {status !== undefined ? (
          <div role="status" className="min-w-0 flex-1 text-xs text-muted">
            {status}
          </div>
        ) : (
          <span className="flex-1" />
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
      </div>
    </div>
  );
}
