# 00 - Project Overview

## Sistem Manajemen Keuangan RT (Kas RT)

Aplikasi web untuk mengelola keuangan lingkungan RT: pencatatan iuran warga, pengeluaran operasional, pelaporan keuangan, dan transparansi kas. Menggantikan proses manual buku besar + Excel yang berjalan saat ini.

---

## Tech Stack

| Layer             | Technology                                   | Notes                                    |
| ----------------- | -------------------------------------------- | ---------------------------------------- |
| **Framework**     | Next.js 16 (App Router)                      | React 19, React Compiler enabled         |
| **Language**      | TypeScript (strict mode)                     | ESM only, no `any`                       |
| **Database**      | PostgreSQL + Drizzle ORM                     | Type-safe schema, SQL-like query API     |
| **Auth**          | Better Auth                                  | Phone+password, admin plugin, Drizzle adapter |
| **UI Components** | shadcn/ui + Tailwind CSS v4                  | 55+ components already installed         |
| **Data Tables**   | @tanstack/react-table                        | Already configured with reusable wrapper |
| **Forms**         | React Hook Form + Zod                        | Already configured                       |
| **Charts**        | Recharts                                     | Already configured                       |
| **State**         | Zustand (UI preferences) + React Query       | Both already installed                   |
| **PDF Export**    | @react-pdf/renderer                          | Server-side generation                   |
| **Excel Export**  | ExcelJS                                      | For audit trail & report export          |
| **Linting**       | Biome 2.3.8                                  | Already configured with Husky hooks      |
| **Deployment**    | Vercel + VPS (standalone output)             | Docker-ready                             |

---

## Existing Codebase Assets (Reusable)

These are already built and will be reused/adapted:

- **Root layout** (`src/app/layout.tsx`) - Theme boot, font loading, preferences provider
- **Dashboard layout** (`src/app/(main)/dashboard/layout.tsx`) - Sidebar + header + content area
- **Sidebar system** (`src/components/ui/sidebar.tsx` + `_components/sidebar/`) - Full sidebar with collapsible, variants, account switcher
- **Data table** (`src/components/data-table/`) - Reusable table with pagination, sorting, column visibility, drag-and-drop rows
- **55+ shadcn/ui components** - button, card, dialog, sheet, form, input, select, combobox, badge, alert, toast, etc.
- **Theme presets** (`src/styles/presets/`) - Multiple color themes with dark/light mode
- **Auth form components** (`src/app/(main)/auth/_components/`) - Login and register form UI (needs wiring to real auth)
- **Server actions** (`src/server/server-actions.ts`) - Cookie-based preference helpers
- **Preferences store** (`src/stores/preferences/`) - Zustand store for UI preferences

---

## Roles & Access Control

| Role      | Description                    | Access                                                    |
| --------- | ------------------------------ | --------------------------------------------------------- |
| **Admin** | Pengurus RT / Bendahara        | Full CRUD on all modules, reports, audit trail            |
| **Warga** | Warga / Kepala Keluarga        | Read-only: own payment history, RT kas transparency       |

---

## New Dependencies to Install

```bash
# Production
npm install better-auth drizzle-orm postgres @react-pdf/renderer exceljs

# Development
npm install -D drizzle-kit @types/pg
```

## Dependencies to Remove (unused template leftovers)

```bash
npm uninstall axios @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities embla-carousel-react simple-icons
```

> **Note:** `next-themes` is installed but the project uses a custom Zustand-based theme system. It can be removed if not referenced anywhere.

---

## New npm Scripts

```jsonc
{
  "db:generate": "drizzle-kit generate",   // Generate migration SQL files
  "db:migrate": "drizzle-kit migrate",     // Run pending migrations
  "db:push": "drizzle-kit push",           // Push schema directly (dev)
  "db:studio": "drizzle-kit studio",       // Open Drizzle Studio GUI
  "db:seed": "tsx src/db/seed.ts"          // Seed initial data
}
```

---

## Environment Variables

```env
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/kas_rt
BETTER_AUTH_SECRET=your-random-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

---

## Document Index

| File                                              | Description                              |
| ------------------------------------------------- | ---------------------------------------- |
| [01-database.md](./01-database.md)                | Database schema design (Drizzle + PG)    |
| [02-authentication.md](./02-authentication.md)    | Better Auth setup & configuration        |
| [03-route-structure.md](./03-route-structure.md)  | App Router route restructuring           |
| [04-admin-features.md](./04-admin-features.md)    | Admin module specifications              |
| [05-warga-features.md](./05-warga-features.md)    | Warga-facing feature specifications      |
| [06-shared-services.md](./06-shared-services.md)  | Audit trail, PDF/Excel, shared utilities |
| [07-deployment.md](./07-deployment.md)            | Deployment configuration                 |
| [08-implementation-roadmap.md](./08-implementation-roadmap.md) | Step-by-step execution plan   |
