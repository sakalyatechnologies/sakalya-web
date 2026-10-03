import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";

import { cx } from "../cx.js";
import { BACKDROP, CLOSE_BUTTON, type OverlaySize } from "./overlay-parts.js";
import { usePortalTheme } from "./theme-scope.js";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Names the dialog; shown as its heading. */
  title: string;
  /** A sentence under the title, read when the dialog opens. */
  description?: string | undefined;
  children?: ReactNode;
  /** Buttons at the bottom, least important first. */
  footer?: ReactNode;
  size?: OverlaySize;
  /** The close button's accessible name. */
  closeLabel?: string;
  /** Whether pressing outside closes the dialog. Turn off where input would be lost. */
  dismissOnOutsidePress?: boolean;
  /** What to focus on open; by default the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>;
}

const WIDTH: Readonly<Record<OverlaySize, string>> = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-3xl" };

/**
 * A modal dialog. Focus moves inside and stays there until it closes; Escape, the close button
 * or pressing outside close it, and focus returns to what opened it. On phones it rises from
 * the bottom of the screen.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  closeLabel = "Close",
  dismissOnOutsidePress = true,
  initialFocus,
}: DialogProps) {
  const portal = usePortalTheme();
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange} disablePointerDismissal={!dismissOnOutsidePress}>
      <BaseDialog.Portal {...portal}>
        <BaseDialog.Backdrop className={BACKDROP} />
        <BaseDialog.Viewport className="fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <BaseDialog.Popup
            initialFocus={initialFocus}
            className={cx(
              "relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-card border border-border bg-surface text-text shadow-2xl outline-none",
              "transition-[opacity,translate,scale] duration-200 data-ending-style:translate-y-4 data-ending-style:opacity-0 data-starting-style:translate-y-4 data-starting-style:opacity-0",
              "sm:max-h-[calc(100dvh-3rem)] sm:data-ending-style:translate-y-0 sm:data-ending-style:scale-95 sm:data-starting-style:translate-y-0 sm:data-starting-style:scale-95",
              WIDTH[size],
            )}
          >
            <div className="border-b border-border py-4 pr-14 pl-5">
              <BaseDialog.Title className="pt-1 text-lg font-bold tracking-tight text-text">{title}</BaseDialog.Title>
              {description !== undefined && description !== "" ? (
                <BaseDialog.Description className="mt-1 text-sm text-muted">{description}</BaseDialog.Description>
              ) : null}
            </div>
            {children !== undefined ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div> : null}
            {footer !== undefined ? (
              <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            ) : null}
            {/* Last in the DOM so focus starts in the content, though it shows at the top. */}
            <BaseDialog.Close aria-label={closeLabel} className={cx(CLOSE_BUTTON, "absolute top-3.5 right-3")}>
              <X aria-hidden="true" className="size-5" />
            </BaseDialog.Close>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
