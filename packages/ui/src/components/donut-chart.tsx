import { AlertTriangle } from "lucide-react";

export interface DonutDatum {
  label: string;
  value: number;
}

export type DonutDataProblem = "invalid-value";

export interface DonutDataIssue {
  /** Position of the datum in the input. */
  index: number;
  label: string;
  problem: DonutDataProblem;
}

export interface CleanDonutData {
  /** Values safe to draw: finite and never negative. */
  data: DonutDatum[];
  issues: DonutDataIssue[];
}

/** Makes chart data safe to draw. A missing, infinite or negative value becomes 0, reported as an issue. */
export function cleanDonutData(input: readonly DonutDatum[]): CleanDonutData {
  const issues: DonutDataIssue[] = [];
  const data = input.map((datum, index) => {
    const value = Number.isFinite(datum.value) && datum.value >= 0 ? datum.value : 0;
    if (value !== datum.value) {
      issues.push({ index, label: datum.label, problem: "invalid-value" });
    }
    return { label: datum.label, value };
  });
  return { data, issues };
}

/** Cycled across slices in order, same four hues as `BarChart`. */
const SLICE_COLORS = ["var(--sk-chart-1)", "var(--sk-chart-2)", "var(--sk-chart-3)", "var(--sk-chart-4)"] as const;

function sliceColor(index: number): string {
  return SLICE_COLORS[index % SLICE_COLORS.length] ?? SLICE_COLORS[0];
}

const number = new Intl.NumberFormat();
const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 0 });

export interface DonutChartProps {
  data: readonly DonutDatum[];
  /** Accessible summary of what the chart shows; also the data table's caption. */
  summary: string;
  /** Header for the label column in the data table, such as "Category". */
  categoryLabel?: string;
  /** Header for the value column in the data table, such as "Amount". */
  valueLabel?: string;
  /** A short number shown in the centre, such as a formatted total. */
  centerValue?: string;
  /** A word or two under `centerValue`, such as "total". */
  centerLabel?: string;
  invalidDataNote?: string;
  size?: number;
}

/**
 * A categorical share-of-total donut, drawn with SVG and theme colours. A visually hidden table
 * gives screen readers the same numbers, and the legend lists each share as a percentage.
 */
export function DonutChart({
  data,
  summary,
  categoryLabel = "Category",
  valueLabel = "Value",
  centerValue,
  centerLabel,
  invalidDataNote = "Some values were missing or negative, so they are shown as 0.",
  size = 160,
}: DonutChartProps) {
  const { data: clean, issues } = cleanDonutData(data);
  const total = clean.reduce((sum, datum) => sum + datum.value, 0);
  const radius = 40;
  const thickness = 14;
  const circumference = 2 * Math.PI * radius;

  const arcs = clean.reduce<{ slices: (DonutDatum & { fraction: number; dash: number; offset: number; color: string })[]; cursor: number }>(
    (acc, datum, index) => {
      const fraction = total > 0 ? datum.value / total : 0;
      const dash = fraction * circumference;
      const offset = -acc.cursor * circumference;
      const color = sliceColor(index);
      return { cursor: acc.cursor + fraction, slices: [...acc.slices, { ...datum, fraction, dash, offset, color }] };
    },
    { slices: [], cursor: 0 },
  ).slices;

  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center gap-6">
        <div aria-hidden="true" className="relative shrink-0" style={{ width: size, height: size }}>
          <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--sk-border)" strokeWidth={thickness} />
            {arcs.map((arc, index) =>
              arc.fraction > 0 ? (
                <circle
                  key={index}
                  data-slice={arc.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${String(arc.dash)} ${String(circumference - arc.dash)}`}
                  strokeDashoffset={arc.offset}
                />
              ) : null,
            )}
          </svg>
          {centerValue !== undefined || centerLabel !== undefined ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {centerValue !== undefined ? <span className="text-xl font-extrabold text-text">{centerValue}</span> : null}
              {centerLabel !== undefined ? <span className="text-xs text-muted">{centerLabel}</span> : null}
            </div>
          ) : null}
        </div>
        <ul aria-hidden="true" className="flex min-w-0 flex-1 flex-col gap-2">
          {arcs.map((arc, index) => (
            <li key={index} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <svg viewBox="0 0 10 10" className="size-2.5 shrink-0">
                  <rect width="10" height="10" rx="2" fill={arc.color} />
                </svg>
                <span className="truncate font-semibold text-text">{arc.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted">{percent.format(arc.fraction)}</span>
            </li>
          ))}
        </ul>
      </div>
      {issues.length > 0 ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
          <AlertTriangle aria-hidden="true" className="mt-px size-3.5 shrink-0 text-warning" />
          {invalidDataNote}
        </p>
      ) : null}
      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {clean.map((datum, index) => (
            <tr key={index}>
              <th scope="row">{datum.label}</th>
              <td>{number.format(datum.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
