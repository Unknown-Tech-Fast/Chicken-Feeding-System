// Mock data untuk pengembangan UI sebelum API Laravel siap.
//
// Aktif kalau `VITE_USE_MOCK_API=true`. Semua logika filter/sort/paging
// dikerjakan di sini supaya perilaku tabel sama seperti saat API asli jalan.
// Hapus pemakaiannya di `endpoints/chicken.ts` begitu endpoint nyata ada.


import type { Paginated, QueryParams } from "./types"

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true"

const MOCK_LATENCY_MS = 450

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })

// ── Transaksi Ayam ────────────────────────────────────────────────────
export type TransaksiAyamRow = {
  id: number
  periodeBulan: string
  type: string
  kandang: string
  flockNo: string
  umurMinggu: number
  /** Ekor yang masuk. */
  ayamMasuk: number
  /** Ekor yang keluar. */
  ayamKeluar: number
  /** Turunan: ayamMasuk - ayamKeluar. Jangan diisi manual. */
  mutasi: number
}

const TYPES = ["DOC Masuk", "Pakan", "Obat", "Mati", "Afkir", "Panen"]
const KANDANG = ["Kandang A", "Kandang B", "Kandang C", "Kandang D"]
const BULAN = [
  "Januari 2026",
  "Februari 2026",
  "Maret 2026",
  "April 2026",
  "Mei 2026",
  "Juni 2026",
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
]

/** Ekor masuk/keluar per jenis transaksi — agar angka mock masuk akal. */
const MUTASI_EKOR: Record<string, { masuk: number; keluar: number }> = {
  "DOC Masuk": { masuk: 1200, keluar: 0 },
  Pakan: { masuk: 0, keluar: 45 },
  Obat: { masuk: 0, keluar: 12 },
  Mati: { masuk: 0, keluar: 18 },
  Afkir: { masuk: 0, keluar: 25 },
  Panen: { masuk: 0, keluar: 950 },
}

const pick = <T>(list: readonly T[], index: number) => list[index % list.length]

/** Angka bervariasi di sekitar nilai dasar jenis transaksi. */
const ekorFor = (type: string, index: number) => {
  const base = MUTASI_EKOR[type] ?? { masuk: 0, keluar: 10 }
  const step = (value: number) =>
    value === 0 ? 0 : value + (index % 7) * Math.max(1, Math.round(value / 20))
  return { masuk: step(base.masuk), keluar: step(base.keluar) }
}

const MOCK_TRANSAKSI: TransaksiAyamRow[] = Array.from({ length: 87 }, (_, i) => {
  const n = i + 1
  return {
    id: n,
    periodeBulan: pick(BULAN, Math.floor(i / 9)),
    type: pick(TYPES, i),
    kandang: pick(KANDANG, Math.floor(i / 3)),
    flockNo: `F-${String(1000 + Math.floor(i / 5)).slice(-4)}`,
    umurMinggu: (i % 6) + 1,
    ...(() => {
      const { masuk, keluar } = ekorFor(pick(TYPES, i), i)
      return { ayamMasuk: masuk, ayamKeluar: keluar, mutasi: masuk - keluar }
    })(),
  }
})

const compare = (a: unknown, b: unknown) => {
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a ?? "").localeCompare(String(b ?? ""), "id", { numeric: true })
}

/** Terapkan query params ke data mock, persis seperti backend seharusnya. */
const applyQuery = <T extends Record<string, unknown>>(
  source: T[],
  params: QueryParams,
  sortable: Record<string, keyof T>,
): Paginated<T> => {
  const search = String(params.search ?? "").trim().toLowerCase()
  const page = Number(params.page ?? 1)
  const perPage = Number(params.per_page ?? 10)
  const sort = typeof params.sort_by === "string" ? params.sort_by : null

  let rows = source

  if (search) {
    rows = rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(search)),
    )
  }

  if (sort) {
    const isDesc = sort.startsWith("-")
    const field = sort.replace(/^-/, "")
    const key = sortable[field]
    if (key) {
      rows = [...rows].sort((a, b) => (isDesc ? -1 : 1) * compare(a[key], b[key]))
    }
  }

  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage

  return {
    items: rows.slice(start, start + perPage),
    page: safePage,
    pageSize: perPage,
    totalItems,
    totalPages,
  }
}

/** Mock endpoint POST /chicken/transactions */
export const mockCreateTransaksiAyam = async (
  body: Omit<TransaksiAyamRow, "id" | "mutasi">,
): Promise<TransaksiAyamRow> => {
  await delay(MOCK_LATENCY_MS)
  return {
    id: Math.max(...MOCK_TRANSAKSI.map((row) => row.id), 0) + 1,
    ...body,
    // Backend asli wajib menghitung sendiri; mock meniru perilaku itu.
    mutasi: Number(body.ayamMasuk) - Number(body.ayamKeluar),
  }
}

/** Mock endpoint GET /chicken/transactions */
export const mockGetTransaksiAyam = async (
  params: QueryParams,
  signal?: AbortSignal,
): Promise<Paginated<TransaksiAyamRow>> => {
  await delay(MOCK_LATENCY_MS, signal)
  return applyQuery(MOCK_TRANSAKSI, params, {
    period: "periodeBulan",
    type: "type",
    kandang: "kandang",
    flock_no: "flockNo",
    umur_minggu: "umurMinggu",
    mutasi: "mutasi",
  })
}
