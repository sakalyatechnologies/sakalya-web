import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

import { cx } from "../cx.js";

export interface PillOption<V extends string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface PillsProps<V extends string> {
  /** Names the group for screen readers, such as "Time range". */
  label: string;
  options: readonly PillOption<V>[];
  value: V;
  onValueChange: (value: V) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A segmented control in a rounded track: choose one view or range of several. One option is
 * always chosen. Arrow keys move between options, and each is a real toggle button.
 */
export function Pills<V extends string>({ label, options, value, onValueChange, size = "md", className }: PillsProps<V>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(next: readonly V[]) => {
        // Pressing the chosen option would clear the group; a segmented control keeps one on.
        const chosen = next.find((option) => option !== value);
        if (chosen !== undefined) {
          onValueChange(chosen);
        }
      }}
      className={cx("inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 shadow-card", className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cx(
            "shrink-0 rounded-full font-medium whitespace-nowrap transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:opacity-50",
            "text-muted hover:text-text data-pressed:bg-sidebar data-pressed:text-sidebar-text data-pressed:shadow-sm",
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
          )}
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
