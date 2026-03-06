# Improvement Plan — Sistem Manajemen Keuangan RT

**Tanggal:** 6 Maret 2026  
**Berdasarkan:** `docs/reports/audit-report.md`  
**Total item:** 26 perbaikan dalam 4 fase

---

## Fase 1 — Critical & Blocking Security Fixes

**Prioritas:** CRITICAL + sebagian HIGH  
**Estimasi:** Harus selesai sebelum deployment apapun

### 1.1 Fix IDOR pada Endpoint Warga (C-2)

**File yang diubah:**
- `src/lib/auth-helpers.ts` — Tambahkan `requireWarga()` helper
- `src/server/actions/warga-dashboard.ts` — Ganti parameter wargaId dengan session-based resolution + ownership check
- `src/server/actions/warga-riwayat.ts` — Sama, validasi ownership di `getPaymentGrid`, `getAvailableYears`, `getKuitansiDetail`

**Implementasi:**
```typescript
// auth-helpers.ts
export async function requireWarga(): Promise<{ session: Session; wargaId: number }> {
  const session = await requireAuth();
  const wargaId = session.user.wargaId;
  if (!wargaId) throw new Error("Akun tidak terhubung dengan data warga");
  return { session, wargaId };
}
```

Semua warga server actions harus memanggil `requireWarga()` dan menggunakan `wargaId` dari session, **bukan** dari parameter client.

### 1.2 Disable Open Registration (H-3)

**File:** `src/lib/auth.ts`

```typescript
emailAndPassword: {
  enabled: true,
  disableSignUp: true, // <-- tambahkan
}
```

### 1.3 Tambahkan Auth Guard ke Unguarded Actions (H-4, H-5, M-5)

**File yang diubah:**
- `src/server/actions/audit.ts` — Hapus `"use server"` dari `logActivity()` atau tambahkan auth guard. Karena `logActivity()` dipanggil internal oleh server actions lain, sebaiknya jadikan fungsi biasa (bukan server action).
- `src/server/actions/warga.ts` — Tambahkan `requireAdmin()` ke `getTotalWarga`
- `src/server/actions/kas-masuk.ts` — Tambahkan `requireAdmin()` ke `getTotalPemasukanBulanIni`
- `src/server/actions/kas-keluar.ts` — Tambahkan `requireAdmin()` ke `getTotalPengeluaranBulanIni`
- `src/server/actions/laporan.ts` — Tambahkan `requireAdmin()` ke `getSaldoKas`
- `src/server/actions/log-aktivitas.ts` — Tambahkan `requireAdmin()` ke `getRecentActivity`
- `src/server/actions/dashboard.ts` — Tambahkan `requireAdmin()` ke `getDashboardStats`

### 1.4 Env Security (C-1, C-3)

- **C-1:** Tambahkan `.env.local` ke `.gitignore` (kemungkinan sudah ada — verifikasi)
- **C-3:** Ubah seed.ts agar membaca password dari env variable `SEED_ADMIN_PASSWORD` dengan fallback ke "admin123" hanya di NODE_ENV=development

**Validasi Fase 1:** `npm run build` + `npm run check:fix` harus pass

---

## Fase 2 — High Security Hardening

**Prioritas:** HIGH + sebagian MEDIUM

### 2.1 Password Policy (H-1)

**File:** `src/lib/auth.ts`

```typescript
emailAndPassword: {
  enabled: true,
  disableSignUp: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
}
```

### 2.2 Rate Limiting (H-2)

**File:** `src/lib/auth.ts`

Better Auth mendukung rate limiting bawaan. Tambahkan:
```typescript
rateLimit: {
  window: 60,    // 60 detik
  max: 10,       // max 10 request per window
}
```

### 2.3 Server-Side Zod Re-validation (M-1)

**File yang diubah:**
- `src/server/actions/warga.ts` — Parse input dengan `wargaSchema`
- `src/server/actions/kategori-kas.ts` — Parse input dengan `kategoriKasSchema`
- `src/server/actions/kas-masuk.ts` — Parse input dengan `kasMasukSchema`
- `src/server/actions/kas-keluar.ts` — Parse input dengan `kasKeluarSchema`

Pattern:
```typescript
export async function createWarga(rawData: WargaFormData) {
  await requireAdmin();
  const data = wargaSchema.parse(rawData); // server-side validation
  // ... proceed with DB operation
}
```

### 2.4 Middleware Enhancement (H-6)

**File:** `src/middleware.ts`

Opsi: Ganti pengecekan cookie sederhana dengan validasi via Better Auth `getSession` API. Catatan: perlu pertimbangkan performance karena dipanggil setiap request.

Pendekatan pragmatis: Middleware tetap cek cookie, tapi server actions sudah di-guard individual (dari Fase 1). Ini memberikan defense-in-depth.

