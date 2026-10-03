import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cx } from "../cx.js";
import { CONTROL_INPUT, controlFrame, useFieldControl } from "./field.js";

export interface SelectOption<V extends string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<V extends string>
  extends Omit<ComponentProps<"select">, "children" | "value" | "defaultValue" | "multiple"> {
  options: readonly SelectOption<V>[];
  /** The selected value, or an empty string for none (shows the placeholder). */
  value?: V | "";
  defaultValue?: V | "";
  /** Shown while nothing is selected; cannot be chosen again once a value is picked. */
  placeholder?: string;
  /** Called with the chosen option's value, typed as one of the options. */
  onValueChange?: (value: V) => void;
}

/**
 * A themed native select. The browser's own picker is used deliberately: it is fully
 * accessible, works with form submission and autofill, and is the best picker on phones.
 */
export function Select<V extends string>({
  options,
  placeholder,
  onChange,
  onValueChange,
  className,
  ...rest
}: SelectProps<V>) {
  const control = useFieldControl(rest);
  return (
    <div className={cx(controlFrame(control.invalid), className)}>
      <select
        {...rest}
        {...control.props}
        onChange={(event) => {
          onChange?.(event);
          const chosen = options.find((option) => option.value === event.currentTarget.value);
          if (chosen !== undefined) {
            onValueChange?.(chosen.value);
          }
        }}
        className={cx(
          CONTROL_INPUT,
          "cursor-pointer appearance-none pr-10 [&>option]:bg-surface [&>option]:text-text",
        )}
      >
        {placeholder !== undefined ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 size-4 text-muted" />
    </div>
  );
}
