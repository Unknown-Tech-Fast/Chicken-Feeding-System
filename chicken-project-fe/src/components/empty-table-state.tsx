import type { ReactNode } from "react"

export function EmptyTableState({ message, icon }: { message: string; icon: ReactNode }) {
  return (
    <div className="flex min-h-72 w-full flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border/80 bg-accent/60 text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <p className="text-sm font-medium">Belum ada data</p>
      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed whitespace-normal text-muted-foreground">
        {message}
      </p>
    </div>
  )
}
