# 1. Activity Diagram Eksisting (Sistem Berjalan)

**Skenario:** Proses Penagihan dan Pencatatan Iuran Manual

- **Warga:** Menyiapkan uang iuran (tanggal 5-6).
- **Pengurus RT:** Berkeliling ke rumah warga untuk menagih.
- **Warga:** Menyerahkan uang iuran bulanan (Rp25.000).
- **Pengurus RT:** Menerima uang, lalu mencari nama warga di buku besar.
- **Pengurus RT:** Memberikan tanda "ceklis" pada kolom bulan di buku besar (Tidak ada kuitansi untuk warga).
- **Pengurus RT (Akhir Bulan):** Membuka laptop, memindahkan data dari buku besar ke Microsoft Excel.
- **Pengurus RT (Per 3 Bulan):** Membuat laporan format PDF/Gambar dari Excel dan membagikannya ke Grup WhatsApp.
- **Warga:** Menerima dan melihat laporan di WhatsApp.

---

# 2. Use Case Usulan

**Aktor:** Admin (Pengurus RT/Bendahara) dan Warga.

**Admin dapat melakukan:**
- Login & Logout
- Kelola Data Warga & Akses Pengurus RT (CRUD profil warga, cabut/berikan hak akses Admin via Toggle Switch)
- Kelola Kategori Kas & Iuran (Dinamis: tambah iuran keamanan, sampah, atau donasi)
- Kelola Transaksi Pemasukan (Input pencatatan iuran warga)
- Kelola Transaksi Pengeluaran (Input biaya operasional RT)
- Melihat Laporan Keuangan (Rekapitulasi agregat kas RT bulanan dan tahunan)
- Memantau Log Aktivitas Sistem (Melihat Audit Trail semua tindakan pengguna)

**Warga dapat melakukan:**
- Login & Logout
- Melihat Profil Data Warga miliknya.
- Melihat Riwayat Pembayaran & Tunggakan Iuran miliknya (e-kuitansi).
- Melihat Laporan Transparansi Kas RT.

---

# 3. Daftar Activity Diagram Usulan (Berdasarkan Use Case)

### a. Activity Diagram: Login (Untuk Admin & Warga)
- **Aktor:** Mengisi Username/No. Telp dan Password, lalu klik "Masuk".
- **Sistem:** Memvalidasi data ke database. Jika salah, tampilkan pesan error. Jika benar, arahkan ke Dashboard sesuai hak akses (Role Admin/Warga).

### b. Activity Diagram: Kelola Data Warga & Akses Pengurus (Khusus Admin)
- **Admin:** Memilih menu "Data Warga", lalu klik "Tambah/Edit Warga".
- **Admin:** Mengisi form dan dapat mengatur "Switch Toggle" untuk menjadikan Warga sebagai Pengurus RT.
- **Sistem:** Memvalidasi inputan. Jika aman, simpan profil, ubah Role di tabel Auth, catat Log Aktivitas ke database, dan tampilkan pesan sukses.

### c. Activity Diagram: Kelola Kategori Iuran (Khusus Admin)
- **Admin:** Memilih menu "Kategori Iuran", lalu klik "Tambah Kategori Baru".
- **Admin:** Menginput nama kategori (misal: Keamanan, Sampah, 17-an) dan jenisnya.
- **Sistem:** Menyimpan kategori baru ke database sehingga nantinya muncul di pilihan saat transaksi.

### d. Activity Diagram: Input Pembayaran Iuran Warga (Khusus Admin)
- **Admin:** Memilih menu "Kas Masuk / Pembayaran".
- **Admin:** Mencari nama warga, memilih kategori iuran, dan mencentang bulan yang dibayar.
- **Sistem:** Menghitung total, menyimpan ke tabel transaksi, dan mengubah status tagihan warga menjadi "Lunas".

### e. Activity Diagram: Input Pengeluaran Operasional RT (Khusus Admin)
- **Admin:** Memilih menu "Kas Keluar / Pengeluaran".
- **Admin:** Mengisi nominal pengeluaran, tanggal, dan keterangan (misal: "Bayar gaji satpam").
- **Sistem:** Menyimpan data pengeluaran dan otomatis memotong saldo kas utama RT.

