import { generatePath, useParams } from "react-router-dom"
import {
  MockDataTable,
  type MockColumn,
} from "@/components/data-table/mock-data-table"
import { ExcelUpload } from "@/components/excel-upload"
import { RecordDetail, RecordNotFound } from "@/components/record-detail"
import {
  accountTransactions,
  accountMutation,
  coaName,
  partnerName,
  type AccountTransaction,
} from "@/data/mock-data"
import { formatDate, formatRupiah } from "@/lib/format"
import { routes } from "@/routes"

const columns: MockColumn<AccountTransaction>[] = [
  {
    key: "tipeInternal",
    label: "Tipe Internal",
    value: (row) => row.tipeInternal,
  },
  { key: "coaCode", label: "COA Code", value: (row) => row.coaCode },
  { key: "coaName", label: "COA Name", value: (row) => coaName(row.coaCode) },
  {
    key: "labelJurnal",
    label: "Label Jurnal",
    value: (row) => row.labelJurnal,
  },
  {
    key: "rekanan",
    label: "Rekanan",
    value: (row) => partnerName(row.rekananId),
  },
  {
    key: "tanggalTransaksi",
    label: "Tanggal Transaksi",
    value: (row) => row.tanggalTransaksi,
    render: (row) => formatDate(row.tanggalTransaksi),
  },
  {
    key: "mutasi",
    label: "Mutasi",
    value: accountMutation,
    render: (row) => formatRupiah(accountMutation(row)),
    align: "right",
  },
]
export function InquiryAccountPage() {
  return (
    <MockDataTable
      title="Daftar Transaksi Account"
      rows={accountTransactions}
      columns={columns}
      createPath={routes.accounts_create.path}
      createLabel="Create / Upload Excel"
      detailPath={(row) =>
        generatePath(routes.accounts_detail.path, { id: row.id })
      }
    />
  )
}
export function AccountCreatePage() {
  return (
    <ExcelUpload
      title="Upload Transaksi Account"
      backTo={routes.accounts.path}
    />
  )
}
export function AccountDetailPage() {
  const { id } = useParams()
  const row = accountTransactions.find((item) => item.id === id)
  if (!row) return <RecordNotFound backTo={routes.accounts.path} />
  return (
    <RecordDetail
      title="Detail Transaksi Account"
      backTo={routes.accounts.path}
      fields={[
        { label: "ID", value: row.id },
        { label: "Tipe Internal", value: row.tipeInternal },
        { label: "COA Code", value: row.coaCode },
        { label: "COA Name", value: coaName(row.coaCode) },
        { label: "Label Jurnal", value: row.labelJurnal },
        { label: "Rekanan", value: partnerName(row.rekananId) },
        { label: "Tanggal Transaksi", value: formatDate(row.tanggalTransaksi) },
      ]}
    >
      <div className="mx-5 mb-6 rounded-xl border bg-accent/40 p-5 md:mx-6">
        <h3 className="font-medium">Perhitungan Mutasi</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Mutasi = Debit − Kredit
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Debit</dt>
            <dd className="mt-1 text-base font-medium tabular-nums">
              {formatRupiah(row.debit)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Kredit</dt>
            <dd className="mt-1 text-base font-medium tabular-nums">
              {formatRupiah(row.kredit)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              Mutasi (Debit − Kredit)
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              {formatRupiah(accountMutation(row))}
            </dd>
          </div>
        </dl>
      </div>
    </RecordDetail>
  )
}
export default InquiryAccountPage
