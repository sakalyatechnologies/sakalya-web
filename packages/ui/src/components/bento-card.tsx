import { useId, type CSSProperties, type ReactNode } from "react";

import { cx } from "../cx.js";

export type BentoTone = "default" | "inverse" | "hero";

export interface BentoCardProps {
  title?: ReactNode;
  /** A line under the title, such as a date range or what the numbers cover. */
  subtitle?: ReactNode;
  /** A button or link at the right of the header. */
  action?: ReactNode;
  /**
   * "default" is a raised surface; "inverse" uses the dark sidebar colours; "hero" is a
   * primary-colour gradient for the one tile that leads a page. Text on inverse and hero
   * tiles uses the matching `on-*` colours, so content inside should not hard-code its own.
   */
  tone?: BentoTone;
  /** The heading level of `title`, so the tile fits the page's outline. Defaults to 2. */
  headingLevel?: 2 | 3 | 4;
  /** Fades and rises in; pass a delay in milliseconds to stagger a grid of tiles. */
  enterDelay?: number;
  className?: string;
  children?: ReactNode;
}

const TONES: Readonly<Record<BentoTone, string>> = {
  default: "border border-border bg-surface text-text shadow-card",
  inverse: "bg-sidebar text-sidebar-text",
  hero: "bg-linear-to-br from-primary to-primary-hover text-on-primary shadow-card",
};

const SUBTITLE: Readonly<Record<BentoTone, string>> = {
  default: "text-muted",
  inverse: "text-sidebar-text",
  hero: "text-on-primary",
};

/**
 * A rounded tile for a dashboard grid, with an optional header. When it has a title the tile
 * is a labelled region, so screen-reader users can jump between tiles.
 */
export function BentoCard({
  title,
  subtitle,
  action,
  tone = "default",
  headingLevel = 2,
  enterDelay,
  className,
  children,
}: BentoCardProps) {
  const headingId = useId();
  const hasTitle = title !== undefined && title !== null && title !== false && title !== "";
  const Heading = headingLevel === 2 ? "h2" : headingLevel === 3 ? "h3" : "h4";
  const style: CSSProperties | undefined = enterDelay === undefined ? undefined : { animationDelay: `${String(enterDelay)}ms` };
  return (
    <section
      aria-labelledby={hasTitle ? headingId : undefined}
      style={style}
      className={cx("sk-rise rounded-card p-5", TONES[tone], className)}
    >
      {hasTitle || action !== undefined ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {hasTitle ? (
              <Heading id={headingId} className="text-[15px] font-semibold tracking-tight">
                {title}
              </Heading>
            ) : null}
            {subtitle !== undefined ? <p className={cx("mt-0.5 text-xs", SUBTITLE[tone])}>{subtitle}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}
