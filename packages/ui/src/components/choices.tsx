import { useId, useState, type ComponentProps, type ReactNode } from "react";

import { cx } from "../cx.js";
import { FieldError, FieldHint, RequiredMark, joinIds } from "./field.js";

const CHOICE_INPUT =
  "mt-0.5 size-5 shrink-0 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "children"> {
  /** The text next to the box; may contain a link, such as to terms. */
  label: ReactNode;
  hint?: string | undefined;
  error?: string | undefined;
}

/** A native checkbox with its label, an optional hint and an error, all linked. */
export function Checkbox({ label, hint, error, id, className, ...rest }: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? `${generated}input`;
  const hintId = `${generated}hint`;
  const errorId = `${generated}error`;
  const hasHint = hint !== undefined && hint !== "";
  const invalid = error !== undefined && error !== "";
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          {...rest}
          id={inputId}
          aria-invalid={rest["aria-invalid"] ?? (invalid ? true : undefined)}
          aria-describedby={joinIds(hasHint && hintId, invalid && errorId, rest["aria-describedby"])}
          className={CHOICE_INPUT}
        />
        <label htmlFor={inputId} className={cx("text-sm font-medium text-text", rest.disabled === true && "opacity-60")}>
          {label}
          {rest.required === true ? <RequiredMark /> : null}
        </label>
      </div>
      {hasHint ? (
        <FieldHint id={hintId} className="pl-8">
          {hint}
        </FieldHint>
      ) : null}
      {invalid ? (
        <FieldError id={errorId} className="pl-8">
          {error}
        </FieldError>
      ) : null}
    </div>
  );
}

export interface SwitchProps {
  /** The setting this turns on or off. */
  label: ReactNode;
  /** The state, when the product keeps it. Leave undefined to let the switch manage itself. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  hint?: string | undefined;
  disabled?: boolean;
  className?: string;
}

/** A boolean on/off control, for a setting rather than a form field. */
export function Switch({ label, checked, defaultChecked = false, onCheckedChange, hint, disabled = false, className }: SwitchProps) {
  const generated = useId();
  const labelId = `${generated}label`;
  const hintId = `${generated}hint`;
  const [own, setOwn] = useState(defaultChecked);
  const isChecked = checked ?? own;
  const hasHint = hint !== undefined && hint !== "";

  const toggle = () => {
    const next = !isChecked;
    if (checked === undefined) {
      setOwn(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <div className={cx("flex items-start justify-between gap-3", className)}>
      <span className="flex min-w-0 flex-col">
        <span id={labelId} className={cx("text-sm font-medium text-text", disabled && "opacity-60")}>
          {label}
        </span>
        {hasHint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={labelId}
        aria-describedby={hasHint ? hintId : undefined}
        disabled={disabled}
        onClick={toggle}
        className={cx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary" : "bg-border-strong",
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "inline-block size-5 translate-x-0.5 rounded-full bg-surface shadow transition-transform",
            isChecked && "translate-x-[22px]",
          )}
        />
      </button>
    </div>
  );
}

export interface RadioOption<V extends string> {
  value: V;
  label: string;
  /** A line of help under the option's label. */
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string> {
  /** The question the options answer; becomes the group's legend. */
  label: string;
  options: readonly RadioOption<V>[];
  /** The chosen value; `null` for none. Leave undefined to let the group manage itself. */
  value?: V | null;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** The form field name; generated when omitted. */
  name?: string;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/**
 * A set of native radio buttons in a fieldset. The legend names the group; the hint and error
 * describe it, and the group is marked invalid while there is an error.
 */
export function RadioGroup<V extends string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  hint,
  error,
  required = false,
  disabled = false,
  orientation = "vertical",
  className,
}: RadioGroupProps<V>) {
  const generated = useId();
  const groupName = name ?? `${generated}name`;
  const legendId = `${generated}legend`;
  const hintId = `${generated}hint`;
  const errorId = `${generated}error`;
  const hasHint = hint !== undefined && hint !== "";
  const invalid = error !== undefined && error !== "";
  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={joinIds(hasHint && hintId, invalid && errorId)}
      aria-invalid={invalid ? true : undefined}
      aria-required={required ? true : undefined}
      disabled={disabled}
      className={cx("min-w-0", className)}
    >
      <legend id={legendId} className="mb-1.5 text-sm font-semibold text-text">
        {label}
        {required ? <RequiredMark /> : null}
      </legend>
      <div className="flex flex-col gap-1.5">
        {hasHint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
        <div className={cx("flex gap-x-6 gap-y-2.5", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap")}>
          {options.map((option, index) => {
            const optionId = `${generated}option${String(index)}`;
            const optionHintId = `${optionId}hint`;
            const hasOptionHint = option.hint !== undefined && option.hint !== "";
            const optionDisabled = disabled || option.disabled === true;
            return (
              <div key={option.value} className={cx("flex items-start gap-3", optionDisabled && "opacity-60")}>
                <input
                  type="radio"
                  id={optionId}
                  name={groupName}
                  value={option.value}
                  checked={value === undefined ? undefined : value === option.value}
                  defaultChecked={value === undefined && defaultValue !== undefined ? defaultValue === option.value : undefined}
                  disabled={option.disabled}
                  required={required}
                  aria-describedby={hasOptionHint ? optionHintId : undefined}
                  onChange={() => {
                    onValueChange?.(option.value);
                  }}
                  className={CHOICE_INPUT}
                />
                <span className="flex flex-col">
                  <label
                    htmlFor={optionId}
                    className={cx("text-sm font-medium text-text", optionDisabled ? "cursor-not-allowed" : "cursor-pointer")}
                  >
                    {option.label}
                  </label>
                  {hasOptionHint ? (
                    <span id={optionHintId} className="text-xs text-muted">
                      {option.hint}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
        {invalid ? <FieldError id={errorId}>{error}</FieldError> : null}
      </div>
    </fieldset>
  );
}
