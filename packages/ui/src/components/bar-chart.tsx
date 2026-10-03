import { AlertTriangle } from "lucide-react";

export interface BarDatum {
  label: string;
  /** The larger, background series, such as scheduled. */
  total: number;
  /** The overlaid series, such as completed. Must not exceed `total`. */
  part: number;
}

export type BarDataProblem = "invalid-total" | "invalid-part" | "part-exceeds-total";

export interface BarDataIssue {
  /** Position of the datum in the input. */
  index: number;
  label: string;
  problem: BarDataProblem;
}

export interface CleanBarData {
  /** Values safe to draw: finite, never negative, `part` never above `total`. */
  data: BarDatum[];
  issues: BarDataIssue[];
}

/**
 * Makes chart data safe to draw. Missing, infinite or negative values become 0 and a `part`
 * above its `total` is capped, each reported as an issue so a product can log or fix it.
 */
export function cleanBarData(input: readonly BarDatum[]): CleanBarData {
  const issues: BarDataIssue[] = [];
  const valid = (value: number) => Number.isFinite(value) && value >= 0;
  const data = input.map((datum, index) => {
    const total = valid(datum.total) ? datum.total : 0;
    const part = valid(datum.part) ? datum.part : 0;
    if (total !== datum.total) {
      issues.push({ index, label: datum.label, problem: "invalid-total" });
    }
    if (part !== datum.part) {
      issues.push({ index, label: datum.label, problem: "invalid-part" });
    }
    if (part > total) {
      issues.push({ index, label: datum.label, problem: "part-exceeds-total" });
    }
    return { label: datum.label, total, part: Math.min(part, total) };
  });
  return { data, issues };
}

export interface BarChartProps {
  data: readonly BarDatum[];
  totalLabel: string;
  partLabel: string;
  /** Accessible summary of what the chart shows; also the data table's caption. */
  summary: string;
  /** Header for the column of labels in the data table, such as "Hour". */
  categoryLabel?: string;
  /** Shown under the chart when some values had to be corrected. */
  invalidDataNote?: string;
  height?: number;
}

/**
 * One colour per series, shared by the legend and the marks. `part` is a subset of `total`,
 * so it reads like a meter: the accent fills a lighter track of the same hue.
 */
const SERIES = {
  total: "var(--sk-chart-4)",
  part: "var(--sk-chart-1)",
} as const;

type Series = keyof typeof SERIES;

const number = new Intl.NumberFormat();

/** A column with a rounded data end and a square foot on the baseline. */
function columnPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  const bottom = y + height;
  return [
    `M${String(x)},${String(bottom)}`,
    `V${String(y + r)}`,
    `Q${String(x)},${String(y)} ${String(x + r)},${String(y)}`,
    `H${String(x + width - r)}`,
    `Q${String(x + width)},${String(y)} ${String(x + width)},${String(y + r)}`,
    `V${String(bottom)}`,
    "Z",
  ].join(" ");
}

function LegendKey({ series, children }: { series: Series; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5">
        <rect data-series={series} width="10" height="10" rx="2" fill={SERIES[series]} />
      </svg>
      {children}
    </span>
  );
}

/**
 * A two-series column chart drawn with SVG and theme colours. Columns share one scale, the
 * y-axis ticks name values the chart actually reaches, and a visually hidden table gives
 * screen readers the same numbers.
 */
export function BarChart({
  data,
  totalLabel,
  partLabel,
  summary,
  categoryLabel = "Category",
  invalidDataNote = "Some values were missing or out of range, so they are shown as 0 or capped.",
  height = 180,
}: BarChartProps) {
  const { data: clean, issues } = cleanBarData(data);
  const max = Math.max(1, ...clean.map((d) => d.total));
  const step = max <= 8 ? 2 : Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const width = 560;
  const left = 28;
  const bottom = 22;
  const gap = 2;
  const plotHeight = height - bottom - 8;
  const slot = (width - left) / Math.max(1, clean.length);
  const barWidth = Math.min(24, slot * 0.6);
  const y = (value: number) => 8 + plotHeight - (value / top) * plotHeight;

  return (
    <figure className="m-0">
      <div aria-hidden="true" className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
        <LegendKey series="total">{totalLabel}</LegendKey>
        <LegendKey series="part">{partLabel}</LegendKey>
      </div>
      <svg aria-hidden="true" viewBox={`0 0 ${String(width)} ${String(height)}`} className="h-auto w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={width} y1={y(tick)} y2={y(tick)} stroke="var(--sk-border)" strokeWidth={1} />
            <text x={left - 8} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="var(--sk-text-muted)">
              {number.format(tick)}
            </text>
          </g>
        ))}
        {clean.map((d, i) => {
          const x = left + i * slot + (slot - barWidth) / 2;
          const partTop = y(d.part);
          const remainderTop = y(d.total);
          // The remainder sits above the part with a 2px surface gap, not overlapping it.
          const remainderHeight = d.part > 0 ? partTop - gap - remainderTop : y(0) - remainderTop;
          return (
            // Labels may repeat, so the position is the key.
            <g key={i}>
              <title>{`${d.label}: ${number.format(d.total)} ${totalLabel}, ${number.format(d.part)} ${partLabel}`}</title>
              {d.total > d.part && remainderHeight > 0 ? (
                <path
                  data-series="total"
                  d={columnPath(x, remainderTop, barWidth, remainderHeight, 4)}
                  fill={SERIES.total}
                />
              ) : null}
              {d.part > 0 ? (
                <path
                  data-series="part"
                  d={columnPath(x, partTop, barWidth, y(0) - partTop, d.part === d.total ? 4 : 0)}
                  fill={SERIES.part}
                />
              ) : null}
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize={11} fill="var(--sk-text-muted)">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
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
            <th scope="col">{totalLabel}</th>
            <th scope="col">{partLabel}</th>
          </tr>
        </thead>
        <tbody>
          {clean.map((d, i) => (
            <tr key={i}>
              <th scope="row">{d.label}</th>
              <td>{number.format(d.total)}</td>
              <td>{number.format(d.part)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
