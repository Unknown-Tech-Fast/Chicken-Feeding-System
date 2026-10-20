import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Sedang menunggu debounce / request berjalan. */
  isBusy?: boolean
  className?: string
}

/**
 * Input pencarian untuk tabel. Nilai langsung diteruskan; debounce ada di
 * `useTableQuery` supaya satu sumber kebenaran.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Cari…",
  isBusy = false,
  className,
}: SearchInputProps) {
  return (
    <div className={`relative ${className ?? "w-full sm:w-72"}`}>
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={1.8}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-8.5 pr-8.5 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
        {isBusy ? (
          <span
            aria-hidden="true"
            className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
          />
        ) : value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            aria-label="Hapus pencarian"
            className="size-6 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} aria-hidden="true" className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
