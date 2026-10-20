# Product Requirement Document (PRD)
# Sistem Jurnal & Alokasi Biaya Ayam (Cimangkok Cost Allocation Engine)

| Dokumen | Keterangan |
|---|---|
| **Versi** | v1.0 (Revised PM & UI/UX Streamlined MVP) |
| **Tanggal Revisi** | 20 Oktober 2026 |
| **Status** | Approved for MVP Development |
| **Tech Stack** | Backend: Laravel (REST API) • Frontend: React + TypeScript (Vite, TanStack Table) • DB: PostgreSQL / Supabase |
| **Referensi Utama** | `konsep alokasi biaya (1).xlsx` (Sheet OVK, PAKAN.VOD, AYAM, CIMANGKOK) • `Table Sistem Ayam.txt` |

---

## 1. Executive Summary & Project Objective

Sistem ini dibangun untuk **mengotomasi proses alokasi biaya operasional dan deplesi populasi ayam** dari data tarikan buku besar Odoo yang selama ini dikerjakan secara manual di Excel (`konsep alokasi biaya (1).xlsx`).

### Problem Statement
1. **Olah Data Manual yang Berat:** File Excel mengolah puluhan ribu baris data buku besar (AYAM 14.134 baris, PAKAN.VOD 57.412 baris, OVK 11.380 baris) dengan Pivot Table dan rumus bertingkat (`SUMIFS`, `VLOOKUP`, `ROUND`), rawan *freeze*, error referensi, dan tidak *multi-user*.
2. **Pergerakan Data Populasi yang Dinamis:** Input populasi ayam (Saldo Awal, In, Out, Saldo Akhir) bergerak setiap bulan. Jika ada revisi di bulan lampau, keterkaitan Saldo Akhir bulan lalu menjadi Saldo Awal bulan berikutnya rawan terputus atau salah tumpuk di Excel.
3. **Ketergantungan Formula Silang:** Perhitungan biaya pakan, OVK, pembelian ayam, dan mutasi kandang mengacu pada pivot sheet lain yang rentan pergeseran baris.

### Solusi MVP (Phase 1 Scratch)
- Memindahkan proses pivot data Odoo ke database SQL yang cepat dan otomatis.
- Menyediakan antarmuka input grid yang user-friendly (Excel-like experience) untuk populasi ayam Cimangkok (Kolom A-I).
- Mengotomasi perhitungan Saldo Akhir ($SA$) dan estafet dinamis ke Saldo Awal ($SO$) bulan berikutnya.
- Menghitung alokasi biaya operasional per kandang dan deplesi secara presisi dengan angka target 100% parity terhadap sheet `CIMANGKOK`.

---

## 2. Scope Management (Prinsip Project Manager: Anti-Scope Creep)

Sebagai proyek rintisan (*scratch project*), cakupan harus dijaga ketat agar cepat dirilis (*time-to-market*), stabil, dan bebas *bloatware*, namun dengan arsitektur bersih yang siap diekstensi (*enhancement-ready*).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SCOPE BOUNDARY PHASE 1 (MVP)                    │
│                                                                        │
│   [Feeder Odoo: A-Q]        [Input Cimangkok A-I]     [Engine Alokasi] │
│   • Import OVK, PAKAN, AYAM  • Grid Input Dinamis     • Bagi biaya SO  │
│   • Auto-Pivot Aggregation   • SA = SO + In - Out     • Deplesi 9 bln  │
│   • Stored in GL DB          • Dynamic Month Rollover • Output Parity  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (Architecturally Ready)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DEFERRED TO PHASE 2 (FUTURE ENHANCEMENT)             │
│   • Farm Lain (Cariu, Gekbrong, Talun)                                │
│   • Sheet Komersil (Broiler Detail) & HPP DOC Pajak                   │
│   • Direct API Connector ke Odoo (saat ini tetap via file upload)     │
│   • Modul Kasir / AP / AR / Invoice Harian Penuh                       │
│   • Sheet REKAP Multi-Lokasi Konsolidasi                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Analisis Alur Data & Formula Matematis (Berdasarkan File Excel)

