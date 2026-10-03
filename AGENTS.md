# AGENTS.md: sakalya-web

Shared, product-agnostic web building blocks for Sakalya Technologies: design tokens, the white-label theme engine, and React components. Arogyam's clinic portal, console and clinic websites are the first consumers.

Nothing here may mention a product concept (patient, clinic, society). Components take generic data: `title`, `value`, `status`, `items`.

## Read before writing code

1. `docs/guidelines/principles.md`: the rules for every Sakalya codebase.
2. `docs/guidelines/typescript.md`: how those rules look in TypeScript and React.
3. `docs/architecture.md`: packages, theming, and how products consume them.

## Commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Gallery (live preview of every component and theme) | `pnpm dev` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Tests | `pnpm test` |
| Everything CI runs | `pnpm check` |

## Hard rules

1. **TypeScript `strict`, no escape hatches.** No `any`, no non-null `!`, no `as` casts except `as const`, no `@ts-ignore`. ESLint enforces it.
2. **Typed values, not strings.** Statuses and variants are string-literal unions; colours entering the theme engine are validated `HexColor` values.
3. **Every colour comes from a theme token.** Components use `var(--sk-…)` through Tailwind classes such as `bg-primary`. No hard-coded hex in components, so white-labeling and dark mode always work.
4. **Accessible by default.** Real buttons and links, visible focus, labels on icon buttons, contrast checked by the theme engine.
5. **No `console.log`.** Libraries don't log.
6. **Components are presentational.** No data fetching inside `@sakalya/ui`; products pass data in.
7. **Small packages, explicit exports.** Each package exports from `src/index.ts`. No default exports.
8. **Tests prove behaviour:** theme maths and contrast rules in `@sakalya/tokens`; rendering and interaction in `@sakalya/ui` with Testing Library.
9. **Ask before adding a dependency,** and justify it in the commit message.

## Hooks

Run `scripts/install-hooks.sh` once per clone. The pre-commit hook runs `pnpm check`.

## Done means

- [ ] `pnpm check` passes (typecheck, lint, tests, build).
- [ ] New components appear in the gallery with every variant, in light and dark, under at least two themes.
- [ ] Small Conventional Commits.
