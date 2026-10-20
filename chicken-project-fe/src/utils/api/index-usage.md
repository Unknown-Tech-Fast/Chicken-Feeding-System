# API mechanism — chicken-project-fe

## Struktur

```
src/utils/api/
├── config.ts        # API_BASE_URL, timeout, storage key, path publik
├── endpoints.ts     # apiPath = kumpulan path endpoint per domain (SUMBER TUNGGAL)
├── http.ts          # axiosInstance + interceptor + request() global
├── query.ts         # kontrak query tabel (search/sort/paging)
├── pagination.ts    # normalizePaginated() — response Laravel → Paginated<T>
├── mapper.ts        # camelizeKeys() — snake_case Laravel → camelCase
├── mock.ts          # data mock selama API belum siap
├── types.ts         # QueryParams, ApiResponse, Paginated, LaravelPaginated
├── endpoints/
│   ├── chicken.ts   # getTransaksiAyam, getTransaksiAyamById, createTransaksiAyam
│   ├── account.ts   # getInquiryAccount, getAccountById
│   └── reporting.ts # getGeneralLedger, getGeneralLedgerSummary
└── index.ts         # barrel — import semua dari sini
```

## Setup environment

Buat `.env.local`:

```
VITE_API_URL=http://localhost:8000/
VITE_USE_MOCK_API=true
```

`VITE_USE_MOCK_API=true` → pakai data mock (badge "Mode Mock" muncul). Set `false` untuk menembak API Laravel asli.

## Search / sort / paging server-side (GLOBAL)

Semua halaman tabel memakai kontrak yang sama:

| File | Isi |
|---|---|
| `utils/api/query.ts` | `TableQuery`, `buildTableQuery()`, `nextSortState()`, `TableQueryMap` |
| `hooks/use-table-query.ts` | state + debounce + fetch + abort |
| `components/data-table/sortable-head.tsx` | header kolom yang bisa diklik |
| `components/data-table/search-input.tsx` | input pencarian |

### Parameter yang dikirim (default, konvensi Laravel + spatie)

```
?page=1&per_page=10&search=kandang&sort_by=-period
```

- `sort_by` pakai awalan `-` untuk desc (spatie/laravel-query-builder).
- Kalau backend beda, ubah `QUERY_PARAM_KEYS` / `SORT_CONVENTION` di `query.ts` — **satu tempat**.

### Pakai di halaman baru

```tsx
import { useTableQuery } from "@/hooks/use-table-query"
import { SortableHead } from "@/components/data-table/sortable-head"
import { SearchInput } from "@/components/data-table/search-input"
import { getTransaksiAyam, type TableQueryMap } from "@/utils/api"

// 1. Map kolom UI → kolom backend
const QUERY_MAP: TableQueryMap = {
  sortMap: {
    periodeBulan: "period",
    flockNo: "flock_no",
  },
  defaultSortBy: "periodeBulan",
  defaultSortOrder: "desc",
}

// 2. Hook
const table = useTableQuery({
  fetcher: (params, signal) => getTransaksiAyam(params, signal),
  map: QUERY_MAP,
})

// 3. UI
<SearchInput value={table.search} onChange={table.setSearch} isBusy={table.isFetching} />

<SortableHead
  columnKey="periodeBulan"
  label="Periode Bulan"
  activeSortBy={table.sortBy}
  sortOrder={table.sortOrder}
  onSort={table.toggleSort}
/>
```

### Yang didapat dari hook

- `search` di-debounce 400ms (bisa diatur lewat `searchDebounceMs`)
- ganti search/sort/pageSize/filter → otomatis balik ke halaman 1
- request lama dibatalkan → respons tidak bisa tertukar
- `isLoading` (load pertama), `isFetching` (request berjalan), `error`
- `setFilter(key, value)` untuk filter tambahan (mis. dropdown bulan)

### Backend yang diharapkan

Response: `{ data: [...], meta: { current_page, per_page, total, last_page } }`.
`normalizePaginated()` juga menerima bentuk tanpa `meta` atau array polos,
dan `camelizeKeys()` mengubah `periode_bulan` → `periodeBulan` agar cocok dengan tipe UI.

## Toast error

Toast error **otomatis** untuk 400/401/403/404/422/500, timeout, dan network error.
Kalau tidak mau toast (misal validasi form), tambahkan argumen kedua:

```ts
request({ url, method: "GET" }, { silent: true })
```

## Nambah endpoint baru

1. Daftarkan path di `endpoints.ts`:

```ts
export const apiPath = {
  chicken: {
    approval: (id: string) => `chicken/transactions/${id}/approval`,
  },
}
```

2. Bikin fungsinya di `endpoints/chicken.ts`:

```ts
export const approveTransaksi = (id: string) =>
  request<unknown>({ url: apiPath.chicken.approval(id), method: "POST" })
```

3. Kalau domain baru, buat file `endpoints/<domain>.ts` lalu `export * from "./endpoints/<domain>"` di `index.ts`.

## Kalau nanti backend dipecah per-host

`request()` sudah menerima `service` (prefix yang ditempel sebelum `url`), sama seperti jamkrida:

```ts
request({ url: apiPath.chicken.list, service: "https://host-master/", method: "GET" })
```

Atau tambahkan `servicePath` di `config.ts`.

## Auth (belum aktif)

Sudah disiapkan, tidak mengganggu sekarang:

- `tokenStorage.get/set/clear()` — token dibaca dari `localStorage.access_token`
- Interceptor request otomatis attach `Authorization: Bearer <token>` **kalau token ada**
- 401 → `setSessionExpiredHandler(handler)` yang kamu daftarkan dari AuthProvider
- Header rotasi token `X-New-Token` otomatis disimpan

Contoh mendaftarkan handler nanti:

```tsx
import { setSessionExpiredHandler } from "@/utils/api"

useEffect(() => {
  setSessionExpiredHandler(() => {
    tokenStorage.clear()
    navigate("/login")
  })
  return () => setSessionExpiredHandler(null)
}, [navigate])
```

## Catatan

- Response `request()` mengembalikan **body** response langsung (bukan `AxiosResponse`).
- Error tetap dilempar ulang (`throw error`), jadi pemanggil masih bisa cek `error.response.status`.
- Request yang dibatalkan (`AbortController`) tidak memunculkan toast.