### f. Activity Diagram: Cetak Laporan Keuangan (Khusus Admin)
- **Admin:** Memilih menu "Laporan Keuangan".
- **Admin:** Memasukkan filter rentang bulan dan tahun, lalu klik "Cetak/Generate".
- **Sistem:** Menarik data pemasukan & pengeluaran dari database, lalu menampilkannya dalam format tabel PDF yang siap dibagikan ke WhatsApp warga.

### g. Activity Diagram: Lihat Riwayat & Transparansi (Khusus Warga)
- **Warga:** Membuka menu "Riwayat Saya" atau "Kas RT".
- **Sistem:** Mencari data transaksi berdasarkan ID Warga yang sedang login.
- **Sistem:** Menampilkan daftar bulan yang sudah lunas/nunggak, beserta ringkasan saldo kas RT bulan ini.

### h. Activity Diagram: Memantau Log Aktivitas (Khusus Admin)
- **Admin:** Memilih menu "Log Aktivitas".
- **Sistem:** Menarik data riwayat operasional lengkap dari tabel Log Aktivitas.
- **Admin:** Dapat memantau dan memilah audit trail untuk setiap aktivitas yang terjadi dalam sistem aplikasi.

---

# 4. Sequence Diagram

### a. Sequence Diagram: Proses Login
**Skenario:** Admin atau Warga masuk ke dalam sistem.
1. Aktor (User) memasukkan No. Telp dan Password, lalu klik login pada halaman `Form_Login` (View).
2. `Form_Login` mengirim data (`no_telp`, `password`) ke `Auth_Controller`.
3. `Auth_Controller` memanggil fungsi `cekLogin()` ke `User_Model`.
4. `User_Model` melakukan pencarian data `SELECT * FROM tb_users` di Database.
5. Database mengembalikan hasil pencarian (Valid/Tidak Valid) ke `User_Model`.
6. `User_Model` meneruskan hasil tersebut ke `Auth_Controller`.
7. Jika Valid, `Auth_Controller` membuat session dan mengarahkan (redirect) ke `Halaman_Dashboard` (View). Jika Tidak Valid, kembali ke `Form_Login` dengan pesan error.

### b. Sequence Diagram: Kelola Data Warga & Hak Akses Pengurus (Admin)
**Skenario:** Admin mendata warga baru/pengontrak, sekaligus menentukan akses Pengurus.
1. Aktor (Admin) mengisi form, mengatur akses pengurus, lalu menekan simpan.
2. `Form_Warga` (View) memanggil Server Action (`Warga_Controller`).
3. `Warga_Controller` memvalidasi inputan skema Zod, lalu meneruskan transaksi ke `Warga_Model`.
4. `Warga_Model` mengeksekusi query `INSERT/UPDATE` ke `tb_warga`.
5. `Warga_Model` menyinkronkan pembaruan data peran/role dengan memanggil Auth/`User_Model`.
6. `Warga_Model` merekam aksi ke `tb_log_aktivitas`.
7. Database mengembalikan status sukses ke sistem yang meneruskan konfirmasi UX ke Admin.

### c. Sequence Diagram: Input Pembayaran Iuran (Kas Masuk)
**Skenario:** Admin mencatat warga yang membayar iuran bulanan.
1. Aktor (Admin) memilih nama warga, kategori iuran, dan bulan tagihan, lalu menekan bayar pada `Form_Transaksi` (View).
2. `Form_Transaksi` mengirim data pembayaran `simpanPembayaran()` ke `Transaksi_Controller`.
3. `Transaksi_Controller` mengirim data ke `Transaksi_Model`.
4. `Transaksi_Model` mengeksekusi dua perintah ke Database:
   - `INSERT INTO tb_transaksi` (menyimpan riwayat uang masuk).
   - `UPDATE status_tagihan = 'Lunas'` (jika memisahkan tabel khusus tagihan).
5. Database merespon Success.
6. `Transaksi_Controller` menerima respon dan mengirimkan instruksi ke `Kuitansi_View`.
7. `Kuitansi_View` menampilkan struk pembayaran digital (E-Kuitansi) di layar Admin.

