# 05 - Warga Features

## Overview

Warga features are under the `(dashboard)/warga/` route group. Accessible by users with `role === "user"` (warga) and `role === "admin"` (for debugging). All views are **read-only** - warga cannot create, edit, or delete any data.

Design priority: **mobile-first**. Warga will primarily access via smartphone through a browser link shared on WhatsApp.

---

## Module 1: Warga Dashboard

**Route:** `/warga/dashboard`
**Files:**
```
warga/dashboard/
├── page.tsx
└── _components/
    ├── greeting-header.tsx        # "Halo, Keluarga [Nama]"
    ├── kas-balance-card.tsx       # RT treasury balance (transparency)
    ├── billing-status-card.tsx    # Lunas/Nunggak big status card
    └── quick-actions.tsx          # Navigation buttons
```

### Layout (Mobile-First, Stacked Cards)

```
┌──────────────────────────────────┐
│  Halo, Keluarga Bpk. Ahmad      │
│  Blok A2 No. 5                   │
│  Status: Warga Tetap             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Saldo Kas Lingkungan RT         │
│                                  │
│     Rp 3.450.000                 │
│                                  │
│  Diperbarui: 05 Jan 2026        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Tagihan Bulan Ini               │
│                                  │
│       ✓ LUNAS                    │  ← Green background
│                                  │  OR
│       ✗ NUNGGAK                  │  ← Red background
│                                  │
│  Iuran Keamanan : Rp 25.000 ✓   │
│  Iuran Sampah   : Rp 15.000 ✗   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  [Lihat Riwayat & E-Kuitansi]   │  ← Button → /warga/riwayat
│  [Lihat Transparansi Kas RT]    │  ← Button → /warga/transparansi (optional)
└──────────────────────────────────┘
```

### Data Queries

```ts
// Server Component queries
const session = await getServerSession();  // Get logged-in warga
const wargaProfile = await getWargaByUserId(session.user.id);
const kasBalance = await getKasBalance();  // SUM(masuk) - SUM(keluar)
const billingStatus = await getBillingStatusForMonth(
  wargaProfile.id,
  currentMonth,
  currentYear
);
```

### Billing Status Logic

For each active `kategori_kas` where `jenis_arus = 'masuk'`:
- Check if there is a `transaksi` for the current month/year for this warga+kategori
- If exists → LUNAS (green checkmark)
- If not → NUNGGAK (red X)

Overall status is LUNAS only if ALL kategori are paid.

### Server Actions (Read-only)

```
src/server/actions/warga-dashboard.ts
├── getWargaProfile(userId)            → Warga profile linked to user
├── getKasBalance()                    → Current RT treasury balance
├── getBillingStatus(wargaId, month, year) → Per-kategori payment status
└── getCurrentMonthCategories()        → Active masuk categories
```

---

## Module 2: Riwayat Pembayaran & E-Kuitansi

**Route:** `/warga/riwayat`
**Files:**
```
warga/riwayat/
├── page.tsx
└── _components/
    ├── payment-history.tsx        # Month-by-month payment grid
    ├── year-selector.tsx          # Year filter tabs
    └── e-kuitansi-view.tsx        # Digital receipt view
```

### Layout

```
┌──────────────────────────────────┐
│  Riwayat Pembayaran              │
│  [2024] [2025] [2026]           │  ← Year tabs
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Iuran Keamanan (Rp 25.000)     │
│                                  │
│  Jan ✓  Feb ✓  Mar ✓  Apr ✓     │
│  Mei ✓  Jun ✓  Jul ✗  Agu ✗    │
│  Sep -  Okt -  Nov -  Des -     │
│                                  │
│  ✓ = Lunas  ✗ = Nunggak  - = Belum│
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Iuran Sampah (Rp 15.000)       │
│                                  │
│  Jan ✓  Feb ✓  Mar ✓  ...       │
└──────────────────────────────────┘
```

### Interaction

- Tapping on a "✓ Lunas" month opens the E-Kuitansi view for that payment
- The grid shows all 12 months per kategori per year
- Past months without payment = NUNGGAK (red)
- Future months = neutral/grey
- Current month = highlighted border

