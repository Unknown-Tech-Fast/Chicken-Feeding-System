import * as React from "react"

import {
  buildTableQuery,
  createTableQuery,
  nextSortState,
  type SortOrder,
  type TableQuery,
  type TableQueryMap,
} from "@/utils/api/query"
import type { Paginated, QueryParams } from "@/utils/api/types"

/**
 * Fetch function yang dipakai hook ini. Halaman membungkus endpoint-nya:
 *
 * ```ts
 * (params, signal) => getTransaksiAyam(params, signal)
 * ```
 */
export type TableFetcher<T> = (params: QueryParams, signal: AbortSignal) => Promise<Paginated<T>>

type Options<T> = {
  fetcher: TableFetcher<T>
  map?: TableQueryMap
  /** Jeda debounce pencarian (ms). */
  searchDebounceMs?: number
  /** Matikan fetch otomatis (mis. menunggu filter wajib terisi). */
  enabled?: boolean
}

export type UseTableQueryResult<T> = {
  page: number
  pageSize: number
  search: string
  sortBy: string | null
  sortOrder: SortOrder
  filters: NonNullable<TableQuery["filters"]>
  rows: T[]
  totalItems: number
  totalPages: number
  isLoading: boolean
  isFetching: boolean
  error: unknown
  /** Query params terakhir yang dikirim — berguna untuk debug. */
  lastParams: Record<string, string | number>
  setSearch: (value: string) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setFilter: (key: string, value: string | number | boolean | null | undefined) => void
  setFilters: (filters: Record<string, string | number | boolean | null | undefined>) => void
  toggleSort: (columnKey: string) => void
  reset: () => void
  refetch: () => void
}

const EMPTY_FILTERS: NonNullable<TableQuery["filters"]> = {}

/**
 * State + fetch untuk tabel yang search/sort/paging-nya dikerjakan server.
 *
 * Perilaku:
 * - `search` di-debounce, sisanya langsung.
 * - Perubahan search/sort/pageSize/filter otomatis kembali ke halaman 1.
 * - Request lama dibatalkan (AbortController) dan respons basi diabaikan,
 *   jadi hasil tidak bisa tertukar saat user mengetik cepat.
 * - Error 400/500 sudah ditampilkan toast oleh `utils/api/http.ts`; di sini
 *   cukup disimpan untuk ditampilkan sebagai state kosong.
 */
export function useTableQuery<T>({
  fetcher,
  map,
  searchDebounceMs = 400,
  enabled = true,
}: Options<T>): UseTableQueryResult<T> {
  const [query, setQueryState] = React.useState<TableQuery>(() => createTableQuery(map))

  // Debounce: copy `search` ke `debouncedSearch` setelah jeda.
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.search), searchDebounceMs)
    return () => clearTimeout(timer)
  }, [query.search, searchDebounceMs])

  const effectiveQuery = React.useMemo<TableQuery>(
    () => ({ ...query, search: debouncedSearch }),
    [query, debouncedSearch],
  )

  const params = React.useMemo(() => buildTableQuery(effectiveQuery, map), [effectiveQuery, map])
  const paramsKey = JSON.stringify(params)

  const [result, setResult] = React.useState<{
    rows: T[]
    totalItems: number
    totalPages: number
  }>({ rows: [], totalItems: 0, totalPages: 0 })

  // null = belum pernah menerima respons sukses untuk query aktif
  const [responseKey, setResponseKey] = React.useState<string | null>(null)
  const [errorKey, setErrorKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<unknown>(null)

  const [isFetching, setIsFetching] = React.useState(false)
  const [refreshToken, setRefreshToken] = React.useState(0)

  const fetcherRef = React.useRef(fetcher)
  React.useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const mapRef = React.useRef(map)
  React.useEffect(() => {
    mapRef.current = map
  }, [map])

  React.useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    let ignore = false

    fetcherRef
      .current(params, controller.signal)
      .then((data) => {
        if (ignore || controller.signal.aborted) return
        setResult({
          rows: data.items,
          totalItems: data.totalItems,
          totalPages: data.totalPages,
        })
        setResponseKey(paramsKey)
        setErrorKey(null)
        setError(null)
      })
      .catch((err: unknown) => {
        if (ignore || controller.signal.aborted) return
        if ((err as { code?: string })?.code === "ERR_CANCELED") return
        setError(err)
        setErrorKey(paramsKey)
      })
      .finally(() => {
        if (ignore) return
        setIsFetching(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, enabled, refreshToken])

  const isStale = responseKey !== paramsKey || errorKey === paramsKey
  const isLoading = enabled && (isStale || isFetching) && responseKey === null
  const rows = isStale ? [] : result.rows

  const setSearch = React.useCallback((value: string) => {
    setQueryState((prev) => ({ ...prev, search: value, page: 1 }))
  }, [])

  const setPage = React.useCallback((page: number) => {
    setQueryState((prev) => ({ ...prev, page: Math.max(1, page) }))
  }, [])

  const setPageSize = React.useCallback((size: number) => {
    setQueryState((prev) => ({ ...prev, pageSize: size, page: 1 }))
  }, [])

  const setFilter = React.useCallback(
    (key: string, value: string | number | boolean | null | undefined) => {
      setQueryState((prev) => ({
        ...prev,
        page: 1,
        filters: { ...prev.filters, [key]: value },
      }))
    },
    [],
  )

  const setFilters = React.useCallback(
    (filters: Record<string, string | number | boolean | null | undefined>) => {
      setQueryState((prev) => ({ ...prev, page: 1, filters: { ...prev.filters, ...filters } }))
    },
    [],
  )

  const toggleSort = React.useCallback((columnKey: string) => {
    setQueryState((prev) => {
      const next = nextSortState(prev, columnKey, mapRef.current)
      return { ...prev, ...next, page: 1 }
    })
  }, [])

  const reset = React.useCallback(() => {
    setQueryState(createTableQuery(mapRef.current))
  }, [])

  const refetch = React.useCallback(() => setRefreshToken((n) => n + 1), [])

  return {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    filters: query.filters ?? EMPTY_FILTERS,
    rows,
    totalItems: isStale ? 0 : result.totalItems,
    totalPages: isStale ? 0 : result.totalPages,
    isLoading,
    isFetching,
    error,
    lastParams: params,
    setSearch,
    setPage,
    setPageSize,
    setFilter,
    setFilters,
    toggleSort,
    reset,
    refetch,
  }
}
