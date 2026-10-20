import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generatePath, useParams } from "react-router-dom"
import {
  MockDataTable,
  type MockColumn,
} from "@/components/data-table/mock-data-table"
import { FormField, SelectInput } from "@/components/form-fields"
import {
  MasterFormLayout,
  notifySaveUnavailable,
} from "@/components/master-form-layout"
import {
  ActiveStatus,
  RecordDetail,
  RecordNotFound,
} from "@/components/record-detail"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cages, regions, regionName, type Cage } from "@/data/mock-data"
import { formatNumber } from "@/lib/format"
import { routes } from "@/routes"
import { cageSchema, type CageForm } from "./master-data-schema"

const columns: MockColumn<Cage>[] = [
  {
    key: "lokasiId",
    label: "Wilayah/Lokasi",
    value: (row) => regionName(row.lokasiId),
  },
  {
    key: "kodeKandang",
    label: "Kode Kandang",
    value: (row) => row.kodeKandang,
  },
  {
    key: "kapasitas",
    label: "Kapasitas",
    value: (row) => row.kapasitas ?? "",
    render: (row) =>
      row.kapasitas === null ? "—" : `${formatNumber(row.kapasitas)} ekor`,
    align: "right",
  },
  {
    key: "isActive",
    label: "Status Aktif",
    value: (row) => (row.isActive ? "Aktif" : "Tidak aktif"),
    render: (row) => <ActiveStatus active={row.isActive} />,
  },
]
export function MasterCagePage() {
  return (
    <MockDataTable
      title="Daftar Master Kandang"
      rows={cages}
      columns={columns}
      createPath={routes.master_cage_create.path}
      detailPath={(row) =>
        generatePath(routes.master_cage_detail.path, { id: row.id })
      }
    />
  )
}

export function MasterCageCreatePage() {
  const form = useForm<CageForm>({
    resolver: zodResolver(cageSchema),
    mode: "onTouched",
    defaultValues: {
      lokasiId: "",
      kodeKandang: "",
      kapasitas: null,
      isActive: true,
    },
  })
  const { errors } = form.formState
  return (
    <MasterFormLayout
      title="Create Master Kandang"
      backTo={routes.master_cage.path}
      onSubmit={form.handleSubmit(notifySaveUnavailable)}
    >
      <FormField
        id="lokasiId"
        label="Wilayah/Lokasi"
        required
        error={errors.lokasiId?.message}
      >
        <Controller
          control={form.control}
          name="lokasiId"
          render={({ field }) => (
            <SelectInput
              id="lokasiId"
              required
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(errors.lokasiId)}
              options={regions.map((row) => ({
                value: row.id,
                label: `${row.kodeLokasi} · ${row.namaLokasi}`,
              }))}
            />
          )}
        />
      </FormField>
      <FormField
        id="kodeKandang"
        label="Kode Kandang"
        required
        error={errors.kodeKandang?.message}
      >
        <Input
          className="h-10"
          id="kodeKandang"
          required
          aria-invalid={Boolean(errors.kodeKandang)}
          aria-describedby={
            errors.kodeKandang ? "kodeKandang-error" : undefined
          }
          {...form.register("kodeKandang")}
        />
      </FormField>
      <FormField
        id="kapasitas"
        label="Kapasitas"
        error={errors.kapasitas?.message}
        help="Opsional. Isi jumlah ekor dengan bilangan bulat nonnegatif."
      >
        <Input
          className="h-10"
          id="kapasitas"
          type="number"
          min={0}
          step={1}
          aria-invalid={Boolean(errors.kapasitas)}
          aria-describedby={`kapasitas-help${errors.kapasitas ? " kapasitas-error" : ""}`}
          {...form.register("kapasitas", {
            setValueAs: (value: string | null) =>
              value === "" || value === null ? null : Number(value),
          })}
        />
      </FormField>
      <FormField id="isActive" label="Status Aktif">
        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <div className="flex min-h-10 items-center gap-3">
              <Switch
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
              />
              <span className="text-sm">
                {field.value ? "Aktif" : "Tidak aktif"}
              </span>
            </div>
          )}
        />
      </FormField>
    </MasterFormLayout>
  )
}

export function MasterCageDetailPage() {
  const { id } = useParams()
  const row = cages.find((item) => item.id === id)
  if (!row) return <RecordNotFound backTo={routes.master_cage.path} />
  return (
    <RecordDetail
      title={row.kodeKandang}
      backTo={routes.master_cage.path}
      fields={[
        { label: "ID", value: row.id },
        { label: "ID Lokasi", value: row.lokasiId },
        { label: "Wilayah/Lokasi", value: regionName(row.lokasiId) },
        { label: "Kode Kandang", value: row.kodeKandang },
        {
          label: "Kapasitas",
          value:
            row.kapasitas === null
              ? "—"
              : `${formatNumber(row.kapasitas)} ekor`,
        },
        {
          label: "Status Aktif",
          value: <ActiveStatus active={row.isActive} />,
        },
      ]}
    />
  )
}
