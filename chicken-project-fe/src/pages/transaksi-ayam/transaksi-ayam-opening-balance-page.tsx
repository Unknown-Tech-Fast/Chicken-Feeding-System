import { generatePath, useParams } from "react-router-dom"
import {
  MockDataTable,
  type MockColumn,
} from "@/components/data-table/mock-data-table"
import { ExcelUpload } from "@/components/excel-upload"
import { RecordDetail, RecordNotFound } from "@/components/record-detail"
import {
  openingBalances,
  cageName,
  regionName,
  type OpeningBalance,
} from "@/data/mock-data"
import { formatMonth, formatNumber } from "@/lib/format"
import { routes } from "@/routes"

const columns: MockColumn<OpeningBalance>[] = [
  {
    key: "periodeBulan",
    label: "Periode Bulan",
    value: (row) => row.periodeBulan,
    render: (row) => formatMonth(row.periodeBulan),
  },
  {
    key: "wilayah",
    label: "Wilayah",
    value: (row) => regionName(row.lokasiId),
  },
  { key: "kandang", label: "Kandang", value: (row) => cageName(row.kandangId) },
  { key: "flockO", label: "Flock O", value: (row) => row.flockO },
  {
    key: "umurMinggu",
    label: "Umur Minggu",
    value: (row) => row.umurMinggu,
    render: (row) => formatNumber(row.umurMinggu),
    align: "right",
  },
  {
    key: "saldoAwal",
    label: "Saldo Awal",
    value: (row) => row.saldoAwal,
    render: (row) => formatNumber(row.saldoAwal) + " ekor",
    align: "right",
  },
]
export function TransaksiAyamOpeningBalancePage() {
  return (
    <MockDataTable
      title="Daftar Opening Balance"
      rows={openingBalances}
      columns={columns}
      createPath={routes.chicken_opening_balance_create.path}
      createLabel="Create / Upload Excel"
      detailPath={(row) =>
        generatePath(routes.chicken_opening_balance_detail.path, { id: row.id })
      }
    />
  )
}
export function OpeningBalanceCreatePage() {
  return (
    <ExcelUpload
      title="Upload Opening Balance"
      backTo={routes.chicken_opening_balance.path}
    />
  )
}
export function OpeningBalanceDetailPage() {
  const { id } = useParams()
  const row = openingBalances.find((item) => item.id === id)
  if (!row)
    return <RecordNotFound backTo={routes.chicken_opening_balance.path} />
  return (
    <RecordDetail
      title="Detail Opening Balance"
      backTo={routes.chicken_opening_balance.path}
      fields={[
        { label: "ID", value: row.id },
        { label: "Periode Bulan", value: formatMonth(row.periodeBulan) },
        { label: "Wilayah", value: regionName(row.lokasiId) },
        { label: "Kandang", value: cageName(row.kandangId) },
        { label: "Flock O", value: row.flockO },
        { label: "Umur Minggu", value: formatNumber(row.umurMinggu) },
        { label: "Saldo Awal", value: formatNumber(row.saldoAwal) + " ekor" },
      ]}
    />
  )
}
export default TransaksiAyamOpeningBalancePage
