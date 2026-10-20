// Mapper response: Laravel mengirim snake_case, UI memakai camelCase.
//
// Setiap endpoint list boleh punya mapper sendiri. Kalau tidak didefinisikan,
// data dipakai apa adanya.

export type RowMapper<T> = (raw: unknown) => T

/** ubah `periode_bulan` → `periodeBulan`, rekursif ke dalam objek/array. */
export const snakeToCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())

export const camelizeKeys = <T = unknown>(value: unknown): T => {
  if (Array.isArray(value)) return value.map((item) => camelizeKeys(item)) as unknown as T
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(source)) {
      result[snakeToCamel(key)] = camelizeKeys(nested)
    }
    return result as T
  }
  return value as T
}
