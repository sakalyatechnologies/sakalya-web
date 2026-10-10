import type { ReactNode } from "react";

import { cx } from "../cx.js";

export type DeviceKind = "phone" | "desktop";

export interface DeviceFrameProps {
  device: DeviceKind;
  /** Names the preview for screen readers, such as "Website preview". */
  label: string;
  /** The address shown in a desktop frame's title bar. */
  address?: string;
  /** Height cap of the screen in pixels; content taller than this scrolls inside the frame. */
  maxHeight?: number;
  className?: string;
  children: ReactNode;
}

/**
 * A phone or desktop-window frame around a preview, such as a site on two screen sizes.
 * Purely visual chrome: the frame's decoration is hidden from assistive technology, and the
 * screen is a labelled, keyboard-scrollable region.
 */
export function DeviceFrame({ device, label, address, maxHeight = 560, className, children }: DeviceFrameProps) {
  const screen = (
    <div
      role="region"
      aria-label={label}
      // A scrolling region needs a tab stop, or keyboard users cannot reach what is below the fold.
      tabIndex={0}
      style={{ maxHeight }}
      className="overflow-x-hidden overflow-y-auto bg-surface text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </div>
  );

  if (device === "phone") {
    return (
      <div
        data-device="phone"
        className={cx("mx-auto w-full max-w-[320px] rounded-[2.5rem] bg-sidebar p-2.5 shadow-xl", className)}
      >
        <div aria-hidden="true" className="mx-auto mb-1.5 h-1.5 w-16 rounded-full bg-sidebar-text/30" />
        <div className="overflow-hidden rounded-[2rem]">{screen}</div>
      </div>
    );
  }

  return (
    <div data-device="desktop" className={cx("w-full overflow-hidden rounded-xl border border-border-strong bg-sidebar shadow-xl", className)}>
      <div aria-hidden="true" className="flex items-center gap-3 px-3 py-2">
        <span className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-sidebar-text/30" />
          <i className="size-2.5 rounded-full bg-sidebar-text/30" />
          <i className="size-2.5 rounded-full bg-sidebar-text/30" />
        </span>
        {address !== undefined ? (
          <span className="min-w-0 flex-1 truncate rounded-md bg-sidebar-text/10 px-3 py-0.5 text-center font-mono text-[11px] text-sidebar-text">
            {address}
          </span>
        ) : null}
      </div>
      {screen}
    </div>
  );
}
