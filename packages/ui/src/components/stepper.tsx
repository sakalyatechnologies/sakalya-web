import { Check } from "lucide-react";

import { cx } from "../cx.js";

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperLabels {
  /** Said after a finished step's name, for screen readers. */
  completed: string;
  /** Said after the current step's name. */
  current: string;
  upcoming: string;
}

const DEFAULT_LABELS: StepperLabels = { completed: "completed", current: "current step", upcoming: "not started" };

export interface StepperProps {
  steps: readonly StepperStep[];
  /** Index of the current step; steps before it show as done. */
  current: number;
  /** Names the list for screen readers, such as "Registration progress". */
  label: string;
  /** When given, finished steps become buttons that go back to that step. */
  onStepSelect?: (index: number) => void;
  labels?: Partial<StepperLabels>;
  className?: string;
}

/**
 * The progress line of a multi-step form: numbered steps joined by a rule, finished steps
 * checked, the current one marked with `aria-current="step"`. It shows progress; the form
 * itself owns the Back and Next buttons and the step's content.
 */
export function Stepper({ steps, current, label, onStepSelect, labels, className }: StepperProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  return (
    <ol aria-label={label} className={cx("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const state = done ? text.completed : active ? text.current : text.upcoming;
        const indicator = (
          <>
            <span
              aria-hidden="true"
              className={cx(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                done || active ? "bg-primary text-on-primary" : "bg-surface-muted text-muted",
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className={cx("text-xs", active ? "font-semibold text-text" : "text-muted")}>{step.label}</span>
            <span className="sr-only">, {state}</span>
          </>
        );
        return (
          <li key={step.id} aria-current={active ? "step" : undefined} className={cx("flex items-center gap-2", index < steps.length - 1 && "flex-1")}>
            {done && onStepSelect !== undefined ? (
              <button
                type="button"
                onClick={() => {
                  onStepSelect(index);
                }}
                className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {indicator}
              </button>
            ) : (
              <span className="flex items-center gap-2">{indicator}</span>
            )}
            {index < steps.length - 1 ? <span aria-hidden="true" className={cx("h-px flex-1", done ? "bg-primary" : "bg-border")} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
