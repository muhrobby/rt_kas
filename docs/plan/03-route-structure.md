# 03 - Route Structure

## App Router Restructuring

The existing template uses a generic dashboard structure. We need to restructure it into role-specific route groups matching the RT Kas application.

---

## Current Structure (Template)

```
src/app/
├── (external)/
│   └── page.tsx                          # Landing page
├── (main)/
│   ├── auth/
│   │   ├── v1/login/page.tsx
│   │   ├── v1/register/page.tsx
│   │   ├── v2/login/page.tsx
│   │   ├── v2/register/page.tsx
│   │   └── _components/                  # login-form, register-form, social-auth
│   ├── dashboard/
│   │   ├── layout.tsx                    # Sidebar layout
│   │   ├── page.tsx                      # Redirects to /dashboard/default
│   │   ├── default/                      # Default dashboard demo
│   │   ├── crm/                          # CRM dashboard demo
│   │   ├── finance/                      # Finance dashboard demo
│   │   ├── coming-soon/                  # Placeholder
│   │   ├── [...not-found]/               # Catch-all 404
│   │   └── _components/sidebar/          # Sidebar components
│   └── unauthorized/page.tsx
├── layout.tsx                            # Root layout
├── not-found.tsx
└── globals.css
```

---

## New Structure

```
src/app/
├── (auth)/                                # Auth pages (no sidebar, centered layout)
│   ├── layout.tsx                         # Centered auth layout
│   ├── login/
│   │   └── page.tsx                       # Login page (phone + password)
│   └── register/
│       └── page.tsx                       # Register page (admin creates accounts)
│
├── (dashboard)/                           # Authenticated area (shared sidebar layout)
│   ├── layout.tsx                         # Main layout: session check → sidebar + header
│   │
│   ├── admin/                             # Admin-only routes
│   │   ├── layout.tsx                     # Admin role guard
│   │   ├── page.tsx                       # Admin dashboard (redirect or main)
│   │   ├── dashboard/
│   │   │   ├── page.tsx                   # Admin dashboard: stats, recent activity
│   │   │   └── _components/
│   │   │       ├── stat-cards.tsx
│   │   │       ├── recent-activity.tsx
│   │   │       └── monthly-chart.tsx
│   │   ├── warga/
│   │   │   ├── page.tsx                   # Data Warga: CRUD table
│   │   │   └── _components/
│   │   │       ├── columns.tsx            # Table column definitions
│   │   │       ├── warga-form.tsx         # Add/Edit dialog form
│   │   │       └── warga-table-toolbar.tsx
│   │   ├── kategori-kas/
│   │   │   ├── page.tsx                   # Kategori Kas: CRUD table
│   │   │   └── _components/
│   │   │       ├── columns.tsx
│   │   │       └── kategori-form.tsx
│   │   ├── kas-masuk/
│   │   │   ├── page.tsx                   # Kas Masuk: Payment form + history
│   │   │   └── _components/
│   │   │       ├── payment-form.tsx       # Main payment input form
│   │   │       ├── today-history.tsx      # Today's transactions table
│   │   │       └── e-kuitansi-dialog.tsx  # Receipt dialog after payment
│   │   ├── kas-keluar/
│   │   │   ├── page.tsx                   # Kas Keluar: Expense form + history
│   │   │   └── _components/
│   │   │       ├── expense-form.tsx
│   │   │       └── recent-expenses.tsx
│   │   ├── laporan/
│   │   │   ├── page.tsx                   # Laporan Keuangan: Filter + table + export
│   │   │   └── _components/
│   │   │       ├── report-filters.tsx
│   │   │       ├── report-table.tsx
│   │   │       └── report-summary.tsx
│   │   └── log-aktivitas/
│   │       ├── page.tsx                   # Audit Trail: Filter + log table
│   │       └── _components/
│   │           ├── log-filters.tsx
│   │           ├── log-table.tsx
│   │           └── columns.tsx
│   │
│   └── warga/                             # Warga-only routes
│       ├── layout.tsx                     # Warga role guard (or shared with admin)
│       ├── page.tsx                       # Warga dashboard (mobile-first)
│       ├── dashboard/
│       │   ├── page.tsx
│       │   └── _components/
│       │       ├── greeting-header.tsx    # "Halo, Keluarga [Nama]"
│       │       ├── kas-balance-card.tsx   # RT treasury balance
│       │       ├── billing-status-card.tsx # Lunas/Nunggak status
│       │       └── quick-actions.tsx
│       └── riwayat/
│           ├── page.tsx                   # Payment history + E-Kuitansi
│           └── _components/
│               ├── payment-history.tsx
│               └── e-kuitansi-view.tsx
│
├── api/
│   ├── auth/
│   │   └── [...all]/
│   │       └── route.ts                   # Better Auth handler
│   └── laporan/
│       └── pdf/
│           └── route.ts                   # PDF generation endpoint
│
├── unauthorized/
│   └── page.tsx                           # Unauthorized access page
│
├── layout.tsx                             # Root layout (theme, fonts, providers)
├── not-found.tsx                          # Global 404
├── globals.css                            # Global styles
└── favicon.ico
```

