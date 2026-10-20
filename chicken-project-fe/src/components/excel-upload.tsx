import { useId, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/format"

export function ExcelUpload({
  title,
  backTo,
}: {
  title: string
  backTo: string
}) {
  const id = useId()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  function selectFiles(files: File[]) {
    setFile(null)
    if (files.length !== 1) {
      setError("Pilih satu file Excel untuk diupload.")
      return
    }
    const selected = files[0]
    if (!/\.(xlsx|xls)$/i.test(selected.name)) {
      setError("Format file harus .xlsx atau .xls.")
      return
    }
    if (selected.size === 0) {
      setError("File kosong. Pilih file Excel yang berisi data.")
      return
    }
    setFile(selected)
    setError("")
  }

  function upload(event: FormEvent) {
    event.preventDefault()
    if (!file) {
      setError("Pilih file Excel terlebih dahulu.")
      return
    }
    toast.info("API upload belum tersedia", {
      description: `${file.name} belum diupload. Tidak ada data yang disimpan.`,
    })
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5 md:p-6">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Input data melalui file Excel. Upload akan tersedia setelah integrasi
          API.
        </p>
      </div>
      <form onSubmit={upload} className="space-y-5 p-5 md:p-6">
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            selectFiles(Array.from(event.dataTransfer.files))
          }}
          className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none ${dragging ? "border-primary bg-accent" : "border-border bg-accent/30 hover:bg-accent/60"}`}
        >
          <input
            id={id}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : `${id}-help`}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length)
                selectFiles(Array.from(event.target.files))
              event.target.value = ""
            }}
          />
          <span className="text-sm font-medium">
            Pilih file Excel atau tarik file ke sini
          </span>
          <span id={`${id}-help`} className="text-sm text-muted-foreground">
            Satu file · Format .xlsx atau .xls
          </span>
        </label>
        {file && (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium break-all">{file.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatNumber(file.size)} byte · Belum diupload
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFile(null)
                setError("")
              }}
            >
              Hapus file
            </Button>
          </div>
        )}
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
          <Button variant="outline" render={<Link to={backTo} />}>
            Kembali ke daftar
          </Button>
          <Button
            type="submit"
            variant="outline"
            className="rounded-full border-primary text-primary"
          >
            Upload
          </Button>
        </div>
      </form>
    </section>
  )
}
