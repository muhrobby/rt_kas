# Phase 5 Report — Polish & Deployment

**Status:** Complete  
**Date:** 2026-03-06

---

## Summary

Phase 5 adds loading/error states for all route segments, deployment configuration for VPS (Docker) and Vercel, and performs final project cleanup including dead code removal, dependency pruning, and a successful production build.

---

## Step 5.1 — Loading & Error States

### Files Created

| File | Description |
|------|-------------|
| `src/app/(dashboard)/loading.tsx` | Dashboard-level skeleton (page title + 4 stat cards + content area) |
| `src/app/(dashboard)/admin/loading.tsx` | Admin page skeleton (header + action button + 4 stat cards + toolbar + table) |
| `src/app/(dashboard)/admin/error.tsx` | Admin error boundary — Indonesian text, error digest display, retry button |
| `src/app/(dashboard)/warga/loading.tsx` | Warga mobile-first skeleton (single-column `max-w-lg` layout) |
| `src/app/(dashboard)/warga/error.tsx` | Warga error boundary — Indonesian text, error digest display, retry button |

### Design Decisions

- Loading skeletons match the layout structure of their respective pages (admin = wide grid, warga = narrow single-column)
- Error boundaries are `"use client"` components with `useEffect` logging and `reset()` retry capability
- All user-facing text is in Indonesian
- Error digest codes are displayed when available for debugging

---

## Step 5.2 — Deployment Configuration

### Files Created

| File | Description |
|------|-------------|
| `Dockerfile` | Multi-stage build: deps → builder → runner (node:22-alpine, non-root user) |
| `docker-compose.yml` | App + PostgreSQL 17 with healthcheck, persistent volume |
| `.dockerignore` | Excludes node_modules, .next, .env, docs, drizzle migrations |

### Dockerfile Details

- **3-stage build:** `deps` (production-only), `builder` (full install + build), `runner` (standalone output)
- **Build args:** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` passed at build time
- **Security:** Non-root `nextjs` user (UID 1001)
- **Standalone output:** Copies `.next/standalone`, `.next/static`, and `public/`

### docker-compose.yml Details

- PostgreSQL 17 Alpine with healthcheck (`pg_isready`)
- Persistent volume for database data
- `depends_on` with `service_healthy` condition
- Environment variables via `.env` file interpolation

### Pre-existing File (No Changes Needed)

- `.env.example` already existed from Phase 1 with all required variables

---

## Step 5.3 — Final Cleanup

### Dead Code Removed

| Item | Description |
|------|-------------|
| `src/app/(main)/` | Entire template route group (16 files) — auth, dashboard, sidebar, unauthorized |
| `src/data/users.ts` | Mock user data used only by old `(main)` layout |

### Dependencies Removed

| Package | Reason |
|---------|--------|
| `axios` | Zero imports in codebase |
| `@tanstack/react-query` | Zero imports in codebase |

### Dependencies Added (Build Fix)

| Package | Reason |
|---------|--------|
| `@better-auth/core@1.5.3` | Peer dependency of `@better-auth/drizzle-adapter` — required for `better-auth/cookies` subpath imports |
| `better-call@1.3.2` | Nested inside `better-auth/node_modules/` but `@better-auth/core` (now top-level) couldn't resolve it |

### Config Changes

| File | Change |
|------|--------|
| `next.config.mjs` | Added `output: "standalone"` for Docker deployment |

### Build Error Fixed

The error `Can't resolve 'better-call/error'` in the middleware import chain was caused by:

```
middleware.ts
  → better-auth/cookies
    → @better-auth/core/error
      → better-call/error  ← NOT FOUND
```

**Root cause:** `@better-auth/core` was installed as a separate top-level package (peer dep of `@better-auth/drizzle-adapter`), but `better-call` was only nested inside `better-auth/node_modules/better-call`. Since `@better-auth/core` lived at the top level, it couldn't traverse into `better-auth`'s nested `node_modules` to find `better-call`.

**Fix:** Installed `better-call@1.3.2` and `@better-auth/core@1.5.3` as top-level dependencies so module resolution works correctly.

### Verification

- `npx tsc --noEmit` — **0 errors**
- `npm run check:fix` — **0 errors** (11 pre-existing warnings in template/infra files)
- `npm run build` — **Exit 0**, all 19 routes compiled successfully

---

## Build Output

```
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/dashboard
├ ƒ /admin/kas-keluar
├ ƒ /admin/kas-masuk
├ ƒ /admin/kategori-kas
├ ƒ /admin/laporan
├ ƒ /admin/log-aktivitas
├ ƒ /admin/warga
├ ƒ /api/auth/[...all]
├ ƒ /api/laporan/excel
├ ƒ /api/laporan/pdf
├ ○ /login
├ ○ /unauthorized
├ ƒ /warga
├ ƒ /warga/dashboard
└ ƒ /warga/riwayat

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## Remaining Biome Warnings (Pre-existing, Not Phase 5)

| File | Warning | Reason |
|------|---------|--------|
| `drizzle.config.ts` | `noNonNullAssertion` | `process.env.DATABASE_URL!` — standard Drizzle pattern |
| `src/db/index.ts` | `noNonNullAssertion` | `process.env.DATABASE_URL!` — same pattern |
| `src/lib/cookie.client.ts` (x2) | `noDocumentCookie` | Direct cookie manipulation required |
| `src/components/data-table/drag-column.tsx` | `noExplicitAny` | Template shared component |
| `src/hooks/use-data-table-instance.ts` | `noExplicitAny` | Legacy `getRowId` fallback |
| Phase 3 skeleton files (x5) | `noArrayIndexKey` | Static skeleton arrays — safe, items never reorder |

---

## Phase 5 File Summary

| Category | New | Modified | Deleted |
|----------|-----|----------|---------|
| Loading/Error states | 5 | 0 | 0 |
| Deployment config | 3 | 1 | 0 |
| Cleanup | 0 | 1 | 17 |
| **Total** | **8** | **2** | **17** |

---

## Project Status: All Phases Complete

| Phase | Status |
|-------|--------|
| 1. Infrastructure | Complete |
| 2. Auth & Routes | Complete |
| 3. Admin Features | Complete |
| 4. Warga Features | Complete |
| 5. Polish & Deploy | Complete |
