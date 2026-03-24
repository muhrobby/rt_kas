# Sistem Informasi Manajemen Kas RT

Aplikasi berbasis web moderen untuk mempermudah tata kelola keuangan kas lingkungan Rukun Tetangga (RT). Sistem ini mengedepankan transparansi, kecepatan pencatatan, dan keamanan log jejak audit untuk meminimalisasi konflik antar warga dan pengurus.

Aplikasi ini dikembangkan berdasarkan spesifikasi kebutuhan (`docs/req.md`) dengan memanfaatkan arsitektur **Next.js 16 (App Router)** dan **Drizzle ORM**.

## ✨ Fitur Utama

- **Dashboard Terintegrasi**: Tampilan panel (*Card Metrics*) rekap sumbangan warga aktif, pemasukan bulan ini, arus keluar, dan saldo kas *real-time*.
- **Manajemen Data Warga & Pengurus**: Integrasi penyimpanan kontak domisili keluarga (tetap/kontrak) dengan kendali hak akses administratif (*Toggle Jadikan Pengurus RT*) tersinkronisasi di satu pintu. Dilengkapi _link WhatsApp_ langsung dari data tabel.
- **Kategori Arus Dinamis**: Admin dapat mengatur sendiri label pembayaran (Uang Keamanan, Sampah, Pembangunan, Sosial, dll.) serta preferensi siklus (Sekali bayar vs Bulanan).
- **Pencatatan Keuangan Presisi**: Mencatat _Cash In/Cash Out_ dengan filter per periode yang terintegrasi penuh terhadap riwayat tiap-tiap warga secara koheren. Terdiri atas *E-Kuitansi* otomatis.
- **Laporan Warga Transparan**: *Adaptive layout* (mendukung tampilan tabel lengkap di Desktop, dan UI *Card View* padat pada Smartphone).
- **Audit Trail (*Log Aktivitas*)**: Pengamanan tingkat tinggi yang mencatat setiap *activity logger* Admin (siapa, jam berapa, apa yang diubah).

## 🛠️ Tech Stack & Konfigurasi

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan *React Compiler* + React 19.
- **Bahasa**: TypeScript (Strict Mode).
- **Interface & UI**: [Tailwind CSS v4](https://tailwindcss.com/) + Shadcn UI + Lucide Icons + Framer Motion.
- **Database & ORM**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/).
- **Autentikasi**: [Better-Auth](https://better-auth.com/) (menggunakan plugin `admin` dan `username`).
- **State Management & Forms**: Zustand (UI Preferences) & React Hook Form + Zod (Validasi).
- **Code Quality Tools**: [Biome 2.3.8](https://biomejs.dev/) (Linter & Formatter pengganti absolut Prettier/ESLint) & Husky.

## 🚀 Instalasi & Menjalankan Aplikasi Secara Lokal

1. **Clone repositori**
   ```bash
   git clone <repository_url>
   cd rt_kas
   ```

2. **Instal seluruh *dependencies***
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Database**
   Salin berkas konfigurasi sampel `.env.example` ke `.env.local` dan tentukan URL koneksi Postgres Anda beserta parameter secret `BETTER_AUTH_SECRET`:
   ```bash
   cp .env.example .env.local
   ```

4. **Kompilasi Database (Push Drizzle Schema)**
   ```bash
   npm run db:push
   ```

5. **Nyalakan Server *Development***
   ```bash
   npm run dev
   ```
   Aplikasi Anda kini berjalan secara stabil pada [http://localhost:3000](http://localhost:3000). 

## 🛡️ Aturan Standar Kode (Code Rules)
Selama pengerjaan, linter telah disesuaikan dengan parameter di `AGENTS.md`. Proyek mewajibkan:
- Menjalankan `npm run check:fix` sebelum *push* kode, guna mengatasi segala format deklaratif atau peringatan linting dari Biome (termasuk Tailwind classes order).
- Tema dinamis dapat dikonfigurasi melalui presetan file `src/styles/presets/*.css` dan merender parameter eksekusi CLI via `npm run generate:presets`.
- Hindari mengubah direktori *primitives* komponen `src/components/ui/` secara manual, biarkan utilitas CLI mengambil alih (kecuali *explicit override*).

---

> Proyek ini menggunakan _boilerplate architecture Next.js Shadcn Admin Dashboard v16_ yang berevolusi total berkat colocation-based layout architecture yang dapat terus dimodifikasi sesuai permintaan di masa mendatang.
