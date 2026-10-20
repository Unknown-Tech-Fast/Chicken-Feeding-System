import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generatePath, useParams } from "react-router-dom"
import {
  MockDataTable,
  type MockColumn,
} from "@/components/data-table/mock-data-table"
import { FormField } from "@/components/form-fields"
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
import { regions, type Region } from "@/data/mock-data"
import { routes } from "@/routes"
import { regionSchema, type RegionForm } from "./master-data-schema"

const columns: MockColumn<Region>[] = [
  { key: "kodeLokasi", label: "Kode Lokasi", value: (row) => row.kodeLokasi },
  { key: "namaLokasi", label: "Nama Lokasi", value: (row) => row.namaLokasi },
  {
    key: "isActive",
    label: "Status Aktif",
    value: (row) => (row.isActive ? "Aktif" : "Tidak aktif"),
    render: (row) => <ActiveStatus active={row.isActive} />,
  },
]
export function MasterRegionPage() {
  return (
    <MockDataTable
      title="Daftar Master Wilayah"
      rows={regions}
      columns={columns}
      createPath={routes.master_region_create.path}
      detailPath={(row) =>
        generatePath(routes.master_region_detail.path, { id: row.id })
      }
    />
  )
}

export function MasterRegionCreatePage() {
  const form = useForm<RegionForm>({
    resolver: zodResolver(regionSchema),
    mode: "onTouched",
    defaultValues: { kodeLokasi: "", namaLokasi: "", isActive: true },
  })
  const { errors } = form.formState
  return (
    <MasterFormLayout
      title="Create Master Wilayah"
      backTo={routes.master_region.path}
      onSubmit={form.handleSubmit(notifySaveUnavailable)}
    >
      <FormField
        id="kodeLokasi"
        label="Kode Lokasi"
        required
        error={errors.kodeLokasi?.message}
      >
        <Input
          className="h-10"
          id="kodeLokasi"
          required
          aria-invalid={Boolean(errors.kodeLokasi)}
          aria-describedby={errors.kodeLokasi ? "kodeLokasi-error" : undefined}
          {...form.register("kodeLokasi")}
        />
      </FormField>
      <FormField
        id="namaLokasi"
        label="Nama Lokasi"
        required
        error={errors.namaLokasi?.message}
      >
        <Input
          className="h-10"
          id="namaLokasi"
          required
          aria-invalid={Boolean(errors.namaLokasi)}
          aria-describedby={errors.namaLokasi ? "namaLokasi-error" : undefined}
          {...form.register("namaLokasi")}
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

export function MasterRegionDetailPage() {
  const { id } = useParams()
  const row = regions.find((item) => item.id === id)
  if (!row) return <RecordNotFound backTo={routes.master_region.path} />
  return (
    <RecordDetail
      title={row.namaLokasi}
      backTo={routes.master_region.path}
      fields={[
        { label: "ID", value: row.id },
        { label: "Kode Lokasi", value: row.kodeLokasi },
        { label: "Nama Lokasi", value: row.namaLokasi },
        {
          label: "Status Aktif",
          value: <ActiveStatus active={row.isActive} />,
        },
      ]}
    />
  )
}
