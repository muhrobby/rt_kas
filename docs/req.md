1. ACTIVITY DIAGRAM EKSISTING (Sistem Berjalan)
Skenario: Proses Penagihan dan Pencatatan Iuran Manual
Warga: Menyiapkan uang iuran (tanggal 5-6).
Pengurus RT: Berkeliling ke rumah warga untuk menagih.
Warga: Menyerahkan uang iuran bulanan (Rp25.000).
Pengurus RT: Menerima uang, lalu mencari nama warga di buku besar.
Pengurus RT: Memberikan tanda "ceklis" pada kolom bulan di buku besar (Tidak ada kuitansi untuk warga).
Pengurus RT (Akhir Bulan): Membuka laptop, memindahkan data dari buku besar ke Microsoft Excel.
Pengurus RT (Per 3 Bulan): Membuat laporan format PDF/Gambar dari Excel dan membagikannya ke Grup WhatsApp.
Warga: Menerima dan melihat laporan di WhatsApp.
2. USE CASE USULAN
Aktor: Admin (Pengurus RT/Bendahara) dan Warga.
Admin dapat melakukan:
Login & Logout
Kelola Data Warga (CRUD data warga, update status domisili/kontrak)
Kelola Kategori Kas & Iuran (Dinamis: tambah iuran keamanan, sampah, atau donasi 17an)
Kelola Transaksi Pemasukan (Input pembayaran warga)
Kelola Transaksi Pengeluaran (Input biaya operasional RT)
Cetak Laporan Keuangan (Filter per bulan/tahun)
Warga dapat melakukan:
Login & Logout
Melihat Profil Data Warga miliknya.
Melihat Riwayat Pembayaran & Tunggakan Iuran miliknya (e-kuitansi).
Melihat Laporan Transparansi Kas RT (Pemasukan & Pengeluaran lingkungan).
3. Daftar Activity Diagram Usulan (Berdasarkan Use Case)
a. Activity Diagram: Login (Untuk Admin & Warga)
Aktor: Mengisi Username/No. Telp dan Password, lalu klik "Masuk".
Sistem: Memvalidasi data ke database. Jika salah, tampilkan pesan error. Jika benar, arahkan ke Dashboard sesuai hak akses (Role Admin/Warga).
b. Activity Diagram: Kelola Data Warga (Khusus Admin)
Admin: Memilih menu "Data Warga", lalu klik "Tambah/Edit Warga".
Admin: Mengisi form data (Nama, Blok/No. Rumah, No. Telp, Status Hunian).
Sistem: Memvalidasi inputan kosong. Jika aman, simpan data ke database dan tampilkan pesan "Data Berhasil Disimpan".
c. Activity Diagram: Kelola Kategori Iuran (Khusus Admin)
Admin: Memilih menu "Kategori Iuran", lalu klik "Tambah Kategori Baru".
Admin: Menginput nama kategori (misal: Keamanan, Sampah, 17-an) dan jenisnya.
Sistem: Menyimpan kategori baru ke database sehingga nantinya muncul di pilihan saat transaksi.
d. Activity Diagram: Input Pembayaran Iuran Warga (Khusus Admin)
Admin: Memilih menu "Kas Masuk / Pembayaran".
Admin: Mencari nama warga, memilih kategori iuran, dan mencentang bulan yang dibayar.
Sistem: Menghitung total, menyimpan ke tabel transaksi, dan mengubah status tagihan warga menjadi "Lunas".
e. Activity Diagram: Input Pengeluaran Operasional RT (Khusus Admin)
Admin: Memilih menu "Kas Keluar / Pengeluaran".
Admin: Mengisi nominal pengeluaran, tanggal, dan keterangan (misal: "Bayar gaji satpam").
Sistem: Menyimpan data pengeluaran dan otomatis memotong saldo kas utama RT.
f. Activity Diagram: Cetak Laporan Keuangan (Khusus Admin)
Admin: Memilih menu "Laporan Keuangan".
Admin: Memasukkan filter rentang bulan dan tahun, lalu klik "Cetak/Generate".
Sistem: Menarik data pemasukan & pengeluaran dari database, lalu menampilkannya dalam format tabel PDF yang siap dibagikan ke WhatsApp warga.
g. Activity Diagram: Lihat Riwayat & Transparansi (Khusus Warga)
Warga: Membuka menu "Riwayat Saya" atau "Kas RT".
Sistem: Mencari data transaksi berdasarkan ID Warga yang sedang login.
Sistem: Menampilkan daftar bulan yang sudah lunas/nunggak, beserta ringkasan saldo kas RT bulan ini.

