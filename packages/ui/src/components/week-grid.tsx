import { cx, TONE_CLASSES, type Tone } from "../cx.js";

export interface WeekGridDay {
  id: string;
  /** Short weekday name, such as "Mon". */
  label: string;
  /** The day number or date shown under the weekday, such as "12". */
  dateLabel: string;
  /** Highlights the column as the current day. */
  current?: boolean;
}

export interface WeekGridBlock {
  id: string;
  dayId: string;
  /** Hour of day the block starts, from midnight; 9.5 means 9:30. */
  start: number;
  /** Length in hours. */
  duration: number;
  label: string;
  subtitle?: string;
  tone: Tone;
}

export interface WeekGridLabels {
  /** The hour rail's hidden column header. */
  hours: string;
}

const DEFAULT_LABELS: WeekGridLabels = { hours: "Hour" };

/** Formats a fractional hour, such as 13.5, as a locale time like "1:30 PM". */
function hourLabel(hour: number): string {
  const whole = Math.floor(hour);
  const minute = Math.round((hour - whole) * 60);
  const date = new Date(2000, 0, 1, whole, minute);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: minute === 0 ? undefined : "2-digit" }).format(date);
}

export interface WeekGridProps {
  days: readonly WeekGridDay[];
  /** The grid's first hour, such as 8 for 8 AM. */
  startHour: number;
  /** The grid's last hour, exclusive, such as 19 for a day ending at 7 PM. */
  endHour: number;
  blocks: readonly WeekGridBlock[];
  /** Accessible summary of what the grid shows; also the data table's caption. */
  summary: string;
  /** Called with a block's id when it is activated. */
  onBlockSelect?: (id: string) => void;
  /** Pixel height of one hour row. */
  hourHeight?: number;
  labels?: Partial<WeekGridLabels>;
  className?: string;
}

/**
 * A week-by-hours schedule grid: one column per day, blocks positioned and sized by their start
 * time and duration within the hour rail, and coloured by tone. Blocks are real buttons, so the
 * grid is fully operable by keyboard; a visually hidden table gives screen readers the same
 * blocks as rows.
 */
export function WeekGrid({
  days,
  startHour,
  endHour,
  blocks,
  summary,
  onBlockSelect,
  hourHeight = 56,
  labels,
  className,
}: WeekGridProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const hourCount = Math.max(0, endHour - startHour);
  const hours = Array.from({ length: hourCount }, (_, index) => startHour + index);
  const bodyHeight = hourCount * hourHeight;
  const columns = `3.5rem repeat(${String(days.length)}, minmax(6rem, 1fr))`;

  // Blocks that fall partly or fully outside the grid are clamped, never dropped or overflowed.
  const positioned = blocks.map((block) => {
    const rawTop = (block.start - startHour) * hourHeight;
    const top = Math.min(Math.max(rawTop, 0), bodyHeight);
    const rawBottom = (block.start + block.duration - startHour) * hourHeight;
    const bottom = Math.min(Math.max(rawBottom, top), bodyHeight);
    return { ...block, top, height: Math.max(bottom - top, 4) };
  });

  return (
    <div className={cx("min-w-0", className)}>
      <div className="overflow-x-auto">
        <div className="min-w-[40rem]">
          <div className="grid" style={{ gridTemplateColumns: columns }}>
            <div aria-hidden="true" />
            {days.map((day) => (
              <div key={day.id} className="px-1 pb-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">{day.label}</p>
                <p
                  className={cx(
                    "mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm font-bold",
                    day.current ? "bg-primary text-on-primary" : "text-text",
                  )}
                >
                  {day.dateLabel}
                </p>
              </div>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: columns }}>
            <div aria-hidden="true" className="flex flex-col text-right text-xs text-muted">
              {hours.map((hour) => (
                <div key={hour} style={{ height: hourHeight }} className="pr-2 pt-1 tabular-nums">
                  {hourLabel(hour)}
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.id}
                className="relative rounded-xl border border-border bg-surface"
                style={{ height: bodyHeight }}
              >
                {hours.map((hour, index) =>
                  index > 0 ? (
                    <div
                      key={hour}
                      aria-hidden="true"
                      className="absolute inset-x-0 border-t border-border"
                      style={{ top: index * hourHeight }}
                    />
                  ) : null,
                )}
                {positioned
                  .filter((block) => block.dayId === day.id)
                  .map((block) => {
                    const classes = TONE_CLASSES[block.tone];
                    return (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => {
                          onBlockSelect?.(block.id);
                        }}
                        style={{ top: block.top, height: block.height }}
                        className={cx(
                          "absolute inset-x-1 overflow-hidden rounded-lg px-2 py-1 text-left text-xs font-bold transition-transform",
                          "hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                          classes.soft,
                          classes.text,
                        )}
                      >
                        <span className="block truncate">{block.label}</span>
                        {block.subtitle !== undefined ? (
                          <span className="block truncate font-medium opacity-80">{block.subtitle}</span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">{text.hours}</th>
            <th scope="col">Day</th>
            <th scope="col">Title</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.id}>
              <th scope="row">
                {hourLabel(block.start)}–{hourLabel(block.start + block.duration)}
              </th>
              <td>{days.find((day) => day.id === block.dayId)?.label ?? block.dayId}</td>
              <td>
                {block.label}
                {block.subtitle !== undefined ? `, ${block.subtitle}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