---

## Layout Hierarchy

```
RootLayout (layout.tsx)
  ├── (auth)/layout.tsx          → Centered, no sidebar
  │   ├── login/page.tsx
  │   └── register/page.tsx
  │
  ├── (dashboard)/layout.tsx     → Session check + Sidebar + Header
  │   ├── admin/layout.tsx       → Role guard (admin only)
  │   │   ├── dashboard/page.tsx
  │   │   ├── warga/page.tsx
  │   │   ├── kategori-kas/page.tsx
  │   │   ├── kas-masuk/page.tsx
  │   │   ├── kas-keluar/page.tsx
  │   │   ├── laporan/page.tsx
  │   │   └── log-aktivitas/page.tsx
  │   │
  │   └── warga/layout.tsx       → Role guard (warga only, or shared)
  │       ├── dashboard/page.tsx
  │       └── riwayat/page.tsx
  │
  └── unauthorized/page.tsx
```

---

## Layout Implementations

### (auth)/layout.tsx

```tsx
// Centered auth layout - no sidebar
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
```

### (dashboard)/layout.tsx

Reuses the existing dashboard layout with sidebar, header, and content area. Key changes:
- Fetch real session from Better Auth instead of mock users
- Pass session data to sidebar components
- Role-aware sidebar items

```tsx
// Adapts existing src/app/(main)/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Reuse existing sidebar layout structure
  // Pass session.user to sidebar for role-aware rendering
  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <Header user={session.user} />
        <div className="h-full p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### admin/layout.tsx

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/unauthorized");

  return <>{children}</>;
}
```

### warga/layout.tsx

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function WargaLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  // Warga can access their own pages; admin can also access for debugging
  if (session.user.role !== "user" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
```

---

## Sidebar Navigation (Role-Aware)

Update `src/navigation/sidebar/sidebar-items.ts`:

```ts
// Admin sidebar items
export const adminSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Menu Utama",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Data Warga", url: "/admin/warga", icon: Users },
      { title: "Kategori Kas", url: "/admin/kategori-kas", icon: Tags },
    ],
  },
  {
    id: 2,
    label: "Transaksi",
    items: [
      { title: "Kas Masuk", url: "/admin/kas-masuk", icon: ArrowDownCircle },
      { title: "Kas Keluar", url: "/admin/kas-keluar", icon: ArrowUpCircle },
    ],
  },
  {
    id: 3,
    label: "Pelaporan",
    items: [
      { title: "Laporan Keuangan", url: "/admin/laporan", icon: FileText },
      { title: "Log Aktivitas", url: "/admin/log-aktivitas", icon: ClipboardList },
    ],
  },
];

// Warga sidebar items
export const wargaSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Menu",
    items: [
      { title: "Dashboard", url: "/warga/dashboard", icon: Home },
      { title: "Riwayat Pembayaran", url: "/warga/riwayat", icon: Receipt },
    ],
  },
];
```

---

## Files to Remove / Archive

These template demo files are no longer needed:

```
src/app/(main)/dashboard/default/          # Demo default dashboard
src/app/(main)/dashboard/crm/             # Demo CRM dashboard
src/app/(main)/dashboard/finance/          # Demo finance dashboard
src/app/(main)/dashboard/coming-soon/      # Placeholder page
src/app/(main)/auth/v1/                    # Demo auth v1
src/app/(main)/auth/v2/                    # Demo auth v2
src/app/(external)/                        # Landing page (not needed for RT app)
src/data/                                  # Mock data files (if any)
```

**Approach:** Move these to an `_archive/` folder initially rather than deleting, in case any component patterns are useful for reference.

---

## Files to Keep / Reuse

```
src/app/(main)/dashboard/layout.tsx                    → Adapt into (dashboard)/layout.tsx
src/app/(main)/dashboard/_components/sidebar/          → Reuse all sidebar components
src/app/(main)/auth/_components/login-form.tsx          → Adapt for phone+password
src/app/(main)/auth/_components/register-form.tsx       → Adapt for admin account creation
src/app/(main)/auth/_components/social-auth/            → Remove (no social auth needed)
src/app/(main)/unauthorized/page.tsx                    → Keep as-is
src/components/data-table/                              → Reuse for all CRUD tables
```

---

## Default Redirect Logic

| Route          | Behavior                                         |
| -------------- | ------------------------------------------------ |
| `/`            | Redirect to `/login` (or `/admin/dashboard` if authenticated) |
| `/login`       | Show login form (redirect to dashboard if already authenticated) |
| `/dashboard`   | Redirect based on role: admin → `/admin/dashboard`, warga → `/warga/dashboard` |
| `/admin/*`     | Admin-only. Redirect to `/unauthorized` if not admin |
| `/warga/*`     | Warga or admin. Redirect to `/unauthorized` if neither |

This can be implemented in the `(dashboard)/layout.tsx` or the root `page.tsx`:

```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin/dashboard");
  redirect("/warga/dashboard");
}
```