### d. Sequence Diagram: Cetak Laporan Keuangan RT
**Skenario:** Admin mencetak laporan per 3 bulan untuk di-share ke grup WhatsApp.
1. Aktor (Admin) memilih filter bulan/tahun dan menekan tombol "Cetak" di `Halaman_Laporan` (View).
2. `Halaman_Laporan` mengirim parameter tanggal (`tgl_awal`, `tgl_akhir`) ke `Laporan_Controller`.
3. `Laporan_Controller` meminta data ke `Transaksi_Model` menggunakan fungsi `getRekapKas()`.
4. `Transaksi_Model` mengeksekusi `SELECT SUM(masuk), SUM(keluar)` ke Database.
5. Database mengembalikan nilai total dan rincian transaksi ke `Transaksi_Model`.
6. `Laporan_Controller` menerima data tersebut dan memanggil library PDF/Excel.
7. `Laporan_Controller` merender data ke `Laporan_PDF` (View) yang siap diunduh oleh Admin.

### e. Sequence Diagram: Lihat Riwayat Pembayaran (Oleh Warga)
**Skenario:** Warga mengecek apakah dia masih punya tunggakan atau sudah lunas.
1. Aktor (Warga) menekan menu "Riwayat Saya" pada `Halaman_Dashboard_Warga` (View).
2. `Halaman_Dashboard_Warga` mengirim ID Warga yang sedang login (`id_warga`) ke `Riwayat_Controller`.
3. `Riwayat_Controller` meminta histori transaksi ke `Transaksi_Model`.
4. `Transaksi_Model` melakukan query `SELECT * FROM tb_transaksi WHERE id_warga = X` ke Database.
5. Database mengembalikan array data riwayat.
6. `Riwayat_Controller` mengirim data tersebut ke `Halaman_Riwayat` (View).
7. `Halaman_Riwayat` menampilkan tabel daftar bulan yang sudah dibayar beserta statusnya kepada Warga.

---

# 5. Perancangan Database (Final untuk Coding)

### Tabel 1: `user` (Tabel bawaan Better-Auth)
- `id` (Primary Key, String)
- `name` (String)
- `email` (String, Unique)
- `emailVerified` (Boolean)
- `image` (String)
- `password` (berada di tabel `account` / `credential` terpisah)
- `role` (Enum: 'admin', 'user') - Terintegrasi dengan plugin admin Better-Auth
- `banned`, `banReason`, `banExpires` (Detail larangan akses)
- `wargaId` (Foreign Key / Integer - Boleh NULL jika pengguna murni Super Admin)
- `createdAt`, `updatedAt`

### Tabel 2: `warga` (Data profil warga)
- `id` (Primary Key, Auto Increment)
- `nama_kepala_keluarga` (String)
- `blok_rumah` (String - Misal: Blok A1 No. 5)
- `no_telp` (String, Unique)
- `status_hunian` (Enum: 'tetap', 'kontrak')
- `tgl_batas_domisili` (Date - NULL jika warga tetap)
- `createdAt`, `updatedAt`

### Tabel 3: `kategori_kas` (Master data iuran & pengeluaran)
- `id` (Primary Key, Auto Increment)
- `nama_kategori` (String - Misal: Keamanan, Sampah, Operasional RT)
- `jenis_arus` (Enum: 'masuk', 'keluar')
- `tipe_tagihan` (Enum: 'bulanan', 'sekali') - Tipe siklus pembayaran tagihan
- `nominal_default` (Integer - Untuk fitur pengisian form otomatis)
- `createdAt`

### Tabel 4: `transaksi` (Jantung utama aplikasi keuangan)
- `id` (Primary Key, Auto Increment)
- `waktu_transaksi` (Datetime - Otomatis merekam jam transaksi)
- `user_id` (Foreign Key - ID Admin yang menginput, untuk Audit)
- `warga_id` (Foreign Key - Boleh NULL untuk kategori transaksi keluar)
- `kategori_id` (Foreign Key)
- `bulan_tagihan` (String - Misal: Januari)
- `tahun_tagihan` (Integer - Misal: 2026)
- `nominal` (Integer)
- `tipe_arus` (Enum: 'masuk', 'keluar')
- `keterangan` (Text)
- `createdAt`

### Tabel 5: `log_aktivitas` (Fitur Audit Trail)
- `id` (Primary Key, Auto Increment)
- `waktu_log` (Datetime)
- `user_id` (Foreign Key - Pengguna/Admin yang melakukan aktivitas)
- `modul` (String - Misal: Data Warga, Transaksi, Auth)
- `aksi` (Enum: 'tambah', 'edit', 'hapus', 'login', 'logout')
- `keterangan` (Text - Rincian tindakan)

