import {
  BirdIcon,
  ChartColumnIcon,
  MoneyIcon,
  SettingsIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import type { RouteKey } from "@/routes"

/** Item menu tunggal (tanpa submenu). */
export type SidebarMenuLink = {
  id: string
  label: string
  route: RouteKey
  icon: typeof BirdIcon
  children?: undefined
}

/** Item menu dengan submenu — `route` opsional (menu induk tidak wajib punya halaman). */
export type SidebarMenuGroup = {
  id: string
  label: string
  icon: typeof BirdIcon
  route?: RouteKey
  children: readonly { label: string; route: RouteKey }[]
}

export type SidebarMenuItem = SidebarMenuLink | SidebarMenuGroup

export const sidebarRoutes: readonly SidebarMenuItem[] = [
  {
    id: "chicken",
    label: "Transaksi Ayam",
    route: "chicken",
    icon: BirdIcon,
    children: [
      { label: "Opening Balance", route: "chicken_opening_balance" },
      { label: "Entry Transaksi Ayam", route: "chicken_inquiry" },
    ],
  },
  {
    id: "account",
    label: "Transaksi Account",
    icon: Wallet01Icon,
    children: [{ label: "Entry Account", route: "accounts" }],
  },
  {
    id: "cost_allocation",
    label: "Alokasi Biaya",
    route: "cost_allocation",
    icon: MoneyIcon,
  },
  {
    id: "reporting",
    label: "Reporting",
    route: "reporting",
    icon: ChartColumnIcon,
  },
  {
    id: "master",
    label: "Master Data",
    icon: SettingsIcon,
    children: [
      { label: "Master Ayam", route: "master_chicken" },
      { label: "Master Kandang", route: "master_cage" },
      { label: "Master Wilayah", route: "master_region" },
    ],
  },
] as const satisfies readonly SidebarMenuItem[]
