import { useLocation } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartColumnIcon } from "@hugeicons/core-free-icons"

import { routes, findRouteKey } from "@/routes"

/**
 * Halaman sementara untuk route yang ada di `routes.ts` tapi belum punya
 * implementasi. Judul & deskripsi diambil dari entri route-nya.
 *
 * Menambah halaman sungguhan: ganti `component` di `routes.ts` — file ini
 * tidak perlu diubah.
 */
export function PlaceholderPage() {
  const { pathname } = useLocation()
  const key = findRouteKey(pathname)
  const details = key ? routes[key] : null

  return (
    <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_12px_-6px_rgba(2,5,32,0.12)]">
      <div className="border-b border-border/70 px-5 py-5 md:px-6">
        <h2 className="text-base font-semibold tracking-[-0.01em]">
          {details?.title ?? "Halaman"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {details?.description ?? "Halaman ini belum tersedia."}
        </p>
      </div>
      <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border/80 bg-accent/60 text-muted-foreground">
          <HugeiconsIcon icon={ChartColumnIcon} strokeWidth={1.8} className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">Halaman belum dibuat</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Halaman ini masih menunggu implementasi. Daftarkan komponennya di
          {" "}<code className="rounded bg-muted px-1 py-0.5 text-xs">src/routes.ts</code>.
        </p>
      </div>
    </section>
  )
}

export default PlaceholderPage
