/** Class names shared by dialogs, drawers, menus and toasts. */

/** A small square icon button, used to close an overlay. */
export const CLOSE_BUTTON =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** The dimmed layer behind a modal. Absolute on iOS so it covers the area under the browser UI. */
export const BACKDROP =
  "fixed inset-0 bg-scrim/45 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute";

export type OverlaySize = "sm" | "md" | "lg";
