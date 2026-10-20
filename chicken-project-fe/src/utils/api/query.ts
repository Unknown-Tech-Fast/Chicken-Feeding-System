// Kontrak query tabel yang dipakai SEMUA halaman list.
//
// Halaman tidak pernah menyebut nama parameter API secara langsung — hanya
// menyebut nama kolom UI. Pemetaan ke parameter backend ada di `TableQueryMap`
// per halaman, dijabarkan oleh `buildTableQuery`.
//
// Default mengikuti konvensi Laravel + spatie/laravel-query-builder
// (?search=, ?sort=-created_at, ?page=, ?per_page=). Kalau backend ternyata
// memakai format lain, cukup ubah konstanta di bawah / map di halaman —
// tidak perlu menyentuh komponen tabel.

export type SortOrder = "asc" | "desc"

export type TableQuery = {
  page: number
  pageSize: number
  search: string
  /** Nama kolom UI (key dari `columns`), bukan nama kolom database. */
  sortBy: string | null
  sortOrder: SortOrder
  /** Filter tambahan, dikirim sebagai query string biasa. */
  filters?: Record<string, string | number | boolean | null | undefined>
}

/** Nama parameter yang dikirim ke backend. Ubah di sini kalau konvensi berbeda. */
export const QUERY_PARAM_KEYS = {
  page: "page",
  pageSize: "per_page",
  search: "search",
  sortBy: "sort_by",
  sortOrder: "sort_order",
} as const

/**
 * Konvensi pengurutan:
 * - "minus"    → `?sort=-created_at` (spatie/laravel-query-builder, default)
 * - "separate" → `?sort_by=created_at&sort_order=desc`
 */
export type SortConvention = "minus" | "separate"

export const SORT_CONVENTION: SortConvention = "minus"

export type TableQueryMap = {
  /** Map nama kolom UI → nama kolom backend. Kolom tanpa entri tidak bisa di-sort. */
  sortMap?: Record<string, string>
  /** Map nama filter UI → nama parameter backend. */
  filterMap?: Record<string, string>
  /** Kolom default saat halaman pertama kali dibuka. */
  defaultSortBy?: string
  defaultSortOrder?: SortOrder
}

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export const createTableQuery = (map: TableQueryMap = {}): TableQuery => ({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  search: "",
  sortBy: map.defaultSortBy ?? null,
  sortOrder: map.defaultSortOrder ?? "asc",
  filters: {},
})

/**
 * Ubah state tabel menjadi query params untuk API.
 * Nilai kosong (search "", filter null/undefined) tidak ikut dikirim.
 */
export const buildTableQuery = (
  query: TableQuery,
  map: TableQueryMap = {},
): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    [QUERY_PARAM_KEYS.page]: query.page,
    [QUERY_PARAM_KEYS.pageSize]: query.pageSize,
  }

  const search = query.search.trim()
  if (search) params[QUERY_PARAM_KEYS.search] = search

  const backendSortKey = query.sortBy ? (map.sortMap?.[query.sortBy] ?? null) : null
  if (backendSortKey) {
    if (SORT_CONVENTION === "minus") {
      params[QUERY_PARAM_KEYS.sortBy] = query.sortOrder === "desc" ? `-${backendSortKey}` : backendSortKey
    } else {
      params[QUERY_PARAM_KEYS.sortBy] = backendSortKey
      params[QUERY_PARAM_KEYS.sortOrder] = query.sortOrder
    }
  }

  for (const [key, value] of Object.entries(query.filters ?? {})) {
    if (value === null || value === undefined || value === "") continue
    params[map.filterMap?.[key] ?? key] = value as string | number
  }

  return params
}

/**
 * Toggle urutan saat header kolom diklik:
 * belum aktif → asc → desc → kembali ke default (tanpa sort).
 */
export const nextSortState = (
  current: Pick<TableQuery, "sortBy" | "sortOrder">,
  columnKey: string,
  map: TableQueryMap = {},
): Pick<TableQuery, "sortBy" | "sortOrder"> => {
  if (current.sortBy !== columnKey) {
    return { sortBy: columnKey, sortOrder: "asc" }
  }
  if (current.sortOrder === "asc") {
    return { sortBy: columnKey, sortOrder: "desc" }
  }
  return {
    sortBy: map.defaultSortBy ?? null,
    sortOrder: map.defaultSortOrder ?? "asc",
  }
}