### 3.1 Alur 1: Data Tarikan Odoo (Kolom A s/d Q) & Otomasi Pivot
Ketiga sheet (`OVK`, `PAKAN.VOD`, `AYAM`) memiliki struktur data transaksi buku besar Odoo yang seragam dari Kolom A sampai Q:

| Kolom | Nama Field | Deskripsi & Tipe |
|---|---|---|
| **A** | `BULAN` | Angka bulan transaksi (1 s/d 12) |
| **B** | `FIELD1` | Status transaksi: `PEMBELIAN` atau `PEMAKAIAN` (default) |
| **C** | `DIVISI` | Divisi bisnis (contoh: `GPS`, `TIB`) |
| **D** | `LOKASI` | Akun Analitik / Lokasi Farm (contoh: `Farm Cimangkok`) |
| **E** | `STATUS` | Status posting Odoo (`posted`) |
| **F** | `TIPE INTERNAL` | Tipe internal rekening (`other`, dll) |
| **G** | `REKENING/JENIS` | Klasifikasi jenis (contoh: `Pengeluaran`, `Aktiva Lancar`) |
| **H** | `NO COA` | Kode akun akuntansi (contoh: `1-130-3`, `5-500-11`) |
| **I** | `NAMA COA` | Deskripsi akun (contoh: `Persediaan Pakan`, `By. Listrik`) |
| **J** | `REKANAN/SUPPLIER`| Nama vendor / customer / partner |
| **K** | `LABEL` | Catatan transaksi / keterangan pengeluaran |
| **L** | `REFERENSI` | Nomor bukti transaksi lapangan |
| **M** | `NOMOR` | Nomor dokumen jurnal Odoo |
| **N** | `TANGGAL` | Tanggal transaksi (YYYY-MM-DD) |
| **O** | `DEBIT` | Nilai debit transaksi (Rp) |
| **P** | `KREDIT` | Nilai kredit transaksi (Rp) |
| **Q** | `MUTASI` | Net mutasi (`DEBIT - KREDIT`) |

**Otomasi Pivot di Sistem (Tanpa Excel Pivot):**
Sistem langsung mengagregasi data kolom A-Q ini menggunakan query SQL:
1. **Pivot PAKAN.VOD (Biaya Operasional Utama Farm Cimangkok):**
   - Agregasi `SUM(mutasi)` per `bulan` dan `no_coa` untuk `lokasi = 'Farm Cimangkok'` & `field1 = 'PEMAKAIAN'`:
     - `1-130-3` = Persediaan Pakan
     - `1-130-4` = Persediaan Disinfectant
     - `1-130-5` = Persediaan Vaccine
     - `1-130-6` = Persediaan Medicines & Vitamin
2. **Pivot AYAM (Pembelian & Mutasi Ekor):**
   - Agregasi `SUM(mutasi)` per `bulan` untuk `lokasi = 'Farm Cimangkok'` & `field1 = 'PEMBELIAN'`.
3. **Pivot OVK (Overhead Farm):**
   - Agregasi `SUM(mutasi)` per `bulan` untuk `lokasi = 'Farm Cimangkok'` pada akun biaya 5-xxx.

---

### 3.2 Alur 2: Sheet CIMANGKOK Kolom A s/d I (Input Populasi & Rollover Dinamis)
Kolom A sampai I merupakan data fisik populasi ayam per kandang:

