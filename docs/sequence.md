# Sequence Diagrams

Berikut adalah urutan Sequence Diagram menggunakan diagram Mermaid standar (*Boundary-Control-Entity* menggunakan label `<<stereotype>>` agar compatible dan siap *copy-paste* ke fasilitas Mermaid pada Draw.io).

---

## 1. Sequence Diagram: Proses Login
**Skenario:** Admin atau Warga masuk ke dalam sistem.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant V1 as <<boundary>><br/>Form_Login
    participant C as <<control>><br/>Auth_Controller
    participant M as <<entity>><br/>User_Model
    participant DB as <<entity>><br/>Database
    participant V2 as <<boundary>><br/>Halaman_Dashboard

    U->>V1: Input No. Telp & Password + Klik Login
    activate V1
    V1->>C: postLogin(no_telp, password)
    deactivate V1
    
    activate C
    C->>M: cekLogin()
    activate M
    M->>DB: SELECT * FROM tb_users
    activate DB
    DB-->>M: Hasil Pencarian (Valid/Tidak Valid)
    deactivate DB
    M-->>C: Status & Data User
    deactivate M
    
    alt Jika Valid
        C->>V2: Redirect (Buat Session)
        activate V2
        V2-->>U: Tampilkan Halaman Dashboard
        deactivate V2
    else Jika Tidak Valid
        C-->>V1: Redirect dengan Pesan Error
        activate V1
        V1-->>U: Tampilkan Pesan Error
        deactivate V1
    end
    deactivate C
```

---

## 2. Sequence Diagram: Kelola Data Warga & Hak Akses Pengurus (Admin)
**Skenario:** Admin mendata warga baru/pengontrak, sekaligus menentukan akses Pengurus.

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant V as <<boundary>><br/>Form_Warga
    participant C as <<control>><br/>Warga_Controller
    participant MW as <<entity>><br/>Warga_Model
    participant MU as <<entity>><br/>User_Model
    participant DB as <<entity>><br/>Database

    A->>V: Isi form, set role, tekan simpan
    activate V
    V->>C: submitDataWarga(data)
    deactivate V
    
    activate C
    Note over C: Validasi input skema Zod
    C->>MW: simpanWarga(data)
    
    activate MW
    MW->>DB: INSERT/UPDATE tb_warga
    activate DB
    DB-->>MW: Query Success
    deactivate DB
    
    MW->>MU: syncUserRole(id_warga, role)
    activate MU
    MU->>DB: UPDATE tb_users SET role
    activate DB
    DB-->>MU: Sync Success
    deactivate DB
    MU-->>MW: Sinkronisasi Akses Berhasil
    deactivate MU
    
    MW->>DB: INSERT log ke tb_log_aktivitas
    activate DB
    DB-->>MW: Audit Dibuat
    deactivate DB
    
    MW-->>C: Seluruh Transaksi Selesai
    deactivate MW
    
    C-->>V: Respon Sukses
    deactivate C
    
    activate V
    V-->>A: Konfirmasi Berhasil (UX)
    deactivate V
```

---

## 3. Sequence Diagram: Input Pembayaran Iuran (Kas Masuk)
**Skenario:** Admin mencatat warga yang membayar iuran bulanan.

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant V1 as <<boundary>><br/>Form_Transaksi
    participant C as <<control>><br/>Transaksi_Controller
    participant M as <<entity>><br/>Transaksi_Model
    participant DB as <<entity>><br/>Database
    participant V2 as <<boundary>><br/>Kuitansi_View

    A->>V1: Pilih warga, kategori, bulan & simpan
    activate V1
    V1->>C: simpanPembayaran()
    deactivate V1
    
    activate C
    C->>M: prosesTransaksi()
    
    activate M
    M->>DB: INSERT INTO tb_transaksi
    activate DB
    DB-->>M: Insert Transaksi Berhasil
    
    DB->>DB: UPDATE status_tagihan = 'Lunas'
    Note right of DB: (Opsional: Jika ada<br/>tabel master tagihan terpisah)
    
    DB-->>M: Respon Database Sukses
    deactivate DB
    
    M-->>C: Data Transaksi Tersimpan
    deactivate M
    
    C->>V2: renderKuitansi(data)
    deactivate C
    
    activate V2
    V2-->>A: Tampilkan Struk Digital (E-Kuitansi)
    deactivate V2
```
