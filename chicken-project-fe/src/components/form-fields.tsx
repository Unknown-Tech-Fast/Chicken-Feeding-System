import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function FormField({
  id,
  label,
  required,
  error,
  children,
  help,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  help?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        )}
      </Label>
      {children}
      {help && (
        <p
          id={`${id}-help`}
          className="text-xs leading-5 text-muted-foreground"
        >
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder = "Pilih…",
  required,
  invalid,
  onBlur,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  invalid?: boolean
  onBlur?: () => void
}) {
  return (
    <Select
      items={options}
      value={value || null}
      onValueChange={(next) => onChange(next ?? "")}
    >
      <SelectTrigger
        id={id}
        onBlur={onBlur}
        className="w-full data-[size=default]:h-10"
        aria-required={required}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
