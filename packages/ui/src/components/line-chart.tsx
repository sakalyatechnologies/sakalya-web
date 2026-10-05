import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface LineSeries {
  id: string;
  /** Names the series in the legend, the tooltip and the data table. */
  label: string;
  /** One value per x point; `null` leaves a gap. */
  values: readonly (number | null)[];
  /** Any CSS colour, normally a theme variable such as `var(--sk-danger)`. Defaults to a palette. */
  color?: string;
  /** SVG dash pattern, such as `"6 4"`, so series differ by more than colour. */
  dash?: string;
}

export interface LineReference {
  value: number;
  /** Drawn on the line and listed in the legend, such as "Budget 300 ms". */
  label: string;
  color?: string;
}

export interface LineChartProps {
  /** X positions in epoch milliseconds, oldest first; one per value of every series. */
  times: readonly number[];
  series: readonly LineSeries[];
  /** Accessible summary; also the caption of the data table. */
  summary: string;
  /** Axis titles with their units, such as "Requests per minute". */
  xLabel: string;
  yLabel: string;
  formatX: (time: number) => string;
  formatY?: (value: number) => string;
  /** Formats a value in the tooltip and the data table; defaults to `formatY`. */
  formatValue?: (value: number) => string;
  reference?: LineReference;
  height?: number;
  loading?: boolean;
  /** Shown instead of the plot when there are no points. */
  emptyMessage?: string;
}

const PALETTE = ["var(--sk-chart-1)", "var(--sk-info)", "var(--sk-warning)", "var(--sk-danger)"] as const;
const DASHES = [undefined, "7 4", "2 3", "10 3 2 3"] as const;
const WIDTH = 640;
const PAD = { left: 52, right: 14, top: 10, bottom: 34 } as const;
const TABLE_ROWS = 24;

const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

/** A rounded-up axis maximum and a tick step that gives about four intervals. */
export function niceScale(max: number): { top: number; step: number } {
  if (!Number.isFinite(max) || max <= 0) {
    return { top: 1, step: 0.25 };
  }
  const rough = max / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const unit = rough / power;
  const step = (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10) * power;
  return { top: Math.ceil(max / step) * step, step };
}

/** Evenly spaced indexes, always including the first and last, for axis labels. */
export function tickIndexes(count: number, wanted: number): number[] {
  if (count <= 0) {
    return [];
  }
  if (count <= wanted) {
    return Array.from({ length: count }, (_, i) => i);
  }
  const last = count - 1;
  return Array.from({ length: wanted }, (_, i) => Math.round((i * last) / (wanted - 1)));
}

function Swatch({ color, dash, reference = false }: { color: string; dash: string | undefined; reference?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 10" className="h-2.5 w-6">
      <line x1="1" x2="23" y1="5" y2="5" stroke={color} strokeWidth={reference ? 1.5 : 2.5} strokeDasharray={dash} strokeLinecap="round" />
      {reference ? null : <circle cx="12" cy="5" r="2.6" fill={color} />}
    </svg>
  );
}

/**
 * A multi-series line chart drawn with SVG and theme colours. Series differ by colour and dash
 * pattern, axes carry titles with units, a crosshair tooltip follows the pointer (and the arrow
 * keys when the chart has focus), and a visually hidden table repeats the numbers.
 */
