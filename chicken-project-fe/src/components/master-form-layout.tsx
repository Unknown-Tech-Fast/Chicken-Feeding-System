import type { FormEventHandler, ReactNode } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function MasterFormLayout({
  title,
  backTo,
  children,
  onSubmit,
}: {
  title: string
  backTo: string
  children: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
}) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5 md:p-6">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kolom bertanda * wajib diisi. Data belum akan disimpan.
        </p>
      </div>
      <form noValidate onSubmit={onSubmit} className="p-5 md:p-6">
        <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        <div className="mt-7 flex justify-end gap-2 border-t pt-5">
          <Button variant="outline" render={<Link to={backTo} />}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="outline"
            className="rounded-full border-primary text-primary"
          >
            Save
          </Button>
        </div>
      </form>
    </section>
  )
}

export function notifySaveUnavailable() {
  toast.info("API penyimpanan belum tersedia", {
    description: "Input sudah divalidasi, tetapi belum ada data yang disimpan.",
  })
}
