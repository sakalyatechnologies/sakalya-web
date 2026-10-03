import { Menu as BaseMenu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { cx } from "../cx.js";
import { usePortalTheme } from "./theme-scope.js";

export interface MenuItem<Id extends string = string> {
  id: Id;
  label: string;
  icon?: ReactNode;
  /** Shows the item in the danger colour, for destructive actions such as delete. */
  danger?: boolean;
  disabled?: boolean;
  /** Draws a divider above this item, to group related actions. */
  separatorBefore?: boolean;
}

export interface MenuProps<Id extends string = string> {
  /** The trigger's text, or its accessible name when `icon` is given. */
  label: string;
  /** Shows an icon-only trigger, such as a "more" icon for row actions. */
  icon?: ReactNode;
  items: readonly MenuItem<Id>[];
  /** Called with the chosen item's id. */
  onSelect: (id: Id) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  className?: string;
}

const TRIGGER_FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * A button that opens a list of actions. Arrow keys move between items, typing jumps to an
 * item, Enter chooses and Escape closes, returning focus to the button.
 */
export function Menu<Id extends string>({
  label,
  icon,
  items,
  onSelect,
  align = "end",
  side = "bottom",
  className,
}: MenuProps<Id>) {
  const portal = usePortalTheme();
  const iconOnly = icon !== undefined;
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        aria-label={iconOnly ? label : undefined}
        className={cx(
          iconOnly
            ? "inline-flex size-9 items-center justify-center rounded-xl text-muted hover:bg-surface-muted hover:text-text data-popup-open:bg-surface-muted [&>svg]:size-5"
            : "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface-muted data-popup-open:bg-surface-muted",
          "transition-colors",
          TRIGGER_FOCUS,
          className,
        )}
      >
        {iconOnly ? (
          icon
        ) : (
          <>
            {label}
            <ChevronDown aria-hidden="true" className="size-4 text-muted" />
          </>
        )}
      </BaseMenu.Trigger>
      <BaseMenu.Portal {...portal}>
        <BaseMenu.Positioner side={side} align={align} sideOffset={6} className="z-50 outline-none">
          <BaseMenu.Popup
            className={cx(
              "min-w-48 origin-[var(--transform-origin)] rounded-xl border border-border bg-surface p-1.5 text-text shadow-xl outline-none",
              "transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            )}
          >
            {items.map((item) => (
              <Fragment key={item.id}>
                {item.separatorBefore === true ? <BaseMenu.Separator className="mx-1.5 my-1.5 h-px bg-border" /> : null}
                <BaseMenu.Item
                  disabled={item.disabled}
                  onClick={() => {
                    onSelect(item.id);
                  }}
                  className={cx(
                    "flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none select-none",
                    "data-highlighted:bg-surface-muted data-disabled:opacity-50",
                    item.danger === true ? "text-danger-text" : "text-text",
                  )}
                >
                  {item.icon !== undefined ? (
                    <span aria-hidden="true" className="flex [&>svg]:size-4">
                      {item.icon}
                    </span>
                  ) : null}
                  {item.label}
                </BaseMenu.Item>
              </Fragment>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
