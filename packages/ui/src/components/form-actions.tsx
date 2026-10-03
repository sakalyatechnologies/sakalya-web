import type { ReactNode } from "react";

import { cx } from "../cx.js";

export interface FormActionsProps {
  /** The form's buttons, least important first: for example Cancel, then Save. */
  children: ReactNode;
  align?: "start" | "end" | "between";
  className?: string;
}

const ALIGN = { start: "sm:justify-start", end: "sm:justify-end", between: "sm:justify-between" } as const;

/**
 * The row of buttons at the end of a form. On phones the buttons stack at full width with
 * the last (main) action on top, where a thumb reaches it.
 */
export function FormActions({ children, align = "end", className }: FormActionsProps) {
  return (
    <div
      className={cx(
        "flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center",
        "[&>*]:w-full sm:[&>*]:w-auto",
        ALIGN[align],
        className,
      )}
    >
      {children}
    </div>
  );
}