| Kolom | Field | Sifat | Deskripsi |
|---|---|---|---|
| **A** | `BULAN` | Sistem / Dropdown | Periode bulan berjalan (1..12) |
| **B** | `TYPE` | Pilihan Master | Fase Ayam: `AYAM LAYING` atau `AYAM GROWING` |
| **C** | `KANDANG` | Pilihan Master | Kode Kandang (contoh: `B-CMK/10FL`) |
| **D** | `FLOCK NO` | Master / Input | Nomor Flock / Strain (contoh: `GPS ROSS`) |
| **E** | `UMUR MINGGU` | Input / Auto+4 | Umur ayam dalam minggu |
| **F** | `SO` | **Otomatis** (Bln > 1) | Saldo Awal (Populasi Awal Ekor) |
| **G** | `In` | **Input User** | Total ayam masuk (DOC masuk / Transfer masuk) |
| **H** | `Out` | **Input User** | Total ayam keluar (Mati + Jual/Afkir + Mutasi keluar) |
| **I** | `SA` | **Otomatis Terumus** | Saldo Akhir Populasi (Ekor) |

#### Rumus Kolom I (Saldo Akhir):
$$SA_{t, k} = SO_{t, k} + In_{t, k} - Out_{t, k}$$
*Validasi:* $SA$ tidak boleh negatif ($SA \ge 0$). Jika $In$ dan $Out$ kosong, dianggap 0.

#### Aturan Estafet Dinamis Antar Bulan (Month Rollover):
Untuk menjaga data bergerak terus secara konsisten seiring berjalannya waktu:
$$SO_{t+1, k} = SA_{t, k}$$
1. Ketika user membuka/menginput periode baru ($t+1$), nilai $SO$ untuk setiap kandang $k$ **otomatis terisi** dari nilai $SA$ bulan sebelumnya ($t$).
2. **Dynamic Cascading Update:** Jika user melakukan koreksi input ($In$ atau $Out$) pada bulan $t$, sistem akan otomatis menghitung ulang $SA_t$ dan secara kaskade memperbarui $SO_{t+1}$ pada bulan-bulan berikutnya yang belum ditutup (*locked*).

---

### 3.3 Alur 3: Sheet CIMANGKOK Setelah Kolom I (Kolom J s/d W: Engine Biaya & Alokasi)
Setelah data populasi Kolom A-I lengkap, sistem menjalankan perhitungan biaya:

| Kolom | Label Excel | Formula / Logika Sistem |
|---|---|---|
| **J** | `NBO AYAM` | **Nilai Buku Awal (Rp):** Bulan 1 dari Saldo Awal Master; Bulan $t > 1$ mengambil `NBA AYAM` (Kolom P) bulan sebelumnya. |
| **K** | `NBO AYAM DP` | **Nilai Buku Deplesi Awal (Rp):** Bulan $t > 1$ mengambil `NBA AYAM DP` (Kolom U) bulan sebelumnya. |
| **L** | `ALOKASI BIAYA` | **Alokasi Biaya Bulanan (Rp):**<br>$$\text{Alokasi}_k = \text{ROUND}\left( \frac{\text{Total Biaya Operasional Bulan Ini}}{\sum SO_{\text{semua kandang}}} \times SO_k + \text{Penyesuaian Plug}_k, 0 \right)$$<br>*Total Biaya Operasional diambil dari Pivot PAKAN.VOD (Pakan, Disinfektan, Vaksin, Meds).* |
| **M** | `MATI` | Proporsi nilai rupiah ayam yang mati. |
| **N** | `JUAL` | Nilai rupiah ayam afkir/dijual. |
| **O** | `KOREKSI/MUTASI`| Penyesuaian nilai mutasi/koreksi buku. |
| **P** | `NBA AYAM` | **Nilai Buku Akhir Sebelum Deplesi (Rp):**<br>$$P = J - M - N - O$$ |
| **Q** | `BIAYA` | Akumulasi biaya untuk ayam growing (fase pembesaran). |
| **R** | `UMUR DEPRESI` | Sisa masa deplesi ayam laying (default: 9 bulan, atau parameter). |
| **S** | `DEPLESI` | **Biaya Deplesi Bulan Ini (Rp):**<br>- Untuk Laying: $$\frac{P}{R}$$ (NBA Ayam dibagi 9)<br>- Untuk Growing: $$0$$ |
| **T** | `Mutasi` | Nilai rupiah mutasi ayam growing yang naik ke laying. |
| **U** | `NBA AYAM DP` | **Nilai Buku Deplesi Akhir (Rp):** Akumulasi deplesi berjalan. |
| **W** | `TOTAL` | Total biaya terpakai ($L + M + N + O + S$). |

