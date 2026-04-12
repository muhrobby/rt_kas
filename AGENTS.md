# AGENTS.md

High-signal repo guidance for coding agents.

## Mandatory agent workflow
- Before implementation, always use **Context7** for library/framework references relevant to the task.
- Also use other relevant MCP tools when available (e.g. shadcn MCP from `opencode.json`).
- Always load and apply relevant **skills** before acting.

## Stack and boundaries
- Next.js 16 App Router + React 19 + TypeScript strict + Tailwind v4 + Biome + Drizzle ORM.
- Path alias: `@/*` -> `./src/*` (`tsconfig.json`).
- `src/components/ui/` is managed/generated shadcn primitives and excluded by Biome; do not manually edit unless user explicitly asks.

## Real entrypoints and structure
- App routes live under `src/app/(auth)` and `src/app/(dashboard)`.
- Server-side business logic is in `src/server/actions/*` (`"use server"` files).
- DB schema source of truth: `src/db/schema/index.ts` and `src/db/schema/*`.
- Migrations are tracked in `drizzle/` + `drizzle/meta/*`.

## Commands (verified from `package.json`)
- Dev: `npm run dev`
- Build/typecheck: `npm run build`
- Lint only: `npm run lint`
- Check (lint+format validation): `npm run check`
- Auto-fix checks: `npm run check:fix`
- Format whole repo: `npm run format`
- Drizzle: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`, `npm run db:studio`
- Theme preset generator: `npm run generate:presets`

## Verification order for normal changes
- Preferred focused flow: `npm run check` -> `npm run build`.
- Run `npm run format` only when needed; it rewrites many files repo-wide.

## Git hooks and generated artifacts
- Pre-commit (`.husky/pre-commit`) always runs:
  1) `npm run generate:presets`
  2) `git add src/lib/preferences/theme.ts`
  3) `npx lint-staged` (`biome check --write` on staged JS/TS files)
- If you touch theme preset CSS, expect `src/lib/preferences/theme.ts` to change automatically.

## Drizzle/env gotchas
- `drizzle.config.ts` currently loads env from `.env.local` (`config({ path: ".env.local" })`).
- If DB commands fail due to missing `DATABASE_URL`, create `.env.local` (see `.env.example`) or export env manually before running Drizzle commands.

## Code style constraints that commonly break CI
- Biome enforces import grouping (react -> next -> packages -> `@/*` -> relative).
- Tailwind classes are auto-sorted by Biome (`useSortedClasses`).
- Use ESM imports only; no CommonJS.
- Use `import type` for type-only imports.

## Testing policy
- There is no test runner configured in this repo. Do not add test files unless explicitly requested.
