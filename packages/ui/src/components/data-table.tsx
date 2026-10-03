import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Fragment, useId, useState, type ReactNode } from "react";

import { cx } from "../cx.js";
import { EmptyState, Skeleton, type EmptyStateProps } from "./feedback.js";
import { DEFAULT_PAGINATION_LABELS, Pagination, type PaginationLabels } from "./pagination.js";

export type SortDirection = "ascending" | "descending";

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** What a column sorts by. Use numbers or ISO strings for dates. Blank values sort last. */
export type SortValue = string | number | null | undefined;

export interface DataTableColumn<Row> {
  /** Unique within the table. */
  id: string;
  header: string;
  /** The cell's content for a row. */
  cell: (row: Row) => ReactNode;
  /** The value to sort by. Columns without one cannot be sorted. */
  sortValue?: (row: Row) => SortValue;
  /** `end` right-aligns the column, for amounts and counts. */
  align?: "start" | "end";
  /** Leaves the column out of the card layout on small screens. */
  hideOnMobile?: boolean;
  /**
   * Hides the header text visually (screen readers still hear it). In the card layout the cell
   * sits at the top right without a label: use it for a row's actions menu.
   */
  hideHeader?: boolean;
}

export interface DataTableLabels extends PaginationLabels {
  loading: string;
  sortBy: string;
  ascending: string;
  descending: string;
  emptyTitle: string;
  /** Text such as "Showing 11–20 of 42". */
  range: (first: number, last: number, total: number) => string;
}

const number = new Intl.NumberFormat();

const DEFAULT_LABELS: DataTableLabels = {
  ...DEFAULT_PAGINATION_LABELS,
  loading: "Loading",
  sortBy: "Sort by",
  ascending: "ascending",
  descending: "descending",
  emptyTitle: "Nothing to show yet",
  range: (first, last, total) => `Showing ${number.format(first)}–${number.format(last)} of ${number.format(total)}`,
};

export interface DataTableProps<Row> {
  /** Names the table for screen readers, and is shown above it with `showCaption`. */
  caption: string;
  showCaption?: boolean;
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  /** A stable, unique key for each row, such as its id. */
  rowKey: (row: Row) => string;
  /** Shows placeholder rows instead of `rows`. */
  loading?: boolean;
  loadingRows?: number;
  /** Shown when there are no rows. */
  empty?: EmptyStateProps;
  defaultSort?: SortState | null;
  /** The sort, when the product keeps it (for example in the URL). */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Rows per page. Use `Infinity` to show every row. */
  pageSize?: number;
  /** The page (from 1), when the product keeps it. */
  page?: number;
  onPageChange?: (page: number) => void;
  labels?: Partial<DataTableLabels>;
  className?: string;
}

function isPresent(value: SortValue): value is string | number {
  return value !== null && value !== undefined && value !== "" && !Number.isNaN(value);
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function compareValues(a: string | number, b: string | number): number {
  return typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b));
}

/** Sorts rows by a column, keeping blank values last in both directions. */
export function sortRows<Row>(rows: readonly Row[], column: DataTableColumn<Row>, direction: SortDirection): Row[] {
  const { sortValue } = column;
  if (sortValue === undefined) {
    return [...rows];
  }
  return rows.toSorted((x, y) => {
    const a = sortValue(x);
    const b = sortValue(y);
    if (!isPresent(a) || !isPresent(b)) {
      return Number(!isPresent(a)) - Number(!isPresent(b));
    }
    const order = compareValues(a, b);
    return direction === "ascending" ? order : -order;
  });
}

/**
 * A table with typed columns, client-side sorting and pagination, loading placeholders and an
 * empty state. Below 640px wide each row becomes a card that lists its columns.
 */
