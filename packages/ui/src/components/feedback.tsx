import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "../cx.js";
import { Button, IconBubble } from "./primitives.js";

export type SkeletonShape = "line" | "circle" | "block";

export interface SkeletonProps {
  shape?: SkeletonShape;
  /** Size overrides, such as `w-1/2` or `h-8`. */
  className?: string;
}

const SHAPES: Readonly<Record<SkeletonShape, string>> = {
  line: "h-4 w-full rounded-md",
  circle: "size-10 rounded-full",
  block: "h-24 w-full rounded-card",
};

/**
 * A placeholder shape shown while content loads. Hidden from screen readers: announce loading
 * once with `aria-busy` or a status message on the region instead.
 */
export function Skeleton({ shape = "line", className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("block animate-pulse bg-border motion-reduce:animate-none", SHAPES[shape], className)}
    />
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string | undefined;
  /** Defaults to an inbox; pass `null` for none. */
  icon?: ReactNode;
  /** A next step, such as a button to add the first item. */
  action?: ReactNode;
  className?: string;
}

/** What to show when a list or table has nothing in it, ideally with a way to add something. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  const shownIcon = icon === undefined ? <Inbox className="size-7" /> : icon;
  return (
    <div className={cx("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
      {shownIcon !== null ? (
        <IconBubble tone="neutral" size="lg">
          {shownIcon}
        </IconBubble>
      ) : null}
      <p className="mt-1 text-base font-bold text-text">{title}</p>
      {description !== undefined && description !== "" ? (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action !== undefined ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string | undefined;
  /** The failed request's id, shown so support can find it in the logs. */
  requestId?: string | undefined;
  /** Shows a retry button. */
  onRetry?: () => void;
  retryLabel?: string;
  requestIdLabel?: string;
  className?: string;
}

/** What to show when loading failed: what happened, a way to retry, and the request id. */
export function ErrorState({
  title = "Something went wrong",
  description,
  requestId,
  onRetry,
  retryLabel = "Try again",
  requestIdLabel = "Request ID",
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cx("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
      <IconBubble tone="danger" size="lg">
        <AlertTriangle className="size-7" />
      </IconBubble>
      <p className="mt-1 text-base font-bold text-text">{title}</p>
      {description !== undefined && description !== "" ? (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {requestId !== undefined && requestId !== "" ? (
        <p className="text-xs text-muted">
          {requestIdLabel}: <code className="font-mono text-text select-all">{requestId}</code>
        </p>
      ) : null}
      {onRetry !== undefined ? (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
