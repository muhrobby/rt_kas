# 04 - Admin Features

## Overview

All admin features are under the `(dashboard)/admin/` route group and require `role === "admin"`. Each module follows a consistent pattern: Server Component page that fetches data, client-side interactive components for forms/tables.

---

## Module 1: Admin Dashboard

**Route:** `/admin/dashboard`
**Files:**
```
admin/dashboard/
├── page.tsx
└── _components/
    ├── stat-cards.tsx
    ├── recent-activity.tsx
    └── monthly-chart.tsx
```

### Stat Cards (Top Section)

Four cards displaying real-time aggregated data:

| Card                     | Query                                                    | Display            |
| ------------------------ | -------------------------------------------------------- | ------------------ |
| Total Warga Aktif        | `SELECT COUNT(*) FROM warga`                             | Number             |
| Saldo Kas Saat Ini       | `SUM(masuk) - SUM(keluar) FROM transaksi`                | Rupiah format      |
| Pemasukan Bulan Ini      | `SUM(nominal) WHERE tipe_arus='masuk' AND month=current` | Rupiah format      |
| Pengeluaran Bulan Ini    | `SUM(nominal) WHERE tipe_arus='keluar' AND month=current`| Rupiah format      |

Implementation: Server Component that queries Drizzle directly. No client-side fetching needed.

```tsx
// admin/dashboard/page.tsx (Server Component)
import { db } from "@/db";
import { transaksi, warga } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const [totalWarga] = await db.select({ count: sql<number>`count(*)` }).from(warga);
  // ... other queries
  return (
    <>
      <StatCards data={stats} />
      <RecentActivity />
      <MonthlyChart />
    </>
  );
}
```

### Recent Activity Table (Bottom Section)

Displays the 5 most recent transactions from `log_aktivitas`:

| Column     | Source                          |
| ---------- | ------------------------------- |
| Tanggal    | `waktu_log` (formatted)        |
| Keterangan | `keterangan`                   |
| Nominal    | From related `transaksi` if applicable |
| Diinput Oleh | `user.name` via `userId` join |

### Monthly Chart

Bar/area chart using `recharts` (already installed) showing monthly income vs expenses for the current year. Query aggregates by month from `transaksi`.

---

## Module 2: Data Warga (CRUD)

**Route:** `/admin/warga`
**Files:**
```
admin/warga/
├── page.tsx
└── _components/
    ├── columns.tsx                # @tanstack/react-table column definitions
    ├── warga-form.tsx             # Add/Edit dialog with react-hook-form + zod
    ├── warga-table-toolbar.tsx    # Search, filters, add button
    └── delete-warga-dialog.tsx    # Confirmation dialog
```

### Table Columns

| # | Column               | Type      | Features                                      |
|---|----------------------|-----------|-----------------------------------------------|
| 1 | No                   | Row index | Auto-numbered                                 |
| 2 | Nama Kepala Keluarga | Text      | Sortable, searchable                          |
| 3 | Blok Rumah           | Text      | Sortable                                      |
| 4 | No. Telp             | Text      | WhatsApp icon link (`https://wa.me/{number}`) |
| 5 | Status Hunian        | Badge     | "Tetap" (default) / "Kontrak" (yellow)        |
| 6 | Batas Domisili       | Date      | Red highlight if < 3 months from now          |
| 7 | Aksi                 | Actions   | Edit button, Delete button                    |

### Form Fields (Add/Edit Dialog)

```ts
const wargaFormSchema = z.object({
  namaKepalaKeluarga: z.string().min(1, "Nama wajib diisi"),
  blokRumah: z.string().min(1, "Blok rumah wajib diisi"),
  noTelp: z.string().min(10, "Nomor telepon minimal 10 digit"),
  statusHunian: z.enum(["tetap", "kontrak"]),
  tglBatasDomisili: z.date().optional().nullable(),  // Required only if kontrak
});
```

### UX Enhancements (from requirement doc)

- **WhatsApp link:** No. Telp column renders as clickable link → opens `https://wa.me/62{number}`
- **Domicile warning:** Rows where `tglBatasDomisili` is within 3 months get a red background + "Peringatan Domisili" badge
- **Create user account:** Option in the form to also create a login account for the warga

