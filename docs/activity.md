# Activity Diagrams

Dokumen ini memuat kumpulan blok kode **Mermaid Flowchart** yang merepresentasikan *Activity Diagram* untuk alur kerja operasional aplikasi Kas RT. 

Setiap aktivitas dipisahkan menggunakan *Swimlane* (Zona kerja dalam diagram: `Admin`/`Warga` dan `Sistem`) agar pembagian tugas antara pihak manusia (Aktor) dan komputer (Sistem) terlihat sangat jelas dan standar.

Gunakan kode di bawah pada **Draw.io** (`Arrange > Insert > Advanced > Mermaid...`) atau platform Markdown/Notion kesayangan Anda.

---

## 1. Kelola Data Warga & Akses Pengurus (Admin)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Admin [Aktor: Admin]
        A1[Pilih menu "Data Warga"] --> A2
        A2[Klik tombol "Tambah/Edit Warga"] --> A3
        A3[Mengisi form profil warga] --> A4
        A4[Atur "Switch Toggle" (Jadikan Pengurus)] --> A5
        A5[Klik Simpan]
    end

    subgraph Sistem [Sistem (Aplikasi & Database)]
        A5 --> S1{Validasi<br/>Inputan?}
        S1 -- Tidak Valid --> S2[Tampilkan Pesan Error]
        S2 --> A3
        
        S1 -- Valid --> S3[Simpan/Update Profil Warga di tb_warga]
        S3 --> S4[Sinkronisasikan Peran (Role) di tabel Auth_Users]
        S4 --> S5[Catat histori ke tb_log_aktivitas]
        S5 --> S6[Berikan notifikasi "Sukses" ke Layar]
    end

    S6 --> End((Selesai))
```

---

## 2. Kelola Kategori Iuran (Admin)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Admin [Aktor: Admin]
        A1[Pilih menu "Kategori Iuran"] --> A2
        A2[Klik "Tambah Kategori Baru"] --> A3
        A3[Input nama (Keamanan/Sampah) & Jenis Arus (Masuk/Keluar)] --> A4
        A4[Klik Simpan]
    end

    subgraph Sistem [Sistem Database]
        A4 --> S1[Validasi Input]
        S1 --> S2[Simpan kategori baru ke tb_kategori_kas]
        S2 --> S3[Tampilkan kategori tersebut di pilihan Pemasukan/Pengeluaran]
    end

    S3 --> End((Selesai))
```

---

## 3. Input Pembayaran Iuran Warga / Kas Masuk (Admin)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Admin [Aktor: Admin]
        A1[Buka menu "Kas Masuk / Pembayaran"] --> A2
        A2[Cari dan pilih nama Warga] --> A3
        A3[Pilih Kategori Iuran] --> A4
        A4[Centang bulan tagihan yang dibayarkan] --> A5
        A5[Klik Lakukan Pembayaran]
    end

    subgraph Sistem [Sistem Pengelola Kas]
        A5 --> S1[Hitung otomatis rincian nominal total]
        S1 --> S2[Simpan ke 'tb_transaksi' sebagai Arus Masuk]
        S2 --> S3[Ubah Status Tagihan Bulan Warga = Lunas]
        S3 --> S4[Sistem merender e-kuitansi digital di layar]
    end

    S4 --> End((Selesai))
```

---

## 4. Input Pengeluaran Operasional RT (Admin)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Admin [Aktor: Admin]
        A1[Buka menu "Kas Keluar / Pengeluaran"] --> A2
        A2[Isi Nominal Pengeluaran (Rp)] --> A3
        A3[Isi Tanggal & Keterangan (Cth: Beli Sapu)] --> A4
        A4[Klik Simpan Pengeluaran]
    end

    subgraph Sistem [Sistem Pengelola Kas]
        A4 --> S1[Validasi kelengkapan form pengeluaran]
        S1 --> S2[Simpan rekaman ke 'tb_transaksi' (Arus Keluar)]
        S2 --> S3[Eksekusi pemotongan/kalkulasi Saldo Kas RT bulan berjalan]
        S3 --> S4[Memunculkan konfirmasi Sukses memotong saldo]
    end

    S4 --> End((Selesai))
```

---

## 5. Cetak Laporan Keuangan (Admin)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Admin [Aktor: Admin]
        A1[Buka menu "Laporan Keuangan"] --> A2
        A2[Pilih Parameter Rentang Waktu (Cth: Jan 2026 - Mar 2026)] --> A3
        A3[Klik tombol "Cetak / Generate"]
    end

    subgraph Sistem [Sistem Pelaporan]
        A3 --> S1[Menarik Agregasi Data Pemasukan & Pengeluaran]
        S1 --> S2[Menyusun format tabulasi Neraca/Saldo akhir]
        S2 --> S3[Build/Render kumpulan Data menjadi File Renderan Tabel/PDF]
        S3 --> S4[Picu Unduhan ke perangkat Admin agar bisa di-*share* ke WhatsApp]
    end

    S4 --> End((Selesai))
```

---

## 6. Lihat Riwayat & Transparansi (Oleh Warga)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Warga [Aktor: Warga (Penghuni)]
        A1[Login menggunakan Akun Warga] --> A2
        A2[Buka menu "Riwayat Saya" / Dashboard Transparansi]
    end

    subgraph Sistem [Sistem Halaman Warga]
        A2 --> S1[Mendeteksi id_warga dari Session Login Aktif]
        S1 --> S2[Melakukan Query: Tarik Data di Database di mana id_warga = x]
        S2 --> S3[Kalkulasi Ringkasan Saldo RT Bersih Bulan Ini]
        S3 --> S4[Tampilkan Tabel Daftar Tagihan (Lunas/Nunggak) eksklusif untuk warga]
    end

    S4 --> A3
    
    subgraph Warga [Aktor: Warga (Penghuni)]
        A3[Warga bisa melihat detail kapan ia membayar tunggakan]
    end

    A3 --> End((Selesai))
```

---

## 7. Memantau Log Aktivitas (Admin)

```mermaid
flowchart TD
    Start((Mulai)) --> A1

    subgraph Admin [Aktor: Super Admin]
        A1[Pilih menu "Log Aktivitas"]
    end

    subgraph Sistem [Sistem Audit Trail]
        A1 --> S1[Tarik seluruh data riwayat kronologis dari 'tb_log_aktivitas']
        S1 --> S2[Format waktu menjadi zona yang mudah dibaca (Sejak jam, Aksi Tipe)]
        S2 --> S3[Paparkan Tabel Jejak Rekam ke layar Admin]
    end

    S3 --> A2

    subgraph Admin [Aktor: Super Admin]
        A2[Melihat rentetan daftar aktivitas] --> A3
        A3[Lakukan pencarian Spesifik/Filter (Misal: Cari Siapa yang merubah data di jam 13:00)]
    end
    
    A3 --> S4

    subgraph Sistem [Sistem Audit Trail]
        S4[Menampilkan hasil filter Log Spesifik]
    end

    S4 --> End((Selesai))
```
