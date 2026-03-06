# 08 - Implementation Roadmap

## Overview

This document defines the step-by-step execution order for building the Kas RT application. Each phase is self-contained and results in a working state that can be verified.

---

## Phase 1: Infrastructure Setup

**Goal:** Working database connection, auth system, and project configuration.

### Step 1.1: Install Dependencies

```bash
npm install better-auth drizzle-orm postgres @react-pdf/renderer exceljs
npm install -D drizzle-kit
npm uninstall axios @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities embla-carousel-react simple-icons
```

**Files modified:**
- `package.json`

**Verification:** `npm install` completes without errors.

---

### Step 1.2: Database Schema

**Files to create:**
| File | Description |
|------|-------------|
| `.env.local` | Environment variables |
| `drizzle.config.ts` | Drizzle Kit configuration |
| `src/db/index.ts` | Drizzle client instance |
| `src/db/schema/index.ts` | Barrel export |
| `src/db/schema/warga.ts` | Warga table + types |
| `src/db/schema/kategori-kas.ts` | Kategori Kas table + types |
| `src/db/schema/transaksi.ts` | Transaksi table + types |
| `src/db/schema/log-aktivitas.ts` | Log Aktivitas table + types |
| `src/db/schema/relations.ts` | Drizzle relations |

**Verification:** `npm run db:push` succeeds, tables appear in `npm run db:studio`.

---

### Step 1.3: Better Auth Setup

**Files to create:**
| File | Description |
|------|-------------|
| `src/lib/auth.ts` | Better Auth server config |
| `src/lib/auth-client.ts` | Better Auth client config |
| `src/lib/auth-helpers.ts` | Session helper functions |
| `src/app/api/auth/[...all]/route.ts` | Auth API handler |
| `src/db/schema/auth.ts` | Generated auth schema |

**Steps:**
1. Create `src/lib/auth.ts` with Drizzle adapter, admin plugin, username plugin
2. Run `npx @better-auth/cli generate` to create auth schema
3. Run `npm run db:push` to apply auth tables
4. Create API route handler
5. Create auth client

**Verification:** Visit `http://localhost:3000/api/auth/ok` - should return OK.

---

### Step 1.4: Seed Script

**Files to create:**
| File | Description |
|------|-------------|
| `src/db/seed.ts` | Seed script |

**Seeds:**
- 1 admin user (phone: 08123456789, password: admin123)
- 5 kategori_kas (Keamanan, Sampah, Donasi, Operasional, Sosial)
- 10 sample warga
- 20 sample transactions

**Verification:** `npm run db:seed` succeeds, data visible in `npm run db:studio`.

---

### Step 1.5: Update Project Config

**Files to modify:**
| File | Change |
|------|--------|
| `src/config/app-config.ts` | Rename to "Kas RT" |
| `package.json` | Add db:* scripts, rename project |
| `next.config.mjs` | Add `output: "standalone"` |

---

## Phase 2: Auth UI & Route Restructuring

**Goal:** Working login/logout flow with role-based routing.

### Step 2.1: Route Restructuring

