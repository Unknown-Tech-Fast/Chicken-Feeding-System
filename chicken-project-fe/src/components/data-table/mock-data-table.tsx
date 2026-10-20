import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { EmptyTableState } from "@/components/empty-table-state"
import { SearchInput } from "@/components/data-table/search-input"
import { SortableHead } from "@/components/data-table/sortable-head"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber } from "@/lib/format"

export type MockColumn<T> = {
  key: string
  label: string
  value: (row: T) => string | number
  render?: (row: T) => ReactNode
  align?: "left" | "right"
}

export function MockDataTable<T extends { id: string }>({
  title,
  rows,
  columns,
  createPath,
  createLabel = "Create",
  detailPath,
}: {
  title: string
  rows: T[]
  columns: MockColumn<T>[]
  createPath: string
  createLabel?: string
  detailPath: (row: T) => string
}) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{
    key: string | null
    order: "asc" | "desc"
  }>({ key: null, order: "asc" })
  const filtered = rows.filter((row) =>
    columns.some((column) => {
      const display = column.render?.(row)
      const displayText =
        typeof display === "string" || typeof display === "number"
          ? display
          : ""
      return `${column.value(row)} ${displayText}`
        .toLocaleLowerCase("id-ID")
        .includes(search.trim().toLocaleLowerCase("id-ID"))
    })
  )
  const active = columns.find((column) => column.key === sort.key)
  if (active)
    filtered.sort((a, b) => {
      const x = active.value(a),
        y = active.value(b)
      const result =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), "id", { numeric: true })
      return sort.order === "asc" ? result : -result
    })
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_12px_-6px_rgba(2,5,32,0.12)]"
    >
      <div className="flex flex-col gap-4 border-b px-5 py-5 md:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{title}</h2>
            <Badge variant="secondary">Data mock</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Data contoh untuk pengembangan. Belum terhubung ke API.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Cari data…"
          />
          <Button
            variant="outline"
            className="h-9 rounded-full border-primary text-primary"
            render={<Link to={createPath} />}
          >
            {createLabel}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader className="group/head bg-accent/40 [&_th]:h-11 [&_th:first-child]:pl-6">
          <TableRow>
            {columns.map((column) => (
              <SortableHead
                key={column.key}
                columnKey={column.key}
                label={column.label}
                align={column.align}
                activeSortBy={sort.key}
                sortOrder={sort.order}
                onSort={(key) => {
                  setSort({
                    key,
                    order:
                      sort.key === key && sort.order === "asc" ? "desc" : "asc",
                  })
                  setPage(1)
                }}
              />
            ))}
            <TableHead className="pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column, index) => (
                <TableCell
                  key={column.key}
                  className={`${index === 0 ? "pl-6 font-medium" : ""} ${column.align === "right" ? "text-right tabular-nums" : ""} py-3`}
                >
                  {column.render ? column.render(row) : column.value(row)}
                </TableCell>
              ))}
              <TableCell className="pr-6 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  render={
                    <Link
                      aria-label={`View ${columns[0].value(row)}`}
                      to={detailPath(row)}
                    />
                  }
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {visible.length === 0 && (
        <EmptyTableState
          message={
            search
              ? `Tidak ada data yang cocok dengan “${search}”. Ubah atau hapus pencarian.`
              : "Data contoh untuk modul ini belum tersedia."
          }
          icon={<HugeiconsIcon icon={Search01Icon} aria-hidden="true" />}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-sm">
        <p className="text-muted-foreground">
          {formatNumber(filtered.length)} data · Halaman {currentPage} dari{" "}
          {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </section>
  )
}
