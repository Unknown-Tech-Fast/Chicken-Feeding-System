-- ====================================================================
-- SISTEM PAKAN & ALOKASI BIAYA AYAM (FARM CIMANGKOK)
-- SUPABASE POSTGRESQL INITIAL SCHEMA & INITIAL DATA SEEDER
-- ====================================================================
-- Cara Penggunaan di Supabase:
-- 1. Buka Supabase Dashboard project Anda (https://supabase.com/dashboard)
-- 2. Pilih menu "SQL Editor" di bilah sisi kiri
-- 3. Copy seluruh isi file ini, paste ke SQL Editor, lalu klik "RUN"
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. TABEL MASTER LOKASI (FARM)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_lokasi (
    id SERIAL PRIMARY KEY,
    kode_lokasi VARCHAR(50) UNIQUE NOT NULL,
    nama_lokasi VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. TABEL MASTER KANDANG
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_kandang (
    id SERIAL PRIMARY KEY,
    lokasi_id INT NOT NULL REFERENCES master_lokasi(id) ON DELETE RESTRICT,
    kode_kandang VARCHAR(50) NOT NULL,
    nama_kandang VARCHAR(100),
    kapasitas INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_kandang_per_lokasi UNIQUE (lokasi_id, kode_kandang)
);

-- --------------------------------------------------------------------
-- 3. TABEL MASTER AYAM (FASE AYAM)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_ayam (
    id SERIAL PRIMARY KEY,
    kode_fase VARCHAR(50) UNIQUE NOT NULL, -- 'DOC', 'GROWING', 'LAYING', 'BROILER'
    nama_fase VARCHAR(150) NOT NULL,
    default_umur_deplesi INT DEFAULT 0,    -- 9 bulan untuk Laying, 0 untuk lainnya
    coa_persediaan VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. TABEL MASTER COA MAPPING
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_coa_mapping (
    id SERIAL PRIMARY KEY,
    kode_coa VARCHAR(50) UNIQUE NOT NULL,
    nama_coa VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL, -- 'PAKAN', 'DISINFECTANT', 'VACCINE', 'MEDICINE', 'OVERHEAD_OVK', 'PEMBELIAN_AYAM'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. TABEL PERIODE CLOSING (KONTROL PERIODE TRANSAKSI)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS periode_closing (
    id SERIAL PRIMARY KEY,
    tahun INT NOT NULL,
    bulan SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CALCULATED', 'LOCKED')),
    total_biaya_operasional NUMERIC(20,2) DEFAULT 0,
    locked_at TIMESTAMPTZ,
    locked_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tahun_bulan UNIQUE (tahun, bulan)
);

-- --------------------------------------------------------------------
-- 6. TABEL JOURNAL DETAIL (PENAMPUNG DATA ODOO A-Q & JURNAL ALOKASI)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_detail (
    id BIGSERIAL PRIMARY KEY,
    import_batch_id UUID,
    sumber VARCHAR(30) DEFAULT 'IMPORT_ODOO' CHECK (sumber IN ('IMPORT_ODOO', 'ENGINE_ALOKASI')),
    sheet_sumber VARCHAR(50), -- 'PAKAN.VOD', 'AYAM', 'OVK', atau NULL jika hasil engine
    bulan SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    field1 VARCHAR(50),      -- 'PEMBELIAN', 'PEMAKAIAN'
    divisi VARCHAR(50),      -- 'GPS', 'TIB'
    lokasi_id INT REFERENCES master_lokasi(id) ON DELETE SET NULL,
    lokasi_raw VARCHAR(150), -- Teks asli dari Odoo: 'Farm Cimangkok', dll
    kandang_id INT REFERENCES master_kandang(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'posted',
    tipe_internal VARCHAR(100),
    rekening_jenis VARCHAR(100),
    kode_coa VARCHAR(50) NOT NULL,
    nama_coa VARCHAR(200) NOT NULL,
    rekanan VARCHAR(200),
    label TEXT,
    referensi VARCHAR(150),
    nomor VARCHAR(150),      -- Nomor dokumen Odoo / Nomor jurnal alokasi
    tanggal DATE NOT NULL,
    debit NUMERIC(20,2) DEFAULT 0,
    kredit NUMERIC(20,2) DEFAULT 0,
    mutasi NUMERIC(20,2) DEFAULT 0, -- DEBIT - KREDIT
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk akselerasi query agregasi auto-pivot
CREATE INDEX IF NOT EXISTS idx_journal_detail_pivot 
    ON journal_detail(bulan, lokasi_raw, kode_coa);
CREATE INDEX IF NOT EXISTS idx_journal_detail_sheet_bulan 
    ON journal_detail(sheet_sumber, bulan);
CREATE INDEX IF NOT EXISTS idx_journal_detail_batch 
    ON journal_detail(import_batch_id);

-- --------------------------------------------------------------------
-- 7. TABEL TRANSAKSI AYAM BULANAN (SHEET CIMANGKOK KOLOM A s/d I)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaksi_ayam_bulanan (
    id BIGSERIAL PRIMARY KEY,
    periode_id INT NOT NULL REFERENCES periode_closing(id) ON DELETE RESTRICT,
    kandang_id INT NOT NULL REFERENCES master_kandang(id) ON DELETE RESTRICT,
    master_ayam_id INT NOT NULL REFERENCES master_ayam(id) ON DELETE RESTRICT,
    flock_no VARCHAR(100) DEFAULT 'GPS ROSS',
    umur_minggu INT DEFAULT 0,
    so_ekor INT NOT NULL DEFAULT 0,        -- Saldo Awal (Auto dari SA bulan sebelumnya)
    in_ekor INT NOT NULL DEFAULT 0,        -- Input User: Ayam Masuk
    out_ekor INT NOT NULL DEFAULT 0,       -- Input User: Ayam Keluar Total
    -- Saldo Akhir Terumus Otomatis di PostgreSQL (SO + In - Out):
    sa_ekor INT GENERATED ALWAYS AS (so_ekor + in_ekor - out_ekor) STORED,
    mati_ekor INT DEFAULT 0,              -- Rincian Out: Mati
    jual_ekor INT DEFAULT 0,              -- Rincian Out: Jual
    koreksi_ekor INT DEFAULT 0,           -- Rincian Out: Koreksi/Mutasi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_periode_kandang UNIQUE (periode_id, kandang_id)
);

-- --------------------------------------------------------------------
-- 8. TABEL ALOKASI BIAYA KANDANG (SHEET CIMANGKOK KOLOM J s/d W)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alokasi_biaya_kandang (
    id BIGSERIAL PRIMARY KEY,
    transaksi_ayam_id BIGINT NOT NULL UNIQUE REFERENCES transaksi_ayam_bulanan(id) ON DELETE CASCADE,
    nbo_ayam NUMERIC(20,2) DEFAULT 0,          -- Nilai Buku Awal Rupiah
    nbo_ayam_dp NUMERIC(20,2) DEFAULT 0,       -- Nilai Buku Awal Deplesi
    alokasi_biaya NUMERIC(20,2) DEFAULT 0,     -- Alokasi Biaya Masuk (Pakan & OVK)
    koreksi_alokasi NUMERIC(20,2) DEFAULT 0,   -- Plug penyesuaian manual jika ada
    mati_rupiah NUMERIC(20,2) DEFAULT 0,
    jual_rupiah NUMERIC(20,2) DEFAULT 0,
    mutasi_koreksi_rupiah NUMERIC(20,2) DEFAULT 0,
    nba_ayam NUMERIC(20,2) DEFAULT 0,          -- Nilai Buku Sebelum Deplesi (J - M - N - O)
    umur_deplesi SMALLINT DEFAULT 9,
    deplesi_rupiah NUMERIC(20,2) DEFAULT 0,    -- Biaya deplesi bulan berjalan
    nba_ayam_dp NUMERIC(20,2) DEFAULT 0,       -- Nilai Buku Akhir Deplesi
    status_perhitungan VARCHAR(20) DEFAULT 'DRAFT' CHECK (status_perhitungan IN ('DRAFT', 'FINAL')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INITIAL SEEDER DATA (DATA AWAL LENGKAP DARI EXCEL)
-- ====================================================================

-- A. SEED MASTER LOKASI (FARM)
INSERT INTO master_lokasi (kode_lokasi, nama_lokasi) VALUES
    ('F-CMK', 'Farm Cimangkok'),
    ('F-CRU', 'Farm Cariu'),
    ('F-GBR', 'Farm Gekbrong'),
    ('F-TLN', 'Farm Talun'),
    ('F-CMS', 'Farm Cimayasari'),
    ('F-TNJ', 'Farm Tenjo Kalijati')
ON CONFLICT (kode_lokasi) DO NOTHING;

-- B. SEED MASTER AYAM (FASE AYAM)
INSERT INTO master_ayam (kode_fase, nama_fase, default_umur_deplesi, coa_persediaan) VALUES
    ('DOC', 'Day Old Chick (DOC)', 0, '1-130-1'),
    ('GROWING', 'Ayam Growing (Masa Pertumbuhan)', 0, '1-130-1'),
    ('LAYING', 'Ayam Laying (Masa Produksi)', 9, '1-130-1'),
    ('BROILER', 'Ayam Broiler (Komersil)', 0, '1-130-2')
ON CONFLICT (kode_fase) DO NOTHING;

-- C. SEED MASTER COA MAPPING (PAKAN, VAKSIN, OBAT, OVK)
INSERT INTO master_coa_mapping (kode_coa, nama_coa, kategori) VALUES
    ('1-130-3', 'Persediaan Pakan', 'PAKAN'),
    ('1-130-4', 'Persediaan Disinfectant', 'DISINFECTANT'),
    ('1-130-5', 'Persediaan Vaccine', 'VACCINE'),
    ('1-130-6', 'Persediaan Medicines & Vitamin', 'MEDICINE'),
    ('1-130-1', 'Persediaan Ayam GPS/PS', 'PEMBELIAN_AYAM'),
    ('5-500-2', 'By. Listrik', 'OVERHEAD_OVK'),
    ('5-500-4', 'By. Ongkos Angkut Pakan', 'OVERHEAD_OVK'),
    ('5-500-5', 'By. Ongkos Angkut DOC', 'OVERHEAD_OVK'),
    ('5-500-7', 'Bbm, Tol, Parkir & Transport Cabang', 'OVERHEAD_OVK'),
    ('5-500-10', 'By. Telpon Cabang', 'OVERHEAD_OVK'),
    ('5-500-11', 'By. Pengobatan Karyawan Cabang', 'OVERHEAD_OVK'),
    ('5-500-12', 'By. Perlengkapan Kandang', 'OVERHEAD_OVK'),
    ('5-500-16', 'By. Ongkos Angkut HE', 'OVERHEAD_OVK')
ON CONFLICT (kode_coa) DO NOTHING;

-- D. SEED 16 KANDANG FARM CIMANGKOK (PERSIS SESUAI SHEET CIMANGKOK)
INSERT INTO master_kandang (lokasi_id, kode_kandang, nama_kandang)
SELECT l.id, k.kode, k.kode
FROM master_lokasi l
CROSS JOIN (
    VALUES 
        ('B-CMK/10FL'), ('B-CMK/11FL'), ('B-CMK/11ML'), 
        ('B-CMK/1FL (A)'), ('B-CMK/1FL (B)'), ('B-CMK/1ML'), 
        ('B-CMK/2FL'), ('B-CMK/4FL'), ('B-CMK/4ML'), 
        ('B-CMK/5FL'), ('B-CMK/6FL'), ('B-CMK/6ML'), 
        ('B-CMK/12FL'), ('B-CMK/12ML'), ('B-CMK/3FL'), ('B-CMK/3ML')
) AS k(kode)
WHERE l.kode_lokasi = 'F-CMK'
ON CONFLICT (lokasi_id, kode_kandang) DO NOTHING;

-- E. SEED PERIODE TAHUN 2026 (BULAN 1 S/D 12)
INSERT INTO periode_closing (tahun, bulan, status)
SELECT 2026, b, 'OPEN'
FROM generate_series(1, 12) AS b
ON CONFLICT (tahun, bulan) DO NOTHING;

COMMIT;