### Server Actions

```
src/server/actions/warga.ts
├── getWargaList()           → Paginated query with search/filter
├── getWargaById(id)         → Single warga for edit form
├── createWarga(data)        → Insert + audit log
├── updateWarga(id, data)    → Update + audit log
└── deleteWarga(id)          → Delete + audit log (soft delete optional)
```

---

## Module 3: Kategori Kas (CRUD)

**Route:** `/admin/kategori-kas`
**Files:**
```
admin/kategori-kas/
├── page.tsx
└── _components/
    ├── columns.tsx
    └── kategori-form.tsx
```

### Table Columns

| # | Column          | Type     | Features                              |
|---|-----------------|----------|---------------------------------------|
| 1 | No              | Index    | Auto-numbered                         |
| 2 | Nama Kategori   | Text     | Sortable                              |
| 3 | Jenis Arus      | Badge    | "Masuk" (green) / "Keluar" (red)      |
| 4 | Nominal Default | Currency | Formatted as Rp XX.XXX                |
| 5 | Aksi            | Actions  | Edit, Delete                          |

### Form Fields

```ts
const kategoriFormSchema = z.object({
  namaKategori: z.string().min(1, "Nama kategori wajib diisi"),
  jenisArus: z.enum(["masuk", "keluar"]),
  nominalDefault: z.number().min(0, "Nominal tidak boleh negatif"),
});
```

### Server Actions

```
src/server/actions/kategori-kas.ts
├── getKategoriList()
├── getKategoriByJenis(jenis)  → Filtered for dropdowns in kas masuk/keluar
├── createKategori(data)
├── updateKategori(id, data)
└── deleteKategori(id)          → Block if referenced by transaksi
```

---

## Module 4: Kas Masuk (Pembayaran Iuran Warga)

**Route:** `/admin/kas-masuk`
**Files:**
```
admin/kas-masuk/
├── page.tsx
└── _components/
    ├── payment-form.tsx           # Main payment input form
    ├── today-history.tsx          # Today's incoming transactions
    ├── e-kuitansi-dialog.tsx      # Digital receipt after payment
    └── month-selector.tsx         # Multi-select month checkboxes
```

### Form Layout (Left/Top Section)

```
┌─────────────────────────────────────────────────────┐
│  Pembayaran Iuran Warga                              │
│                                                       │
│  Pilih Warga:     [Combobox - search by name/blok]   │
│  Kategori Iuran:  [Select - filtered masuk only]     │
│  Nominal:         [Input - auto-filled from default]  │
│  Bulan Tagihan:   [☐ Jan ☐ Feb ☐ Mar ... ☐ Des]     │
│  Tahun:           [Select - 2024, 2025, 2026, ...]   │
│  Keterangan:      [Input - optional]                  │
│                                                       │
│  [Simpan Pembayaran]                                  │
└─────────────────────────────────────────────────────┘
```

### Behavior

1. **Warga selection:** Combobox (using existing `cmdk`-based component) that searches warga by name or blok
2. **Kategori selection:** Dropdown filtered to `jenis_arus = 'masuk'`
3. **Auto-fill nominal:** When kategori is selected, auto-populate nominal from `nominal_default`
4. **Month multi-select:** Checkboxes for Jan-Dec. Multiple selection for arrears ("nunggak")
5. **On submit:**
   - Create one `transaksi` record per selected month
   - Log activity to `log_aktivitas`
   - Show E-Kuitansi dialog with payment summary
   - Refresh today's history table

### E-Kuitansi Dialog

Displayed after successful payment:

```
┌─────────────────────────────────────┐
│        E-KUITANSI PEMBAYARAN        │
│         Kas RT [Nama RT]            │
│                                     │
│  Tanggal  : 05 Januari 2026        │
│  No. Ref  : TRX-20260105-001       │
│  Warga    : Bpk. Ahmad (Blok A2)   │
│  Kategori : Iuran Keamanan          │
│  Bulan    : Januari, Februari 2026  │
│  Nominal  : Rp 50.000              │
│                                     │
│  Dicatat oleh: Admin Budi           │
│                                     │
│  [Tutup]            [Print/Share]   │
└─────────────────────────────────────┘
```

