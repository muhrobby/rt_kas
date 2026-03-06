# Changelog — Sistem Manajemen Keuangan RT

Dokumen ini merangkum seluruh perubahan yang pernah dilakukan pada proyek ini, diurutkan dari yang terbaru ke yang paling awal.

---

## [f03d0bc] feat: refactor e-kuitansi into professional invoice with real PDF download
**Tanggal:** 2026-03-06

### Ringkasan
Mengganti tampilan E-Kuitansi dari `window.print()` menjadi **invoice profesional** dengan kemampuan unduh file PDF nyata menggunakan `@react-pdf/renderer`. Sekaligus memperbaiki bug total = 0 pada pembayaran sekali bayar.

### File yang Diubah / Ditambah

| File | Perubahan |
|---|---|
| `src/lib/pdf/kuitansi-template.tsx` | **BARU** — Komponen PDF A5 portrait: header org (biru) + badge LUNAS, tabel item, summary box dengan strip total biru, note box keterangan, dan footer timestamp cetak. Mendukung mode `bulanan` (qty = jumlah bulan) dan `sekali` (qty = 1). |
| `src/app/api/kuitansi/pdf/route.ts` | **BARU** — GET `/api/kuitansi/pdf`: menerima parameter via query string, render PDF via `renderToBuffer`, return `Response` dengan `Content-Type: application/pdf` dan `Content-Disposition: attachment`. |
| `src/app/(dashboard)/admin/kas-masuk/_components/e-kuitansi-dialog.tsx` | **DIREFACTOR** — Interface `EKuitansiData` diperluas dengan `totalDibayar: number` dan `keterangan?: string | null`. Preview dialog diperbarui agar konsisten secara visual dengan PDF. Tombol unduh menggantikan `window.print()`: fetch ke API → `URL.createObjectURL` → auto-download. |
| `src/app/(dashboard)/admin/kas-masuk/page.tsx` | Tambah `totalDibayar` ke tipe state `kuitansi`. Di `handleSuccess`: hitung `totalDibayar = nominal * bulanTagihan.length` untuk bulanan, atau `totalDibayar = nominal` untuk sekali bayar. |

### Bug yang Diperbaiki
- **Total = 0 untuk sekali bayar**: Sebelumnya dihitung `nominal * bulanTagihan.length` di dialog, dan untuk sekali bayar `bulanTagihan = []` sehingga hasilnya 0. Sekarang dihitung di `handleSuccess` di `page.tsx` dengan logika kondisional yang benar.

---

## [be4a799] feat: add tipeTagihan (bulanan/sekali) to kategori kas and conditional month selector in kas masuk form
**Tanggal:** 2026-03-06

### Ringkasan
Menambahkan konsep **tipe tagihan** pada kategori kas, membedakan antara iuran rutin bulanan dan pembayaran event/insidental sekali bayar. Form Kas Masuk kini menyesuaikan tampilan secara otomatis berdasarkan tipe kategori yang dipilih.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/lib/validations/kategori-kas.ts` | Tambah field `tipeTagihan: z.enum(["bulanan","sekali"]).default("bulanan")` ke schema Zod |
| `src/lib/validations/kas-masuk.ts` | Hapus `.min(1)` dari `bulanTagihan`; validasi minimum dilakukan kondisional di komponen |
| `src/server/actions/kategori-kas.ts` | `createKategori` dan `updateKategori` menyertakan `tipeTagihan` di `.values()` / `.set()` |
| `src/server/actions/kas-masuk.ts` | `createPembayaran` cabang baru untuk `isSekali`: insert satu transaksi dengan `bulanTagihan: null` dan `tahunTagihan: null` |
| `src/app/(dashboard)/admin/kategori-kas/_components/columns.tsx` | Tambah `tipeTagihan` ke interface `KategoriRow`; tambah kolom "Tipe Tagihan" dengan Badge |
| `src/app/(dashboard)/admin/kategori-kas/_components/kategori-form.tsx` | Tambah Select field "Tipe Tagihan"; `form.reset()` menyertakan `tipeTagihan` |
| `src/components/quick-add-kategori-dialog.tsx` | Tambah Select "Tipe Tagihan" (hanya tampil untuk `jenisArus="masuk"`); interface `onCreated` diperluas dengan `tipeTagihan` |
| `src/app/(dashboard)/admin/kas-masuk/_components/payment-form.tsx` | Deteksi `tipeTagihan` dari kategori terpilih; untuk `sekali` — sembunyikan year selector dan MonthSelector; validasi manual "pilih minimal satu bulan" untuk `bulanan` |

### Catatan Teknis
- Kolom `tipe_tagihan` di database sudah di-migrate via raw SQL incremental (enum + ALTER TABLE) sebelum commit ini.
- Schema Drizzle `src/db/schema/kategori-kas.ts` sudah diperbarui di sesi sebelumnya.

---

## [d010c77] feat: add QuickAddKategoriDialog for single-journey category creation in kas masuk/keluar
**Tanggal:** 2026-03-06

### Ringkasan
Menambahkan komponen dialog reusable untuk membuat kategori baru langsung dari dalam form Kas Masuk dan Kas Keluar, tanpa harus berpindah ke halaman Kategori Kas.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/components/quick-add-kategori-dialog.tsx` | Komponen baru: Dialog dengan field nama + nominalDefault; memanggil `createKategori` server action |
| `src/app/(dashboard)/admin/kas-masuk/_components/payment-form.tsx` | Tambah tombol `+ Kategori Baru` di label "Kategori Iuran"; kategori baru langsung masuk dropdown dan auto-terpilih |
| `src/app/(dashboard)/admin/kas-keluar/_components/expense-form.tsx` | Tambah tombol `+ Kategori Baru` di label "Kategori Pengeluaran"; pola yang sama |

