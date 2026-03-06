# Laporan Audit Proyek — Sistem Manajemen Keuangan RT

**Tanggal:** 6 Maret 2026  
**Cakupan:** Database schema, auth & routing, admin features, warga features, keamanan (security)

---

## Ringkasan Eksekutif

Proyek telah menyelesaikan 5 fase implementasi. Audit menunjukkan **arsitektur dan fitur inti sudah solid** — mayoritas komponen sesuai plan. Namun ditemukan **3 temuan kritikal**, **6 temuan high**, **6 medium**, dan **4 low** yang perlu ditangani sebelum production deployment.

Temuan paling serius: **IDOR (Insecure Direct Object Reference)** pada endpoint warga yang memungkinkan user melihat data keuangan warga lain.

---

## 1. Audit Database Schema

**Hasil: SESUAI PLAN — 3 deviasi kosmetik saja**

Semua 8 tabel sudah ada dan strukturnya sesuai plan docs (`00-overview.md` s.d. `08-implementation-roadmap.md`):

| Tabel | Status |
|-------|--------|
| `user`, `session`, `account`, `verification` | ✅ Match (Better Auth) |
| `warga` | ✅ Match |
| `kategori_kas` | ✅ Match |
| `transaksi` | ✅ Match |
| `log_aktivitas` | ✅ Match |

**Deviasi kosmetik (tidak berdampak fungsional):**
1. `transaksi.nominal` menggunakan `integer` (plan menyebut `decimal/numeric`) — cukup untuk skala RT
2. `log_aktivitas.modul` menggunakan `varchar(50)` (plan: `varchar(30)`) — lebih fleksibel
3. Beberapa kolom timestamp default menggunakan `sql\`now()\`` vs `new Date()` — hasil sama

---

## 2. Audit Auth & Routing

**Hasil: 28 MATCH, 1 DEVIASI, 1 MISSING**

### Route Structure
Semua route sesuai plan:
- `(auth)/login` — Public login page
- `(dashboard)/admin/*` — 7 admin sub-routes (dashboard, warga, kategori-kas, kas-masuk, kas-keluar, laporan, log-aktivitas)
- `(dashboard)/warga/*` — 2 warga sub-routes (dashboard, riwayat)
- API routes: `/api/auth/[...all]`, `/api/laporan/pdf`, `/api/laporan/excel`

### Auth Config
- Better Auth dengan username plugin (phone = username) ✅
- Admin plugin dengan `defaultRole: "user"` ✅
- Custom `wargaId` field pada user ✅
- Middleware memeriksa session cookie ✅

### Deviasi
- **Warga layout** menerima role `admin` DAN `user` — ini intentional agar admin bisa preview tampilan warga

### Missing
- **`requireWarga()` helper** di `auth-helpers.ts` — dibutuhkan untuk validasi ownership di endpoint warga

---

## 3. Audit Admin Features

**Hasil: 52 MATCH, 5 DEVIASI, 7 MISSING, 6 EXTRA**

### Deviasi
| # | Item | Plan | Aktual |
|---|------|------|--------|
| 1 | Dashboard recent items | 5 item | 8 item |
| 2 | Kas Masuk — pilih warga | Combobox (searchable) | Select biasa |
| 3 | `getTagihanWarga` | Digunakan | Didefinisikan tapi tidak dipanggil |
| 4 | Kas Keluar scope | Semua data | 30 hari terakhir |
| 5 | Loading state | Per-modul | 1 shared `loading.tsx` |

### Missing
| # | Item | Lokasi yang diharapkan |
|---|------|----------------------|
| 1 | `getSaldoAwal` server action | `src/server/actions/laporan.ts` |
| 2 | `getAdminList` server action | `src/server/actions/log-aktivitas.ts` |
| 3 | Filter petugas di Log Aktivitas | `log-filters.tsx` |
| 4 | Kolom petugas di tabel Log Aktivitas | `log-table.tsx` |
| 5 | Export Log Aktivitas (PDF/Excel) | `log-aktivitas/` route |
| 6 | Zod schema untuk filter Laporan | `src/lib/validations/` |
| 7 | Opsi "Laporan" di filter modul Log Aktivitas | `log-filters.tsx` |

### Extra (bonus features, tidak di plan)
1. WhatsApp link generator di data warga
2. Format Rupiah helper yang komprehensif
3. Toast notifications untuk semua mutations
4. Responsive mobile layout untuk semua tabel
5. Kuitansi PDF untuk warga
6. Payment grid (kalender bayar) untuk warga

---

## 4. Audit Warga Features

**Hasil: Mayoritas match**

- Dashboard warga: Billing status, ringkasan pembayaran ✅
- Riwayat pembayaran: Grid view, detail kuitansi ✅
- Layout single-column mobile-first ✅
- Profile resolution via `wargaId` + phone fallback ✅

**Tidak dibangun (opsional per plan):** Modul Transparansi Keuangan RT

---

## 5. Audit Keamanan (Security)

### CRITICAL (3 temuan)

#### C-1: Kredensial Live di `.env.local`
- **File:** `.env.local`
- **Risiko:** Jika repository bocor, database production terekspos
- **Rekomendasi:** Gunakan `.env.example` tanpa nilai asli; rotasi kredensial