export function LineChart({
  times,
  series,
  summary,
  xLabel,
  yLabel,
  formatX,
  formatY = (value) => plain.format(value),
  formatValue,
  reference,
  height = 220,
  loading = false,
  emptyMessage = "No data for this period yet.",
}: LineChartProps) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const showValue = formatValue ?? formatY;

  if (loading) {
    return (
      <div role="status" aria-label={`Loading ${yLabel}`} className="animate-pulse rounded-xl bg-surface-muted" style={{ height }} />
    );
  }
  if (times.length === 0) {
    return (
      <p role="status" className="flex items-center justify-center rounded-xl bg-surface-muted px-4 text-sm text-muted" style={{ height }}>
        {emptyMessage}
      </p>
    );
  }

  const resolved = series.map((s, index) => ({
    ...s,
    color: s.color ?? PALETTE[index % PALETTE.length] ?? PALETTE[0],
    dash: s.dash ?? DASHES[index % DASHES.length],
  }));
  const dataMax = Math.max(0, ...resolved.flatMap((s) => s.values.map((v) => (v !== null && Number.isFinite(v) ? v : 0))));
  const { top, step } = niceScale(Math.max(dataMax, reference?.value ?? 0));
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const last = times.length - 1;
  const x = (index: number) => PAD.left + (last === 0 ? plotW / 2 : (index / last) * plotW);
  const y = (value: number) => PAD.top + plotH - (Math.min(value, top) / top) * plotH;

  const paths = resolved.map((s) => {
    let d = "";
    let pen = false;
    s.values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`;
      pen = true;
    });
    return d;
  });

  const move = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) {
      return;
    }
    const at = ((event.clientX - box.left) / box.width) * WIDTH;
    const index = Math.round(((at - PAD.left) / plotW) * last);
    setActive(Math.min(last, Math.max(0, index)));
  };
  const key = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : last);
      return;
    }
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) {
      return;
    }
    event.preventDefault();
    setActive((current) => Math.min(last, Math.max(0, (current ?? (delta > 0 ? -1 : last + 1)) + delta)));
  };

  const stride = Math.max(1, Math.ceil(times.length / TABLE_ROWS));
  const tableRows = times.map((_, index) => index).filter((index) => index % stride === 0 || index === last);
  const activeX = active === null ? 0 : x(active);

  return (
    <figure className="m-0">
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 p-0 text-xs font-semibold text-muted" aria-label="Legend">
        {resolved.map((s) => (
          <li key={s.id} className="inline-flex list-none items-center gap-1.5">
            <Swatch color={s.color} dash={s.dash} />
            {s.label}
          </li>
        ))}
        {reference === undefined ? null : (
          <li className="inline-flex list-none items-center gap-1.5">
            <Swatch color={reference.color ?? "var(--sk-text-muted)"} dash="4 3" reference />
            {reference.label}
          </li>
        )}
      </ul>
      <div
        className="relative rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        tabIndex={0}
        role="group"
        aria-label={`${summary} Use the left and right arrow keys to read each point.`}
        aria-describedby={`${id}-tip`}
        onKeyDown={key}
        onBlur={() => {
          setActive(null);
        }}
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${String(WIDTH)} ${String(height)}`}
          className="h-auto w-full touch-pan-y"
          onPointerMove={move}
          onPointerDown={move}
          onPointerLeave={() => {
            setActive(null);
          }}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--sk-border)" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="var(--sk-text-muted)">
                {formatY(tick)}
              </text>
            </g>
          ))}
          {tickIndexes(times.length, 6).map((index) => (
            <text
              key={index}
              x={x(index)}
              y={height - 16}
              textAnchor={index === 0 ? "start" : index === last ? "end" : "middle"}
              fontSize={11}
              fill="var(--sk-text-muted)"
            >
              {formatX(times[index] ?? 0)}
            </text>
          ))}
          <text x={PAD.left + plotW / 2} y={height - 2} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--sk-text-muted)">
            {xLabel}
          </text>
          <text
            transform={`translate(11 ${String(PAD.top + plotH / 2)}) rotate(-90)`}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="var(--sk-text-muted)"
          >
            {yLabel}
          </text>
          {reference === undefined ? null : (
            <g data-reference="">
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y(reference.value)}
                y2={y(reference.value)}
                stroke={reference.color ?? "var(--sk-text-muted)"}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text x={WIDTH - PAD.right - 2} y={y(reference.value) - 4} textAnchor="end" fontSize={10.5} fontWeight={600} fill="var(--sk-text-muted)">
                {reference.label}
              </text>
            </g>
          )}
          {resolved.map((s, i) => (
            <g key={s.id} data-series={s.id}>
              <path d={paths[i]} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round" />
              {times.length <= 2 || times.length > 90
                ? s.values.map((value, index) =>
                    value !== null && (times.length <= 2 || index === last) ? (
                      <circle key={index} cx={x(index)} cy={y(value)} r={3} fill={s.color} />
                    ) : null,
                  )
                : null}
            </g>
          ))}
          {active === null ? null : (
            <g>
              <line x1={activeX} x2={activeX} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--sk-text-muted)" strokeWidth={1} />
              {resolved.map((s) => {
                const value = s.values[active];
                return value === null || value === undefined ? null : (
                  <circle key={s.id} cx={activeX} cy={y(value)} r={4} fill="var(--sk-surface)" stroke={s.color} strokeWidth={2} />
                );
              })}
            </g>
          )}
        </svg>
        <div
          id={`${id}-tip`}
          role="status"
          className={
            active === null
              ? "sr-only"
              : "pointer-events-none absolute top-2 z-10 min-w-36 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-card"
          }
          style={active === null ? undefined : { left: `${String(Math.min(78, Math.max(2, (activeX / WIDTH) * 100 + 2)))}%` }}
        >
          {active === null ? null : (
            <>
              <p className="mb-1 font-bold text-text">{formatX(times[active] ?? 0)}</p>
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {resolved.map((s) => {
                  const value = s.values[active];
                  return (
                    <li key={s.id} className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <Swatch color={s.color} dash={s.dash} />
                        {s.label}
                      </span>
                      <span className="font-bold text-text">{value === null || value === undefined ? "–" : showValue(value)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">{xLabel}</th>
            {resolved.map((s) => (
              <th key={s.id} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((index) => (
            <tr key={index}>
              <th scope="row">{formatX(times[index] ?? 0)}</th>
              {resolved.map((s) => {
                const value = s.values[index];
                return <td key={s.id}>{value === null || value === undefined ? "" : showValue(value)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