---

## [b97d9a9] fix: pass getRowId to tunggakan DataTable (row has wargaId not id)
**Tanggal:** 2026-03-06

### Ringkasan
Perbaikan bug pada tabel Tunggakan: baris tidak punya field `id` (hanya `wargaId`), sehingga perlu meneruskan `getRowId` secara eksplisit ke DataTable.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/app/(dashboard)/admin/tunggakan/_components/tunggakan-table.tsx` | Tambah `getRowId: (row) => String(row.wargaId)` ke props DataTable |

---

## [8936c59] feat: convert kas masuk/keluar forms to modal dialogs and add tunggakan page
**Tanggal:** 2026-03-06

### Ringkasan
Refaktor besar pada layout halaman Kas Masuk dan Kas Keluar: form dipindahkan ke dalam Dialog modal sehingga history/tabel bisa tampil full-width. Ditambahkan halaman baru Tunggakan untuk memantau warga yang belum membayar.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/app/(dashboard)/admin/kas-masuk/page.tsx` | Form PaymentForm dipindah ke dalam Dialog; TodayHistory menjadi full-width |
| `src/app/(dashboard)/admin/kas-masuk/_components/payment-form.tsx` | Adaptasi untuk render di dalam Dialog |
| `src/app/(dashboard)/admin/kas-masuk/_components/today-history.tsx` | Layout diperbarui untuk full-width |
| `src/app/(dashboard)/admin/kas-keluar/page.tsx` | Form ExpenseForm dipindah ke dalam Dialog; RecentExpenses menjadi full-width |
| `src/app/(dashboard)/admin/kas-keluar/_components/expense-form.tsx` | Adaptasi untuk render di dalam Dialog |
| `src/app/(dashboard)/admin/kas-keluar/_components/recent-expenses.tsx` | Layout diperbarui untuk full-width |
| `src/app/(dashboard)/admin/tunggakan/page.tsx` | Halaman baru: filter tahun/bulan/kategori + DataTable warga belum bayar |
| `src/app/(dashboard)/admin/tunggakan/_components/tunggakan-filters.tsx` | Komponen filter tahun, bulan, dan kategori |
| `src/app/(dashboard)/admin/tunggakan/_components/tunggakan-table.tsx` | DataTable dengan kolom warga, blok, dan status bayar |
| `src/server/actions/tunggakan.ts` | Server action baru: `getTunggakan` (LEFT JOIN warga vs transaksi masuk, filter `isNull`) |
| `src/navigation/sidebar/sidebar-items.ts` | Tambah entri "Tunggakan" dengan ikon `AlertCircle` di grup Transaksi |
| `src/app/(dashboard)/admin/kategori-kas/page.tsx` | Perbaikan noArrayIndexKey warnings |
| `src/app/(dashboard)/admin/laporan/_components/report-table.tsx` | Refaktor layout |
| `src/app/(dashboard)/admin/log-aktivitas/_components/log-table.tsx` | Refaktor layout |
| `src/app/(dashboard)/admin/warga/page.tsx` | Refaktor layout |
| `next.config.mjs` | Penyesuaian konfigurasi |

---

## [d52b1ce] feat: prevent duplicate kas masuk and add searchable combobox dropdowns
**Tanggal:** 2026-03-06

