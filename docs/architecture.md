# Architecture

## Packages

| Package | Holds | Depends on |
|---|---|---|
| `@sakalya/tokens` | Colour maths, the white-label theme engine (`createTheme`), contrast checks, theme presets, CSS variable output | nothing |
| `@sakalya/ui` | React components styled with Tailwind classes that read theme variables, plus `ThemeScope` to apply a theme to part of a page | `@sakalya/tokens`, React, Base UI, lucide-react |
| `apps/gallery` | A live catalogue of every component and theme, a sample form, table and dashboard, and a side-by-side view of two presets in light and dark | both packages |

## Components

| Group | Components | Notes |
|---|---|---|
| Layout | `AppShell`, `PageHeader`, `UserChip`, `Card`, `CardLink`, `FormActions` | `AppShell` has a skip link and a navigation drawer below 1024px |
| Form kit | `Field`, `TextInput`, `TextArea`, `Select`, `DateInput`, `PhoneInput`, `Checkbox`, `RadioGroup`, `SearchInput` | `Field` links label, hint and error (`aria-describedby`, `aria-invalid`); errors are plain strings mapped from API field errors. Native controls, so phones get native pickers. Controls take native props and refs, so form libraries can register them |
| Overlays | `Dialog`, `Drawer`, `Menu`, `ToastProvider` + `useToast` | Base UI underneath: focus trap and return, Escape, keyboard navigation, live-region toasts |
| Data display | `DataTable`, `Pagination`, `Tabs`, `Badge`, `Pill`, `StatCard`, `Timeline`, `AttentionList`, `PersonList`, `BarChart` | `DataTable` sorts and pages on the client and becomes cards below 640px |
| States | `Skeleton`, `EmptyState`, `ErrorState` | `ErrorState` shows the request ID for support |
| Primitives | `Button`, `IconButton`, `Avatar`, `IconBubble`, `Link`, `LinkProvider` | |

Links: `AppShell`'s `renderLink` (or `LinkProvider`) renders every library link with the app's router link, so navigation never reloads the app.

## Theming and white-labeling

1. A tenant (a clinic) picks a preset or a brand colour.
2. `createTheme({ brand, mode })` derives the full palette: primary, its hover and soft tints, accent text, text on primary, surfaces, borders (including a 3:1 outline for form fields), a scrim, chart colours, and status colours with their tints, text and on-colour labels. Only validated hex colours are accepted, because the values end up in CSS.
3. `checkContrast(theme)` returns errors (unreadable, block saving) and warnings (below WCAG AA, advise). It covers every text pairing components use, including status pills and badges.
4. `toCssVariables(theme)` produces `--sk-*` custom properties. `ThemeScope` writes them on a wrapper element, so a portal, a preview card and a website can each show a different tenant's theme on one page. Dialogs, drawers, menus and toasts render in portals outside that wrapper, so they put the nearest scope's variables on their portal element (`usePortalTheme`, also exported for products' own portals).
5. A stored theme is untrusted: read it with `parseTheme(unknown)`, which returns `{ ok: true, value }` or `{ ok: false, error }`. `toCssVariables` and `toCssText` re-check their input and `toCssText` refuses unsafe selectors, throwing on either because a bad typed `Theme` is a programming error.
6. Tailwind maps utility classes to those variables (`bg-primary` is `var(--sk-primary)`), so components never know which tenant they render for.

Presets give doctors a starting point: each sets a brand colour, corner radius and surface style. A clinic's website templates use the same tokens, so its portal, prescriptions, patient app and website share one look.

## Library choices

| Need | Choice | Why |
|---|---|---|
| Styling | Tailwind CSS 4 | CSS-first configuration that maps cleanly onto theme variables; tiny output |
| Accessible primitives (menus, dialogs, drawers, tabs, toasts) | Base UI (`@base-ui/react`), the way shadcn/ui uses it | Unstyled, accessible, so the look stays ours; MyDwarpal already uses this stack. Form controls stay native (`select`, `input type="date"`) for phones and autofill |
| Icons | lucide-react | Consistent, tree-shakeable |
| Charts | Hand-drawn SVG for the simple charts we have (`BarChart`); Recharts, wrapped in themed components, when a chart needs more | Colours come from tokens; every chart has a hidden data table |
| Accessibility tests | axe-core over rendered components, in Vitest | Catches missing names, roles and relationships; contrast is tested in the theme engine |
| Motion | CSS transitions first; Motion for orchestrated moments | Small; respects reduced motion |

AWS Cloudscape was considered. It is robust for dense consoles but looks like the AWS console and is hard to brand per tenant, which conflicts with white-labeling.

## Build model

Packages export their TypeScript source (`"exports": "./src/index.ts"`). Apps compile them with Vite, so there is no separate library build to keep in sync. Each package type-checks itself with `tsc --noEmit`.
