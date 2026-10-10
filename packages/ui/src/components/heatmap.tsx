import { cx } from "../cx.js";

export interface HeatmapRow {
  id: string;
  label: string;
  /** One value per column, from 0 to `max`; null for no data. */
  values: readonly (number | null)[];
}

export interface HeatmapProps {
  /** Column headings, such as hours. */
  columns: readonly string[];
  rows: readonly HeatmapRow[];
  /** The value that fills a cell completely. Defaults to 100, for percentages. */
  max?: number;
  /** What a cell's value means, for each cell's tooltip and screen reader name: "Chair 1, 10a: 95% booked". */
  describe: (value: number, row: HeatmapRow, column: string) => string;
  /** Accessible title of the table. */
  summary: string;
  /** Legend ends, such as "Low" and "High". Omit to hide the legend. */
  legend?: { low: string; high: string };
  /** Draws each cell's value as text. On by default, so colour is never the only signal. */
  showValues?: boolean;
  /** Formats the value drawn in a cell. Defaults to the plain number. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * How much of the chart colour each step mixes into the empty colour, and which text colour
 * it carries. Only the top step is the full chart colour: that is the only shade every theme
 * guarantees a readable label on (`onPrimary` on `primary`), and the lower steps are light
 * enough for body text. A smooth ramp would pass through mid-tones where neither reads.
 */
export const HEAT_STEPS = [
  { share: 8, onFill: "text" },
  { share: 24, onFill: "text" },
  { share: 42, onFill: "text" },
  { share: 100, onFill: "on-primary" },
] as const;

/** The step (0 to 3) for `value` out of `max`; invalid input is the lowest step. */
export function heatStep(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }
  const fraction = Math.min(1, Math.max(0, value / max));
  if (fraction < 0.2) return 0;
  if (fraction < 0.45) return 1;
  if (fraction < 0.7) return 2;
  return 3;
}

function cellStyle(step: number) {
  const { share, onFill } = HEAT_STEPS[step] ?? HEAT_STEPS[0];
  return {
    background: `color-mix(in srgb, var(--sk-chart-1) ${String(share)}%, var(--sk-surface-muted))`,
    color: onFill === "text" ? "var(--sk-text)" : "var(--sk-on-primary)",
  };
}

/**
 * A grid of values shaded by size, such as occupancy by hour. It is a real table, so screen
 * readers announce row and column names, and every cell carries its value as text and as a
 * description, so shade is never the only signal. Wide grids scroll sideways.
 */
export function Heatmap({
  columns,
  rows,
  max = 100,
  describe,
  summary,
  legend,
  showValues = true,
  format = (value) => String(Math.round(value)),
  className,
}: HeatmapProps) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-1.5 text-center">
          <caption className="sr-only">{summary}</caption>
          <thead>
            <tr>
              <td />
              {columns.map((column) => (
                <th key={column} scope="col" className="text-[10px] font-normal text-muted">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="pr-2 text-left text-xs font-medium whitespace-nowrap text-text">
                  {row.label}
                </th>
                {columns.map((column, index) => {
                  const value = row.values[index] ?? null;
                  if (value === null) {
                    return (
                      <td key={column} className="h-9 rounded-lg bg-surface-muted text-[10px] text-muted">
                        <span aria-hidden="true">–</span>
                      </td>
                    );
                  }
                  const text = describe(value, row, column);
                  return (
                    <td
                      key={column}
                      title={text}
                      style={cellStyle(heatStep(value, max))}
                      className="h-9 rounded-lg text-[10px] font-medium tabular-nums transition-transform hover:scale-110"
                    >
                      {showValues ? <span aria-hidden="true">{format(value)}</span> : null}
                      <span className="sr-only">{text}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {legend !== undefined ? (
        <div aria-hidden="true" className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted">
          <span>{legend.low}</span>
          {HEAT_STEPS.map((step, index) => (
            <i key={step.share} style={cellStyle(index)} className="size-3 rounded" />
          ))}
          <span>{legend.high}</span>
        </div>
      ) : null}
    </div>
  );
}
