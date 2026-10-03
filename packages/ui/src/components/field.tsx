import { AlertCircle } from "lucide-react";
import { createContext, useContext, useId, useMemo, type AriaAttributes, type ReactNode } from "react";

import { cx } from "../cx.js";

/** What a control inside a `Field` needs to connect itself to the label, hint and error. */
interface FieldState {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = createContext<FieldState | null>(null);

/** Joins element ids for `aria-describedby`, skipping empty ones. */
export function joinIds(...ids: readonly (string | false | null | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined === "" ? undefined : joined;
}

/** The accessibility props a form control accepts, which a surrounding `Field` can fill in. */
export interface FieldControlProps {
  id?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  required?: boolean | undefined;
  disabled?: boolean | undefined;
}

/** The merged props for a control, plus whether it should look invalid. */
export interface FieldControl {
  props: {
    id: string | undefined;
    "aria-describedby": string | undefined;
    "aria-invalid": AriaAttributes["aria-invalid"];
    required: boolean | undefined;
    disabled: boolean | undefined;
  };
  invalid: boolean;
}

/**
 * Connects a control to the surrounding `Field`: its id matches the label, its description
 * lists the hint and error, and it is marked invalid while there is an error. The control's
 * own props win, so a control also works outside a `Field` when given an `aria-label`.
 */
export function useFieldControl(own: FieldControlProps): FieldControl {
  const field = useContext(FieldContext);
  const ariaInvalid = own["aria-invalid"] ?? (field?.invalid === true ? true : undefined);
  return {
    props: {
      id: own.id ?? field?.controlId,
      "aria-describedby": joinIds(field?.describedBy, own["aria-describedby"]),
      "aria-invalid": ariaInvalid,
      required: own.required ?? field?.required,
      disabled: own.disabled ?? field?.disabled,
    },
    invalid: ariaInvalid === true || ariaInvalid === "true",
  };
}

/** The outline shared by text fields, selects and date fields. */
export function controlFrame(invalid: boolean): string {
  return cx(
    "relative flex w-full min-w-0 items-center rounded-xl border bg-surface text-text transition-colors",
    "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary",
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
    invalid ? "border-danger" : "border-border-strong",
  );
}

/**
 * The inner element of a text field. 16px text on phones stops iOS from zooming in on focus.
 */
export const CONTROL_INPUT =
  "min-h-11 w-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 py-2.5 text-base text-text outline-none placeholder:text-muted disabled:cursor-not-allowed sm:text-sm";

export interface FieldHintProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/** Help text under a label, linked to its control by id. */
export function FieldHint({ id, children, className }: FieldHintProps) {
  return (
    <p id={id} className={cx("text-sm text-muted", className)}>
      {children}
    </p>
  );
}

export interface FieldErrorProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/** A validation message, linked to its control by id. */
export function FieldError({ id, children, className }: FieldErrorProps) {
  return (
    <p id={id} className={cx("flex items-start gap-1.5 text-sm font-medium text-danger-text", className)}>
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Marks a label as required. Hidden from screen readers, which hear the control's `required`. */
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-danger-text">
      *
    </span>
  );
}

export interface FieldProps {
  label: string;
  /** Help shown under the label, such as the expected format. */
  hint?: string | undefined;
  /**
   * The validation message. Products map API field errors to these strings. While it is set,
   * the control is marked invalid and the message is read with it.
   */
  error?: string | undefined;
  required?: boolean;
  disabled?: boolean;
  /** Keeps the label for screen readers but hides it visually, for compact filters. */
  hideLabel?: boolean;
  /** The control's id; generated when omitted. */
  id?: string;
  /** One control: `TextInput`, `TextArea`, `Select`, `DateInput` or `PhoneInput`. */
  children: ReactNode;
  className?: string;
}

/** A label, optional hint and error around one form control, wired up for assistive technology. */
export function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  hideLabel = false,
  id,
  children,
  className,
}: FieldProps) {
  const generated = useId();
  const controlId = id ?? `${generated}control`;
  const hintId = `${generated}hint`;
  const errorId = `${generated}error`;
  const hasHint = hint !== undefined && hint !== "";
  const invalid = error !== undefined && error !== "";
  const describedBy = joinIds(hasHint && hintId, invalid && errorId);
  const state = useMemo<FieldState>(
    () => ({ controlId, describedBy, invalid, required, disabled }),
    [controlId, describedBy, invalid, required, disabled],
  );
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className={cx("text-sm font-semibold text-text", hideLabel && "sr-only")}>
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {hasHint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      <FieldContext value={state}>{children}</FieldContext>
      {invalid ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