### Today's History (Right/Bottom Section)

Table showing all `transaksi` where `tipe_arus = 'masuk'` and `waktu_transaksi = today`:

| Jam   | Warga          | Kategori  | Bulan     | Nominal   |
|-------|----------------|-----------|-----------|-----------|
| 14:30 | Bpk. Ahmad     | Keamanan  | Jan 2026  | Rp 25.000 |
| 14:35 | Ibu Siti       | Sampah    | Jan 2026  | Rp 15.000 |

### Server Actions

```
src/server/actions/kas-masuk.ts
├── createPembayaran(data)      → Batch insert for multi-month + audit log
├── getTodayPemasukan()         → Today's incoming transactions
├── getTagihanWarga(wargaId)    → Which months are paid/unpaid for a warga
└── getPembayaranDetail(id)     → For E-Kuitansi display
```

---

## Module 5: Kas Keluar (Pengeluaran Operasional)

**Route:** `/admin/kas-keluar`
**Files:**
```
admin/kas-keluar/
├── page.tsx
└── _components/
    ├── expense-form.tsx
    └── recent-expenses.tsx
```

### Form Layout

```
┌─────────────────────────────────────────────────┐
│  Pengeluaran Operasional RT                      │
│                                                   │
│  Kategori:     [Select - filtered keluar only]   │
│  Tanggal:      [Date Picker]                     │
│  Nominal:      [Input - currency]                │
│  Keterangan:   [Textarea - detailed description] │
│                                                   │
│  [Simpan Pengeluaran]                             │
└─────────────────────────────────────────────────┘
```

### Behavior

1. Kategori filtered to `jenis_arus = 'keluar'`
2. Date picker defaults to today
3. Nominal is free input (no auto-fill for expenses)
4. Keterangan should be detailed (e.g., "Beli 2 buah sapu lidi dan pengki - Rp 45.000")
5. On submit: insert `transaksi` with `tipe_arus = 'keluar'`, `warga_id = NULL`, log to audit trail

### Recent Expenses Table

Shows recent pengeluaran (last 30 days or current month):

| Tanggal    | Kategori     | Keterangan                 | Nominal    |
|------------|--------------|----------------------------|------------|
| 05/01/2026 | Operasional  | Beli sapu lidi dan pengki  | Rp 45.000  |
| 03/01/2026 | Operasional  | Bayar gaji satpam          | Rp 500.000 |

### Server Actions

```
src/server/actions/kas-keluar.ts
├── createPengeluaran(data)      → Insert + audit log
├── getRecentPengeluaran()       → Recent expenses
└── getPengeluaranByMonth(month, year) → Monthly filtered
```

---

## Module 6: Laporan Keuangan

**Route:** `/admin/laporan`
**Files:**
```
admin/laporan/
├── page.tsx
└── _components/
    ├── report-filters.tsx        # Filter bar with date range
    ├── report-table.tsx          # Detailed transaction table
    └── report-summary.tsx        # Summary cards (total in/out/balance)
```

### Filter Bar

```
┌──────────────────────────────────────────────────────────────────┐
│  Bulan Awal: [Select]  Bulan Akhir: [Select]  Tahun: [Select]  │
│  [Filter]  [Cetak PDF]  [Export Excel]                           │
└──────────────────────────────────────────────────────────────────┘
```

### Summary Cards

After filtering, show 3 summary cards:
- **Total Pemasukan:** Sum of all `masuk` in the period
- **Total Pengeluaran:** Sum of all `keluar` in the period
- **Saldo Akhir:** Pemasukan - Pengeluaran

### Report Table

| # | Tanggal    | Uraian / Keterangan              | Pemasukan (Rp) | Pengeluaran (Rp) | Saldo (Rp) | Petugas |
|---|------------|----------------------------------|----------------|-------------------|------------|---------|
| 1 | 05/01/2026 | Iuran Keamanan - Bpk Ahmad       | 25.000         | -                 | 25.000     | Budi    |
| 2 | 05/01/2026 | Bayar gaji satpam                | -              | 500.000           | -475.000   | Budi    |

Running balance (saldo) is calculated row by row.

### PDF Export

