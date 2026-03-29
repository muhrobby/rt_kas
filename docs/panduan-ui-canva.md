# Panduan Pembuatan Mockup (Wireframe) UI Kas RT di Canva

Dokumen ini berisi spesifikasi layout yang harus diaplikasikan saat Anda mendesain struktur UI Dummy di dalam *canvas* Canva. Gunakan komponen bentuk *Shape* dasar (Kotak/Persegi Panjang) dan teks di Canva untuk mulai membuat kerangkanya.

---

## Spesifikasi Layout Utama (Dasar)

Buat frame di Canva dengan rasio layar laptop (Contoh: `1920x1080` atau Presentasi `16:9`).

### 1. Panel Sidebar Kiri (Lebar: ~250px)
- **Komponen:**
  - Letakkan **Logo & Teks "Kas RT"** di sudut kiri paling atas.
  - Buat daftar teks kebawah untuk Menu Utama: `Dashboard`, `Data Warga`, `Kategori Kas`, `Kas Masuk`, `Kas Keluar`. (Beri *highlight*/blok warna pada menu yang sedang "aktif").
  - Beri pembatas/garis (*divider*), lalu tambahkan menu `Pelaporan`: `Laporan Keuangan`, `Log Aktivitas`.
- **Bagian Dasar (Bawah) Sidebar:**
  - Buat kotak kecil berisi "Foto Profil" (lingkaran) di sebelah nama `Admin` / `Role (Pengurus RT)`.

### 2. Area Konten Utama (Kanan Area Abu-Abu/Putih)
- **Header (Navigasi Atas):** Letakkan ikon Garis Tiga (Hamburger Menu) dan tulisan "Dashboard" atau nama halaman. Letakkan pula Toggle Beralih Warna (Bulan/Matahari) di sudut kanan atas.

---

## Template Tampilan / Halaman

### a. Dashboard Admin
- **Elemen:**
  - Buat 4 Kotak Kecil (Card) sejajar di atas. Setiap kotak isinya:
    1. Icon User + Teks "Warga Terdaftar" + Angka.
    2. Icon Dompet + Teks "Saldo Kas" + Angka Rupiah.
    3. Panah Hijau + Teks "Pemasukan Bulanan" + Angka.
    4. Panah Merah + Teks "Pengeluaran Bulanan" + Angka.
  - Di bawahnya, buat sebuah Kotak Lebar untuk "Tabel Transaksi Terbaru". Buat beberapa baris simulasi data sederhana (Tanggal, Nama Orang, Nominal).

### b. Data Warga (Tabel & Modal Form)
- **Halaman Tabel:**
  - Sebuah Tombol Persegi Panjang warna hitam/warna utama di kanan atas teksnya "Tambah Warga Baru".
  - Area Kotak lebar berformat Tabel: Baris atas untuk Judul Kolom (Nama, Blok, Status, Akses, Aksi). Isi data simulasi. Gunakan sebuah kapsul (badge) berwarna kuning tua (Amber) bertuliskan "Pengurus RT", disusul teks abu-abu "Warga Biasa".
- **Halaman Pop-Up (Modal Add/Edit):**
  - Gambar satu Kotak Bayangan (Modal) timbul di tengah. Isi dengan label & kotak abu-abu yang mengilustrasikan "Input Teks" Nama Warga, Dropdown Status Kontrak, dan sebuah tombol saklar bergambar *Toggle-Switch* di paling bawah, dengan keterangan: "Jadikan Pengurus RT (Penuh Akses Admin)".

### c. Input Pembayaran (Kas Masuk)
- Bagilah layar konten (di luar Sidebar) menjadi dua bagian vertikal (*Split View*).
- **Block Kiri (Formulir Kasir):**
  - Buat susunan Kotak TextField: Pilih Warga, Pilih Tipe Iuran, Centang Bulan (Jan-Des), Tahun Tagihan, Keterangan Tambahan, dan Tombol Biru "Simpan Pembayaran".
- **Block Kanan (Riwayat Harian):**
  - Tampilkan list struk mini dari warga-warga yang hari ini baru menyelesaikan pembayaran (Contoh: "*Budi (A1) - Uang Kebersihan - Rp.25.000*").

### d. Laporan Keuangan (Adaptive Card View)
- Rancang tabel dengan 6 kolom padat (Bulan, Total Uang Masuk, Total Uang Keluar, dan Sisa Saldo).
- Tambahkan anotasi panah atau teks panduan di luar layar Canva yang menunjuk ke tabel dengan keterangan: *"Jika Layar menjadi kecil (Mobile Phone), setiap baris/bulan ini akan berubah wujud dari tabel horizontal menjadi kumpulan Kotak (Card) menurun ke bawah."*

### e. Log Aktivitas (Sistem Tracker)
- Bagian atas merupakan baris pemilah filter (Cari Tanggal / Filter Kategori Sistem).
- Tabel utama (Lebar Penuh) yang di dalamnya disimulasikan teks data berupa jejak jejak panjang. Contoh data row: `10/05/26 14:02:11 | Login Admin Budi | Data Warga | Mengubah nomor HP dan menjadikan warga Admin.`

---

## 🎨 Tips Desain untuk Canva (Komposisi Visual)

1. **Warna Dasar**: Gunakan warna Putih / Abu-abu terang (`#F9FAFB`) sebagai latar aplikasi (background).
2. **Warna Kotak (Card)**: Warna putih murni (`#FFFFFF`) dengan efek *Drop Shadow* Sangat Halus (*Soft Shadow*) agar komponen terlihat menonjol.
3. **Typography**: Cari Font bernuansa bersih seperti `Inter`, `Roboto`, atau `Montserrat`.
4. **Sudut Kotak (Corner Radius)**: Jangan lancip. Buat kotak tabel/elemen dengan desain membulat (*Rounded Corner* sebesar 10-12px) sebagai standar UI/UX Moderen.
5. **Asset Cepat**: Akses tab **Elements** pada Canva dan gunakan kata kunci pencarian seperti: `UI wireframe`, `Table Dashboard`, `Switch toggle UI`, atau `Graph Chart` untuk mendapatkan ikon instan tanpa mendesain dari akar.
