import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "../cx.js";
import { Avatar } from "./primitives.js";

export interface NavEntry {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

export interface AppShellProps {
  /** Logo and name at the top of the sidebar. */
  brand: ReactNode;
  nav: readonly NavEntry[];
  activeId: string;
  /** Promotional or help card at the bottom of the sidebar. */
  sidebarFooter?: ReactNode;
  /** Items at the right of the top bar: selectors, icon buttons, the user chip. */
  topBarEnd?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  children: ReactNode;
}

/** The standard layout: themed sidebar, top bar with search, and the page content. */
export function AppShell({
  brand,
  nav,
  activeId,
  sidebarFooter,
  topBarEnd,
  searchPlaceholder = "Search",
  onSearch,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-sidebar px-4 py-6 lg:flex">
        <div className="px-2">{brand}</div>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {nav.map((entry) => {
              const active = entry.id === activeId;
              return (
                <li key={entry.id}>
                  <a
                    href={entry.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-primary",
                      active
                        ? "bg-sidebar-active text-sidebar-active-text"
                        : "text-sidebar-text hover:bg-surface-muted",
                    )}
                  >
                    <span aria-hidden="true" className="[&>svg]:size-5">
                      {entry.icon}
                    </span>
                    {entry.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        {sidebarFooter ? <div className="mt-auto">{sidebarFooter}</div> : null}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-card">
            <Search aria-hidden="true" className="size-5 text-muted" />
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              type="search"
              placeholder={searchPlaceholder}
              onChange={(event) => onSearch?.(event.target.value)}
              className="w-full min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-muted"
            />
          </label>
          <div className="flex items-center gap-3">{topBarEnd}</div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export interface UserChipProps {
  name: string;
  role: string;
  imageUrl?: string;
}

/** The signed-in user's avatar, name and role, for the top bar. */
export function UserChip({ name, role, imageUrl }: UserChipProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} {...(imageUrl === undefined ? {} : { imageUrl })} />
      <div className="hidden leading-tight sm:block">
        <p className="text-sm font-bold text-text">{name}</p>
        <p className="text-xs text-muted">{role}</p>
      </div>
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  end?: ReactNode;
}

/** A page title with an optional subtitle and actions on the right. */
export function PageHeader({ title, subtitle, end }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">{title}</h1>
        {subtitle !== undefined ? <p className="mt-1 text-[15px] text-muted">{subtitle}</p> : null}
      </div>
      {end ? <div className="flex items-center gap-3">{end}</div> : null}
    </div>
  );
}