**Files to create:**
| File | Description |
|------|-------------|
| `src/app/(auth)/layout.tsx` | Centered auth layout |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(dashboard)/layout.tsx` | Main dashboard layout (adapt existing) |
| `src/app/(dashboard)/admin/layout.tsx` | Admin role guard |
| `src/app/(dashboard)/admin/page.tsx` | Admin root redirect |
| `src/app/(dashboard)/warga/layout.tsx` | Warga role guard |
| `src/app/(dashboard)/warga/page.tsx` | Warga root redirect |
| `src/app/page.tsx` | Root redirect based on role |
| `src/middleware.ts` | Route protection |

**Files to move/adapt:**
| From | To | Change |
|------|-----|--------|
| `(main)/dashboard/layout.tsx` | `(dashboard)/layout.tsx` | Replace mock user with session |
| `(main)/dashboard/_components/sidebar/` | `(dashboard)/_components/sidebar/` | Reuse sidebar components |
| `(main)/auth/_components/login-form.tsx` | `(auth)/login/_components/login-form.tsx` | Wire to Better Auth |

**Files to archive:**
- `src/app/(main)/dashboard/default/`
- `src/app/(main)/dashboard/crm/`
- `src/app/(main)/dashboard/finance/`
- `src/app/(main)/dashboard/coming-soon/`
- `src/app/(main)/auth/v1/`, `v2/`
- `src/app/(external)/`

**Verification:** Login with seeded admin account, redirect to `/admin/dashboard` works.

---

### Step 2.2: Login Form

**Files to modify/create:**
| File | Description |
|------|-------------|
| `(auth)/login/page.tsx` | Login page with phone + password |
| `(auth)/login/_components/login-form.tsx` | Adapted from existing, wired to Better Auth |

**Changes from existing login form:**
- Change `email` field to `phone` (text input, phone format)
- Wire `onSubmit` to `authClient.signIn.username()` (phone as username)
- Add proper loading state and error handling
- Redirect after success based on role

**Verification:** Login → redirect to correct dashboard by role. Logout → redirect to login.

---

### Step 2.3: Session-Aware Sidebar

**Files to modify:**
| File | Change |
|------|--------|
| `sidebar-items.ts` | Split into admin/warga items |
| `app-sidebar.tsx` | Accept user prop, render role-based items |
| `nav-user.tsx` | Show real user data, wire logout |
| `account-switcher.tsx` | Show real user name + role |

**Verification:** Admin sees admin menu, warga sees warga menu. Logout works.

---

## Phase 3: Admin Features

**Goal:** All admin CRUD modules working.

### Step 3.1: Admin Dashboard

**Files to create:**
| File | Description |
|------|-------------|
| `admin/dashboard/page.tsx` | Stats + recent activity |
| `admin/dashboard/_components/stat-cards.tsx` | 4 KPI cards |
| `admin/dashboard/_components/recent-activity.tsx` | Last 5 activities |
| `admin/dashboard/_components/monthly-chart.tsx` | Income vs expense chart |
| `src/server/actions/dashboard.ts` | Dashboard query actions |

**Verification:** Dashboard shows real data from seeded database.

---

### Step 3.2: Data Warga CRUD

**Files to create:**
| File | Description |
|------|-------------|
| `admin/warga/page.tsx` | Warga list page |
| `admin/warga/_components/columns.tsx` | Table columns |
| `admin/warga/_components/warga-form.tsx` | Add/Edit form dialog |
| `admin/warga/_components/warga-table-toolbar.tsx` | Toolbar with search + add button |
| `admin/warga/_components/delete-warga-dialog.tsx` | Delete confirmation |
| `src/server/actions/warga.ts` | Warga CRUD server actions |
| `src/lib/validations/warga.ts` | Zod schema |

**Verification:** Add, edit, delete warga. Search/filter works. WhatsApp links work. Domicile warning badge shows.

---

### Step 3.3: Kategori Kas CRUD

**Files to create:**
| File | Description |
|------|-------------|
| `admin/kategori-kas/page.tsx` | Kategori list page |
| `admin/kategori-kas/_components/columns.tsx` | Table columns |
| `admin/kategori-kas/_components/kategori-form.tsx` | Add/Edit form |
| `src/server/actions/kategori-kas.ts` | CRUD actions |
| `src/lib/validations/kategori-kas.ts` | Zod schema |

**Verification:** CRUD works. Can't delete category referenced by transactions.

---

### Step 3.4: Kas Masuk (Pembayaran)

**Files to create:**
| File | Description |
|------|-------------|
| `admin/kas-masuk/page.tsx` | Payment page |
| `admin/kas-masuk/_components/payment-form.tsx` | Payment form |
| `admin/kas-masuk/_components/month-selector.tsx` | Multi-month checkboxes |
| `admin/kas-masuk/_components/today-history.tsx` | Today's table |
| `admin/kas-masuk/_components/e-kuitansi-dialog.tsx` | Receipt dialog |
| `src/server/actions/kas-masuk.ts` | Payment actions |
| `src/lib/validations/kas-masuk.ts` | Zod schema |

**Verification:** Select warga, choose category (auto-fills nominal), select months, submit. E-Kuitansi shows. Today's history updates.

---

### Step 3.5: Kas Keluar (Pengeluaran)

**Files to create:**
| File | Description |
|------|-------------|
| `admin/kas-keluar/page.tsx` | Expense page |
| `admin/kas-keluar/_components/expense-form.tsx` | Expense form |
| `admin/kas-keluar/_components/recent-expenses.tsx` | Recent table |
| `src/server/actions/kas-keluar.ts` | Expense actions |
| `src/lib/validations/kas-keluar.ts` | Zod schema |

**Verification:** Submit expense with category, date, amount, description. Recent list updates.

---

### Step 3.6: Laporan Keuangan

**Files to create:**
| File | Description |
|------|-------------|
| `admin/laporan/page.tsx` | Report page |
| `admin/laporan/_components/report-filters.tsx` | Date range filter |
| `admin/laporan/_components/report-table.tsx` | Transaction table with running balance |
| `admin/laporan/_components/report-summary.tsx` | Summary cards |
| `src/server/actions/laporan.ts` | Report query actions |
| `src/lib/pdf/laporan-template.tsx` | PDF template |
| `src/app/api/laporan/pdf/route.ts` | PDF endpoint |
| `src/app/api/laporan/excel/route.ts` | Excel endpoint |
| `src/lib/excel/export-helpers.ts` | Excel utility |

**Verification:** Filter by date range. Table shows running balance. PDF downloads correctly. Excel downloads correctly.

---

### Step 3.7: Log Aktivitas

**Files to create:**
| File | Description |
|------|-------------|
| `admin/log-aktivitas/page.tsx` | Audit trail page |
| `admin/log-aktivitas/_components/log-filters.tsx` | Filters |
| `admin/log-aktivitas/_components/log-table.tsx` | Log table |
| `admin/log-aktivitas/_components/columns.tsx` | Column definitions |
| `src/server/actions/log-aktivitas.ts` | Log query actions |

**Verification:** Logs show for all previous CRUD actions. Filter by date, admin, module works. Export works.

---

## Phase 4: Warga Features

**Goal:** Warga dashboard and payment history working.

### Step 4.1: Warga Dashboard

**Files to create:**
| File | Description |
|------|-------------|
| `warga/dashboard/page.tsx` | Warga dashboard |
| `warga/dashboard/_components/greeting-header.tsx` | Greeting with name |
| `warga/dashboard/_components/kas-balance-card.tsx` | RT balance |
| `warga/dashboard/_components/billing-status-card.tsx` | Lunas/Nunggak |
| `warga/dashboard/_components/quick-actions.tsx` | Navigation buttons |
| `src/server/actions/warga-dashboard.ts` | Dashboard queries |

**Verification:** Login as warga, see personalized dashboard with correct billing status.

---

### Step 4.2: Riwayat Pembayaran

**Files to create:**
| File | Description |
|------|-------------|
| `warga/riwayat/page.tsx` | Payment history |
| `warga/riwayat/_components/payment-history.tsx` | Month grid per category |
| `warga/riwayat/_components/year-selector.tsx` | Year tabs |
| `warga/riwayat/_components/e-kuitansi-view.tsx` | Receipt drawer |
| `src/server/actions/warga-riwayat.ts` | History queries |

**Verification:** See payment grid. Tap paid month to see E-Kuitansi. Correct lunas/nunggak status.

---

## Phase 5: Polish & Deployment

**Goal:** Production-ready with error handling, loading states, and deployment config.

### Step 5.1: Loading & Error States

**Files to create:**
| File | Description |
|------|-------------|
| `(dashboard)/loading.tsx` | Dashboard skeleton |
| `(dashboard)/admin/loading.tsx` | Admin page skeleton |
| `(dashboard)/admin/error.tsx` | Admin error boundary |
| `(dashboard)/warga/loading.tsx` | Warga page skeleton |
| `(dashboard)/warga/error.tsx` | Warga error boundary |

---

### Step 5.2: Deployment Config

**Files to create:**
| File | Description |
|------|-------------|
| `Dockerfile` | Multi-stage Docker build |
| `docker-compose.yml` | App + PostgreSQL |
| `.dockerignore` | Ignore node_modules, .next, etc. |
| `.env.example` | Template for environment variables |

---

### Step 5.3: Final Cleanup

- Remove archived template files
- Remove unused dependencies
- Run `npm run check:fix` (Biome lint + format)
- Run `npm run build` and fix any errors
- Update `AGENTS.md` with new project-specific guidance

---

## Summary: File Count by Phase

| Phase | New Files | Modified Files | Total |
|-------|-----------|----------------|-------|
| 1. Infrastructure | ~15 | ~3 | ~18 |
| 2. Auth & Routes | ~12 | ~6 | ~18 |
| 3. Admin Features | ~35 | ~2 | ~37 |
| 4. Warga Features | ~12 | ~0 | ~12 |
| 5. Polish & Deploy | ~8 | ~3 | ~11 |
| **Total** | **~82** | **~14** | **~96** |

---

## Dependency Graph

```
Phase 1 (Infrastructure)
  ├── 1.1 Install deps
  ├── 1.2 DB schema (depends on 1.1)
  ├── 1.3 Better Auth (depends on 1.2)
  ├── 1.4 Seed script (depends on 1.3)
  └── 1.5 Config updates (independent)

