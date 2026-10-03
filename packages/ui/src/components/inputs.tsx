import { useId, type ComponentProps, type ReactNode } from "react";

import { cx } from "../cx.js";
import { CONTROL_INPUT, controlFrame, joinIds, useFieldControl } from "./field.js";

export type TextInputType = "text" | "email" | "password" | "url" | "number" | "search" | "tel";

export interface TextInputProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  type?: TextInputType;
  /** Content inside the field before the text, such as a currency symbol or an icon. */
  startAddon?: ReactNode;
  /** Content inside the field after the text, such as a unit. */
  endAddon?: ReactNode;
}

const ADDON = "flex shrink-0 items-center text-sm font-medium text-muted [&>svg]:size-4";

/**
 * A single-line text field. Put it inside a `Field` for its label, hint and error. Accepts
 * every native input prop, including `ref`, so form libraries can register it.
 */
export function TextInput({ type = "text", startAddon, endAddon, className, ...rest }: TextInputProps) {
  const control = useFieldControl(rest);
  return (
    <div className={cx(controlFrame(control.invalid), className)}>
      {startAddon !== undefined ? <span className={cx(ADDON, "pl-3.5")}>{startAddon}</span> : null}
      <input
        type={type}
        {...rest}
        {...control.props}
        className={cx(CONTROL_INPUT, startAddon !== undefined && "pl-2", endAddon !== undefined && "pr-2")}
      />
      {endAddon !== undefined ? <span className={cx(ADDON, "pr-3.5")}>{endAddon}</span> : null}
    </div>
  );
}

export type TextAreaProps = ComponentProps<"textarea">;

/** A multi-line text field that the user can make taller. */
export function TextArea({ className, rows = 4, ...rest }: TextAreaProps) {
  const control = useFieldControl(rest);
  return (
    <div className={cx(controlFrame(control.invalid), className)}>
      <textarea rows={rows} {...rest} {...control.props} className={cx(CONTROL_INPUT, "resize-y")} />
    </div>
  );
}

export interface DateInputProps extends Omit<ComponentProps<"input">, "type" | "size" | "value" | "defaultValue" | "min" | "max"> {
  /** The date as `YYYY-MM-DD`, or an empty string for no date. */
  value?: string;
  defaultValue?: string;
  /** The earliest allowed date, `YYYY-MM-DD`. */
  min?: string;
  /** The latest allowed date, `YYYY-MM-DD`. */
  max?: string;
  /** Called with the new date as `YYYY-MM-DD`, or an empty string when cleared. */
  onValueChange?: (value: string) => void;
}

/**
 * A date field using the browser's own date picker, which is accessible and native on phones.
 * The value is always `YYYY-MM-DD`, whatever format the browser shows.
 */
export function DateInput({ className, onChange, onValueChange, ...rest }: DateInputProps) {
  const control = useFieldControl(rest);
  return (
    <div className={cx(controlFrame(control.invalid), className)}>
      <input
        type="date"
        {...rest}
        {...control.props}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
        className={cx(CONTROL_INPUT, "tabular-nums")}
      />
    </div>
  );
}

/** An international calling code such as `+91`. */
export type CallingCode = `+${number}`;

/** E.164 allows at most 15 digits including the country code; India's numbers have 10. */
function defaultMaxDigits(callingCode: CallingCode): number {
  return callingCode === "+91" ? 10 : 15 - (callingCode.length - 1);
}

/**
 * The national digits in what a user typed or pasted. Drops spaces and punctuation, and an
 * international prefix such as `+91`, `0091` or a leading `91` or `0` on a number that is too
 * long, then keeps at most `maxDigits` digits.
 */
export function phoneDigits(raw: string, callingCode: CallingCode, maxDigits = defaultMaxDigits(callingCode)): string {
  const code = callingCode.slice(1);
  let text = raw.trim();
  if (text.startsWith(callingCode)) {
    text = text.slice(callingCode.length);
  } else if (text.startsWith(`00${code}`)) {
    text = text.slice(2 + code.length);
  }
  let digits = text.replace(/\D/g, "");
  if (digits.length > maxDigits && digits.startsWith(code)) {
    digits = digits.slice(code.length);
  }
  if (digits.length > maxDigits && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, maxDigits);
}

export interface PhoneInputProps
  extends Omit<TextInputProps, "type" | "value" | "defaultValue" | "startAddon" | "inputMode"> {
  /** The country calling code shown before the number. */
  callingCode?: CallingCode;
  /** The national number, digits only. */
  value?: string;
  defaultValue?: string;
  /** The most digits the national number may have. Defaults to 10 for `+91`. */
  maxDigits?: number;
  /** Called with the national number, digits only. */
  onValueChange?: (digits: string) => void;
}

/**
 * A phone number field with a fixed country calling code. It keeps only digits, so pasting
 * `+91 98765-43210` gives `9876543210`; combine the code and digits when saving.
 */
export function PhoneInput({
  callingCode = "+91",
  maxDigits,
  onChange,
  onValueChange,
  autoComplete = "tel-national",
  ...rest
}: PhoneInputProps) {
  const prefixId = useId();
  const limit = maxDigits ?? defaultMaxDigits(callingCode);
  return (
    <TextInput
      {...rest}
      type="tel"
      inputMode="numeric"
      autoComplete={autoComplete}
      startAddon={<span id={prefixId}>{callingCode}</span>}
      aria-describedby={joinIds(prefixId, rest["aria-describedby"])}
      onChange={(event) => {
        const input = event.currentTarget;
        const digits = phoneDigits(input.value, callingCode, limit);
        if (input.value !== digits) {
          input.value = digits;
        }
        onChange?.(event);
        onValueChange?.(digits);
      }}
    />
  );
}
