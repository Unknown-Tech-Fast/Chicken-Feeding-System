import { z } from "zod"
import { coaAccounts, phaseCodes, regions } from "@/data/mock-data"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} wajib diisi`)
const integer = (label: string) =>
  z
    .number({ message: `${label} harus berupa angka` })
    .int(`${label} harus bilangan bulat`)
    .min(0, `${label} tidak boleh negatif`)
export const defaultDepletionAge = (phase: string) =>
  phase === "LAYING" ? 9 : 0

export const chickenPhaseSchema = z.object({
  kodeFase: z.enum(phaseCodes, { message: "Pilih kode fase" }),
  namaFase: requiredText("Nama fase"),
  defaultUmurDeplesi: integer("Umur deplesi"),
  coaPersediaan: requiredText("COA persediaan").refine(
    (code) => coaAccounts.some((row) => row.code === code),
    "Pilih COA yang tersedia"
  ),
})
export const cageSchema = z.object({
  lokasiId: requiredText("Wilayah").refine(
    (id) => regions.some((row) => row.id === id),
    "Pilih wilayah yang tersedia"
  ),
  kodeKandang: requiredText("Kode kandang"),
  kapasitas: integer("Kapasitas").nullable(),
  isActive: z.boolean(),
})
export const regionSchema = z.object({
  kodeLokasi: requiredText("Kode lokasi"),
  namaLokasi: requiredText("Nama lokasi"),
  isActive: z.boolean(),
})
export type ChickenPhaseForm = z.infer<typeof chickenPhaseSchema>
export type CageForm = z.infer<typeof cageSchema>
export type RegionForm = z.infer<typeof regionSchema>
