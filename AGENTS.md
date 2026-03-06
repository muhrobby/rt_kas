# AGENTS.md

Guidance for agentic coding assistants (Claude, Cursor, Copilot, etc.) working in this repository.

---

## Project Overview

Next.js 16 admin dashboard (App Router) using React 19, TypeScript, Tailwind CSS v4, and Zustand. No test suite — this is a UI-focused project. The `src/components/ui/` directory is **generated/managed code** and is excluded from linting; do not manually edit files there.

Path alias: `@/*` maps to `./src/*`.

---

## Commands

### Dev server
```bash
npm run dev
```

### Production build
```bash
npm run build
```

### Lint (Biome)
```bash
npm run lint
# or directly:
npx biome lint .
```

### Format (Biome)
```bash
npm run format
# or directly:
npx biome format --write .
```

### Lint + format check together
```bash
npm run check           # report only
npm run check:fix       # auto-fix
```

### Generate theme presets (run before committing theme changes)
```bash
npm run generate:presets
```

> There is no test runner configured in this project. Do not add test files unless explicitly asked.

### Pre-commit hook
Husky runs automatically on commit:
1. `npm run generate:presets` — regenerates `src/lib/preferences/theme.ts`
2. `git add src/lib/preferences/theme.ts`
3. `lint-staged` — runs `biome check --write` on staged `.js/.ts/.jsx/.tsx` files

---

## Code Style

### TypeScript
- **Strict mode** is enabled (`strict: true`, `isolatedModules: true`).
- Target: `ES2017`, module resolution: `bundler`.
- Avoid `any` — use specific types or `unknown`. The one exception is legacy `getRowId` fallback patterns.
- Use `as const` assertions for literal arrays/objects (enforced: `useAsConstAssertion`).
- Never use `var`; always `const` or `let` (enforced: `noInferrableTypes`, `noParameterAssign`).
- No CommonJS (`noCommonJs` is an error) — use ESM only.
- No TypeScript namespaces (`noNamespace` is an error).
- Avoid `else` after an early `return` (`noUselessElse` is enforced).

### Formatting (Biome 2.3.8)
- **Indent:** 2 spaces (no tabs), LF line endings.
- **Line width:** 120 characters.
- **Quotes:** Double quotes for JS/JSX strings and JSX attributes.
- **Semicolons:** Always required.
- **Trailing commas:** Always (including function params).
- **Arrow function parens:** Always (`(x) => x`, not `x => x`).
- **Self-closing elements:** Always use self-closing for void JSX elements (enforced).
- **Tailwind classes:** Biome sorts Tailwind classes automatically via `useSortedClasses` — do not manually reorder them.

### Imports
Biome enforces this import group order (with blank lines between groups):
```
1. react
2. react/**
   (blank line)
3. next/**
   (blank line)
4. third-party packages
   (blank line)
5. @/* alias imports
   (blank line)
6. relative ./  imports
```
Use `import type` for type-only imports.

### Naming Conventions
- **Files/directories:** `kebab-case` (e.g., `data-table.tsx`, `use-mobile.ts`).
- **React components:** `PascalCase` named exports (e.g., `export function DataTable`).
- **Hooks:** `camelCase` prefixed with `use` (e.g., `useDataTableInstance`).
- **Constants:** `UPPER_SNAKE_CASE` for module-level config (e.g., `PREFERENCE_DEFAULTS`).
- **Types/interfaces:** `PascalCase`. Prefer `type` for unions/aliases, `interface` for extendable shapes.
- **Route groups:** Next.js App Router conventions — `(group)/` for layout grouping, `[param]/` for dynamic routes, `_components/` for co-located private components.

### React & Next.js
- **React Compiler is enabled** (`reactCompiler: true` in `next.config.mjs`). Add `"use no memo"` at the top of files where you need to opt out of automatic memoization.
- Use Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs).
- Server Actions must be in files with `"use server"` at the top.
- `console.*` calls are stripped in production builds — they are acceptable for development debugging.
- Avoid the `<img>` element — use Next.js `<Image>` instead (`noImgElement` warns).
- Avoid the `<head>` element directly — use Next.js metadata API (`noHeadElement` warns).
- Array index keys in React lists are discouraged (`noArrayIndexKey` warns).

### Styling
- Tailwind CSS v4 via PostCSS. Global styles in `src/app/globals.css`.
- Use the `cn()` helper from `@/lib/utils` for conditional class merging (`clsx` + `tailwind-merge`).
- Theme presets live in `src/styles/presets/` as CSS files. Modify those, then run `npm run generate:presets`.
- CSS `!important` is allowed (the `noImportantStyles` rule is off).
- Unknown at-rules are allowed (for Tailwind directives — `noUnknownAtRules` is off).

### State Management
- Global UI preferences use **Zustand** (`createStore` from `zustand/vanilla`) with a React context provider for SSR compatibility. See `src/stores/preferences/`.
- Layout-critical preferences (sidebar shape) must be persisted via cookies (not `localStorage`) so SSR reads them correctly.

### Error Handling
- Validate inputs early and return a result rather than throwing where possible.
- Prefer explicit `undefined` checks over falsy checks when `noUncheckedIndexedAccess` matters.

---

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (external)/           # Public-facing pages (no auth)
│   ├── (main)/               # Authenticated layout
│   │   ├── auth/
│   │   ├── dashboard/
│   │   │   ├── _components/  # Co-located private components
│   │   │   └── [...route]/
│   │   └── unauthorized/
│   ├── layout.tsx            # Root layout
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui primitives — DO NOT edit manually
│   └── data-table/           # Reusable data table components
├── config/                   # App-wide constants
├── hooks/                    # Custom React hooks
├── lib/                      # Pure utilities and shared logic
│   ├── fonts/
│   ├── preferences/          # Preference types, defaults, persistence config
│   └── utils.ts              # cn(), formatCurrency(), etc.
├── navigation/               # Sidebar nav item definitions
├── scripts/                  # Build-time scripts (theme generation)
├── server/                   # Server Actions
├── stores/                   # Zustand stores + React providers
└── styles/presets/           # CSS theme preset files
```
