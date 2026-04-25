# AGENTS.md

High-signal guidance for OpenCode in this repo.

## Mandatory workflow (WAJIB)
- Work design-first: before coding, write a short implementation plan, then execute in small modular steps.
- Before implementation, fetch latest official framework/library docs via MCP (use Context7 first; use shadcn MCP when relevant).
- Load/apply relevant skills before acting (especially planning, security, docs, shadcn).
- If prose docs conflict with scripts/config/code, trust executable sources.

## Security rules (WAJIB for server/API/auth/data changes)
- Validate all external input at boundaries (query/body/params/form) using Zod.
- Use Drizzle/ORM-safe APIs or parameterized queries only; never string-concatenate SQL.
- Add CSRF protection for any new state-changing cookie-authenticated route handlers.
- Keep secure session/cookie posture; do not weaken Better Auth defaults (`httpOnly`, `secure`, `sameSite`, state checks).
- Do not expose secrets/sensitive internals in logs, errors, or responses.

## Stack and boundaries (verified)
- Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Biome 2.3.8, Drizzle ORM, Better Auth.
- Path alias: `@/*` -> `./src/*`.
- `src/components/ui/` is shadcn-generated and excluded by Biome; avoid manual edits unless explicitly requested.

## Real entrypoints
- Routes: `src/app/(auth)` and `src/app/(dashboard)`.
- Route protection: `src/proxy.ts` (Next 16 proxy entrypoint), matcher `/admin/:path*` + `/warga/:path*`.
- Server business logic/mutations: `src/server/actions/*` (`"use server"`).
- Auth handler: `src/app/api/auth/[...all]/route.ts`.
- DB schema source of truth: `src/db/schema/index.ts` + `src/db/schema/*`; migrations in `drizzle/`.

## Commands
- Dev: `npm run dev`
- Quality: `npm run check`, `npm run check:fix`, `npm run lint`, `npm run format`
- Build: `npm run build`
- DB: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`, `npm run db:studio`, `npm run db:seed`

## Verification order
- Preferred: `npm run check` -> `npm run build`.
- No test runner is configured; do not add tests unless explicitly requested.
- `npm run format` is repo-wide and rewrite-heavy; run only when needed.

## Hooks and generated artifacts
- Pre-commit (`.husky/pre-commit`) always runs:
  1) `npm run generate:presets`
  2) `git add src/lib/preferences/theme.ts`
  3) `npx lint-staged`
- If you edit `src/styles/presets/*.css`, expect generated changes in `src/lib/preferences/theme.ts`.

## Env and runtime gotchas
- Drizzle CLI (`drizzle.config.ts`) loads env from `.env`.
- Seed script (`npm run db:seed`) loads `.env.local`.
- Keep `.env` and `.env.local` consistent for `DATABASE_URL` to avoid confusing DB behavior.
- Server Actions origin allowlist is in `next.config.mjs` (`experimental.serverActions.allowedOrigins`).

## Repo-specific conventions that matter
- Use existing auth guards (`requireAuth`, `requireAdmin`, `requireWarga`) instead of custom checks.
- For new route handlers, follow existing pattern: boundary validation + explicit 4xx on invalid input.
- `.npmrc` sets `legacy-peer-deps=true`; do not remove casually or installs may fail.
