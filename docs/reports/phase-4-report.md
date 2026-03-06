# Phase 4 Report — Warga Portal Implementation

**Status:** Complete ✅  
**Date:** 2026-03-06

---

## Scope

Phase 4 implemented the read-only Warga (resident) portal: a mobile-first dashboard and payment history view accessible to logged-in warga users.

---

## Completed Work

### Server Actions

| File | Exports |
|---|---|
| `src/server/actions/warga-dashboard.ts` | `getWargaProfile()`, `getKasBalance()`, `getBillingStatus(wargaId, month, year)` |
| `src/server/actions/warga-riwayat.ts` | `getPaymentGrid(wargaId, tahun)`, `getKuitansiDetail(transaksiId)`, `getAvailableYears(wargaId)` |

**Profile resolution strategy:**
- Primary: `session.user.wargaId` (custom field on Better Auth user, set when admin creates warga account)
- Fallback: match `warga.noTelp` against `session.user.username` (phone number)

### Step 4.1 — Warga Dashboard (`/warga/dashboard`)

| File | Description |
|---|---|
| `page.tsx` | Server component — fetches profile, balance, billing status in parallel |
| `_components/greeting-header.tsx` | Name, blok, status badge, domicile expiry warning |
| `_components/kas-balance-card.tsx` | RT treasury balance with update timestamp |
| `_components/billing-status-card.tsx` | Per-category lunas/belum-lunas breakdown; overall LUNAS/BELUM LUNAS banner |
| `_components/quick-actions.tsx` | Button linking to `/warga/riwayat` |

**Design:** `max-w-lg mx-auto` single-column stacked cards — mobile-first as specified in plan.

**Billing status logic:**
- Fetches all `kategori_kas` where `jenis_arus = 'masuk'`
- Checks `transaksi` for current month/year filtered by `warga_id`
- Overall LUNAS only if all categories are paid

### Step 4.2 — Riwayat Pembayaran (`/warga/riwayat`)

| File | Description |
|---|---|
| `page.tsx` | Server component — fetches profile, available years, initial grid |
| `_components/riwayat-shell.tsx` | Client component — manages year selection state, re-fetches grid on year change |
| `_components/year-selector.tsx` | Pill-style year tabs (client) |
| `_components/payment-history.tsx` | Per-kategori 4-column month grid with lunas/nunggak/belum-jatuh-tempo states (client) |
| `_components/e-kuitansi-view.tsx` | Bottom-sheet `Drawer` showing full receipt detail, fetched on demand (client) |

**Payment grid color coding (per plan spec):**

| State | Color | Icon |
|---|---|---|
| Lunas (past, paid) | Green `bg-green-50` | `CheckCircle2` — tappable, opens kuitansi |
| Belum bayar (past, unpaid) | Red `bg-red-50` | `XCircle` |
| Belum jatuh tempo (future) | Gray `bg-muted/40 opacity-50` | `Clock` |
| Bulan berjalan | Ring highlight | depends on status |

**E-Kuitansi drawer** fetches `getKuitansiDetail(transaksiId)` lazily when a paid month cell is tapped. Displays: no. referensi, tanggal, warga, blok, kategori, bulan, nominal, dicatat oleh, waktu pencatatan.

---

## Architecture Notes

- **Server/client split:** pages are Server Components for initial data fetch; interactive parts (`RiwayatShell`, payment grid, drawer) are Client Components
- **No prop drilling for session:** server actions call `requireAuth()` internally — no session passed through props
- **`getAvailableYears`** always includes the current year even if no transactions exist yet

---

## Lint & Type Check Results

- `npx tsc --noEmit` — 0 errors
- `npm run check` — 11 warnings (all pre-existing in template/infrastructure files, none in Phase 4 code)
- One Phase 4 warning fixed: `noNonNullAssertion` in `payment-history.tsx` — replaced `m.transaksiId!` with captured variable `txId`

---

## Next Phase

**Phase 5 — Polish & Deployment**

- Loading/error boundaries (`loading.tsx`, `error.tsx`) for admin and warga routes
- Dockerfile + docker-compose for VPS deployment
- `npm run build` verification
- Final cleanup (remove archived template files, unused deps)
