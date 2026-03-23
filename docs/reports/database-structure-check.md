# Database Structure Check (Project Consistency)

Dokumen ini merangkum pengecekan struktur project terhadap relasi database agar implementasi tetap konsisten.

## 1) Ringkasan Struktur yang Dicek

- Drizzle config: `drizzle.config.ts` (`schema: ./src/db/schema/index.ts`)
- Schema source:
  - `src/db/schema/auth.ts`
  - `src/db/schema/warga.ts`
  - `src/db/schema/kategori-kas.ts`
  - `src/db/schema/transaksi.ts`
  - `src/db/schema/log-aktivitas.ts`
  - `src/db/schema/relations.ts`
- Runtime usage (server action):
  - `src/server/actions/warga.ts`
  - `src/server/actions/kas-masuk.ts`
  - `src/server/actions/kas-keluar.ts`
  - `src/server/actions/kategori-kas.ts`
  - `src/server/actions/log-aktivitas.ts`
  - `src/server/actions/warga-riwayat.ts`
  - `src/server/actions/warga-dashboard.ts`

## 2) Temuan Konsistensi Relasi

### Sudah konsisten

- `transaksi.kategori_id -> kategori_kas.id` dipakai konsisten di fitur kas masuk/keluar.
- `transaksi.warga_id -> warga.id` dipakai konsisten untuk histori warga, dan memang nullable untuk kas keluar.
- `user.warga_id` dipakai untuk lookup profil warga (`warga-dashboard`, `warga`).

### Titik rawan inkonsistensi (sebelum hardening SQL)

- `user.warga_id` belum dijaga kuat sebagai relasi 1:1 di level database (perlu `UNIQUE + FK`).
- `transaksi.user_id` dan `log_aktivitas.user_id` di kode diasumsikan menunjuk ke `user.id`, tapi perlu FK eksplisit agar tidak orphan.
- Transaksi iuran bulanan berpotensi duplikat jika tidak ada unique index parsial (meski di kode sudah ada pengecekan).
- Konsistensi `transaksi.tipe_arus` terhadap `kategori_kas.jenis_arus` belum dijaga penuh di level DB (butuh trigger/constraint bisnis).

## 3) Output Hardening yang Ditambahkan

File SQL final:

- `docs/plan/01-database-consistent.sql`

Isi utama hardening:

- FK lengkap untuk relasi kunci (`user-warga`, `transaksi-user/warga/kategori`, `log-user`).
- `UNIQUE (user.warga_id)` untuk relasi 1 warga maksimum 1 akun.
- Partial unique index anti duplikasi transaksi bulanan dan sekali bayar.
- Check constraint bentuk data transaksi masuk/keluar.
- Trigger validasi kategori arus vs tipe transaksi.

## 4) Catatan Implementasi

- SQL ini adalah baseline final relasional. Untuk environment existing, jalankan di staging dulu karena ada constraint baru yang dapat gagal jika data lama sudah terlanjur tidak konsisten.
- Setelah eksekusi SQL final, sinkronkan definisi Drizzle migration agar schema code dan database selalu 1 sumber kebenaran.

## 5) Status Eksekusi Aktual (rt_dev)

Status: **SUKSES TERAPLIKASI** pada database `rt_dev` (23 Maret 2026).

### 5.1 Ringkasan Verifikasi Integritas Data (pasca apply)

- `orphanTransUser = 0`
- `orphanLogUser = 0`
- `invalidMasukKeluarShape = 0`
- `categoryFlowMismatch = 0`
- `duplicateMasukBulanan = 0`
- `duplicateMasukSekali = 0`

### 5.2 Area Aplikasi yang Terdampak (Impact)

#### Dampak Tinggi (write-path transaksi)

- `src/server/actions/kas-masuk.ts`
  - Terdampak oleh unique index parsial dan validasi arus kategori.
  - Status: aman (shape data dan anti-duplikasi sudah selaras).

- `src/server/actions/kas-keluar.ts`
  - Terdampak oleh check transaksi arus keluar (warga/bulan/tahun harus `NULL`).
  - Status: aman (sudah set `wargaId: null`, tanpa bulan/tahun).

#### Dampak Menengah (provisioning user & audit)

- `src/server/actions/warga.ts`
  - Terdampak oleh relasi 1:1 `user.warga_id`.
  - Status: aman (insert akun per warga konsisten).

- `src/server/actions/audit.ts`
- `src/server/actions/log-aktivitas.ts`
  - Terdampak oleh FK `log_aktivitas.user_id -> user.id`.
  - Status: aman (tidak ditemukan orphan log).

#### Dampak Rendah (read-path)

- `src/server/actions/warga-dashboard.ts`
- `src/server/actions/warga-riwayat.ts`
- `src/server/actions/kategori-kas.ts`
  - Tidak ada perubahan perilaku query; hanya mendapat jaminan konsistensi data lebih kuat dari DB.

### 5.3 Sinkronisasi Source Schema

Schema Drizzle sudah diselaraskan agar tidak drift dengan DB:

- `src/db/schema/warga.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/transaksi.ts`
- `src/db/schema/log-aktivitas.ts`

### 5.4 Sinkronisasi Migration Drizzle

- Migration resmi berhasil digenerate:
  - `drizzle/0001_fancy_sleepwalker.sql`
  - `drizzle/meta/0001_snapshot.json`
  - `drizzle/meta/_journal.json` ter-update ke entry `0001_fancy_sleepwalker`.
- Untuk environment `rt_dev` yang sudah lebih dulu di-hardening manual, migration `0001` ditandai applied di tabel `drizzle.__drizzle_migrations` agar `db:migrate` tidak error duplikasi objek.
- Verifikasi akhir: `db:migrate` exit code `0`.