- Triggered by "Cetak PDF" button
- Calls `/api/laporan/pdf?bulanAwal=1&bulanAkhir=3&tahun=2026`
- Server-side PDF generation with `@react-pdf/renderer`
- Returns downloadable PDF file
- See [06-shared-services.md](./06-shared-services.md) for PDF implementation details

### Excel Export

- Triggered by "Export Excel" button
- Uses `exceljs` to generate `.xlsx` file
- Same data as the table view
- See [06-shared-services.md](./06-shared-services.md) for Excel implementation details

### Server Actions / API

```
src/server/actions/laporan.ts
├── getRekapKas(bulanAwal, bulanAkhir, tahun)  → Filtered transactions + aggregates
└── getSaldoAwal(bulanAwal, tahun)             → Opening balance before the period

src/app/api/laporan/pdf/route.ts               → PDF generation endpoint
src/app/api/laporan/excel/route.ts             → Excel generation endpoint (optional)
```

---

## Module 7: Log Aktivitas (Audit Trail)

**Route:** `/admin/log-aktivitas`
**Files:**
```
admin/log-aktivitas/
├── page.tsx
└── _components/
    ├── log-filters.tsx
    ├── log-table.tsx
    └── columns.tsx
```

### Filter Bar

```
┌────────────────────────────────────────────────────────────────────────┐
│  Tanggal Mulai: [Date]  s/d  Tanggal Akhir: [Date]                    │
│  Petugas: [Select - all admins]  Modul: [Select - all modules]         │
│  [Cari/Filter]  [Export Log (Excel/PDF)]                               │
└────────────────────────────────────────────────────────────────────────┘
```

### Log Table

Sorted by `waktu_log` DESC (newest first):

| # | Waktu (Tgl & Jam)       | Petugas    | Modul       | Aksi   | Deskripsi Detail                                       |
|---|-------------------------|------------|-------------|--------|--------------------------------------------------------|
| 1 | 12-04-2026 14:30:05     | Bpk. Budi  | Kas Masuk   | Tambah | Mencatat iuran keamanan Rp 25.000 untuk Bpk. Ahmad    |
| 2 | 12-04-2026 14:25:12     | Bpk. Budi  | Data Warga  | Edit   | Mengubah data nomor telepon warga an. Ibu Siti         |
| 3 | 12-04-2026 08:00:01     | Bpk. Budi  | Login       | Login  | Login berhasil dari IP 192.168.1.100                   |

### Modul Filter Options

- Semua Aktivitas
- Data Warga
- Kategori Kas
- Kas Masuk
- Kas Keluar
- Login/Logout

### Aksi Filter Options

- Semua Aksi
- Tambah
- Edit
- Hapus
- Login
- Logout

### Export

- Excel export using `exceljs` (same columns as the table)
- See [06-shared-services.md](./06-shared-services.md)

### Server Actions

```
src/server/actions/log-aktivitas.ts
├── getLogList(filters)        → Paginated, filtered log entries
├── getAdminList()             → Dropdown data for petugas filter
└── exportLogToExcel(filters)  → Generate Excel file
```

---

## Shared Patterns Across All Admin Modules

### Loading States

Each page should use a `loading.tsx` with skeleton cards/tables:

```tsx
// admin/warga/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
```

### Error Handling

Each route group should have an `error.tsx`:

```tsx
// admin/error.tsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-lg font-semibold">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset}>Coba Lagi</button>
    </div>
  );
}
```

### Toast Notifications

Use `sonner` (already installed) for success/error feedback:

```tsx
import { toast } from "sonner";

// After successful action
toast.success("Data warga berhasil disimpan");

// After error
toast.error("Gagal menyimpan data. Silakan coba lagi.");
```

### Currency Formatting

```ts
// src/lib/utils.ts (add to existing)
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
```

### Audit Trail Helper

Every mutation (create/update/delete) should call this helper:

```ts
// src/server/actions/audit.ts
export async function logActivity(data: {
  userId: string;
  modul: string;
  aksi: "tambah" | "edit" | "hapus" | "login" | "logout";
  keterangan: string;
}) {
  await db.insert(logAktivitas).values({
    userId: data.userId,
    modul: data.modul,
    aksi: data.aksi,
    keterangan: data.keterangan,
  });
}
```