4. SEQUENCE DIAGRAM
a. Sequence Diagram: Proses Login
Skenario: Admin atau Warga masuk ke dalam sistem.
Aktor (User) memasukkan No. Telp dan Password, lalu klik login pada halaman Form_Login (View).
Form_Login mengirim data (no_telp, password) ke Auth_Controller.
Auth_Controller memanggil fungsi cekLogin() ke User_Model.
User_Model melakukan pencarian data SELECT * FROM tb_users di Database.
Database mengembalikan hasil pencarian (Valid/Tidak Valid) ke User_Model.
User_Model meneruskan hasil tersebut ke Auth_Controller.
Jika Valid, Auth_Controller membuat session dan mengarahkan (redirect) ke Halaman_Dashboard (View). Jika Tidak Valid, kembali ke Form_Login dengan pesan error.
b. Sequence Diagram: Tambah Data Warga (Oleh Admin)
Skenario: Admin mendata warga baru/pengontrak.
Aktor (Admin) mengisi form (Nama, Blok, No. Telp, Status) dan menekan tombol simpan di Form_Warga (View).
Form_Warga mengirim request simpanDataWarga() ke Warga_Controller.
Warga_Controller memvalidasi inputan (memastikan tidak ada kolom kosong), lalu meneruskan ke Warga_Model.
Warga_Model mengeksekusi INSERT INTO tb_warga ke Database.
Database mengirimkan konfirmasi Success ke Warga_Model.
Warga_Model mengembalikan status sukses ke Warga_Controller.
Warga_Controller memerintahkan Form_Warga (View) untuk menampilkan Alert Sukses dan me-refresh tabel data warga.
c. Sequence Diagram: Input Pembayaran Iuran (Kas Masuk)
Skenario: Admin mencatat warga yang membayar iuran bulanan.
Aktor (Admin) memilih nama warga, kategori iuran, dan bulan tagihan, lalu menekan bayar pada Form_Transaksi (View).
Form_Transaksi mengirim data pembayaran simpanPembayaran() ke Transaksi_Controller.
Transaksi_Controller mengirim data ke Transaksi_Model.
Transaksi_Model mengeksekusi dua perintah ke Database:
INSERT INTO tb_transaksi (menyimpan riwayat uang masuk).
UPDATE status_tagihan = 'Lunas' (jika kamu memakai tabel khusus tagihan).
Database merespon Success.
Transaksi_Controller menerima respon dan mengirimkan instruksi ke Kuitansi_View.
Kuitansi_View menampilkan struk pembayaran digital (E-Kuitansi) di layar Admin.
d. Sequence Diagram: Cetak Laporan Keuangan RT
Skenario: Admin mencetak laporan per 3 bulan untuk di-share ke grup WhatsApp.
Aktor (Admin) memilih filter bulan/tahun dan menekan tombol "Cetak" di Halaman_Laporan (View).
Halaman_Laporan mengirim parameter tanggal (tgl_awal, tgl_akhir) ke Laporan_Controller.
Laporan_Controller meminta data ke Transaksi_Model menggunakan fungsi getRekapKas().
Transaksi_Model mengeksekusi SELECT SUM(masuk), SUM(keluar) ke Database.
Database mengembalikan nilai total dan rincian transaksi ke Transaksi_Model.
Laporan_Controller menerima data tersebut dan memanggil library PDF/Excel.
Laporan_Controller merender data ke Laporan_PDF (View) yang siap diunduh oleh Admin.
e. Sequence Diagram: Lihat Riwayat Pembayaran (Oleh Warga)
Skenario: Warga mengecek apakah dia masih punya tunggakan atau sudah lunas.
Aktor (Warga) menekan menu "Riwayat Saya" pada Halaman_Dashboard_Warga (View).
Halaman_Dashboard_Warga mengirim ID Warga yang sedang login (id_warga) ke Riwayat_Controller.
Riwayat_Controller meminta histori transaksi ke Transaksi_Model.
Transaksi_Model melakukan query SELECT * FROM tb_transaksi WHERE id_warga = X ke Database.
Database mengembalikan array data riwayat.
Riwayat_Controller mengirim data tersebut ke Halaman_Riwayat (View).
Halaman_Riwayat menampilkan tabel daftar bulan yang sudah dibayar beserta statusnya kepada Warga.

