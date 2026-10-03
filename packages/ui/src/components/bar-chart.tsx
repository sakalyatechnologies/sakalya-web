export interface BarDatum {
  label: string;
  /** The larger, background series, such as scheduled. */
  total: number;
  /** The overlaid series, such as completed. Must not exceed `total`. */
  part: number;
}

export interface BarChartProps {
  data: readonly BarDatum[];
  totalLabel: string;
  partLabel: string;
  /** Accessible summary of what the chart shows. */
  summary: string;
  height?: number;
}

/**
 * A two-series bar chart drawn with SVG and theme colours. Bars share one scale; the
 * y-axis ticks name values the chart actually reaches.
 */
export function BarChart({ data, totalLabel, partLabel, summary, height = 180 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const step = max <= 8 ? 2 : Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const width = 560;
  const left = 28;
  const bottom = 22;
  const plotHeight = height - bottom - 8;
  const slot = (width - left) / Math.max(1, data.length);
  const barWidth = Math.min(28, slot * 0.55);
  const y = (value: number) => 8 + plotHeight - (value / top) * plotHeight;

  return (
    <figure>
      <div className="mb-3 flex gap-4 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-chart-1" />
          {totalLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-chart-2" />
          {partLabel}
        </span>
      </div>
      <svg viewBox={`0 0 ${String(width)} ${String(height)}`} role="img" aria-label={summary} className="h-auto w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={left} x2={width} y1={y(tick)} y2={y(tick)} stroke="var(--sk-border)" strokeWidth={1} />
            <text x={left - 8} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="var(--sk-text-muted)">
              {tick}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = left + i * slot + (slot - barWidth) / 2;
          return (
            <g key={d.label}>
              <rect x={x} y={y(d.total)} width={barWidth} height={y(0) - y(d.total)} rx={4} fill="var(--sk-chart-4)" />
              <rect x={x} y={y(d.part)} width={barWidth} height={y(0) - y(d.part)} rx={4} fill="var(--sk-chart-1)" />
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize={11} fill="var(--sk-text-muted)">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