---

# 6. ERD Diagram (Final untuk Digambar Aan)

Sampaikan ke Aan bahwa ada 5 Kotak Entitas yang harus digambar dan dihubungkan. Berikut adalah aturan relasi kardinalitasnya (garis penghubungnya):

- `WARGA (1)` ──── `(1) USER` (Satu data Warga hanya bisa memiliki maksimal satu akun User untuk login aplikasi).
- `WARGA (1)` ──── `(M) TRANSAKSI` (Satu Warga bisa melakukan banyak Transaksi pembayaran. Garisnya dibuat opsional/putus-putus ke arah transaksi karena ada transaksi keluar yang tidak butuh data warga).
- `KATEGORI_KAS (1)` ──── `(M) TRANSAKSI` (Satu Kategori Kas, misal "Keamanan", akan digunakan berulang kali di banyak Transaksi).
- `USER (1)` ──── `(M) TRANSAKSI` (Satu User/Admin bisa mencatat dan memproses banyak data Transaksi).
- `USER (1)` ──── `(M) LOG_AKTIVITAS` (Satu User/Admin bisa melakukan banyak aktivitas yang terekam di sistem).

---

# 7. Class Diagram (Final untuk Digambar Aan)

Di diagram ini, Aan akan menggambar 5 kotak Class. Di setiap kotak, ada 2 bagian: Atribut (berisi nama kolom database) dan Method/Operation (berisi fungsi coding yang kamu buat).

### Class User
**Atribut:** `+ id`, `+ name`, `+ email`, `+ role`, `+ wargaId`, `+ banned`, `+ createdAt`, `+ updatedAt`  
**Method:** `+ login()`, `+ logout()`, `+ cekAkses()`

### Class Warga
**Atribut:** `+ id`, `+ namaKepalaKeluarga`, `+ blokRumah`, `+ noTelp`, `+ statusHunian`, `+ tglBatasDomisili`, `+ createdAt`, `+ updatedAt`  
**Method:** `+ tambahWarga()`, `+ editWarga()`, `+ hapusWarga()`, `+ cekStatusDomisili()`

### Class KategoriKas
**Atribut:** `+ id`, `+ namaKategori`, `+ jenisArus`, `+ tipeTagihan`, `+ nominalDefault`, `+ createdAt`  
**Method:** `+ tambahKategori()`, `+ editKategori()`, `+ hapusKategori()`, `+ getNominalOtomatis()`

### Class Transaksi
**Atribut:** `+ id`, `+ waktuTransaksi`, `+ userId`, `+ wargaId`, `+ kategoriId`, `+ bulanTagihan`, `+ tahunTagihan`, `+ nominal`, `+ tipeArus`, `+ keterangan`, `+ createdAt`  
**Method:** `+ simpanPemasukan()`, `+ simpanPengeluaran()`, `+ cetakE_Kuitansi()`, `+ getLaporanBulanan()`

### Class LogAktivitas
**Atribut:** `+ id`, `+ waktuLog`, `+ userId`, `+ modul`, `+ aksi`, `+ keterangan`  
**Method:** `+ catatLog()`, `+ exportLogToExcel()`, `+ tampilkanRiwayatAdmin()`

---

# 8. Rancangan UI Dummy (Improvement)

### a. UI Login & Layout Dasar
- **Form Login:** Input Username, Input Password, dan Tombol "Login". Terdapat pesan *error* dinamis (Toast/Sonner).
- **Layout Utama (Setelah Login):** 
  - **Sidebar Kiri (Collapsible):** Dilengkapi logo RT Kas di kiri atas. Daftar menu dikelompokkan menjadi Main (Dashboard, Data Warga, Kategori Kas, Pembayaran, Pengeluaran) dan Pelaporan (Laporan Keuangan, Log Aktivitas).
  - **Bottom Sidebar / Header:** Terdapat *Account Switcher* (Dropdown Menu) untuk melihat Role ("Pengurus RT" atau "Warga"), Tombol Theme Toggle (Terang/Gelap), dan Logout.

