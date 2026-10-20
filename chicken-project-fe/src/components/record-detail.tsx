import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function RecordDetail({
  title,
  backTo,
  fields,
  children,
}: {
  title: string
  backTo: string
  fields: { label: string; value: ReactNode }[]
  children?: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5 md:px-6">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Data mock · Tampilan read-only.
          </p>
        </div>
        <Button variant="outline" render={<Link to={backTo} />}>
          Kembali ke daftar
        </Button>
      </div>
      <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 md:p-6">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-sm text-muted-foreground">{field.label}</dt>
            <dd className="mt-1.5 text-sm font-medium break-words">
              {field.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  )
}

export function RecordNotFound({ backTo }: { backTo: string }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Data tidak ditemukan</h2>
      <p className="my-3 text-sm text-muted-foreground">
        Identifier pada alamat ini tidak tersedia di data mock.
      </p>
      <Button variant="outline" render={<Link to={backTo} />}>
        Kembali ke daftar
      </Button>
    </section>
  )
}

export function ActiveStatus({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "secondary" : "outline"}>
      {active ? "Aktif" : "Tidak aktif"}
    </Badge>
  )
}
