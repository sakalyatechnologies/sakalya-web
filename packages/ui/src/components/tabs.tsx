import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

import { cx } from "../cx.js";

export interface TabItem<V extends string = string> {
  value: V;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<V extends string = string> {
  items: readonly TabItem<V>[];
  /** Names the tab list for screen readers. */
  label: string;
  /** The selected tab, when the product keeps it (for example in the URL). */
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  className?: string;
}

/** Tabs with panels. Arrow keys move between tabs; the selected tab is underlined in the accent. */
export function Tabs<V extends string>({ items, label, value, defaultValue, onValueChange, className }: TabsProps<V>) {
  return (
    <BaseTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(next: unknown) => {
        const chosen = items.find((item) => item.value === next);
        if (chosen !== undefined) {
          onValueChange?.(chosen.value);
        }
      }}
      className={className}
    >
      <BaseTabs.List aria-label={label} className="relative flex gap-1 overflow-x-auto border-b border-border">
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cx(
              "shrink-0 rounded-t-lg px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-muted transition-colors",
              "hover:text-text data-active:text-primary-text data-disabled:cursor-not-allowed data-disabled:opacity-50",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
            )}
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="absolute bottom-0 left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] rounded-full bg-primary transition-[left,width] duration-200" />
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel
          key={item.value}
          value={item.value}
          className="pt-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