#### C-2: IDOR pada Endpoint Warga
- **File:** `src/server/actions/warga-dashboard.ts`, `src/server/actions/warga-riwayat.ts`
- **Fungsi terdampak:** `getBillingStatus`, `getPaymentGrid`, `getAvailableYears`, `getKuitansiDetail`
- **Risiko:** User bisa mengakses data keuangan warga lain dengan mengubah parameter `wargaId`/`transaksiId`
- **Rekomendasi:** Validasi bahwa `session.user.wargaId === requestedWargaId` di setiap fungsi; buat `requireWarga()` helper

#### C-3: Password Seed Hardcoded
- **File:** `src/db/seed.ts`
- **Risiko:** Password "admin123" diketahui publik jika seed dijalankan di production
- **Rekomendasi:** Gunakan environment variable untuk seed password; tambahkan warning bahwa seed hanya untuk development

---

### HIGH (6 temuan)

#### H-1: Tidak Ada Password Policy
- **File:** `src/lib/auth.ts`
- **Risiko:** User bisa menggunakan password lemah
- **Rekomendasi:** Konfigurasi `password.minLength`, `password.maxLength` di Better Auth

#### H-2: Tidak Ada Rate Limiting
- **Risiko:** Brute force login, abuse API
- **Rekomendasi:** Tambahkan `rateLimit` config di Better Auth; pertimbangkan middleware rate limiting

#### H-3: Open Registration Aktif
- **File:** `src/lib/auth.ts`
- **Detail:** `emailAndPassword: { enabled: true }` tanpa `disableSignUp: true`
- **Risiko:** Siapapun bisa membuat akun
- **Rekomendasi:** Tambahkan `disableSignUp: true` — registrasi hanya melalui admin

#### H-4: `logActivity()` Tanpa Auth Guard
- **File:** `src/server/actions/audit.ts`
- **Risiko:** Fungsi bisa dipanggil tanpa autentikasi, memungkinkan log injection
- **Rekomendasi:** Tambahkan `requireAdmin()` atau jadikan fungsi internal (bukan server action yang bisa dipanggil client)

#### H-5: 5 Server Actions Tanpa Auth Guard
- **Fungsi:** `getTotalWarga`, `getTotalPemasukanBulanIni`, `getTotalPengeluaranBulanIni`, `getSaldoKas`, `getRecentActivity`
- **Risiko:** Data agregat bisa diakses tanpa login
- **Rekomendasi:** Tambahkan `requireAdmin()` di setiap fungsi

#### H-6: Middleware Hanya Cek Cookie Existence
- **File:** `src/middleware.ts`
- **Risiko:** Cookie palsu/expired bisa melewati middleware
- **Rekomendasi:** Validasi session via Better Auth API di middleware

---

### MEDIUM (6 temuan)

| # | Temuan | File | Rekomendasi |
|---|--------|------|-------------|
| M-1 | Tidak ada re-validasi Zod server-side di mutation actions | Server action files | Tambahkan `.parse()` sebelum DB operations |
| M-2 | ILIKE wildcard chars tidak di-escape | Search functions | Escape `%`, `_`, `\` di input |
| M-3 | Cookie cache 5 menit menunda session revocation | `auth-helpers.ts` | Turunkan ke 1-2 menit atau hapus cache |
| M-4 | Tidak ada bounds checking di parameter laporan | API route `/api/laporan/*` | Validasi `bulanAwal`, `bulanAkhir`, `tahun` |
| M-5 | `getDashboardStats()` tanpa auth guard | `dashboard.ts` | Tambahkan `requireAdmin()` |
| M-6 | Tidak ada max value di field nominal | Validation schemas | Tambahkan `.max()` di Zod schema |

---

### LOW (4 temuan)

| # | Temuan | File | Rekomendasi |
|---|--------|------|-------------|
| L-1 | Phone fallback lookup bisa mismatch | `warga-dashboard.ts` | Prioritaskan `wargaId`, log warning jika fallback |
| L-2 | NaN possible di Content-Disposition filename | API route export | Sanitize filename params |
| L-3 | Error messages reveal entity types | Server actions | Gunakan pesan generik |
| L-4 | `deleteWarga` tidak cek transaksi terkait | `warga.ts` | Cek foreign key sebelum delete, atau soft-delete |

---

## 6. Deployment Audit

- `Dockerfile` memiliki unused `deps` stage (minor waste) — bisa dihapus
- `docker-compose.yml` dan `.env.example` tersedia ✅
- `next.config.mjs` dengan `output: "standalone"` ✅
- Vercel deployment ready ✅

---

## Kesimpulan

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3 | ⛔ Harus diperbaiki sebelum production |
| High | 6 | ⚠️ Harus diperbaiki sebelum production |
| Medium | 6 | 📋 Sebaiknya diperbaiki |
| Low | 4 | 📝 Nice to have |
| Missing Features | 7 | 📦 Perlu diimplementasi |

**Rekomendasi:** Eksekusi perbaikan dalam 4 fase bertahap. Lihat `docs/improvement-plan.md` untuk detail.
