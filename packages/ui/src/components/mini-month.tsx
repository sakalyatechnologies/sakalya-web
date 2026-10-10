import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../cx.js";

/** A calendar date as `YYYY-MM-DD`. Plain strings keep dates free of time zones. */
export type IsoDate = string;

interface Ymd {
  year: number;
  month: number;
  day: number;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Reads `YYYY-MM-DD`, or returns null for anything else, including dates that do not exist. */
export function parseIsoDate(value: string): Ymd | null {
  const match = ISO.exec(value);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
    ? { year, month, day }
    : null;
}

function toIso({ year, month, day }: Ymd): IsoDate {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function utc(date: Ymd): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

function fromUtc(date: Date): Ymd {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function addDays(date: Ymd, days: number): Ymd {
  const next = utc(date);
  next.setUTCDate(next.getUTCDate() + days);
  return fromUtc(next);
}

/** Moves by whole months, keeping the day where the month is long enough, else its last day. */
function addMonths(date: Ymd, months: number): Ymd {
  const first = new Date(Date.UTC(date.year, date.month - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return { year: first.getUTCFullYear(), month: first.getUTCMonth() + 1, day: Math.min(date.day, last) };
}

/** Day of week, 0 for Sunday. */
function weekday(date: Ymd): number {
  return utc(date).getUTCDay();
}

export interface MiniMonthLabels {
  previousMonth: string;
  nextMonth: string;
  /** Added to a day that has items, such as "has appointments". */
  busy: string;
  today: string;
}

const DEFAULT_LABELS: MiniMonthLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  busy: "has items",
  today: "today",
};

export interface MiniMonthProps {
  /** The selected day, when the product keeps it. Leave undefined to let the calendar remember the choice. */
  value?: IsoDate | undefined;
  onValueChange?: (value: IsoDate) => void;
  /** Today's date, marked in the primary colour. Passed in so the calendar never reads the clock. */
  today?: IsoDate;
  /** Days to mark with a dot, such as days that have appointments. */
  busy?: readonly IsoDate[];
  /** The month on show when no day is selected, as any date in it. Defaults to `value`, then `today`. */
  initialMonth?: IsoDate;
  /** 1 starts weeks on Monday (the default); 0 on Sunday. */
  weekStartsOn?: 0 | 1;
  /** BCP 47 tag for month and weekday names. Defaults to the viewer's locale. */
  locale?: string;
  labels?: Partial<MiniMonthLabels>;
  className?: string;
}

/**
 * A compact month calendar for choosing a day, with a dot under days that have items. It is
 * an ARIA grid with one tab stop: arrow keys move by day and week, Home and End to the week's
 * ends, Page Up and Page Down by month (with Shift, by year), Enter or Space chooses.
 */
export function MiniMonth({
  value,
  onValueChange,
  today,
  busy = [],
  initialMonth,
  weekStartsOn = 1,
  locale,
  labels,
  className,
}: MiniMonthProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [chosen, setChosen] = useState<IsoDate | undefined>(undefined);
  const chosenValue = value ?? chosen;
  const selected = chosenValue === undefined ? null : parseIsoDate(chosenValue);
  const todayDate = today === undefined ? null : parseIsoDate(today);
  const start =
    selected ?? (initialMonth === undefined ? null : parseIsoDate(initialMonth)) ?? todayDate ?? { year: 1970, month: 1, day: 1 };

  const [focused, setFocused] = useState<Ymd>(start);
  const [shown, setShown] = useState({ year: start.year, month: start.month });
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  // After a key moves the focused day, put DOM focus on its button once it has rendered.
  useEffect(() => {
    if (moveFocus.current) {
      moveFocus.current = false;
      gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
    }
  });

  const busySet = new Set(busy);
  const monthStart: Ymd = { year: shown.year, month: shown.month, day: 1 };
  const daysInMonth = new Date(Date.UTC(shown.year, shown.month, 0)).getUTCDate();
  const lead = (weekday(monthStart) - weekStartsOn + 7) % 7;
  const cells: (Ymd | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ year: shown.year, month: shown.month, day: index + 1 })),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));