---

## 4. Koreksi & Rasionalisasi Tabel Database

Berdasarkan draf manual di file `Table Sistem Ayam.txt` dan evaluasi struktur PRD lama (17 tabel):

```
Table Sistem Ayam.txt (Manual User):
1: modul master journal detail
2: modul master ayam ( laying , growing, broiler, doc -> day of chicken )
3: modul master kandang
4: modul master lokasi 
5: modul transaksi ayam 
```

### 4.1 Tabel yang Dihilangkan / Disederhanakan (Anti-Overengineering)
| Tabel PRD Lama | Status | Alasan Rasionalisasi PM |
|---|---|---|
| `partner_alias` | **Dihilangkan** | Untuk MVP scratch, nama rekanan cukup disimpan sebagai teks asli dari Odoo. Normalisasi alias NPWP cabang ditunda ke Phase 2. |
| `lokasi_alias` | **Dihilangkan** | Nama lokasi farm distandarisasi saat import lewat script mapping sederhana, tidak perlu tabel alias dinamis tersendiri. |
| `import_row` (Staging) | **Dihilangkan** | Membengkakkan DB (80.000+ baris diduplikasi). Data file langsung divalidasi dan diinsert ke tabel `general_ledger` dengan penanda `batch_id`. |
| `parameter_hpp` | **Disederhanakan** | Parameter seperti masa deplesi (9 bulan) dijadikan kolom konfigurasi di tabel periode, tidak perlu tabel abstraction terpisah. |
| `jurnal_header` & `jurnal_detail` | **Disatukan** | Data Odoo yang diimport adalah baris transaksi buku besar (Kolom A-Q). Menggunakan tabel `general_ledger` jauh lebih cepat dan mudah di-pivot daripada header-detail yang terpecah. |

---

### 4.2 Skema Tabel Final Phase 1 (7 Tabel Inti + 1 Tabel Kontrol)

#### 1. `master_lokasi`
Menyimpan lokasi farm.
- `id` (PK, UUID / Serial)
- `kode_lokasi` (VARCHAR, contoh: `F-CMK`)
- `nama_lokasi` (VARCHAR, contoh: `Farm Cimangkok`)
- `is_active` (BOOLEAN, default: true)

#### 2. `master_kandang`
Menyimpan data kandang fisik per lokasi.
- `id` (PK)
- `lokasi_id` (FK -> `master_lokasi.id`)
- `kode_kandang` (VARCHAR, contoh: `B-CMK/10FL`, `B-CMK/1FL (A)`)
- `kapasitas` (INTEGER, nullable)
- `is_active` (BOOLEAN, default: true)

#### 3. `master_ayam`
Sesuai baris 2 `Table Sistem Ayam.txt` (laying, growing, broiler, doc):
- `id` (PK)
- `kode_fase` (VARCHAR: `DOC`, `GROWING`, `LAYING`, `BROILER`)
- `nama_fase` (VARCHAR, contoh: `Ayam Laying (Masa Produksi)`, `Ayam Growing (Masa Pertumbuhan)`)
- `default_umur_deplesi` (INTEGER, default: 9 untuk laying, 0 untuk growing)
- `coa_persediaan` (VARCHAR, contoh: `1-130-1`)

#### 4. `master_coa_mapping`
Pemetaan akun Odoo ke kategori operasional pakan & alokasi:
- `id` (PK)
- `kode_coa` (VARCHAR, contoh: `1-130-3`, `1-130-4`, `5-500-11`)
- `nama_coa` (VARCHAR)
- `kategori` (ENUM: `PAKAN`, `DISINFECTANT`, `VACCINE`, `MEDICINE`, `OVERHEAD_OVK`, `PEMBELIAN_AYAM`)