export function DataTable<Row>({
  caption,
  showCaption = false,
  columns,
  rows,
  rowKey,
  loading = false,
  loadingRows = 5,
  empty,
  defaultSort = null,
  sort: sortProp,
  onSortChange,
  pageSize = 10,
  page: pageProp,
  onPageChange,
  labels,
  className,
}: DataTableProps<Row>) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const sortSelectId = useId();
  const [ownSort, setOwnSort] = useState<SortState | null>(defaultSort);
  const [ownPage, setOwnPage] = useState(1);
  const sort = sortProp === undefined ? ownSort : sortProp;

  const sortColumn = sort === null ? undefined : columns.find((column) => column.id === sort.columnId);
  const sorted = sort !== null && sortColumn !== undefined ? sortRows(rows, sortColumn, sort.direction) : rows;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, pageProp ?? ownPage), pageCount);
  const first = (page - 1) * pageSize;
  const pageRows = sorted.slice(first, first + pageSize);

  const changePage = (next: number) => {
    setOwnPage(next);
    onPageChange?.(next);
  };
  const changeSort = (next: SortState) => {
    setOwnSort(next);
    onSortChange?.(next);
    changePage(1);
  };
  const toggleSort = (column: DataTableColumn<Row>) => {
    const ascending = sort?.columnId !== column.id || sort.direction === "descending";
    changeSort({ columnId: column.id, direction: ascending ? "ascending" : "descending" });
  };

  const sortable = columns.filter((column) => column.sortValue !== undefined);
  const [primary, ...others] = columns;
  const cardActions = others.filter((column) => column.hideHeader === true && column.hideOnMobile !== true);
  const cardDetails = others.filter((column) => column.hideHeader !== true && column.hideOnMobile !== true);

  if (!loading && rows.length === 0) {
    return <EmptyState title={text.emptyTitle} {...empty} className={cx(empty?.className, className)} />;
  }

  const sortOptions = sortable.flatMap((column) =>
    (["ascending", "descending"] as const).map((direction) => ({
      key: `${column.id}:${direction}`,
      label: `${column.header}, ${direction === "ascending" ? text.ascending : text.descending}`,
      sort: { columnId: column.id, direction },
    })),
  );

  const header = (
    <thead>
      <tr className="border-b border-border">
        {columns.map((column) => {
          const sortedHere = sort?.columnId === column.id ? sort.direction : undefined;
          const SortIcon = sortedHere === "ascending" ? ArrowUp : sortedHere === "descending" ? ArrowDown : ChevronsUpDown;
          return (
            <th
              key={column.id}
              scope="col"
              aria-sort={sortedHere}
              className={cx(
                "px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted first:pl-0 last:pr-0",
                column.align === "end" ? "text-right" : "text-left",
              )}
            >
              {column.sortValue !== undefined ? (
                <button
                  type="button"
                  onClick={() => {
                    toggleSort(column);
                  }}
                  className={cx(
                    "inline-flex items-center gap-1 rounded-md uppercase transition-colors hover:text-text",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    sortedHere !== undefined && "text-text",
                  )}
                >
                  {column.header}
                  <SortIcon aria-hidden="true" className="size-3.5" />
                </button>
              ) : (
                <span className={cx(column.hideHeader === true && "sr-only")}>{column.header}</span>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );

  return (
    <div aria-busy={loading} className={cx("min-w-0", className)}>
      {loading ? (
        <p role="status" className="sr-only">
          {text.loading}
        </p>
      ) : null}

      {sortOptions.length > 0 && !loading ? (
        <div className="mb-3 flex items-center gap-2 sm:hidden">
          <label htmlFor={sortSelectId} className="text-sm font-semibold text-text">
            {text.sortBy}
          </label>
          <select
            id={sortSelectId}
            value={sort === null ? "" : `${sort.columnId}:${sort.direction}`}
            onChange={(event) => {
              const chosen = sortOptions.find((option) => option.key === event.currentTarget.value);
              if (chosen !== undefined) {
                changeSort(chosen.sort);
              }
            }}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-strong bg-surface px-3 text-base text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&>option]:bg-surface"
          >
            {sort === null ? <option value="">—</option> : null}
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <caption className={showCaption ? "mb-3 text-left text-lg font-bold text-text" : "sr-only"}>{caption}</caption>
          {header}
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: loadingRows }, (_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.id} className="px-3 py-3.5 first:pl-0 last:pr-0">
                        <Skeleton className={column.align === "end" ? "ml-auto w-16" : "w-3/4"} />
                      </td>
                    ))}
                  </tr>
                ))
              : pageRows.map((row) => (
                  <tr key={rowKey(row)} className="transition-colors hover:bg-surface-muted">
                    {columns.map((column, index) => {
                      const Cell = index === 0 ? "th" : "td";
                      return (
                        <Cell
                          key={column.id}
                          scope={index === 0 ? "row" : undefined}
                          className={cx(
                            "px-3 py-3 align-middle font-normal text-text first:pl-0 last:pr-0",
                            column.align === "end" ? "text-right tabular-nums" : "text-left",
                          )}
                        >
                          {column.cell(row)}
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={caption} className="divide-y divide-border sm:hidden">
        {loading
          ? Array.from({ length: Math.min(loadingRows, 3) }, (_, index) => (
              <li key={index} aria-hidden="true" className="flex flex-col gap-2 py-4">
                <Skeleton className="w-1/2" />
                <Skeleton className="w-3/4" />
                <Skeleton className="w-2/3" />
              </li>
            ))
          : pageRows.map((row) => (
              <li key={rowKey(row)} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm font-semibold text-text">{primary?.cell(row)}</div>
                  {cardActions.map((column) => (
                    <div key={column.id} className="shrink-0">
                      {column.cell(row)}
                    </div>
                  ))}
                </div>
                {cardDetails.length > 0 ? (
                  <dl className="mt-2 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
                    {cardDetails.map((column) => (
                      <Fragment key={column.id}>
                        <dt className="text-muted">{column.header}</dt>
                        <dd className={cx("min-w-0 text-text", column.align === "end" && "tabular-nums")}>{column.cell(row)}</dd>
                      </Fragment>
                    ))}
                  </dl>
                ) : null}
              </li>
            ))}
      </ul>

      {!loading && rows.length > pageSize ? (
        <Pagination
          className="mt-4 border-t border-border pt-4"
          label={caption}
          page={page}
          pageCount={pageCount}
          onPageChange={changePage}
          summary={text.range(first + 1, first + pageRows.length, rows.length)}
          labels={text}
        />
      ) : null}
    </div>
  );
}