**Keputusan:** Tambahkan header-based session validation di middleware untuk protected routes, dengan fallback redirect ke login jika invalid.

**Validasi Fase 2:** `npm run build` + `npm run check:fix` harus pass

---

## Fase 3 — Missing Features

**Prioritas:** MEDIUM — Fitur yang ada di plan tapi belum diimplementasi

### 3.1 `requireWarga()` Helper
*(Sudah ditangani di Fase 1.1)*

### 3.2 `getSaldoAwal` Server Action

**File:** `src/server/actions/laporan.ts`

Implementasi: Query saldo kas per tanggal awal periode laporan — sum semua transaksi sebelum `bulanAwal/tahun`.

### 3.3 `getAdminList` Server Action

**File:** `src/server/actions/log-aktivitas.ts`

Implementasi: Query distinct admin users dari tabel `user` WHERE role = 'admin'. Digunakan untuk dropdown filter petugas.

### 3.4 Filter Petugas di Log Aktivitas

**File:** `src/app/(dashboard)/admin/log-aktivitas/_components/log-filters.tsx`

Tambahkan Select/Combobox untuk filter berdasarkan petugas (admin yang melakukan aksi).

### 3.5 Kolom Petugas di Tabel Log Aktivitas

**File:** `src/app/(dashboard)/admin/log-aktivitas/_components/log-table.tsx`

Tambahkan kolom "Petugas" yang menampilkan nama admin.

### 3.6 Export Log Aktivitas

Tambahkan tombol export PDF dan Excel di halaman Log Aktivitas, mirip dengan yang sudah ada di Laporan.

### 3.7 Zod Schema untuk Filter Laporan

**File:** `src/lib/validations/` — Buat `laporan.ts` dengan schema validasi untuk `bulanAwal`, `bulanAkhir`, `tahun`.

### 3.8 Opsi "Laporan" di Filter Modul Log Aktivitas

**File:** `src/app/(dashboard)/admin/log-aktivitas/_components/log-filters.tsx`

Tambahkan "Laporan" ke daftar opsi modul.

**Validasi Fase 3:** `npm run build` + `npm run check:fix` harus pass

---

## Fase 4 — Medium/Low Polish & Hardening

**Prioritas:** LOW — Quality of life improvements

### 4.1 ILIKE Wildcard Escaping (M-2)

**File:** Semua server actions yang menggunakan `ilike()` untuk search

```typescript
function escapeIlike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}
```

### 4.2 Report Parameter Bounds Checking (M-4)

**File:** `src/app/api/laporan/pdf/route.ts`, `src/app/api/laporan/excel/route.ts`

Validasi: `bulanAwal` 1-12, `bulanAkhir` 1-12, `bulanAwal <= bulanAkhir`, `tahun` 2020-2100.

### 4.3 Nominal Max Value (M-6)

**File:** `src/lib/validations/kas-masuk.ts`, `src/lib/validations/kas-keluar.ts`

Tambahkan `.max(999_999_999)` pada field nominal.

### 4.4 `deleteWarga` — Cek Transaksi Terkait (L-4)

**File:** `src/server/actions/warga.ts`

Sebelum delete, cek apakah ada transaksi terkait. Jika ada, return error "Warga memiliki N transaksi, tidak bisa dihapus."

### 4.5 Content-Disposition Filename Sanitization (L-2)

**File:** API route export files

Sanitize parameter yang dimasukkan ke filename header.

### 4.6 Cookie Cache Tuning (M-3)

**File:** `src/lib/auth-helpers.ts`

Turunkan cache duration dari 5 menit ke 2 menit.

### 4.7 Kas Masuk — Combobox untuk Warga (Deviasi)

**File:** `src/app/(dashboard)/admin/kas-masuk/_components/payment-form.tsx`

Ganti `<Select>` dengan Combobox yang searchable (sesuai plan).

### 4.8 Dashboard Recent Items Count (Deviasi)

**File:** `src/server/actions/dashboard.ts` atau terkait

Ubah dari 8 ke 5 item sesuai plan, atau dokumentasikan sebagai intentional deviation.

### 4.9 Kas Keluar Scope (Deviasi)

Evaluasi apakah scope 30 hari sudah cukup atau perlu pagination semua data.

**Validasi Fase 4:** `npm run build` + `npm run check:fix` harus pass

---

## Urutan Eksekusi

```
Fase 1 (Critical)  →  Build + Lint  →  Report
       ↓
Fase 2 (High)      →  Build + Lint  →  Report
       ↓
Fase 3 (Features)  →  Build + Lint  →  Report
       ↓
Fase 4 (Polish)    →  Build + Lint  →  Report
```

Setiap fase menghasilkan laporan di `docs/reports/improvement-phase-{N}-report.md`.