#### 5. `general_ledger` (Tarikan Data Odoo Kolom A s/d Q)
Menampung seluruh data mentah dari sheet `OVK`, `PAKAN.VOD`, dan `AYAM`:
- `id` (BIGINT PK)
- `import_batch_id` (UUID, untuk tracking file & idempotency)
- `sheet_sumber` (VARCHAR: `PAKAN.VOD`, `AYAM`, `OVK`)
- `bulan` (SMALLINT, 1..12)
- `field1` (VARCHAR: `PEMBELIAN`, `PEMAKAIAN`)
- `divisi` (VARCHAR)
- `lokasi_raw` (VARCHAR: `Farm Cimangkok`, dll)
- `status` (VARCHAR: `posted`)
- `kode_coa` (VARCHAR)
- `nama_coa` (VARCHAR)
- `rekanan` (VARCHAR, nullable)
- `label` (TEXT, nullable)
- `referensi` (VARCHAR, nullable)
- `nomor` (VARCHAR, nullable)
- `tanggal` (DATE)
- `debit` (NUMERIC(20,2))
- `kredit` (NUMERIC(20,2))
- `mutasi` (NUMERIC(20,2))
- *Index:* `(bulan, sheet_sumber, lokasi_raw)`, `(kode_coa)`

#### 6. `transaksi_ayam_bulanan` (Sesuai Kolom A s/d I Sheet CIMANGKOK)
Sesuai baris 5 `Table Sistem Ayam.txt`:
- `id` (PK)
- `periode_id` (FK -> `periode_closing.id`)
- `kandang_id` (FK -> `master_kandang.id`)
- `master_ayam_id` (FK -> `master_ayam.id`)
- `flock_no` (VARCHAR, default: `GPS ROSS`)
- `umur_minggu` (INTEGER)
- `so_ekor` (INTEGER) — Saldo Awal (Auto dari SA bulan lalu)
- `in_ekor` (INTEGER, default: 0) — Input User (Ayam Masuk)
- `out_ekor` (INTEGER, default: 0) — Input User (Ayam Keluar: Mati/Jual/Mutasi)
- `sa_ekor` (INTEGER) — **Auto Generated:** $SO + In - Out$
- `mati_ekor` (INTEGER, default: 0) — Breakdown Out
- `jual_ekor` (INTEGER, default: 0) — Breakdown Out
- `koreksi_ekor` (INTEGER, default: 0) — Breakdown Out
- *Constraint:* Unique `(periode_id, kandang_id)`

#### 7. `alokasi_biaya_kandang` (Sesuai Kolom J s/d W Sheet CIMANGKOK)
Hasil engine alokasi biaya:
- `id` (PK)
- `transaksi_ayam_id` (FK -> `transaksi_ayam_bulanan.id`)
- `nbo_ayam` (NUMERIC(20,2)) — Nilai Buku Awal
- `nbo_ayam_dp` (NUMERIC(20,2)) — Nilai Buku Awal Deplesi
- `alokasi_biaya` (NUMERIC(20,2)) — Proporsi Biaya Operasional
- `koreksi_alokasi` (NUMERIC(20,2), default: 0) — Plug manual jika ada
- `mati_rupiah` (NUMERIC(20,2))
- `jual_rupiah` (NUMERIC(20,2))
- `mutasi_koreksi_rupiah` (NUMERIC(20,2))
- `nba_ayam` (NUMERIC(20,2)) — Nilai Buku Akhir sebelum Deplesi
- `umur_deplesi` (SMALLINT, default: 9)
- `deplesi_rupiah` (NUMERIC(20,2)) — Beban deplesi bulan ini
- `nba_ayam_dp` (NUMERIC(20,2)) — Nilai Buku Akhir Deplesi
- `status_perhitungan` (ENUM: `DRAFT`, `FINAL`)

#### 8. `periode_closing`
Tabel kontrol bulan transaksi:
- `id` (PK)
- `tahun` (INTEGER)
- `bulan` (SMALLINT, 1..12)
- `status` (ENUM: `OPEN`, `CALCULATED`, `LOCKED`)
- `total_biaya_operasional` (NUMERIC(20,2))
- `locked_at` (TIMESTAMP, nullable)
- `locked_by` (VARCHAR, nullable)

