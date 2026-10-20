import { z } from "zod"

export const TRANSAKSI_TYPE_OPTIONS = ["Ayam Laying", "Ayam Growing"] as const

export const transaksiAyamSchema = z.object({
  periodeBulan: z
    .string()
    .trim()
    .min(1, "Periode bulan wajib diisi")
    .max(30, "Periode bulan maksimal 30 karakter"),
  type: z
    .string()
    .refine(
      (value) => (TRANSAKSI_TYPE_OPTIONS as readonly string[]).includes(value),
      {
        message: "Type wajib dipilih",
      }
    ),
  kandang: z
    .string()
    .trim()
    .min(1, "Kandang wajib diisi")
    .max(50, "Kandang maksimal 50 karakter"),
  flockNo: z
    .string()
    .trim()
    .min(1, "Flock No wajib diisi")
    .max(30, "Flock No maksimal 30 karakter"),
  umurMinggu: z.coerce
    .number({ message: "Umur harus berupa angka" })
    .int("Umur harus bilangan bulat")
    .min(0, "Umur minimal 0 minggu")
    .max(200, "Umur maksimal 200 minggu"),
  ayamMasuk: z.coerce
    .number({ message: "Ayam masuk harus berupa angka" })
    .int("Ayam masuk harus bilangan bulat")
    .min(0, "Ayam masuk tidak boleh negatif")
    .max(1000000, "Ayam masuk terlalu besar"),
  ayamKeluar: z.coerce
    .number({ message: "Ayam keluar harus berupa angka" })
    .int("Ayam keluar harus bilangan bulat")
    .min(0, "Ayam keluar tidak boleh negatif")
    .max(1000000, "Ayam keluar terlalu besar"),
})
  // Minimal salah satu > 0 — transaksi tanpa pergerakan ekor tidak sah.
  .refine((values) => values.ayamMasuk > 0 || values.ayamKeluar > 0, {
    message: "Isi Ayam Masuk atau Ayam Keluar, keduanya tidak boleh 0",
    path: ["ayamMasuk"],
  })

export type TransaksiAyamFormValues = z.infer<typeof transaksiAyamSchema>

export type TransaksiAyamFormInput = z.input<typeof transaksiAyamSchema>

export const TRANSAKSI_AYAM_DEFAULT_VALUES: TransaksiAyamFormValues = {
  periodeBulan: "",
  type: "",
  kandang: "",
  flockNo: "",
  umurMinggu: 1,
  ayamMasuk: 0,
  ayamKeluar: 0,
}

/**
 * Rumus mutasi — satu-satunya tempat perhitungan ini ditulis.
 * Dipakai tabel, form (preview), dan mock supaya hasilnya tidak bisa berbeda.
 */
export const hitungMutasi = (ayamMasuk: number, ayamKeluar: number) =>
  Number(ayamMasuk) - Number(ayamKeluar)

/** Format mutasi untuk tampilan: `+1.450`, `−950`, atau `0`. */
export const formatMutasi = (mutasi: number) => {
  const n = Number(mutasi) || 0
  const abs = new Intl.NumberFormat("id-ID").format(Math.abs(n))
  if (n === 0) return "0"
  // U+2212 (minus) lebih rapi daripada hyphen pada angka tabular.
  return n > 0 ? `+${abs}` : `−${abs}`
}