### Ringkasan
Mencegah duplikasi data pembayaran dan meningkatkan UX form dengan mengganti dropdown Select menjadi Combobox yang bisa dicari. MonthSelector kini menampilkan bulan yang sudah dibayar dan menonaktifkannya.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/server/actions/kas-masuk.ts` | `createPembayaran`: cek existing records sebelum insert; lempar error deskriptif dengan daftar bulan duplikat. Tambah `getAlreadyPaidBulans`: server action baru untuk mengambil bulan yang sudah dibayar untuk kombinasi warga + kategori + tahun tertentu |
| `src/app/(dashboard)/admin/kas-masuk/_components/month-selector.tsx` | Terima prop `paidBulans`; bulan yang sudah dibayar ditampilkan dengan ikon centang hijau, di-disable, dan tidak bisa dipilih |
| `src/app/(dashboard)/admin/kas-masuk/_components/payment-form.tsx` | Ganti Select dengan Combobox (dengan search) untuk warga dan kategori; fetch paid months saat warga/kategori/tahun berubah; auto-deselect bulan yang konflik |
| `src/app/(dashboard)/admin/kas-keluar/_components/expense-form.tsx` | Ganti Select dengan Combobox (dengan search) untuk kategori |

---

## [a302165] chore: refactor seed to use direct Drizzle inserts and create warga accounts
**Tanggal:** 2026-03-06

### Ringkasan
Memperbaiki script seed yang sebelumnya gagal karena `auth.api.signUpEmail` diblokir oleh `disableSignUp`. Seed kini menggunakan Drizzle insert langsung dan membuat akun login untuk semua warga.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/db/seed.ts` | Ganti `auth.api.signUpEmail` dengan Drizzle insert + `better-auth/crypto` `hashPassword`/`generateId`; buat akun untuk 10 warga (username=noTelp, password=noTelp) |
| `src/db/truncate.ts` | File baru: helper script untuk truncate semua tabel sebelum re-seed |

---

## [d229163] feat: auto-create user account when adding warga
**Tanggal:** 2026-03-06

### Ringkasan
Saat admin menambahkan warga baru, akun login otomatis dibuat dengan username dan password sama dengan nomor telepon warga.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/server/actions/warga.ts` | `createWarga`: auto sign-up user (username=noTelp, password=noTelp), link `wargaId`, rollback warga jika gagal, return `defaultPassword`. `updateWarga`: sync username/email/name saat noTelp atau nama berubah. `deleteWarga`: hapus akun user terkait sebelum menghapus warga |
| `src/app/(dashboard)/admin/warga/_components/warga-form.tsx` | Tampilkan info kredensial di success toast (durasi 8 detik) |

---

## [493aac7] fix: remove baseURL from auth client to use same-origin requests
**Tanggal:** 2026-03-06

### Ringkasan
Menghapus `baseURL` yang di-hardcode dari auth client agar menggunakan same-origin requests, memperbaiki masalah autentikasi di lingkungan Codespaces.

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/lib/auth-client.ts` | Hapus properti `baseURL` |

---

## [52c18c3] fix: remove hardcoded baseURL fallback and rename middleware to proxy
**Tanggal:** 2026-03-06

