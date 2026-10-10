import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { TONE_CLASSES, cx } from "../cx.js";
import { IconBubble } from "./primitives.js";

const COUNT_MS = 900;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Ease-out cubic: fast at first, settling on the value. */
function eased(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

export interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** BCP 47 tag for digit grouping, such as "en-IN" for lakhs. Defaults to the viewer's locale. */
  locale?: string;
}

/**
 * A number that counts up to `value` when it first shows or changes. Screen readers get the
 * final figure at once, never the animation's in-between values, and viewers who prefer
 * reduced motion see the figure without any animation.
 */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0, locale }: CountUpProps) {
  const [reduced] = useState(prefersReducedMotion);
  const [counted, setCounted] = useState(0);
  const shown = reduced ? value : counted;
  useEffect(() => {
    if (reduced) {
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      setCounted(value * eased(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [value, reduced]);

  const format = (n: number) =>
    `${prefix}${n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  return (
    <>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

export interface KpiItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Change as a percentage; positive is up. Shown as a coloured chip with an arrow. */
  trend?: number;
  icon: ReactNode;
  /** A short note under the figure, such as "vs last week". */
  hint?: string;
}

export interface KpiRibbonLabels {
  /** Names the list for screen readers. */
  summary: string;
  up: string;
  down: string;
}

const DEFAULT_LABELS: KpiRibbonLabels = { summary: "Key figures", up: "up", down: "down" };

export interface KpiRibbonProps {
  items: readonly KpiItem[];
  locale?: string;
  labels?: Partial<KpiRibbonLabels>;
  className?: string;
}

/**
 * A row of headline figures that count up on load. Each is a list item: label, figure, an
 * optional trend chip (arrow and percentage, with the direction spelled out for screen
 * readers) and a hint.
 */
export function KpiRibbon({ items, locale, labels, className }: KpiRibbonProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  return (
    <ul aria-label={text.summary} className={cx("grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5", className)}>
      {items.map((item, index) => (
        <li
          key={item.id}
          style={{ animationDelay: `${String(index * 50)}ms` }}
          className="sk-rise rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex items-center justify-between gap-2">
            <IconBubble size="sm">{item.icon}</IconBubble>
            {item.trend !== undefined ? <TrendChip trend={item.trend} up={text.up} down={text.down} /> : null}
          </div>
          <p className="mt-3 text-xs text-muted">{item.label}</p>
          <p className="mt-0.5 font-mono text-2xl font-semibold tracking-tight text-text tabular-nums">
            <CountUp value={item.value} prefix={item.prefix ?? ""} suffix={item.suffix ?? ""} decimals={item.decimals ?? 0} {...(locale === undefined ? {} : { locale })} />
          </p>
          {item.hint !== undefined ? <p className="mt-1 text-[11px] text-muted">{item.hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function TrendChip({ trend, up, down }: { trend: number; up: string; down: string }) {
  const good = trend >= 0;
  const Icon = good ? TrendingUp : TrendingDown;
  const classes = TONE_CLASSES[good ? "success" : "danger"];
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", classes.soft, classes.text)}>
      <Icon aria-hidden="true" className="size-3" />
      <span className="sr-only">{good ? up : down} </span>
      {Math.abs(trend)}%
    </span>
  );
}