5.PERANCANGAN DATABASE (Final untuk Coding)
Tabel 1: tb_users (Untuk login Admin dan Warga)
id_user (Primary Key, Auto Increment)
no_telp(Varchar - Bisa diisi No. Telp agar mudah diingat)
password (Varchar)
role (Enum: 'Admin', 'Warga')
id_warga (Foreign Key - Boleh NULL/Kosong jika user tersebut adalah Admin murni)
Tabel 2: tb_warga (Data profil warga, tanpa NIK/KK)
id_warga (Primary Key, Auto Increment)
nama_kepala_keluarga (Varchar)
blok_rumah (Varchar - Misal: Blok A1 No. 5)
no_telp (Varchar)
status_hunian (Enum: 'Tetap', 'Kontrak')
tgl_batas_domisili (Date - Boleh NULL jika warga tetap)
Tabel 3: tb_kategori_kas (Master data iuran & pengeluaran)
id_kategori (Primary Key, Auto Increment)
nama_kategori (Varchar - Misal: Keamanan, Sampah, Operasional RT)
jenis_arus (Enum: 'Masuk', 'Keluar')
nominal_default (Int - Untuk fitur efisiensi/otomatisasi)
Tabel 4: tb_transaksi (Jantung utama aplikasi keuangan)
id_transaksi (Primary Key, Auto Increment)
waktu_transaksi (Datetime - Otomatis merekam tanggal & jam)
id_user (Foreign Key - Menyimpan ID Admin yang menginput, bagian dari Audit Trail)
id_warga (Foreign Key - Boleh NULL/Kosong jika transaksi pengeluaran)
id_kategori (Foreign Key)
bulan_tagihan (Varchar - Misal: Januari)
tahun_tagihan (Year/Int - Misal: 2026)
nominal (Int)
tipe_arus (Enum: 'Masuk', 'Keluar')
keterangan (Text - Misal: "Bayar dobel", atau "Beli Sapu")
Tabel 5: tb_log_aktivitas (Fitur Enterprise Audit Trail)
id_log (Primary Key, Auto Increment)
waktu_log (Datetime)
id_user (Foreign Key - Siapa yang melakukan aktivitas)
modul (Varchar - Misal: Data Warga, Transaksi, Kategori)
aksi (Enum: 'Tambah', 'Edit', 'Hapus', 'Login')
keterangan (Text - Misal: "Menambahkan warga baru an. Bpk Ahmad")

6. ERD DIAGRAM (Final untuk Digambar Aan)
Sampaikan ke Aan bahwa ada 5 Kotak Entitas yang harus digambar dan dihubungkan. Berikut adalah aturan relasi kardinalitasnya (garis penghubungnya):
WARGA (1) ──── (1) USER (Satu data Warga hanya bisa memiliki maksimal satu akun User untuk login aplikasi).
WARGA (1) ──── (M) TRANSAKSI (Satu Warga bisa melakukan banyak Transaksi pembayaran. Garisnya dibuat opsional/putus-putus ke arah transaksi karena ada transaksi keluar yang tidak butuh data warga).
KATEGORI_KAS (1) ──── (M) TRANSAKSI (Satu Kategori Kas, misal "Keamanan", akan digunakan berulang kali di banyak Transaksi).
USER (1) ──── (M) TRANSAKSI (Satu User/Admin bisa mencatat dan memproses banyak data Transaksi).
USER (1) ──── (M) LOG_AKTIVITAS (Satu User/Admin bisa melakukan banyak aktivitas yang terekam di sistem).

7.CLASS DIAGRAM (Final untuk Digambar Aan)
Di diagram ini, Aan akan menggambar 5 kotak Class. Di setiap kotak, ada 2 bagian: Atribut (berisi nama kolom database) dan Method/Operation (berisi fungsi coding yang kamu buat).
Class User
Atribut: + id_user, + username, + password, + role, + id_warga
Method: + login(), + logout(), + cekAkses()
Class Warga
Atribut: + id_warga, + nama_kepala_keluarga, + blok_rumah, + no_telp, + status_hunian, + tgl_batas_domisili
Method: + tambahWarga(), + editWarga(), + hapusWarga(), + cekStatusDomisili()
Class KategoriKas
Atribut: + id_kategori, + nama_kategori, + jenis_arus, + nominal_default
Method: + tambahKategori(), + editKategori(), + hapusKategori(), + getNominalOtomatis()
Class Transaksi
Atribut: + id_transaksi, + waktu_transaksi, + id_user, + id_warga, + id_kategori, + bulan_tagihan, + tahun_tagihan, + nominal, + tipe_arus, + keterangan
Method: + simpanPemasukan(), + simpanPengeluaran(), + cetakE_Kuitansi(), + getLaporanBulanan()
Class LogAktivitas (Class Baru)
Atribut: + id_log, + waktu_log, + id_user, + modul, + aksi, + keterangan
Method: + catatLog(), + exportLogToExcel(), + tampilkanRiwayatAdmin()