---

## 5. UI/UX Design System & Page Architecture (Perspektif UI/UX Designer)

Sebagai UI/UX Designer, antarmuka dirancang khusus untuk meminimalkan beban kognitif akuntan dan operasional farm, dengan visual yang bersih, modern, dan fungsional.

### 5.1 Jumlah & Struktur Halaman (4 Core Pages + 1 Master Modal)

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TOP NAVIGATION BAR                        │
│   🐔 PakanCost Engine   [Farm Cimangkok ▼]  [Bulan: Jan 2026 ▼]  [🔒] │
└────────────────────────────────────────────────────────────────────────┘
  │
  ├─► [PAGE 1: Dashboard & Rekonsiliasi] (Ringkasan KPI, Selisih Rp 0, Health Check)
  │
  ├─► [PAGE 2: Odoo Feeder Hub] (Upload 3 Sheet, Auto-Pivot Viewer, Validasi)
  │
  ├─► [PAGE 3: Input Populasi Ayam] (Spreadsheet Grid A-I, Auto-SA, Paste Excel)
  │
  ├─► [PAGE 4: Lembar Alokasi & Deplesi] (Grid Kolom J-W, Run Engine, Export Excel)
  │
  └─► [MODAL / DRAWER: Master Settings] (Lokasi, Kandang, Master Ayam, COA Mapping)