### b. UI Dashboard Admin
- **Header:** Judul Halaman dan Breadcrumbs (Navigasi path folder).
- **Card Statistik (Atas):** 4 Kartu metrik: Total Warga (Icon User), Saldo Kas (Icon Dompet), Pemasukan Bulan Ini (Panah Hijau Ke Atas), dan Pengeluaran Bulan Ini (Panah Merah Ke Bawah). Dilengkapi dengan animasi *Skeleton Loading* sebelum data selesai dipanggil asinkron.
- **Tabel Transaksi Terbaru (Bawah):** Menampilkan histori kas masuk riil terbaru (Kolom: Waktu, Keterangan, Nominal, User Pencatat).

### c. UI Menu Data Warga
- **Tombol Aksi:** Tombol "Tambah Warga Baru" menggunakan pop-up modal/Dialog.
- **Tabel Data:** Menampilkan atribut (No, Nama Kepala Keluarga, Blok Rumah, No. Telp, Status Hunian, Akses/Peran, dan Aksi/Edit/Hapus). Tombol edit memunculkan pop-up yang sama.
- **Improvement Visual:** 
  - Kolom **Peran** ditandai *Badge* warna khusus (Amber untuk Pengurus RT, Outline untuk Warga Biasa).
  - *Switch Toggle* "Jadikan Pengurus RT" ada di bawah form.
  - Tabel menampilkan illustrasi *Empty State* (Gambar kosong + tulisan abu-abu) jika belum ada data.

### d. UI Menu Kategori Kas
- **Tabel Data:** Kolom Nama Kategori, Tipe Arus (Badge Hijau untuk Masuk, Merah untuk Keluar), Tipe Tagihan (Badge Biru untuk Bulanan, Ungu untuk Sekali Bayar), Nominal Standar, Akses Edit/Hapus.
- **Form Kategori:** Input Nama, Radio/Select Tipe Arus, Select Tipe Tagihan, dan Input Nominal Default.

### e. UI Menu Kas Masuk (Pembayaran)
- **Form Transaksi Input (Sisi Kiri/Modal):** 
  - Dropdown/Select 'Warga'.
  - Dropdown 'Kategori Tagihan' (terikat nilai otomatis berdasarkan *nominal default*).
  - Pemilihan Bulan (bisa mencontreng banyak bulan jika tipenya *Bulanan*).
  - Dropdown Tahun Pembayaran.
  - Input Nominal terbayar dan Keterangan opsional.
- **Riwayat Harian (Sisi Kanan):** Daftar data siapa saja yang sudah bayar di hari tersebut.

### f. UI Menu Kas Keluar (Pengeluaran)
- **Form Pengeluaran:** Dropdown 'Kategori Pengeluaran', Date-picker 'Tanggal Keluar', Input Nominal (Rp), dan Input Teks Keterangan peruntukan uang.

### g. UI Menu Laporan Keuangan
- **Area Filter:** Filter Pilihan 'Tahun' berjalan dengan sebuah tombol submit.
- **Dashboard Agregasi:** 
  - Desktop View: Tabel rekap utuh (Bulan, Total Pemasukan, Total Pengeluaran, dan Sisa Saldo Kumulatif).
  - Interaktif: Meng-klik baris tertentu membuka pop-up Modal yang berisi **Rincian Detil Pengeluaran** per tanggal bulan tersebut.
  - *Mobile Responsiveness*: Bila dibuka dari ponsel layar kecil, tabel hancur lebur akan diganti menjadi kumpulan desain *Card-View* bersusun (Card per bulan) yang menawan dan bebas gulir vertikal.

### h. UI Dashboard Warga
- **Card Saldo Kepercayaan:** Menyajikan Saldo Kas Lingkungan RT total terbaru agar warga percaya terhadap pengurus.
- **Kuitansi/Status Tagihan Warga:** Tampilan yang menunjukkan riwayat pelunasan tunggakan spesifik untuk rumah warga yang bersangkutan dengan keterangan warna *Lunas* atau *Tertunggak*.

### i. UI Log Aktivitas (Audit Trail)
- **Susunan Data:** Tabel dengan *Pagination* urutan terbalik waktu (Terbaru > Terlama).
- **Kolom Data:** Menampilkan secara akurat kolom (Waktu/Detik, Modul Sistem, Tindakan/`Badge Aksi`, Deskripsi Detil Aktivitas, dan Pelaku/Admin `User Name`). Merupakan alat lacak keamanan tertinggi di dalam aplikasi.
