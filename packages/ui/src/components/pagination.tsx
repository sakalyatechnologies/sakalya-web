import { ChevronLeft, ChevronRight } from "lucide-react";

import { cx } from "../cx.js";
import { Button } from "./primitives.js";

export interface PaginationLabels {
  previous: string;
  next: string;
  /** Text such as "Page 2 of 5", announced when the page changes. */
  page: (page: number, pageCount: number) => string;
}

export interface PaginationProps {
  /** The current page, starting at 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Text such as "Showing 11–20 of 42". */
  summary?: string | undefined;
  /** The navigation landmark's name, such as "Invoice pages". */
  label?: string;
  labels?: Partial<PaginationLabels>;
  className?: string;
}

const number = new Intl.NumberFormat();

export const DEFAULT_PAGINATION_LABELS: PaginationLabels = {
  previous: "Previous",
  next: "Next",
  page: (page, pageCount) => `Page ${number.format(page)} of ${number.format(pageCount)}`,
};

/**
 * Previous and next buttons with the current page. At the first or last page the button stays
 * focusable but inert (`aria-disabled`), so keyboard focus is not lost.
 */
export function Pagination({ page, pageCount, onPageChange, summary, label = "Pagination", labels, className }: PaginationProps) {
  const text = { ...DEFAULT_PAGINATION_LABELS, ...labels };
  const atStart = page <= 1;
  const atEnd = page >= pageCount;
  const inert = "aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-surface";
  return (
    <nav aria-label={label} className={cx("flex flex-wrap items-center justify-between gap-3 text-sm", className)}>
      <p className="text-muted">{summary}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          aria-disabled={atStart}
          className={cx("px-3 py-2", inert)}
          icon={<ChevronLeft aria-hidden="true" className="size-4" />}
          onClick={() => {
            if (!atStart) {
              onPageChange(page - 1);
            }
          }}
        >
          {text.previous}
        </Button>
        <p aria-live="polite" className="min-w-24 text-center font-semibold tabular-nums text-text">
          {text.page(page, pageCount)}
        </p>
        <Button
          variant="secondary"
          aria-disabled={atEnd}
          className={cx("px-3 py-2", inert)}
          onClick={() => {
            if (!atEnd) {
              onPageChange(page + 1);
            }
          }}
        >
          {text.next}
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
