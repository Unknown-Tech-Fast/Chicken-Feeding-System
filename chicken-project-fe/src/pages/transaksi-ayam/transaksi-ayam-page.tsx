import { generatePath, useParams } from "react-router-dom"
import {
  MockDataTable,
  type MockColumn,
} from "@/components/data-table/mock-data-table"
import { RecordDetail, RecordNotFound } from "@/components/record-detail"
import { chickenTransactions, cageName } from "@/data/mock-data"
import { formatMonth, formatNumber } from "@/lib/format"
import { routes } from "@/routes"
import { formatMutasi, hitungMutasi } from "./transaksi-ayam-schema"

type Row = (typeof chickenTransactions)[number]
const columns: MockColumn<Row>[] = [
  {
    key: "periodeBulan",
    label: "Periode Bulan",
    value: (row) => row.periodeBulan,
    render: (row) => formatMonth(row.periodeBulan),
  },
  { key: "type", label: "Type", value: (row) => row.type },
  { key: "kandang", label: "Kandang", value: (row) => cageName(row.kandangId) },
  { key: "flockNo", label: "Flock No", value: (row) => row.flockNo },
  {
    key: "umurMinggu",
    label: "Umur Minggu",
    value: (row) => row.umurMinggu,
    align: "right",
  },
  {
    key: "mutasi",
    label: "Mutasi",
    value: (row) => hitungMutasi(row.ayamMasuk, row.ayamKeluar),
    render: (row) => formatMutasi(hitungMutasi(row.ayamMasuk, row.ayamKeluar)),
    align: "right",
  },
]
export function TransaksiAyamPage() {
  return (
    <MockDataTable
      title="Daftar Transaksi Ayam"
      rows={chickenTransactions}
      columns={columns}
      createPath={routes.chicken_create.path}
      createLabel="Tambah Transaksi"
      detailPath={(row) =>
        generatePath(routes.chicken_detail.path, { id: row.id })
      }
    />
  )
}
export function TransaksiAyamDetailPage() {
  const { id } = useParams()
  const row = chickenTransactions.find((item) => item.id === id)
  if (!row) return <RecordNotFound backTo={routes.chicken_inquiry.path} />
  return (
    <RecordDetail
      title="Detail Transaksi Ayam"
      backTo={routes.chicken_inquiry.path}
      fields={[
        { label: "ID", value: row.id },
        { label: "Periode Bulan", value: formatMonth(row.periodeBulan) },
        { label: "Type", value: row.type },
        { label: "Kandang", value: cageName(row.kandangId) },
        { label: "Flock No", value: row.flockNo },
        { label: "Umur Minggu", value: formatNumber(row.umurMinggu) },
        { label: "Ayam Masuk", value: formatNumber(row.ayamMasuk) + " ekor" },
        { label: "Ayam Keluar", value: formatNumber(row.ayamKeluar) + " ekor" },
        {
          label: "Mutasi",
          value:
            formatMutasi(hitungMutasi(row.ayamMasuk, row.ayamKeluar)) + " ekor",
        },
      ]}
    />
  )
}
export default TransaksiAyamPage
