import { type ReactNode } from "react"
import { Link } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, FloppyDiskIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { routes } from "@/routes"
import {
  TRANSAKSI_AYAM_DEFAULT_VALUES,
  TRANSAKSI_TYPE_OPTIONS,
  formatMutasi,
  hitungMutasi,
  transaksiAyamSchema,
  type TransaksiAyamFormInput,
  type TransaksiAyamFormValues,
} from "./transaksi-ayam-schema"

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  )
}

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: ReactNode
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span aria-hidden="true" className="ml-0.5 text-destructive">
        *
      </span>
    </Label>
  )
}

export function TransaksiAyamCreatePage() {
  const listPath = routes.chicken_inquiry.path

  const form = useForm<
    TransaksiAyamFormInput,
    unknown,
    TransaksiAyamFormValues
  >({
    resolver: zodResolver(transaksiAyamSchema),
    defaultValues: TRANSAKSI_AYAM_DEFAULT_VALUES,
    mode: "onTouched",
  })

  const { errors } = form.formState

  // Preview mutasi butuh nilai terkini → langganan ke dua field itu saja.
  const ayamMasuk = Number(
    useWatch({ control: form.control, name: "ayamMasuk" })
  )
  const ayamKeluar = Number(
    useWatch({ control: form.control, name: "ayamKeluar" })
  )

  function onSubmit() {
    toast.info("API penyimpanan belum tersedia", {
      description: "Input sudah divalidasi, tetapi transaksi belum disimpan.",
    })
  }

  return (
    <section
      aria-label="Form tambah transaksi ayam"
      className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_12px_-6px_rgba(2,5,32,0.12)]"
    >
      <div className="border-b border-border/70 px-5 py-5 md:px-6">
        <Link
          to={listPath}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            strokeWidth={1.8}
            className="size-4"
            aria-hidden="true"
          />
          Kembali ke daftar
        </Link>
        <h2 className="mt-3 text-base font-semibold tracking-[-0.01em]">
          Tambah Transaksi Ayam
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi data transaksi untuk pengembangan UI. API penyimpanan belum
          tersedia.
        </p>
      </div>

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="px-5 py-6 md:px-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Periode Bulan */}
          <div>
            <RequiredLabel htmlFor="periodeBulan">Periode Bulan</RequiredLabel>
            <Input
              id="periodeBulan"
              required
              aria-required="true"
              className="mt-2"
              placeholder="September 2026"
              aria-invalid={Boolean(errors.periodeBulan)}
              aria-describedby={
                errors.periodeBulan ? "periodeBulan-error" : undefined
              }
              {...form.register("periodeBulan")}
            />
            <FieldError
              id="periodeBulan-error"
              message={errors.periodeBulan?.message}
            />
          </div>

          {/* Type */}
          <div>
            <RequiredLabel htmlFor="type">Type</RequiredLabel>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id="type"
                    className="mt-2 w-full"
                    aria-required="true"
                    aria-invalid={Boolean(errors.type)}
                    aria-describedby={errors.type ? "type-error" : undefined}
                  >
                    <SelectValue placeholder="Pilih type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSAKSI_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id="type-error" message={errors.type?.message} />
          </div>

          {/* Kandang */}
          <div>
            <RequiredLabel htmlFor="kandang">Kandang</RequiredLabel>
            <Input
              id="kandang"
              required
              aria-required="true"
              className="mt-2"
              placeholder="Kandang A"
              aria-invalid={Boolean(errors.kandang)}
              aria-describedby={errors.kandang ? "kandang-error" : undefined}
              {...form.register("kandang")}
            />
            <FieldError id="kandang-error" message={errors.kandang?.message} />
          </div>

          {/* Flock No */}
          <div>
            <RequiredLabel htmlFor="flockNo">Flock No</RequiredLabel>
            <Input
              id="flockNo"
              required
              aria-required="true"
              className="mt-2"
              placeholder="FLK-001"
              aria-invalid={Boolean(errors.flockNo)}
              aria-describedby={errors.flockNo ? "flockNo-error" : undefined}
              {...form.register("flockNo")}
            />
            <FieldError id="flockNo-error" message={errors.flockNo?.message} />
          </div>

          {/* Umur Minggu */}
          <div>
            <RequiredLabel htmlFor="umurMinggu">Umur (minggu)</RequiredLabel>
            <Input
              id="umurMinggu"
              required
              aria-required="true"
              type="number"
              inputMode="numeric"
              min={0}
              max={200}
              step={1}
              className="mt-2"
              aria-invalid={Boolean(errors.umurMinggu)}
              aria-describedby={
                errors.umurMinggu ? "umurMinggu-error" : undefined
              }
              {...form.register("umurMinggu")}
            />
            <FieldError
              id="umurMinggu-error"
              message={errors.umurMinggu?.message}
            />
          </div>

          {/* Ayam Masuk */}
          <div>
            <RequiredLabel htmlFor="ayamMasuk">Ayam Masuk</RequiredLabel>
            <Input
              id="ayamMasuk"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              className="mt-2"
              placeholder="1200"
              aria-required="true"
              aria-invalid={Boolean(errors.ayamMasuk)}
              aria-describedby={
                errors.ayamMasuk
                  ? "ayamMasuk-help ayamMasuk-error"
                  : "ayamMasuk-help"
              }
              {...form.register("ayamMasuk")}
            />
            <p
              id="ayamMasuk-help"
              className="mt-1.5 text-xs text-muted-foreground"
            >
              Jumlah ekor yang masuk.
            </p>
            <FieldError
              id="ayamMasuk-error"
              message={errors.ayamMasuk?.message}
            />
          </div>

          {/* Ayam Keluar */}
          <div>
            <RequiredLabel htmlFor="ayamKeluar">Ayam Keluar</RequiredLabel>
            <Input
              id="ayamKeluar"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              className="mt-2"
              placeholder="0"
              aria-required="true"
              aria-invalid={Boolean(errors.ayamKeluar)}
              aria-describedby={
                errors.ayamKeluar
                  ? "ayamKeluar-help ayamKeluar-error"
                  : "ayamKeluar-help"
              }
              {...form.register("ayamKeluar")}
            />
            <p
              id="ayamKeluar-help"
              className="mt-1.5 text-xs text-muted-foreground"
            >
              Jumlah ekor yang keluar.
            </p>
            <FieldError
              id="ayamKeluar-error"
              message={errors.ayamKeluar?.message}
            />
          </div>
        </div>

        {/* Preview mutasi: masuk - keluar */}
        <div
          aria-live="polite"
          className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-accent/40 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">Mutasi</p>
            <p className="text-xs text-muted-foreground">
              Ayam masuk dikurangi ayam keluar.
            </p>
          </div>
          <output
            htmlFor="ayamMasuk ayamKeluar"
            className="text-lg font-semibold tabular-nums"
          >
            {formatMutasi(hitungMutasi(ayamMasuk, ayamKeluar))}
          </output>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            render={<Link to={listPath} />}
          >
            Batal
          </Button>
          <Button type="submit">
            <HugeiconsIcon
              icon={FloppyDiskIcon}
              strokeWidth={1.8}
              className="size-4"
              aria-hidden="true"
            />
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </section>
  )
}

export default TransaksiAyamCreatePage
