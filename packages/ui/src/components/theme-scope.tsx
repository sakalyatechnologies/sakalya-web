import { useMemo, type CSSProperties, type ReactNode } from "react";

import { toCssVariables, type Theme } from "@sakalya/tokens";

import { cx } from "../cx.js";

export interface ThemeScopeProps {
  theme: Theme;
  children: ReactNode;
  className?: string;
}

/**
 * Applies a theme to everything inside it by setting `--sk-*` variables on a wrapper.
 * Several scopes can sit on one page, so a portal can preview another tenant's theme.
 */
export function ThemeScope({ theme, children, className }: ThemeScopeProps) {
  const style = useMemo<CSSProperties>(() => ({ ...toCssVariables(theme) }), [theme]);
  return (
    <div
      data-theme-mode={theme.mode}
      style={{ ...style, colorScheme: theme.mode }}
      className={cx("bg-background font-sans text-text antialiased", className)}
    >
      {children}
    </div>
  );
}
