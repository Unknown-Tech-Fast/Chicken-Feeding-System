import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SortOrder } from "@/utils/api/query"

type SortableHeadProps = {
  /** Key kolom UI — harus ada di `sortMap` halaman. */
  columnKey: string
  label: string
  activeSortBy: string | null
  sortOrder: SortOrder
  onSort: (columnKey: string) => void
  align?: "left" | "right" | "center"
  className?: string
}

/**
 * Header kolom tabel yang bisa diklik untuk sort server-side.
 * Klik: belum aktif → asc → desc → kembali ke default.
 */
export function SortableHead({
  columnKey,
  label,
  activeSortBy,
  sortOrder,
  onSort,
  align = "left",
  className,
}: SortableHeadProps) {
  const isActive = activeSortBy === columnKey
  const Icon = isActive && sortOrder === "desc" ? ArrowDown01Icon : ArrowUp01Icon

  return (
    <TableHead
      className={cn(align === "right" && "text-right", align === "center" && "text-center", className)}
      aria-sort={isActive ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors",
          "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isActive && "font-medium text-foreground",
          align === "right" && "flex-row-reverse",
        )}
      >
        <span>{label}</span>
        <HugeiconsIcon
          icon={Icon}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            "size-3 shrink-0 transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover/head:opacity-40",
          )}
        />
      </button>
    </TableHead>
  )
}