8. RANCANGAN UI DUMMY (IMPROVEMENT)
a. UI Login & Layout Dasar
Form Login: Input No. Telepon/Username, Input Password, Tombol "Masuk".
Layout Utama (Setelah Login): * Sidebar Kiri (Menu): Dashboard, Data Warga, Kategori Kas, Kas Masuk, Kas Keluar, Laporan.
Header Atas: Nama User yang Login (misal: "Halo, Budi (Admin)"), Tombol Logout.
b. UI Dashboard Admin
Card Statistik (Atas): Total Warga Aktif, Saldo Kas Saat Ini, Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini.
Tabel Aktivitas Terbaru (Bawah): Ini untuk memunculkan efek Audit Trail. Menampilkan 5 transaksi terakhir secara real-time (Kolom: Tanggal, Keterangan Transaksi, Nominal, Diinput Oleh).
c. UI Menu Data Warga
Tombol Aksi: "Tambah Warga Baru" (di kanan atas).
Tabel Data: No, Nama Kepala Keluarga, Blok Rumah, No. Telp, Status (Tetap/Kontrak), Batas Domisili, Aksi (Edit/Hapus).
Improvement UX: * Kolom No. Telp bisa diberi Icon WhatsApp (jika diklik langsung buka WA).
Baris warga yang batas domisilinya sisa < 3 bulan di-highlight Warna Merah atau diberi badge "Peringatan Domisili".
c. UI Menu Kategori Kas (Menu Baru)
Tabel Data: Nama Kategori, Jenis Arus (Masuk/Keluar), Nominal Default, Aksi.
Form Tambah/Edit: Input Nama, Pilih Jenis, Input Angka Nominal Default (Contoh: 25000).
d. UI Menu Kas Masuk (Pembayaran Warga)
Area Form Input: * Dropdown Pilih Nama Warga.
Dropdown Pilih Kategori Iuran (Keamanan/Sampah/dll). -> Saat ini dipilih, kolom nominal di bawahnya otomatis terisi.
Input Nominal (Bisa diedit/Otomatis).
Checkbox / Select Bulan (Bisa pilih lebih dari 1 jika nunggak).
Dropdown Tahun Tagihan (2025, 2026, dst).
Input Keterangan (Opsional).
Tombol "Simpan Pembayaran".
Area Tabel (Kanan/Bawah): Menampilkan histori kas masuk hari ini.
e. UI Menu Kas Keluar (Pengeluaran RT)
Area Form Input: * Dropdown Kategori (Misal: Operasional, Sosial, dll).
Input Tanggal Pengeluaran.
Input Nominal.
Input Keterangan Detail (Misal: "Beli 2 buah sapu lidi dan pengki").
Tombol "Simpan Pengeluaran".
f. UI Menu Laporan Keuangan (Untuk di-Share ke Warga)
Area Filter: Dropdown Bulan Awal, Bulan Akhir, Tahun, Tombol "Filter", Tombol "Cetak PDF / Excel".
Tabel Laporan: Tanggal, Uraian/Keterangan, Pemasukan (Rp), Pengeluaran (Rp), Saldo (Rp), Petugas (Audit Trail).
g. UI Dashboard Warga (Tampilan Mobile-Friendly) Desain ini dibuat memanjang ke bawah seperti layar HP, karena warga pasti membukanya lewat HP.
Header: "Halo, Keluarga [Nama Warga]".
Card Atas: "Saldo Kas Lingkungan RT: Rp X.XXX.XXX" (Transparansi).
Card Status Pembayaran (Tengah): Tampilan besar menunjukkan "Tagihan Bulan Ini: LUNAS" (Warna Hijau) atau "NUNGGAK" (Warna Merah).
Tombol Aksi (Bawah): "Lihat Riwayat & E-Kuitansi". Jika diklik, muncul daftar bulan apa saja yang sudah dibayar beserta tanggal pembayarannya.
h. UI Menu Log Aktivitas / Audit Trail (Khusus Admin/Ketua RT)
h.1. Area Pencarian & Filter (Bagian Atas)
Filter Tanggal: Input Tanggal Mulai s/d Tanggal Akhir.
Filter Petugas: Dropdown pilih nama Admin (Misal: Semua Petugas, Bapak Budi, Bapak Andi).
Filter Modul/Kategori: Dropdown (Semua Aktivitas, Transaksi Masuk, Transaksi Keluar, Data Warga).
Tombol Aksi: Tombol "Cari/Filter" dan Tombol "Eksport Log (Excel/PDF)".
h.2. Area Tabel Log Aktivitas (Bagian Bawah) Tabel ini harus menampilkan data secara kronologis (waktu terbaru di urutan paling atas).
No
Waktu (Tanggal & Jam): (Misal: 12-04-2026 14:30:05) -> Jam/detik sangat penting di Audit Trail!
Petugas: Nama Admin yang sedang login saat itu.
Modul: (Misal: Kas Masuk / Kas Keluar / Data Warga / Login).
Aksi: (Tambah / Edit / Hapus).
Deskripsi Detail: Kalimat penjelas dari sistem. (Misal: "Mencatat iuran keamanan Rp 25.000 untuk Bpk. Ahmad (Blok A2)" atau "Mengubah data nomor telepon warga an. Ibu Siti").



