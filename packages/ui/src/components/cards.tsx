import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { TONE_CLASSES, cx, type Tone } from "../cx.js";
import { Link } from "./link.js";
import { IconBubble } from "./primitives.js";

export interface CardProps {
  title?: string;
  /** A link or button shown at the right of the header, such as "View all". */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A themed surface with an optional header. */
export function Card({ title, action, className, children }: CardProps) {
  return (
    <section className={cx("rounded-card border border-border bg-surface p-5 shadow-card", className)}>
      {title !== undefined || action !== undefined ? (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title !== undefined ? <h2 className="text-lg font-bold tracking-tight text-text">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export interface CardLinkProps {
  href: string;
  children: ReactNode;
}

/** The "View all →" link used in card headers. Uses the app's router link inside a `LinkProvider`. */
export function CardLink({ href, children }: CardLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
      <ChevronRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

export interface Trend {
  /** Text such as "18% vs yesterday". */
  label: string;
  direction: "up" | "down";
  /** Whether this direction is good news, which decides the colour. */
  good: boolean;
}

export interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: Tone;
  trend?: Trend;
  /** Extra content under the value, such as a breakdown or a short list. */
  footer?: ReactNode;
  href?: string;
}

/** A headline number with an icon, an optional trend and footer. */
export function StatCard({ label, value, icon, tone = "primary", trend, footer, href }: StatCardProps) {
  const body = (
    <div className="flex items-start gap-4">
      <IconBubble tone={tone} size="lg">
        {icon}
      </IconBubble>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-text tabular-nums">{value}</p>
        {trend ? <TrendLine trend={trend} /> : null}
        {footer ? <div className="mt-3">{footer}</div> : null}
      </div>
      {href ? <ChevronRight aria-hidden="true" className="mt-1 size-5 text-muted" /> : null}
    </div>
  );
  const shell = "block rounded-card border border-border bg-surface p-5 shadow-card";
  return href ? (
    <Link href={href} className={cx(shell, "transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary")}>
      {body}
    </Link>
  ) : (
    <section className={shell}>{body}</section>
  );
}

function TrendLine({ trend }: { trend: Trend }) {
  const tone: Tone = trend.good ? "success" : "danger";
  const Icon = trend.direction === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={cx("mt-2 inline-flex items-center gap-1 text-sm font-semibold", TONE_CLASSES[tone].text)}>
      <Icon aria-hidden="true" className="size-4" />
      {trend.label}
    </p>
  );
}
