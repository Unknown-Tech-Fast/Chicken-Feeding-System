export type Region = {
  id: string
  kodeLokasi: string
  namaLokasi: string
  isActive: boolean
}
export type Cage = {
  id: string
  lokasiId: string
  kodeKandang: string
  kapasitas: number | null
  isActive: boolean
}
export const phaseCodes = ["DOC", "GROWING", "LAYING", "BROILER"] as const
export type ChickenPhase = {
  id: string
  kodeFase: (typeof phaseCodes)[number]
  namaFase: string
  defaultUmurDeplesi: number
  coaPersediaan: string
}
export type OpeningBalance = {
  id: string
  periodeBulan: string
  lokasiId: string
  kandangId: string
  flockO: string
  umurMinggu: number
  saldoAwal: number
}
export type AccountTransaction = {
  id: string
  tipeInternal: string
  coaCode: string
  labelJurnal: string
  rekananId: string
  tanggalTransaksi: string
  debit: number
  kredit: number
}

export const regions: Region[] = [
  {
    id: "loc-cmk",
    kodeLokasi: "F-CMK",
    namaLokasi: "Farm Cimangkok",
    isActive: true,
  },
  {
    id: "loc-cbd",
    kodeLokasi: "F-CBD",
    namaLokasi: "Farm Cibadak",
    isActive: true,
  },
  {
    id: "loc-skb",
    kodeLokasi: "F-SKB",
    namaLokasi: "Farm Sukabumi",
    isActive: false,
  },
]
export const cages: Cage[] = [
  {
    id: "cage-10",
    lokasiId: "loc-cmk",
    kodeKandang: "B-CMK/10FL",
    kapasitas: 12000,
    isActive: true,
  },
  {
    id: "cage-1a",
    lokasiId: "loc-cmk",
    kodeKandang: "B-CMK/1FL (A)",
    kapasitas: 8000,
    isActive: true,
  },
  {
    id: "cage-cbd",
    lokasiId: "loc-cbd",
    kodeKandang: "B-CBD/02",
    kapasitas: 10000,
    isActive: true,
  },
  {
    id: "cage-skb",
    lokasiId: "loc-skb",
    kodeKandang: "B-SKB/01",
    kapasitas: null,
    isActive: false,
  },
]
export const coaAccounts = [
  { code: "1101", name: "Kas Operasional" },
  { code: "1201", name: "Persediaan Ayam DOC" },
  { code: "1202", name: "Persediaan Ayam Growing" },
  { code: "1203", name: "Persediaan Ayam Laying" },
  { code: "1204", name: "Persediaan Ayam Broiler" },
  { code: "5101", name: "Biaya Pakan" },
  { code: "5102", name: "Biaya OVK" },
]
export const partners = [
  { id: "partner-1", name: "PT Bibit Unggas Sejahtera" },
  { id: "partner-2", name: "PT Pakan Ternak Mandiri" },
  { id: "partner-3", name: "CV Sehat Unggas" },
]
export const chickenPhases: ChickenPhase[] = [
  {
    id: "phase-doc",
    kodeFase: "DOC",
    namaFase: "Ayam DOC",
    defaultUmurDeplesi: 0,
    coaPersediaan: "1201",
  },
  {
    id: "phase-growing",
    kodeFase: "GROWING",
    namaFase: "Ayam Growing (Masa Pertumbuhan)",
    defaultUmurDeplesi: 0,
    coaPersediaan: "1202",
  },
  {
    id: "phase-laying",
    kodeFase: "LAYING",
    namaFase: "Ayam Laying (Masa Produksi)",
    defaultUmurDeplesi: 9,
    coaPersediaan: "1203",
  },
  {
    id: "phase-broiler",
    kodeFase: "BROILER",
    namaFase: "Ayam Broiler",
    defaultUmurDeplesi: 0,
    coaPersediaan: "1204",
  },
]
export const openingBalances: OpeningBalance[] = [
  {
    id: "ob-001",
    periodeBulan: "2026-10",
    lokasiId: "loc-cmk",
    kandangId: "cage-10",
    flockO: "FL-2601",
    umurMinggu: 24,
    saldoAwal: 11250,
  },
  {
    id: "ob-002",
    periodeBulan: "2026-10",
    lokasiId: "loc-cmk",
    kandangId: "cage-1a",
    flockO: "FL-2602",
    umurMinggu: 12,
    saldoAwal: 7680,
  },
  {
    id: "ob-003",
    periodeBulan: "2026-10",
    lokasiId: "loc-cbd",
    kandangId: "cage-cbd",
    flockO: "FL-2603",
    umurMinggu: 4,
    saldoAwal: 9500,
  },
  {
    id: "ob-004",
    periodeBulan: "2026-09",
    lokasiId: "loc-cmk",
    kandangId: "cage-10",
    flockO: "FL-2601",
    umurMinggu: 20,
    saldoAwal: 11320,
  },
]
export const accountTransactions: AccountTransaction[] = [
  {
    id: "acct-001",
    tipeInternal: "Pembelian Ayam",
    coaCode: "1201",
    labelJurnal: "Pembelian DOC Oktober",
    rekananId: "partner-1",
    tanggalTransaksi: "2026-10-02",
    debit: 72000000,
    kredit: 0,
  },
  {
    id: "acct-002",
    tipeInternal: "Pembayaran",
    coaCode: "1101",
    labelJurnal: "Pembayaran Pakan Cimangkok",
    rekananId: "partner-2",
    tanggalTransaksi: "2026-10-05",
    debit: 0,
    kredit: 18500000,
  },
  {
    id: "acct-003",
    tipeInternal: "Pemakaian Pakan",
    coaCode: "5101",
    labelJurnal: "Pakan Flock FL-2601",
    rekananId: "partner-2",
    tanggalTransaksi: "2026-10-08",
    debit: 18500000,
    kredit: 500000,
  },
  {
    id: "acct-004",
    tipeInternal: "Pemakaian OVK",
    coaCode: "5102",
    labelJurnal: "Vitamin dan Vaksin Oktober",
    rekananId: "partner-3",
    tanggalTransaksi: "2026-10-10",
    debit: 3250000,
    kredit: 0,
  },
  {
    id: "acct-005",
    tipeInternal: "Penyesuaian",
    coaCode: "1203",
    labelJurnal: "Reklasifikasi Persediaan Laying",
    rekananId: "partner-1",
    tanggalTransaksi: "2026-10-12",
    debit: 4500000,
    kredit: 4500000,
  },
]
export const chickenTransactions = [
  {
    id: "txn-001",
    periodeBulan: "2026-10",
    type: "Ayam Laying",
    kandangId: "cage-10",
    flockNo: "FL-2601",
    umurMinggu: 24,
    ayamMasuk: 0,
    ayamKeluar: 18,
  },
  {
    id: "txn-002",
    periodeBulan: "2026-10",
    type: "Ayam Growing",
    kandangId: "cage-1a",
    flockNo: "FL-2602",
    umurMinggu: 12,
    ayamMasuk: 800,
    ayamKeluar: 12,
  },
  {
    id: "txn-003",
    periodeBulan: "2026-09",
    type: "Ayam Laying",
    kandangId: "cage-10",
    flockNo: "FL-2601",
    umurMinggu: 20,
    ayamMasuk: 0,
    ayamKeluar: 25,
  },
]

export const regionName = (id: string) =>
  regions.find((row) => row.id === id)?.namaLokasi ?? "Wilayah tidak ditemukan"
export const cageName = (id: string) =>
  cages.find((row) => row.id === id)?.kodeKandang ?? "Kandang tidak ditemukan"
export const coaName = (code: string) =>
  coaAccounts.find((row) => row.code === code)?.name ?? "Akun tidak ditemukan"
export const partnerName = (id: string) =>
  partners.find((row) => row.id === id)?.name ?? "Rekanan tidak ditemukan"
export const accountMutation = (
  row: Pick<AccountTransaction, "debit" | "kredit">
) => row.debit - row.kredit
