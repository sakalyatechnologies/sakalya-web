# TypeScript and React guidelines

The shared principles in `principles.md`, applied to TypeScript.

## Types

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- Closed sets are string-literal unions: `type Tone = "neutral" | "success" | "warning" | "danger" | "info"`.
- Distinct identifiers are branded types: `type PatientId = string & { readonly __brand: "PatientId" }`, created by one parsing function.
- Validate at the boundary (API responses, URL params, user input) with a schema, then pass typed values.
- Failures that callers must handle return a result union: `{ ok: true; value } | { ok: false; error }`. Throw only for programming bugs.

## Banned

| Instead of | Use |
|---|---|
| `any` | `unknown`, then narrow |
| `value!` | a check, or a type that can't be undefined |
| `x as Foo` | a type guard or a parser |
| `// @ts-ignore` | fix the type |
| `console.log` | nothing in libraries; the product's logger in apps |
| default exports | named exports |

## React

- Function components with typed props interfaces. No class components.
- Props are data, not behaviour bags: prefer `items` and `onSelect` over passing render functions unless composition needs it.
- Components never fetch; products fetch and pass data.
- Styling with Tailwind classes that resolve to theme tokens (`bg-primary`, `text-muted`). No hard-coded colours.
- Every interactive element is a real `<button>` or `<a>` with a visible focus ring and an accessible name.
- Respect `prefers-reduced-motion` for animation.

## Tests

- Vitest for logic; Testing Library for components, querying by role and label as a user would.
- Test what a user sees or a caller gets, not implementation details.
