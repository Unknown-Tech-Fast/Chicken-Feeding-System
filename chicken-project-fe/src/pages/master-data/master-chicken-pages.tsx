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
import { RecordDetail, RecordNotFound } from "@/components/record-detail"
import { Input } from "@/components/ui/input"
import {
  chickenPhases,
  coaAccounts,
  coaName,
  phaseCodes,
  type ChickenPhase,
} from "@/data/mock-data"
import { formatNumber } from "@/lib/format"
import { routes } from "@/routes"
import {
  chickenPhaseSchema,
  defaultDepletionAge,
  type ChickenPhaseForm,
} from "./master-data-schema"

const columns: MockColumn<ChickenPhase>[] = [
  { key: "kodeFase", label: "Kode Fase", value: (row) => row.kodeFase },
  { key: "namaFase", label: "Nama Fase", value: (row) => row.namaFase },
  {
    key: "defaultUmurDeplesi",
    label: "Default Umur Deplesi",
    value: (row) => row.defaultUmurDeplesi,
    render: (row) => formatNumber(row.defaultUmurDeplesi),
    align: "right",
  },
  {
    key: "coaPersediaan",
    label: "COA Persediaan",
    value: (row) => `${row.coaPersediaan} · ${coaName(row.coaPersediaan)}`,
  },
]

export function MasterChickenPage() {
  return (
    <MockDataTable
      title="Daftar Master Ayam"
      rows={chickenPhases}
      columns={columns}
      createPath={routes.master_chicken_create.path}
      detailPath={(row) =>
        generatePath(routes.master_chicken_detail.path, { id: row.id })
      }
    />
  )
}

export function MasterChickenCreatePage() {
  const form = useForm<ChickenPhaseForm>({
    resolver: zodResolver(chickenPhaseSchema),
    mode: "onTouched",
    defaultValues: {
      kodeFase: "DOC",
      namaFase: "",
      defaultUmurDeplesi: 0,
      coaPersediaan: "",
    },
  })
  const { errors } = form.formState
  return (
    <MasterFormLayout
      title="Create Master Ayam"
      backTo={routes.master_chicken.path}
      onSubmit={form.handleSubmit(notifySaveUnavailable)}
    >
      <FormField
        id="kodeFase"
        label="Kode Fase"
        required
        error={errors.kodeFase?.message}
      >
        <Controller
          control={form.control}
          name="kodeFase"
          render={({ field }) => (
            <SelectInput
              id="kodeFase"
              required
              value={field.value}
              onBlur={field.onBlur}
              invalid={Boolean(errors.kodeFase)}
              options={phaseCodes.map((value) => ({ value, label: value }))}
              onChange={(value) => {
                field.onChange(value)
                form.setValue(
                  "defaultUmurDeplesi",
                  defaultDepletionAge(value),
                  { shouldValidate: true, shouldDirty: true }
                )
              }}
            />
          )}
        />
      </FormField>
      <FormField
        id="namaFase"
        label="Nama Fase"
        required
        error={errors.namaFase?.message}
      >
        <Input
          className="h-10"
          id="namaFase"
          required
          aria-invalid={Boolean(errors.namaFase)}
          aria-describedby={errors.namaFase ? "namaFase-error" : undefined}
          {...form.register("namaFase")}
        />
      </FormField>
      <FormField
        id="defaultUmurDeplesi"
        label="Default Umur Deplesi"
        required
        error={errors.defaultUmurDeplesi?.message}
        help="LAYING: 9; fase lainnya: 0. Nilai awal dapat diubah."
      >
        <Input
          className="h-10"
          id="defaultUmurDeplesi"
          type="number"
          min={0}
          step={1}
          required
          aria-invalid={Boolean(errors.defaultUmurDeplesi)}
          aria-describedby={`defaultUmurDeplesi-help${errors.defaultUmurDeplesi ? " defaultUmurDeplesi-error" : ""}`}
          {...form.register("defaultUmurDeplesi", { valueAsNumber: true })}
        />
      </FormField>
      <FormField
        id="coaPersediaan"
        label="COA Persediaan"
        required
        error={errors.coaPersediaan?.message}
      >
        <Controller
          control={form.control}
          name="coaPersediaan"
          render={({ field }) => (
            <SelectInput
              id="coaPersediaan"
              required
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(errors.coaPersediaan)}
              options={coaAccounts.map((row) => ({
                value: row.code,
                label: `${row.code} · ${row.name}`,
              }))}
            />
          )}
        />
      </FormField>
    </MasterFormLayout>
  )
}

export function MasterChickenDetailPage() {
  const { id } = useParams()
  const row = chickenPhases.find((item) => item.id === id)
  if (!row) return <RecordNotFound backTo={routes.master_chicken.path} />
  return (
    <RecordDetail
      title={row.namaFase}
      backTo={routes.master_chicken.path}
      fields={[
        { label: "ID", value: row.id },
        { label: "Kode Fase", value: row.kodeFase },
        { label: "Nama Fase", value: row.namaFase },
        {
          label: "Default Umur Deplesi",
          value: formatNumber(row.defaultUmurDeplesi),
        },
        {
          label: "COA Persediaan",
          value: `${row.coaPersediaan} · ${coaName(row.coaPersediaan)}`,
        },
      ]}
    />
  )
}
