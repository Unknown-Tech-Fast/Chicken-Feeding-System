import { request } from "../http"
import { apiPath } from "../endpoints"
import { camelizeKeys } from "../mapper"
import { normalizePaginated } from "../pagination"
import {
  USE_MOCK_API,
  mockCreateTransaksiAyam,
  mockGetTransaksiAyam,
  type TransaksiAyamRow,
} from "../mock"
import type { Paginated, QueryParams } from "../types"

export type { TransaksiAyamRow }

/**
 * Daftar transaksi ayam (search + sort + paging dikerjakan server).
 *
 * Selama `VITE_USE_MOCK_API=true`, data diambil dari mock lokal supaya UI
 * bisa dikembangkan sebelum endpoint Laravel siap. Hapus cabang mock-nya
 * begitu API nyata tersedia.
 */
export const getTransaksiAyam = async (
  params: QueryParams = {},
  signal?: AbortSignal,
): Promise<Paginated<TransaksiAyamRow>> => {
  if (USE_MOCK_API) return mockGetTransaksiAyam(params, signal)

  const response = await request<unknown>({
    url: apiPath.chicken.list,
    method: "GET",
    params,
    signal,
  })

  // Laravel mengirim snake_case (`periode_bulan`) → diseragamkan ke camelCase.
  const page = normalizePaginated<unknown>(
    response,
    Number(params.page ?? 1),
    Number(params.per_page ?? 10),
  )

  return { ...page, items: page.items.map((row) => camelizeKeys<TransaksiAyamRow>(row)) }
}

export const getTransaksiAyamById = (id: string | number) =>
  request<TransaksiAyamRow>({
    url: apiPath.chicken.detail(id),
    method: "GET",
  })

/**
 * Simpan transaksi ayam baru.
 *
 * Selama `VITE_USE_MOCK_API=true`, tidak ada request keluar: data hanya
 * dikembalikan sebagai respons palsu supaya alur form bisa diuji.
 */
export const createTransaksiAyam = async (
  body: Omit<TransaksiAyamRow, "id" | "mutasi">,
): Promise<TransaksiAyamRow> => {
  if (USE_MOCK_API) return mockCreateTransaksiAyam(body)

  return request<TransaksiAyamRow>({
    url: apiPath.chicken.create,
    method: "POST",
    data: body,
  })
}
