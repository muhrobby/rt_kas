# Panduan Tercepat Generate Class Diagram di Draw.io

Cara tercepat untuk membuat *Class Diagram* lengkap di Draw.io tanpa perlu menggambar kotak dan menarik garis satu-per-satu secara manual adalah dengan menggunakan fitur **Text-to-Diagram (Mermaid)**.

## Langkah-Langkah (1 Menit Selesai):
1. Buka [app.diagrams.net (Draw.io)](https://app.diagrams.net/) di browser Anda.
2. Buat diagram baru (Blank Diagram).
3. Pada Menu Bar di bagian paling atas, klik menu **Arrange** > **Insert** > **Advanced** > **Mermaid...** (Atau Anda bisa klik tombol `+` (Plus) di *toolbar* > Advanced > Mermaid).
4. Sebuah kotak teks akan muncul. Hapus teks contoh yang ada di dalamnya.
5. **Copy** dan **Paste** seluruh blok kode Mermaid di bawah ini ke dalam kotak tersebut.
6. Klik tombol **Insert** (Warna biru).
7. Selesai! Draw.io akan otomatis merender struktur *Class Diagram* beserta seluruh atribut, *method*, dan relasi kardinalitas antar-tabelnya secara rapi!

---

## Kode Mermaid (Tinggal Copy-Paste)

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String role
        +Integer wargaId
        +Boolean banned
        +Date createdAt
        +Date updatedAt
        +login()
        +logout()
        +cekAkses()
    }

    class Warga {
        +Integer id
        +String namaKepalaKeluarga
        +String blokRumah
        +String noTelp
        +String statusHunian
        +Date tglBatasDomisili
        +Date createdAt
        +Date updatedAt
        +tambahWarga()
        +editWarga()
        +hapusWarga()
        +cekStatusDomisili()
    }

    class KategoriKas {
        +Integer id
        +String namaKategori
        +String jenisArus
        +String tipeTagihan
        +Integer nominalDefault
        +Date createdAt
        +tambahKategori()
        +editKategori()
        +hapusKategori()
        +getNominalOtomatis()
    }

    class Transaksi {
        +Integer id
        +Date waktuTransaksi
        +String userId
        +Integer wargaId
        +Integer kategoriId
        +String bulanTagihan
        +Integer tahunTagihan
        +Integer nominal
        +String tipeArus
        +String keterangan
        +Date createdAt
        +simpanPemasukan()
        +simpanPengeluaran()
        +cetakE_Kuitansi()
        +getLaporanBulanan()
    }

    class LogAktivitas {
        +Integer id
        +Date waktuLog
        +String userId
        +String modul
        +String aksi
        +String keterangan
        +catatLog()
        +exportLogToExcel()
        +tampilkanRiwayatAdmin()
    }

    %% Definisi Relasi (Kardinalitas)
    Warga "1" -- "0..1" User : memiliki akun >
    Warga "1" -- "*" Transaksi : bayar tagihan >
    KategoriKas "1" -- "*" Transaksi : diklasifikasikan >
    User "1" -- "*" Transaksi : catat pembayaran >
    User "1" -- "*" LogAktivitas : trigger audit trail >
```

> **Tips:** Setelah ter-generate di kanvas Draw.io, Anda bisa memindahkan posisi setiap kotak secara bebas dan garisnya akan tetap terhubung otomatis secara dinamis. Anda juga bisa mengganti warna (Style) dari masing-masing komponen class di menu palet sebelah kanan.