```

---

### 5.2 Rincian Desain & Pengalaman Pengguna (UX Experience)

#### Page 1: Dashboard & Status Rekonsiliasi
- **Tujuan:** Memberikan gambaran kilat status kesehatan alokasi bulan aktif kepada manajemen dan akuntan.
- **Komponen Utama:**
  1. **Status Banner:** Status Periode (`OPEN` / `CALCULATED` / `LOCKED`). Tombol *Lock Period* untuk mencegah perubahan data bulan lampau.
  2. **4 KPI Stat Cards:**
     - Total Populasi ($SO$, $In$, $Out$, $SA$ total ekor).
     - Total Biaya Operasional (Pakan + Disinfektan + Vaksin + Meds dari tarikan Odoo).
     - Total Alokasi Biaya Terdistribusi (Rp) vs Biaya Sumber (dengan badge hijau `MATCH (Selisih Rp 0)` atau merah jika ada selisih).
     - Total Beban Deplesi Bulan Berjalan.
  3. **Visual Parity Checker:** Tabel komparasi saldo awal, pembelian, alokasi, deplesi, dan saldo akhir.

#### Page 2: Odoo Feeder & Auto-Pivot Hub
- **Tujuan:** Pengunggahan data tarikan Odoo Kolom A-Q tanpa pusing membuka file raksasa.
- **UX Flow:**
  1. **Unified Drag & Drop Upload Zone:** Bisa drag 1 workbook Excel berisi 3 sheet (`OVK`, `PAKAN.VOD`, `AYAM`) atau upload terpisah.
  2. **Background Processing with Progress Bar:** Menampilkan progress bar saat membaca 80.000+ baris data tanpa browser hang.
  3. **Auto-Pivot Interactive View:** Menampilkan hasil agregasi pivot otomatis dalam bentuk kartu/tabel ringkas:
     - Biaya Pakan (1-130-3), Disinfektan (1-130-4), Vaksin (1-130-5), Obat (1-130-6).
     - Nilai Pembelian Ayam & Overhead OVK.
  4. **Data Grid Viewer:** Dilengkapi filter pencarian COA, tanggal, dan nilai mutasi.

#### Page 3: Input Populasi Ayam (Spreadsheet Grid Kolom A s/d I)
- **Tujuan:** Tempat user memasukkan data ayam masuk dan keluar per kandang dengan rasa familiar seperti Excel.
- **UX Highlights:**
  1. **Excel-like Data Grid (TanStack Table):** Mendukung navigasi panah keyboard (*Arrow Keys*), Enter untuk pindah baris, dan Tab.
  2. **Clipboard Paste Integration:** User bisa langsung meng-copy range kolom dari Excel dan menekan **Ctrl+V** di grid web.
  3. **Real-time Automatic SA:** Kolom $SA$ otomatis berubah warna secara instan saat kolom $In$ atau $Out$ diketik ($SA = SO + In - Out$).
  4. **Visual Indicator Rollover:** Kolom $SO$ memiliki ikon gembok kecil bertuliskan *"Auto from Month [t-1]"* untuk memberi tahu user bahwa nilai berasal dari saldo akhir bulan lalu.

#### Page 4: Lembar Alokasi Biaya & Deplesi (Kolom J s/d W)
- **Tujuan:** Menampilkan hasil hitungan biaya per kandang setara sheet `CIMANGKOK`.
- **UX Highlights:**
  1. **Floating Action Bar:**
     - Tombol `[ ⚡ Hitung Alokasi Biaya ]` (Run Engine).
     - Tombol `[ 📥 Export Sheet CIMANGKOK (.xlsx) ]` (menghasilkan file Excel dengan format dan styling identik aslinya).
     - Tombol `[ ✏️ Koreksi Manual / Plug ]` (dengan modal pencatatan alasan untuk audit trail).
  2. **Color-Coded Column Groups:**
     - Header Hijau: Data Populasi Ekor ($SO$, $SA$).
     - Header Biru: Alokasi Biaya Masuk ($NBO$, Alokasi Pakan/OVK).
     - Header Oranye: Pengurang Nilai (Mati, Jual, Mutasi).
     - Header Ungu: Deplesi & Nilai Buku Akhir ($NBA$, $NBA DP$).
  3. **Summary Sticky Footer:** Baris total di bagian bawah selalu terlihat (*sticky footer*) saat scroll.

---

## 6. Target Verifikasi & Parity Pengecekan

Hasil perhitungan sistem pada Phase 1 wajib menghasilkan angka yang sama persis (selisih pembulatan $\le \text{Rp } 1$) dengan target Excel periode Januari s/d September 2026:

| Komponen Alokasi | Target Angka Excel (Rp) |
|---|---:|
| **Saldo Awal** | 19.854.133.334 |
| **Pembelian Ayam** | 19.404.844.246 |
| **Alokasi Biaya (Pakan & OVK)** | 8.432.860.168 |
| **Deplesi** | (16.269.355.406) |
| **Jual / Afkir** | (5.177.294.499) |
| **Mutasi** | (589.593.610) |
| **Saldo Akhir Populasi (Net)** | **25.655.594.233** |

*Persamaan Keseimbangan:*
$$\text{Saldo Akhir} = 19.854.133.334 + 19.404.844.246 + 8.432.860.168 - 16.269.355.406 - 5.177.294.499 - 589.593.610 = 25.655.594.233$$

---

## 7. Roadmap Pelaksanaan MVP & Milestone

| Milestone | Durasi Estimasi | Deliverables |
|---|---|---|
| **M0: Project Setup & Schema DB** | 2 Hari | Migrasi 7 Tabel Inti + 1 Kontrol, Setup Laravel API & React Vite. |
| **M1: Odoo Feeder & Auto-Pivot** | 3 Hari | Upload file Excel/CSV Kolom A-Q, Queue Import, Auto-Pivot Query SQL. |
| **M2: Input Grid Populasi (A-I)** | 3 Hari | Spreadsheet Grid, Rumus $SA = SO + In - Out$, Estafet $SO$ Antar Bulan, Paste Excel. |
| **M3: Allocation & Depletion Engine** | 4 Hari | Formula Kolom J-W, Alokasi proporsional $SO$, Deplesi 9 bulan, Test Parity 100%. |
| **M4: UI/UX Finishing & Excel Export** | 3 Hari | Dashboard Rekonsiliasi, Export Excel setara aslinya, Lock Period. |
| **Total Estimasi MVP** | **15 Hari Kerja** | **Ready for UAT & Operational Run** |
