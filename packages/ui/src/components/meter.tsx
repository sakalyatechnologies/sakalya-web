import { cx } from "../cx.js";

const number = new Intl.NumberFormat();

export interface MeterProps {
  /** Names the value for screen readers, such as "Composite A2 stock" or "Disk usage". */
  label: string;
  value: number;
  max: number;
  /** Shown in the low tone once `value` falls to this level or below. */
  lowAt?: number;
  /** Text next to the bar, such as "4 of 40 units". Defaults to a generated one from the numbers. */
  valueLabel?: string;
  className?: string;
}

/**
 * A bounded value bar, such as a stock level or a quota, that switches to a low-tone fill once
 * the value drops to or below `lowAt`. Values outside range are clamped rather than overflowing.
 */
export function Meter({ label, value, max, lowAt, valueLabel, className }: MeterProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeValue = Number.isFinite(value) && value >= 0 ? Math.min(value, safeMax) : 0;
  const fraction = safeMax > 0 ? safeValue / safeMax : 0;
  const low = lowAt !== undefined && safeValue <= lowAt;
  const text = valueLabel ?? `${number.format(safeValue)} of ${number.format(safeMax)}`;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-text">{label}</span>
        <span className="text-muted tabular-nums">{text}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(safeValue)}
        aria-valuemin={0}
        aria-valuemax={Math.round(safeMax)}
        aria-valuetext={text}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={cx("h-full rounded-full transition-[width]", low ? "bg-danger" : "bg-primary")}
          style={{ width: `${String(fraction * 100)}%` }}
        />
      </div>
    </div>
  );
}
