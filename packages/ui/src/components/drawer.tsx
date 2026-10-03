import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "../cx.js";
import { BACKDROP, CLOSE_BUTTON, type OverlaySize } from "./overlay-parts.js";
import { usePortalTheme } from "./theme-scope.js";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Names the drawer; shown as its heading unless `hideTitle` is set. */
  title: string;
  /** Keeps the title for screen readers only, when the content already makes it clear. */
  hideTitle?: boolean;
  description?: string | undefined;
  children?: ReactNode;
  /** Buttons pinned to the bottom, least important first. */
  footer?: ReactNode;
  /** The edge it slides in from. */
  side?: "left" | "right";
  size?: OverlaySize;
  closeLabel?: string;
}

const WIDTH: Readonly<Record<OverlaySize, string>> = { sm: "max-w-xs", md: "max-w-md", lg: "max-w-2xl" };

/**
 * A modal panel that slides in from the side, for details, filters or navigation. It traps
 * focus like a dialog and can be swiped away towards its edge on touch screens.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  side = "right",
  size = "md",
  closeLabel = "Close",
}: DrawerProps) {
  const portal = usePortalTheme();
  const left = side === "left";
  return (
    <BaseDrawer.Root open={open} onOpenChange={onOpenChange} swipeDirection={side}>
      <BaseDrawer.Portal {...portal}>
        <BaseDrawer.Backdrop className={BACKDROP} />
        <BaseDrawer.Viewport className={cx("fixed inset-0 flex items-stretch", left ? "justify-start" : "justify-end")}>
          <BaseDrawer.Popup
            className={cx(
              "relative flex h-full w-[calc(100vw-3rem)] flex-col bg-surface text-text shadow-2xl outline-none",
              "[transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-swiping:duration-0",
              left
                ? "border-r border-border data-ending-style:[transform:translateX(calc(-100%-2px))] data-starting-style:[transform:translateX(calc(-100%-2px))]"
                : "border-l border-border data-ending-style:[transform:translateX(calc(100%+2px))] data-starting-style:[transform:translateX(calc(100%+2px))]",
              WIDTH[size],
            )}
          >
            <div className={cx("min-h-16 py-4 pr-14 pl-5", !hideTitle && "border-b border-border")}>
              <BaseDrawer.Title className={hideTitle ? "sr-only" : "pt-1 text-lg font-bold tracking-tight text-text"}>
                {title}
              </BaseDrawer.Title>
              {description !== undefined && description !== "" ? (
                <BaseDrawer.Description className="mt-1 text-sm text-muted">{description}</BaseDrawer.Description>
              ) : null}
            </div>
            <BaseDrawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </BaseDrawer.Content>
            {footer !== undefined ? (
              <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            ) : null}
            {/* Last in the DOM so focus starts in the content, though it shows at the top. */}
            <BaseDrawer.Close aria-label={closeLabel} className={cx(CLOSE_BUTTON, "absolute top-3.5 right-3")}>
              <X aria-hidden="true" className="size-5" />
            </BaseDrawer.Close>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}
