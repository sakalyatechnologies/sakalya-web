import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { cx } from "../cx.js";
import { CONTROL_INPUT, controlFrame } from "./field.js";

export interface SearchInputProps
  extends Omit<ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange" | "size"> {
  /** Names the field for screen readers; it is not shown. */
  label: string;
  /** The current search, owned by the product. */
  value: string;
  /** Called once typing pauses for `delay` ms, at once on Enter or clear. */
  onValueChange: (value: string) => void;
  delay?: number;
  clearLabel?: string;
}

/** A search field that reports what was typed after a pause, so a list is not refiltered per key. */
export function SearchInput({
  label,
  value,
  onValueChange,
  delay = 300,
  clearLabel = "Clear search",
  className,
  onKeyDown,
  ...rest
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const input = useRef<HTMLInputElement>(null);

  // The product changed the search itself (for example, cleared a filter): show its value.
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    const pending = timer;
    return () => {
      clearTimeout(pending.current);
    };
  }, []);

  const emit = (next: string) => {
    clearTimeout(timer.current);
    setSynced(next);
    onValueChange(next);
  };

  return (
    <div role="search" className={cx(controlFrame(false), className)}>
      <Search aria-hidden="true" className="ml-3.5 size-4 shrink-0 text-muted" />
      <input
        {...rest}
        ref={input}
        type="search"
        aria-label={label}
        value={draft}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setDraft(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            emit(next);
          }, delay);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter") {
            emit(draft);
          }
        }}
        className={cx(CONTROL_INPUT, "pl-2 [&::-webkit-search-cancel-button]:appearance-none")}
      />
      {draft !== "" ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            setDraft("");
            emit("");
            input.current?.focus();
          }}
          className="mr-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
