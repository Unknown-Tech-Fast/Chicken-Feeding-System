import { useState, type FormEvent } from "react"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"
import { FormField, SelectInput } from "@/components/form-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { coaAccounts, partners } from "@/data/mock-data"
import { currentMonth, formatMonth } from "@/lib/format"
import {
  reportCategories,
  reportOptions,
  type ReportCategory,
} from "./report-options"

function ReportForm({ category }: { category: ReportCategory }) {
  const config = reportOptions[category]
  const [kind, setKind] = useState(config.options[0].value)
  const [month, setMonth] = useState(currentMonth)
  const [scope, setScope] = useState("all")
  const [selection, setSelection] = useState("")
  const [error, setError] = useState("")
  const [monthError, setMonthError] = useState("")
  const selectedKind = config.options.find((option) => option.value === kind)!
  const filter = selectedKind.filter
  const scopeId = category + "-scope"
  const selectionId = category + "-selection"
  const monthId = category + "-month"
  const options =
    filter === "account"
      ? coaAccounts.map((row) => ({
          value: row.code,
          label: row.code + " · " + row.name,
        }))
      : partners.map((row) => ({ value: row.id, label: row.name }))

  function submit(event: FormEvent) {
    event.preventDefault()
    const period = month || currentMonth()
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      setMonthError("Pilih periode bulan yang valid.")
      return
    }
    setMonth(period)
    setMonthError("")
    if (
      filter &&
      scope === "specific" &&
      !options.some((option) => option.value === selection)
    ) {
      setError(
        filter === "account"
          ? "Pilih akun terlebih dahulu."
          : "Pilih rekanan terlebih dahulu."
      )
      return
    }
    setError("")
    toast.info("API generate/download laporan belum tersedia", {
      description:
        "Laporan " +
        config.label +
        " periode " +
        formatMonth(period) +
        " belum dibuat. Tidak ada file yang diunduh.",
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6 p-5 md:p-6">
      <div>
        <h3 className="text-lg font-semibold">Laporan {config.label}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Atur periode dan cakupan laporan. Opsi pilihan menggunakan data mock.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id={category + "-kind"} label="Jenis Laporan" required>
          <SelectInput
            id={category + "-kind"}
            value={kind}
            required
            options={config.options}
            onChange={(value) => {
              setKind(value)
              setScope("all")
              setSelection("")
              setError("")
            }}
          />
        </FormField>
        <FormField
          id={monthId}
          label="Periode Bulan"
          error={monthError}
          help="Jika dikosongkan, laporan menggunakan bulan berjalan."
        >
          <Input
            id={monthId}
            type="month"
            value={month}
            aria-invalid={Boolean(monthError)}
            aria-describedby={
              monthId + "-help" + (monthError ? " " + monthId + "-error" : "")
            }
            onChange={(event) => {
              setMonth(event.target.value)
              setMonthError("")
            }}
            className="h-10"
          />
        </FormField>
        {filter && (
          <FormField
            id={scopeId}
            label={filter === "account" ? "Filter Akun" : "Filter Rekanan"}
          >
            <SelectInput
              id={scopeId}
              value={scope}
              options={[
                {
                  value: "all",
                  label: filter === "account" ? "Semua Akun" : "Semua Rekanan",
                },
                {
                  value: "specific",
                  label:
                    filter === "account" ? "Akun Tertentu" : "Rekanan Tertentu",
                },
              ]}
              onChange={(value) => {
                setScope(value)
                setSelection("")
                setError("")
              }}
            />
          </FormField>
        )}
        {filter && scope === "specific" && (
          <FormField
            id={selectionId}
            label={filter === "account" ? "Pilih Akun" : "Pilih Rekanan"}
            required
            error={error}
          >
            <SelectInput
              id={selectionId}
              value={selection}
              required
              invalid={Boolean(error)}
              options={options}
              onChange={(value) => {
                setSelection(value)
                setError("")
              }}
            />
          </FormField>
        )}
      </div>
      <div className="flex flex-col items-start justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Format keluaran: Excel · API belum tersedia.
        </p>
        <Button
          type="submit"
          variant="outline"
          className="h-10 rounded-full border-primary px-5 text-primary"
        >
          Download Report (Excel)
        </Button>
      </div>
    </form>
  )
}

export function ReportingPage() {
  const { pathname } = useLocation()
  const initialCategory: ReportCategory = pathname.endsWith("/general-ledger")
    ? "ledger"
    : pathname.endsWith("/ayam")
      ? "chicken"
      : pathname.endsWith("/pakan")
        ? "feed"
        : pathname.endsWith("/ovk")
          ? "ovk"
          : "ledger"
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b p-5 md:px-6">
        <h2 className="font-semibold">Pusat Laporan</h2>
        <Badge variant="secondary">Data mock</Badge>
      </div>
      <Tabs defaultValue={initialCategory} className="gap-0">
        <div className="overflow-x-auto border-b px-5 py-3 md:px-6">
          <TabsList
            aria-label="Kategori laporan"
            className="min-w-max gap-1 rounded-full"
          >
            {reportCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-full px-4"
              >
                {reportOptions[category].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {reportCategories.map((category) => (
          <TabsContent key={category} value={category} keepMounted>
            <ReportForm category={category} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
export default ReportingPage
