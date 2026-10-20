const numberFormatter = new Intl.NumberFormat("id-ID")
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export const formatNumber = (value: number) => numberFormatter.format(value)
export const formatRupiah = (value: number) => rupiahFormatter.format(value)
export const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}
export const formatMonth = (value: string) => {
  const [year, month] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}
export const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}
