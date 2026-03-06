# Improvement Phase 1 Report — Critical Security Fixes

**Tanggal:** 6 Maret 2026  
**Fase:** 1 dari 4  
**Kategori:** Critical & Blocking Security  
**Build status:** PASS  
**Lint status:** 11 warnings (semua pre-existing, tidak ada regresi)

---

## Perubahan yang Dilakukan

### 1.1 Fix IDOR pada Endpoint Warga (C-2) ✅

**Masalah:** 4 server actions warga menerima `wargaId`/`transaksiId` sebagai parameter dari client, tanpa memverifikasi bahwa parameter tersebut milik session user yang aktif. Ini memungkinkan user A membaca data keuangan user B.

**Solusi:**
- Menambahkan `requireWarga()` helper di `src/lib/auth-helpers.ts` yang membaca `wargaId` dari session secara langsung
- Mengubah signature semua fungsi warga agar tidak menerima `wargaId` sebagai parameter eksternal
- Untuk `getKuitansiDetail`: tetap menerima `transaksiId` (karena butuh lookup), tapi menambahkan ownership check (`row.wargaId !== wargaId`)

**File diubah:**
- `src/lib/auth-helpers.ts` — Tambah `requireWarga()` helper
- `src/server/actions/warga-dashboard.ts` — `getBillingStatus(month, year)` (hapus param `wargaId`)
- `src/server/actions/warga-riwayat.ts` — `getPaymentGrid(tahun)`, `getAvailableYears()` (hapus param `wargaId`); `getKuitansiDetail(transaksiId)` tambah ownership check
- `src/app/(dashboard)/warga/dashboard/page.tsx` — Sesuaikan pemanggilan
- `src/app/(dashboard)/warga/riwayat/page.tsx` — Sesuaikan pemanggilan + hapus `wargaId` prop
- `src/app/(dashboard)/warga/riwayat/_components/riwayat-shell.tsx` — Hapus prop `wargaId`, sesuaikan `getPaymentGrid(year)`

**Catatan:** `getWargaProfile()` sudah aman (session-based). `getKasBalance()` aman (data publik RT).

---

### 1.2 Disable Open Registration (H-3) ✅

**Masalah:** `emailAndPassword: { enabled: true }` tanpa `disableSignUp` memungkinkan siapapun membuat akun.

**Solusi:** Tambah `disableSignUp: true` di `src/lib/auth.ts`.

**File diubah:**
- `src/lib/auth.ts` — Tambah `disableSignUp: true`

---

### 1.3 Tambah Auth Guard ke Unguarded Actions (H-4, H-5, M-5) ✅

**Masalah:** 7 server action dapat dipanggil tanpa autentikasi.

**Solusi:**
- `logActivity()` di `audit.ts`: hapus `"use server"` directive sehingga tidak bisa dipanggil langsung dari client. Fungsi ini hanya dipakai secara internal oleh server actions lain.
- 5 aggregation functions: tambah `await requireAdmin()` di awal
- `getDashboardStats()`: tambah `await requireAdmin()` eksplisit

**File diubah:**
- `src/server/actions/audit.ts` — Hapus `"use server"`, jadikan internal module
- `src/server/actions/warga.ts` — `getTotalWarga()` tambah `requireAdmin()`
- `src/server/actions/kas-masuk.ts` — `getTotalPemasukanBulanIni()` tambah `requireAdmin()`
- `src/server/actions/kas-keluar.ts` — `getTotalPengeluaranBulanIni()` tambah `requireAdmin()`
- `src/server/actions/laporan.ts` — `getSaldoKas()` tambah `requireAdmin()`
- `src/server/actions/log-aktivitas.ts` — `getRecentActivity()` tambah `requireAdmin()`
- `src/server/actions/dashboard.ts` — `getDashboardStats()` tambah `requireAdmin()`, tambah import `requireAdmin`

---

### 1.4 Seed Password dari Env Variable (C-3) ✅

**Masalah:** Password "admin123" hardcoded di seed script dan diprint ke stdout.

**Solusi:**
- Baca password dari `SEED_ADMIN_PASSWORD` environment variable
- Fallback ke "admin123" hanya jika env var tidak di-set
- Tampilkan warning jika menggunakan default password
- Hapus print password dari log output

**File diubah:**
- `src/db/seed.ts` — Baca `process.env.SEED_ADMIN_PASSWORD`, tambah warning, hapus password dari log

---

### 1.5 Verifikasi `.env.local` di `.gitignore` (C-1) ✅

**Temuan:** `.gitignore` sudah mengandung `.env*.local` di baris 30 — file credentials tidak akan ter-commit. Tidak ada perubahan diperlukan.

---

## Ringkasan

| Item | Status | File |
|------|--------|------|
| IDOR fix — `requireWarga()` helper | ✅ Done | `auth-helpers.ts` |
| IDOR fix — `getBillingStatus` | ✅ Done | `warga-dashboard.ts` |
| IDOR fix — `getPaymentGrid`, `getAvailableYears` | ✅ Done | `warga-riwayat.ts` |
| IDOR fix — `getKuitansiDetail` ownership check | ✅ Done | `warga-riwayat.ts` |
| Disable open registration | ✅ Done | `auth.ts` |
| `logActivity` — hapus server action exposure | ✅ Done | `audit.ts` |
| Auth guard — `getTotalWarga` | ✅ Done | `warga.ts` |
| Auth guard — `getTotalPemasukanBulanIni` | ✅ Done | `kas-masuk.ts` |
| Auth guard — `getTotalPengeluaranBulanIni` | ✅ Done | `kas-keluar.ts` |
| Auth guard — `getSaldoKas` | ✅ Done | `laporan.ts` |
| Auth guard — `getRecentActivity` | ✅ Done | `log-aktivitas.ts` |
| Auth guard — `getDashboardStats` | ✅ Done | `dashboard.ts` |
| Seed password dari env | ✅ Done | `seed.ts` |
| `.env.local` di gitignore | ✅ Already done | `.gitignore` |

**Build:** PASS (19 routes)  
**Lint:** 11 warnings (pre-existing, tidak ada regresi)