### E-Kuitansi View (Digital Receipt)

Displayed as a bottom sheet (drawer) on mobile when tapping a paid month:

```
┌──────────────────────────────────┐
│        E-KUITANSI                │
│     Kas RT [Nama Lingkungan]     │
│                                  │
│  No. Referensi: TRX-20260105-01 │
│  Tanggal Bayar: 05 Januari 2026 │
│                                  │
│  Warga  : Bpk. Ahmad            │
│  Blok   : A2 No. 5              │
│  Kategori: Iuran Keamanan       │
│  Bulan  : Januari 2026          │
│  Nominal: Rp 25.000             │
│                                  │
│  Dicatat oleh: Admin Budi       │
│  Pada: 05/01/2026 14:30:05      │
│                                  │
│  ─────────────────────────────   │
│  Ini adalah bukti pembayaran     │
│  digital yang sah.               │
│                                  │
│  [Tutup]                         │
└──────────────────────────────────┘
```

### Server Actions (Read-only)

```
src/server/actions/warga-riwayat.ts
├── getPaymentHistory(wargaId, tahun)     → All transaksi for this warga in a year
├── getPaymentGrid(wargaId, tahun)        → Per-kategori per-month status grid
└── getKuitansiDetail(transaksiId)        → Single transaction for receipt view
```

---

## Module 3: Transparansi Kas RT (Optional)

**Route:** `/warga/transparansi` (or embedded in dashboard)

This is a simplified read-only view of the RT financial summary, allowing warga to see where their money goes.

### Layout

```
┌──────────────────────────────────┐
│  Transparansi Kas RT             │
│  Bulan: [Select] Tahun: [Select] │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Ringkasan Bulan Januari 2026   │
│                                  │
│  Total Pemasukan  : Rp 1.250.000│
│  Total Pengeluaran: Rp   850.000│
│  ────────────────────────────────│
│  Saldo Akhir     : Rp   400.000│
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Rincian Pengeluaran             │
│                                  │
│  05/01 Gaji satpam    Rp500.000 │
│  10/01 Sapu & pengki  Rp 45.000 │
│  15/01 Lampu jalan    Rp305.000 │
└──────────────────────────────────┘
```

### Data

- Aggregated income/expense summary (no individual warga payment details for privacy)
- Only shows expense details (what RT money was spent on)
- Monthly filter

### Server Actions

```
src/server/actions/transparansi.ts
├── getMonthlySummary(month, year)      → Aggregated in/out/balance
└── getExpenseDetails(month, year)      → List of pengeluaran for transparency
```

---

## Mobile-First Design Considerations

### Responsive Strategy

- All warga pages use a single-column stacked layout
- Max width: `max-w-lg mx-auto` (centered, narrow)
- Touch-friendly: minimum tap targets of 44x44px
- Large text for important numbers (saldo, status)
- Bottom sheet (vaul drawer) for receipts instead of modal dialogs
- Minimal sidebar: either hidden (hamburger) or replaced with a simple top nav

### Warga Layout

```tsx
// (dashboard)/warga/layout.tsx
// Simplified layout for warga - may hide sidebar or use a minimal header
export default async function WargaLayout({ children }) {
  const session = await getServerSession();
  
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Kas RT</h1>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
```

**Alternative:** Use the same sidebar layout as admin but with fewer items. The sidebar auto-collapses on mobile already (existing behavior).

### Color Coding

| Status   | Color                    | Usage                          |
| -------- | ------------------------ | ------------------------------ |
| LUNAS    | Green (`bg-green-100`)   | Paid months, billing status    |
| NUNGGAK  | Red (`bg-red-100`)       | Unpaid months, overdue status  |
| Neutral  | Gray (`bg-muted`)        | Future months, no data yet     |
| Warning  | Amber (`bg-amber-100`)   | Domicile expiry warning        |

---

## Data Privacy

- Warga can ONLY see their own payment data (filtered by `warga_id`)
- Warga can see aggregated RT financial summary (total in/out) but NOT individual warga payments
- Expense details are public within the RT (transparency feature)
- Server actions must always verify `session.user.wargaId` matches the requested data