Phase 2 (Auth & Routes) ← depends on Phase 1
  ├── 2.1 Route restructuring (depends on 1.3)
  ├── 2.2 Login form (depends on 2.1)
  └── 2.3 Session sidebar (depends on 2.2)

Phase 3 (Admin) ← depends on Phase 2
  ├── 3.1 Dashboard (depends on 2.3)
  ├── 3.2 Warga CRUD (depends on 2.3)
  ├── 3.3 Kategori CRUD (depends on 2.3)
  ├── 3.4 Kas Masuk (depends on 3.2 + 3.3)
  ├── 3.5 Kas Keluar (depends on 3.3)
  ├── 3.6 Laporan (depends on 3.4 + 3.5)
  └── 3.7 Log Aktivitas (depends on 3.2+)

Phase 4 (Warga) ← depends on Phase 3.4
  ├── 4.1 Dashboard (depends on 3.4)
  └── 4.2 Riwayat (depends on 4.1)

Phase 5 (Polish) ← depends on Phase 4
  ├── 5.1 Loading/Error states
  ├── 5.2 Deployment config
  └── 5.3 Final cleanup
```

---

## Estimated Effort

| Phase | Description | Estimated Sessions |
|-------|-------------|-------------------|
| 1 | Infrastructure | 1-2 sessions |
| 2 | Auth & Routes | 1-2 sessions |
| 3 | Admin Features | 3-5 sessions |
| 4 | Warga Features | 1-2 sessions |
| 5 | Polish & Deploy | 1 session |
| **Total** | | **7-12 sessions** |

> A "session" = one focused working period with the AI assistant.