### Ringkasan
Menghapus fallback `baseURL` yang di-hardcode dan mengganti nama `middleware.ts` menjadi `proxy.ts` sesuai konvensi Next.js 16 (export function harus bernama `proxy`).

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/lib/auth-client.ts` | Hapus fallback URL hardcode |
| `src/middleware.ts` → `src/proxy.ts` | Rename file; export function sekarang bernama `proxy` |
| `tsconfig.json` | Penyesuaian path dan konfigurasi compiler |

---

## [674fb12] fix: downgrade next to v15, update recharts to v3, fix chart types
**Tanggal:** 2026-03-06

### Ringkasan
Downgrade Next.js dari v16 ke v15 untuk stabilitas, upgrade Recharts ke v3, dan memperbaiki breaking changes pada tipe chart.

### File yang Diubah

| File | Perubahan |
|---|---|
| `package.json` | Downgrade `next` ke v15 |
| `package-lock.json` | Update lockfile |
| `src/components/ui/chart.tsx` | Perbaiki tipe yang breaking di Recharts v3 |

---

## [306e28a] fix: update all dependencies to latest and fix breaking changes
**Tanggal:** 2026-03-06

### Ringkasan
Update semua dependensi ke versi terbaru dan memperbaiki seluruh breaking changes yang diakibatkan, termasuk penambahan fitur export log aktivitas (Excel/PDF) dan filter log.

### File yang Diubah (utama)

| File | Perubahan |
|---|---|
| `package.json` / `package-lock.json` | Update semua dependensi |
| `src/app/(dashboard)/admin/log-aktivitas/page.tsx` | Tambah filter tanggal, modul, aksi |
| `src/app/(dashboard)/admin/log-aktivitas/_components/log-filters.tsx` | Komponen filter baru |
| `src/app/(dashboard)/admin/log-aktivitas/_components/columns.tsx` | Perbaiki tipe kolom |
| `src/app/api/log-aktivitas/excel/route.ts` | Route baru: export log ke Excel |
| `src/app/api/log-aktivitas/pdf/route.ts` | Route baru: export log ke PDF |
| `src/lib/pdf/log-aktivitas-template.tsx` | Template PDF log aktivitas |
| `src/lib/validations/laporan.ts` | Tambah schema validasi laporan |
| `src/app/(dashboard)/admin/dashboard/_components/monthly-chart.tsx` | Fix tipe Recharts |
| `src/components/ui/chart.tsx` | Fix breaking changes |
| `docs/reports/improvement-phase-2-report.md` | Report fase 2 ditambahkan |

---

## [b4dfd44] fix: add legacy-peer-deps to resolve zod v3/v4 conflict
**Tanggal:** 2026-03-06

### Ringkasan
Menambahkan `.npmrc` dengan `legacy-peer-deps=true` untuk mengatasi konflik peer dependency antara Zod v3 dan v4 yang digunakan oleh berbagai package.

### File yang Diubah

| File | Perubahan |
|---|---|
| `.npmrc` | Tambah `legacy-peer-deps=true` |

---

## [202b2f4] first commit
**Tanggal:** 2026-03-06

### Ringkasan
Commit awal proyek. Seluruh fondasi aplikasi admin dashboard RT dibangun dari awal, mencakup autentikasi, manajemen warga, kas masuk/keluar, kategori, laporan, log aktivitas, dan dashboard warga.

### Fitur yang Dibangun

#### Autentikasi & Otorisasi
- `better-auth` dengan role `admin` dan `warga`
- Login form di `/login`
- Proxy middleware untuk proteksi route
- `requireAdmin()` helper untuk server actions

#### Manajemen Warga (`/admin/warga`)
- CRUD warga (nama, blok rumah, nomor telepon, status aktif)
- DataTable dengan sorting, filter, pagination
- Dialog tambah/edit/hapus warga

#### Kas Masuk (`/admin/kas-masuk`)
- Form pembayaran dengan pilih warga, kategori, nominal, tahun, bulan
- MonthSelector untuk memilih beberapa bulan sekaligus
- E-Kuitansi dialog setelah pembayaran berhasil
- Riwayat transaksi hari ini

#### Kas Keluar (`/admin/kas-keluar`)
- Form pengeluaran dengan kategori, nominal, keterangan
- Riwayat pengeluaran terbaru

#### Kategori Kas (`/admin/kategori-kas`)
- CRUD kategori dengan jenis arus (masuk/keluar) dan nominal default
- DataTable dengan aksi edit/hapus

#### Laporan (`/admin/laporan`)
- Filter tanggal, jenis arus, kategori
- Tabel transaksi dengan summary
- Export ke Excel dan PDF

#### Log Aktivitas (`/admin/log-aktivitas`)
- Tabel semua aktivitas sistem dengan pagination
- Setiap server action mencatat log via `logActivity()`

#### Dashboard Admin (`/admin/dashboard`)
- Stat cards: total pemasukan, pengeluaran, saldo
- Monthly chart (bar chart Recharts)
- Recent activity feed

#### Dashboard Warga (`/warga/dashboard`)
- Greeting header dengan nama warga
- Billing status card (bulan yang sudah/belum dibayar)
- Kas balance card
- Quick actions

#### Riwayat Pembayaran Warga (`/warga/riwayat`)
- Filter per tahun
- Tabel riwayat pembayaran pribadi
- E-Kuitansi per transaksi

#### Infrastruktur
- Next.js App Router dengan route groups `(auth)`, `(dashboard)`
- Drizzle ORM + PostgreSQL (schema: `warga`, `transaksi`, `kategoriKas`, `user`, `session`, `account`, `logAktivitas`)
- Zustand store untuk preferences (tema, layout sidebar)
- Tema presets CSS (tangerine, brutalist, soft-pop) dengan generator script
- shadcn/ui komponen lengkap di `src/components/ui/`
- DataTable reusable (`src/components/data-table/`) dengan TanStack Table v8
- Docker + Docker Compose untuk deployment
- Biome untuk linting dan formatting
- Husky pre-commit hook: generate presets + lint-staged

---

*Dokumen ini di-generate secara manual dari git log. Update dokumen ini setiap kali ada commit baru yang signifikan.*