  const monthName = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(utc(monthStart));
  const weekdayNames = Array.from({ length: 7 }, (_, index) => {
    const day = utc({ year: 2023, month: 1, day: 1 + ((index + weekStartsOn) % 7) });
    return {
      long: new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(day),
      narrow: new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" }).format(day),
    };
  });
  const dayLabel = (date: Ymd) =>
    new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utc(date));

  const showMonthOf = (date: Ymd) => {
    setShown({ year: date.year, month: date.month });
  };
  const focusDay = (date: Ymd) => {
    moveFocus.current = true;
    setFocused(date);
    showMonthOf(date);
  };
  const stepMonth = (delta: number) => {
    const next = addMonths(focused, delta);
    setFocused(next);
    showMonthOf(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const column = (weekday(focused) - weekStartsOn + 7) % 7;
    const moves: Readonly<Record<string, Ymd>> = {
      ArrowLeft: addDays(focused, -1),
      ArrowRight: addDays(focused, 1),
      ArrowUp: addDays(focused, -7),
      ArrowDown: addDays(focused, 7),
      Home: addDays(focused, -column),
      End: addDays(focused, 6 - column),
      PageUp: addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const target = moves[event.key];
    if (target !== undefined) {
      event.preventDefault();
      focusDay(target);
    }
  };

  const focusedInView = focused.year === shown.year && focused.month === shown.month;
  // The tab stop must exist on screen: use the focused day, else the first of the month.
  const tabStop = focusedInView ? focused.day : 1;

  return (
    <div className={cx("w-full", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm font-semibold text-text">
          {monthName}
        </p>
        <div className="flex items-center gap-1">
          <NavButton label={text.previousMonth} onClick={() => { stepMonth(-1); }}>
            <ChevronLeft aria-hidden="true" className="size-4" />
          </NavButton>
          <NavButton label={text.nextMonth} onClick={() => { stepMonth(1); }}>
            <ChevronRight aria-hidden="true" className="size-4" />
          </NavButton>
        </div>
      </div>
      <div ref={gridRef} role="grid" aria-label={monthName} onKeyDown={onKeyDown} className="grid gap-1 text-center text-xs">
        <div role="row" className="grid grid-cols-7 gap-1">
          {weekdayNames.map((name) => (
            <span key={name.long} role="columnheader" aria-label={name.long} className="py-1 text-[11px] font-medium text-muted">
              {name.narrow}
            </span>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="grid grid-cols-7 gap-1">
            {week.map((date, columnIndex) => {
              if (date === null) {
                return <span key={columnIndex} role="gridcell" aria-hidden="true" />;
              }
              const iso = toIso(date);
              const isSelected = selected !== null && toIso(selected) === iso;
              const isToday = todayDate !== null && toIso(todayDate) === iso;
              const isBusy = busySet.has(iso);
              return (
                <span key={columnIndex} role="gridcell" aria-selected={isSelected}>
                  <button
                    type="button"
                    tabIndex={date.day === tabStop ? 0 : -1}
                    aria-current={isToday ? "date" : undefined}
                    aria-label={[dayLabel(date), isToday ? text.today : null, isBusy ? text.busy : null].filter(Boolean).join(", ")}
                    onClick={() => {
                      setFocused(date);
                      setChosen(iso);
                      onValueChange?.(iso);
                    }}
                    className={cx(
                      "relative grid aspect-square w-full place-items-center rounded-xl text-sm tabular-nums transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                      isSelected
                        ? "bg-primary font-semibold text-on-primary"
                        : isToday
                          ? "bg-primary-soft font-semibold text-primary-text"
                          : "text-text hover:bg-surface-muted",
                    )}
                  >
                    {date.day}
                    {isBusy ? (
                      <span
                        aria-hidden="true"
                        className={cx("absolute bottom-1 size-1 rounded-full", isSelected ? "bg-on-primary" : "bg-primary")}
                      />
                    ) : null}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}
