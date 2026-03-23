-- RT Kas - Final Relational Database Schema (PostgreSQL)
-- Tujuan: menjaga konsistensi relasi dan mencegah data transaksi inkonsisten.

BEGIN;

-- =========================================================
-- 0) ENUM TYPES
-- =========================================================
DO $$ BEGIN
  CREATE TYPE status_hunian AS ENUM ('tetap', 'kontrak');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE jenis_arus AS ENUM ('masuk', 'keluar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipe_tagihan AS ENUM ('bulanan', 'sekali');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipe_arus AS ENUM ('masuk', 'keluar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE aksi AS ENUM ('tambah', 'edit', 'hapus', 'login', 'logout');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- 1) MASTER TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS warga (
    id SERIAL PRIMARY KEY,
    nama_kepala_keluarga TEXT NOT NULL,
    blok_rumah TEXT NOT NULL,
    no_telp TEXT NOT NULL UNIQUE,
    status_hunian status_hunian NOT NULL DEFAULT 'tetap',
    tgl_batas_domisili DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT warga_ck_status_domisili CHECK (
        (
            status_hunian = 'tetap'
            AND tgl_batas_domisili IS NULL
        )
        OR (
            status_hunian = 'kontrak'
            AND tgl_batas_domisili IS NOT NULL
        )
    )
);

-- Better Auth managed table: "user"
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    username TEXT UNIQUE,
    display_username TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires TIMESTAMP,
    warga_id INTEGER UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT user_ck_role CHECK (role IN ('admin', 'user'))
);

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_warga_id_fkey;

ALTER TABLE "user"
ADD CONSTRAINT user_warga_id_fkey FOREIGN KEY (warga_id) REFERENCES warga (id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT account_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    impersonated_by TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kategori_kas (
    id SERIAL PRIMARY KEY,
    nama_kategori TEXT NOT NULL,
    jenis_arus jenis_arus NOT NULL,
    tipe_tagihan tipe_tagihan NOT NULL DEFAULT 'bulanan',
    nominal_default INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT kategori_kas_ck_nominal_default CHECK (nominal_default >= 0),
    CONSTRAINT kategori_kas_uq_nama_jenis_tipe UNIQUE (
        nama_kategori,
        jenis_arus,
        tipe_tagihan
    )
);

-- =========================================================
-- 2) TRANSACTIONAL TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS transaksi (
    id SERIAL PRIMARY KEY,
    waktu_transaksi TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL,
    warga_id INTEGER,
    kategori_id INTEGER NOT NULL,
    bulan_tagihan VARCHAR(20),
    tahun_tagihan INTEGER,
    nominal INTEGER NOT NULL,
    tipe_arus tipe_arus NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT transaksi_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT transaksi_warga_id_fkey FOREIGN KEY (warga_id) REFERENCES warga (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT transaksi_kategori_id_fkey FOREIGN KEY (kategori_id) REFERENCES kategori_kas (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT transaksi_ck_nominal_pos CHECK (nominal > 0),
    CONSTRAINT transaksi_ck_tahun CHECK (
        tahun_tagihan IS NULL
        OR tahun_tagihan BETWEEN 2000 AND 2100
    ),
    CONSTRAINT transaksi_ck_masuk_keluar_shape CHECK (
        (
            tipe_arus = 'keluar'
            AND warga_id IS NULL
            AND bulan_tagihan IS NULL
            AND tahun_tagihan IS NULL
        )
        OR (
            tipe_arus = 'masuk'
            AND warga_id IS NOT NULL
        )
    )
);

CREATE TABLE IF NOT EXISTS log_aktivitas (
    id SERIAL PRIMARY KEY,
    waktu_log TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL,
    modul TEXT NOT NULL,
    aksi aksi NOT NULL,
    keterangan TEXT NOT NULL,
    CONSTRAINT log_aktivitas_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =========================================================
-- 3) INDEXES FOR PERFORMANCE + CONSISTENCY
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_transaksi_waktu ON transaksi (waktu_transaksi DESC);

CREATE INDEX IF NOT EXISTS idx_transaksi_warga_tipe_tahun_bulan ON transaksi (
    warga_id,
    tipe_arus,
    tahun_tagihan,
    bulan_tagihan
);

CREATE INDEX IF NOT EXISTS idx_transaksi_kategori_tipe ON transaksi (kategori_id, tipe_arus);

CREATE INDEX IF NOT EXISTS idx_log_aktivitas_waktu ON log_aktivitas (waktu_log DESC);

CREATE INDEX IF NOT EXISTS idx_log_aktivitas_user ON log_aktivitas (user_id, waktu_log DESC);

-- Cegah duplikasi iuran bulanan (warga + kategori + bulan + tahun harus unik)
CREATE UNIQUE INDEX IF NOT EXISTS uq_transaksi_masuk_bulanan ON transaksi (
    warga_id,
    kategori_id,
    tahun_tagihan,
    bulan_tagihan
)
WHERE
    tipe_arus = 'masuk'
    AND bulan_tagihan IS NOT NULL
    AND tahun_tagihan IS NOT NULL;

-- Cegah duplikasi iuran sekali bayar (warga + kategori sekali)
CREATE UNIQUE INDEX IF NOT EXISTS uq_transaksi_masuk_sekali ON transaksi (warga_id, kategori_id)
WHERE
    tipe_arus = 'masuk'
    AND bulan_tagihan IS NULL
    AND tahun_tagihan IS NULL;

-- =========================================================
-- 4) TRIGGERS FOR BUSINESS CONSISTENCY
-- =========================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warga_set_updated_at ON warga;

CREATE TRIGGER trg_warga_set_updated_at
  BEFORE UPDATE ON warga
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_user_set_updated_at ON "user";

CREATE TRIGGER trg_user_set_updated_at
  BEFORE UPDATE ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_validate_transaksi_kategori_jenis()
RETURNS TRIGGER AS $$
DECLARE
  v_jenis jenis_arus;
BEGIN
  SELECT k.jenis_arus
    INTO v_jenis
  FROM kategori_kas k
  WHERE k.id = NEW.kategori_id;

  IF v_jenis IS NULL THEN
    RAISE EXCEPTION 'Kategori kas % tidak ditemukan', NEW.kategori_id;
  END IF;

  IF v_jenis::TEXT <> NEW.tipe_arus::TEXT THEN
    RAISE EXCEPTION 'Jenis arus kategori (%) tidak sama dengan tipe_arus transaksi (%)', v_jenis, NEW.tipe_arus;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transaksi_validate_kategori_jenis ON transaksi;

CREATE TRIGGER trg_transaksi_validate_kategori_jenis
  BEFORE INSERT OR UPDATE ON transaksi
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_transaksi_kategori_jenis();

COMMIT;

-- =========================================================
-- RELASI TABEL (RINGKAS)
-- =========================================================
-- warga (1) ---- (0..1) user        via user.warga_id (UNIQUE)
-- user  (1) ---- (M)   transaksi    via transaksi.user_id
-- user  (1) ---- (M)   log_aktivitas via log_aktivitas.user_id
-- warga (1) ---- (M)   transaksi    via transaksi.warga_id (nullable untuk arus keluar)
-- kategori_kas (1) -- (M) transaksi via transaksi.kategori_id