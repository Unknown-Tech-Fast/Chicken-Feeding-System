import type { LaravelPaginated, Paginated } from "./types"

/**
 * Normalisasi response list Laravel apa pun bentuknya jadi `Paginated<T>`.
 *
 * Didukung:
 * - `{ data: [...], meta: { current_page, per_page, total, last_page } }`
 * - `{ data: [...], current_page, per_page, total, last_page }`
 * - `{ data: { data: [...] } }` (double wrap resource)
 * - `[...]` (array polos, tanpa pagination)
 */
export const normalizePaginated = <T>(
  payload: unknown,
  fallbackPage = 1,
  fallbackPageSize = 10,
): Paginated<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      page: fallbackPage,
      pageSize: fallbackPageSize,
      totalItems: payload.length,
      totalPages: 1,
    }
  }

  const root = payload as Record<string, unknown> | null | undefined
  if (!root) {
    return { items: [], page: fallbackPage, pageSize: fallbackPageSize, totalItems: 0, totalPages: 0 }
  }

  // Double wrap: { data: { data: [...] } }
  const inner = root.data
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return normalizePaginated<T>(inner, fallbackPage, fallbackPageSize)
  }

  const raw = root as unknown as LaravelPaginated<T>
  const items = Array.isArray(raw.data) ? raw.data : []
  const meta = raw.meta

  const page = meta?.current_page ?? raw.current_page ?? fallbackPage
  const pageSize = meta?.per_page ?? raw.per_page ?? fallbackPageSize
  const totalItems = meta?.total ?? raw.total ?? items.length
  const totalPages = meta?.last_page ?? raw.last_page ?? Math.max(1, Math.ceil(totalItems / (pageSize || 1)))

  return { items, page, pageSize, totalItems, totalPages }
}
