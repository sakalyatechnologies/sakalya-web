import { ChevronRight, MoreVertical } from "lucide-react";
import type { ReactNode } from "react";

import { cx, type Tone } from "../cx.js";
import { Avatar, IconBubble, Pill } from "./primitives.js";

export interface Status {
  label: string;
  tone: Tone;
  icon?: ReactNode;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  detail: string;
  detailSub: string;
  status: Status;
  /** Highlights the dot, for the current or overdue item. */
  current?: boolean;
}

export interface TimelineProps {
  items: readonly TimelineItem[];
  /** Called with an item's id when its menu button is pressed. */
  onMenu?: (id: string) => void;
}

/** A vertical schedule: time, person, detail and status, joined by a line. */
export function Timeline({ items, onMenu }: TimelineProps) {
  return (
    <ol className="relative">
      {items.map((item, index) => (
        <li key={item.id} className="relative grid grid-cols-[4.5rem_1fr] items-center gap-3 py-2.5">
          <div className="relative flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cx(
                "z-10 size-2.5 rounded-full",
                item.current ? "bg-warning ring-4 ring-warning-soft" : "bg-border",
              )}
            />
            <span className="text-sm font-semibold tabular-nums text-text">{item.time}</span>
            {index < items.length - 1 ? (
              <span aria-hidden="true" className="absolute left-[4px] top-5 h-[calc(100%+0.5rem)] w-px bg-border" />
            ) : null}
          </div>
          <div className="grid grid-cols-1 items-center gap-3 rounded-2xl px-2 py-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_9.5rem_2rem]">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={item.title} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text">{item.title}</p>
                <p className="truncate text-xs text-muted">{item.subtitle}</p>
              </div>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{item.detail}</p>
              <p className="truncate text-xs text-muted">{item.detailSub}</p>
            </div>
            <span className="justify-self-start">
              <Pill tone={item.status.tone} icon={item.status.icon}>
                {item.status.label}
              </Pill>
            </span>
            {onMenu ? (
              <button
                type="button"
                aria-label={`More actions for ${item.title}`}
                onClick={() => {
                  onMenu(item.id);
                }}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                <MoreVertical aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <span />
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  tone: Tone;
  icon: ReactNode;
  href: string;
}

/** A list of things that need action, each linking to where to act. */
export function AttentionList({ items }: { items: readonly AttentionItem[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id}>
          <a href={item.href} className="flex items-center gap-3 rounded-xl py-3 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary">
            <IconBubble tone={item.tone} size="sm">
              {item.icon}
            </IconBubble>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-text">{item.title}</span>
              <span className="block truncate text-xs text-muted">{item.subtitle}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 text-muted" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export interface PersonRowItem {
  id: string;
  name: string;
  subtitle: string;
  value?: string;
  valueSub?: string;
  status?: Status;
}

/** Rows of people with a trailing amount or status. */
export function PersonList({ items }: { items: readonly PersonRowItem[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <Avatar name={item.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text">{item.name}</p>
            <p className="truncate text-xs text-muted">{item.subtitle}</p>
          </div>
          <div className="text-right">
            {item.status ? (
              <Pill tone={item.status.tone} icon={item.status.icon}>
                {item.status.label}
              </Pill>
            ) : item.value !== undefined ? (
              <p className="text-sm font-bold tabular-nums text-success">{item.value}</p>
            ) : null}
            {item.valueSub !== undefined ? <p className="mt-0.5 text-xs text-muted">{item.valueSub}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
