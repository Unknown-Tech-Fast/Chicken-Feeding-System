export const reportCategories = ["ledger", "chicken", "feed", "ovk"] as const
export type ReportCategory = (typeof reportCategories)[number]
export type ReportOption = {
  value: string
  label: string
  filter?: "account" | "partner"
}
export const reportOptions: Record<
  ReportCategory,
  { label: string; options: ReportOption[] }
> = {
  ledger: {
    label: "Buku Besar",
    options: [
      { value: "ledger", label: "Buku Besar (mock)", filter: "account" },
    ],
  },
  chicken: {
    label: "Ayam",
    options: [
      { value: "summary", label: "Summary Data" },
      { value: "partner", label: "Laporan per Rekanan", filter: "partner" },
    ],
  },
  feed: {
    label: "Pakan",
    options: [
      { value: "account", label: "Summary Data per Akun" },
      { value: "partner", label: "Laporan per Rekanan", filter: "partner" },
      { value: "region", label: "Laporan per Wilayah" },
    ],
  },
  ovk: {
    label: "OVK",
    options: [
      { value: "region", label: "Summary OVK per Wilayah" },
      { value: "account", label: "Summary per Akun" },
    ],
  },
}
