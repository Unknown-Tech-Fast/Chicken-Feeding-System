export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined | (string | number)[]
>

export type ApiResponse<T> = {
  success?: boolean
  message?: string
  data: T
}

/** Bentuk hasil list yang sudah dinormalkan dari response backend. */
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/**
 * Shape mentah pagination Laravel.
 * - `data` + `meta/links` → `paginate()` dengan Resource Collection
 * - `data` + `current_page` di root → `paginate()` tanpa wrapper
 */
export type LaravelPaginated<T> = {
  data: T[]
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
