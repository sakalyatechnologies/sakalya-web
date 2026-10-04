import { cx } from "../cx.js";

export interface ChipFilterOption<V extends string> {
  value: V;
  label: string;
}

export interface ChipFilterGroupProps<V extends string> {
  /** Names the group of chips for screen readers, such as "Filter patients". */
  label: string;
  options: readonly ChipFilterOption<V>[];
  /** The chosen values. A single-select group still receives an array of 0 or 1 items. */
  value: readonly V[];
  onValueChange: (value: readonly V[]) => void;
  /** Lets more than one chip be pressed at once. Defaults to a single, always-one-chosen group. */
  multiple?: boolean;
  className?: string;
}

/**
 * A row of toggle chips for quick list filters, such as "All / With balance / New this month".
 * Single-select behaves like a segmented control: pressing a chip always leaves exactly one
 * chosen. Each chip is a real, keyboard-operable button.
 */
export function ChipFilterGroup<V extends string>({
  label,
  options,
  value,
  onValueChange,
  multiple = false,
  className,
}: ChipFilterGroupProps<V>) {
  const toggle = (option: V) => {
    if (multiple) {
      onValueChange(value.includes(option) ? value.filter((chosen) => chosen !== option) : [...value, option]);
    } else if (!value.includes(option)) {
      onValueChange([option]);
    }
  };

  return (
    <div role="group" aria-label={label} className={cx("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              toggle(option.value);
            }}
            className={cx(
              "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              selected ? "border-text bg-text text-surface" : "border-border bg-surface text-muted hover:bg-surface-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
