import { Menu as MenuIcon, Search } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";

import { cx } from "../cx.js";
import { Drawer } from "./drawer.js";
import { Link, LinkProvider, type RenderLink } from "./link.js";
import { Avatar } from "./primitives.js";

export interface NavEntry {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

export interface AppShellLabels {
  /** The skip link, the first thing a keyboard user reaches. */
  skipToContent: string;
  /** The menu button's name and the navigation drawer's title on small screens. */
  menu: string;
  /** The navigation landmark's name. */
  navigation: string;
}

const DEFAULT_LABELS: AppShellLabels = { skipToContent: "Skip to content", menu: "Menu", navigation: "Main" };

export interface AppShellProps {
  /** Logo and name at the top of the sidebar. */
  brand: ReactNode;
  nav: readonly NavEntry[];
  activeId: string;
  /** Promotional or help card at the bottom of the sidebar. */
  sidebarFooter?: ReactNode;
  /** Items at the right of the top bar: selectors, icon buttons, the user chip. */
  topBarEnd?: ReactNode;
  /** Shows a search field in the top bar, reporting each change. */
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  /**
   * Renders navigation, and every library link inside the shell, with the app's router link,
   * so moving between pages does not reload the app.
   */
  renderLink?: RenderLink;
  labels?: Partial<AppShellLabels>;
  children: ReactNode;
}

interface NavListProps {
  nav: readonly NavEntry[];
  activeId: string;
  label: string;
  onNavigate?: () => void;
}

function NavList({ nav, activeId, label, onNavigate }: NavListProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-1">
        {nav.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              <Link
                href={entry.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cx(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active ? "bg-sidebar-active text-sidebar-active-text" : "text-sidebar-text hover:bg-surface-muted",
                )}
              >
                <span aria-hidden="true" className="[&>svg]:size-5">
                  {entry.icon}
                </span>
                {entry.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * The standard layout: a skip link, a themed sidebar (a drawer behind a menu button below
 * 1024px), a top bar with optional search, and the page content.
 */
export function AppShell({
  brand,
  nav,
  activeId,
  sidebarFooter,
  topBarEnd,
  onSearch,
  searchPlaceholder = "Search",
  renderLink,
  labels,
  children,
}: AppShellProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const mainId = useId();
  const mainRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const shell = (
    <div className="flex min-h-full bg-background">
      <a
        href={`#${mainId}`}
        onClick={(event) => {
          // Focus without changing the URL, which a hash router would treat as navigation.
          event.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-primary-text shadow-card focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      >
        {text.skipToContent}
      </a>
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-sidebar px-4 py-6 lg:flex">
        <div className="px-2">{brand}</div>
        <NavList nav={nav} activeId={activeId} label={text.navigation} />
        {sidebarFooter !== undefined ? <div className="mt-auto">{sidebarFooter}</div> : null}
      </aside>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title={text.menu} hideTitle side="left" size="sm">
        <div className="flex flex-col gap-6">
          <div className="px-2">{brand}</div>
          <NavList
            nav={nav}
            activeId={activeId}
            label={text.navigation}
            onNavigate={() => {
              setMenuOpen(false);
            }}
          />
          {sidebarFooter !== undefined ? <div>{sidebarFooter}</div> : null}
        </div>
      </Drawer>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            aria-label={text.menu}
            onClick={() => {
              setMenuOpen(true);
            }}
            className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-surface text-text transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          >
            <MenuIcon aria-hidden="true" className="size-5" />
          </button>
          {onSearch !== undefined ? (
            <label
              className={cx(
                "flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border-strong bg-surface px-4 py-2.5 shadow-card",
                "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary",
              )}
            >
              <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
              <span className="sr-only">{searchPlaceholder}</span>
              <input
                type="search"
                placeholder={searchPlaceholder}
                onChange={(event) => {
                  onSearch(event.target.value);
                }}
                className="w-full min-w-0 bg-transparent text-base text-text outline-none placeholder:text-muted sm:text-sm"
              />
            </label>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex items-center gap-3">{topBarEnd}</div>
        </header>
        <main id={mainId} ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 px-4 pb-8 outline-none sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );

  return renderLink === undefined ? shell : <LinkProvider renderLink={renderLink}>{shell}</LinkProvider>;
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
  /**
   * "display" sets the title in the theme's display face (an editorial serif in the Studio
   * theme) at a lighter weight, and larger from tablet width. Default is the bold sans title.
   */
  variant?: "default" | "display";
}

/** A page title with an optional subtitle and actions on the right. */
export function PageHeader({ title, subtitle, end, variant = "default" }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1
          className={
            variant === "display"
              ? "font-display text-3xl font-medium tracking-tight text-text md:text-4xl"
              : "text-3xl font-extrabold tracking-tight text-text"
          }
        >
          {title}
        </h1>
        {subtitle !== undefined ? <p className="mt-1 text-[15px] text-muted">{subtitle}</p> : null}
      </div>
      {end ? <div className="flex flex-wrap items-center gap-3">{end}</div> : null}
    </div>
  );
}
