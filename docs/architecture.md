# Architecture

## Packages

| Package | Holds | Depends on |
|---|---|---|
| `@sakalya/tokens` | Colour maths, the white-label theme engine (`createTheme`), contrast checks, theme presets, CSS variable output | nothing |
| `@sakalya/ui` | React components styled with Tailwind classes that read theme variables, plus `ThemeScope` to apply a theme to part of a page | `@sakalya/tokens`, React |
| `apps/gallery` | A live catalogue of every component and theme, and sample screens such as a clinic dashboard | both packages |

## Theming and white-labeling

1. A tenant (a clinic) picks a preset or a brand colour.
2. `createTheme({ brand, mode })` derives the full palette: primary, its hover and soft tints, text on primary, surfaces, borders, chart colours, and status colours. Only validated hex colours are accepted, because the values end up in CSS.
3. `checkContrast(theme)` returns errors (unreadable, block saving) and warnings (below WCAG AA, advise).
4. `toCssVariables(theme)` produces `--sk-*` custom properties. `ThemeScope` writes them on a wrapper element, so a portal, a preview card and a website can each show a different tenant's theme on one page.
5. Tailwind maps utility classes to those variables (`bg-primary` is `var(--sk-primary)`), so components never know which tenant they render for.

Presets give doctors a starting point: each sets a brand colour, corner radius and surface style. A clinic's website templates use the same tokens, so its portal, prescriptions, patient app and website share one look.

## Library choices

| Need | Choice | Why |
|---|---|---|
| Styling | Tailwind CSS 4 | CSS-first configuration that maps cleanly onto theme variables; tiny output |
| Accessible primitives (menus, dialogs, popovers) | Base UI, the way shadcn/ui uses it | Unstyled, accessible, so the look stays ours; MyDwarpal already uses this stack |
| Icons | lucide-react | Consistent, tree-shakeable |
| Charts | Recharts, wrapped in themed components | Mature; colours come from tokens |
| Motion | CSS transitions first; Motion for orchestrated moments | Small; respects reduced motion |

AWS Cloudscape was considered. It is robust for dense consoles but looks like the AWS console and is hard to brand per tenant, which conflicts with white-labeling.

## Build model

Packages export their TypeScript source (`"exports": "./src/index.ts"`). Apps compile them with Vite, so there is no separate library build to keep in sync. Each package type-checks itself with `tsc --noEmit`.
