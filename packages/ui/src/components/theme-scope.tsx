import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";

import { toCssVariables, type Theme, type ThemeMode } from "@sakalya/tokens";

import { cx } from "../cx.js";

interface ScopeValue {
  mode: ThemeMode;
  style: CSSProperties;
}

const ThemeScopeContext = createContext<ScopeValue | null>(null);

/** Text defaults every themed subtree starts from. */
const BASE_TEXT = "font-sans text-text antialiased";

export interface ThemeScopeProps {
  theme: Theme;
  children: ReactNode;
  className?: string;
}

/**
 * Applies a theme to everything inside it by setting `--sk-*` variables on a wrapper.
 * Several scopes can sit on one page, so a portal can preview another tenant's theme.
 * Dialogs, drawers, menus and toasts opened inside a scope carry its theme into their portal.
 */
export function ThemeScope({ theme, children, className }: ThemeScopeProps) {
  const value = useMemo<ScopeValue>(
    () => ({ mode: theme.mode, style: { ...toCssVariables(theme), colorScheme: theme.mode } }),
    [theme],
  );
  return (
    <ThemeScopeContext value={value}>
      <div data-theme-mode={theme.mode} style={value.style} className={cx("bg-background", BASE_TEXT, className)}>
        {children}
      </div>
    </ThemeScopeContext>
  );
}

/** Props that give an element rendered outside a scope's DOM, such as a portal, its theme. */
export interface PortalThemeProps {
  className: string;
  style: CSSProperties | undefined;
  "data-theme-mode": ThemeMode | undefined;
}

/**
 * The nearest `ThemeScope`'s variables, for spreading onto a portal element. Outside any scope
 * the portal inherits whatever theme the page sets on `:root`.
 */
export function usePortalTheme(): PortalThemeProps {
  const scope = useContext(ThemeScopeContext);
  return { className: BASE_TEXT, style: scope?.style, "data-theme-mode": scope?.mode };
}
