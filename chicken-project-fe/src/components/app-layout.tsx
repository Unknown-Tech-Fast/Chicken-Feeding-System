import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { UserMenu } from "@/components/user-menu"
import { routes, type RouteKey } from "@/routes"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppLayout({
  route,
  children,
}: {
  route: RouteKey
  children: ReactNode
}) {
  const details = routes[route]
  const sidebarRoute = "sidebarRoute" in details ? details.sidebarRoute : route

  return (
    <SidebarProvider>
      <AppSidebar route={sidebarRoute} />
      <SidebarInset className="min-h-svh min-w-0 bg-accent/60">
        <header className="sticky top-0 z-10 flex h-[4.5rem] items-center gap-3 border-b bg-background px-4 md:px-8">
          <SidebarTrigger
            aria-label="Buka atau tutup menu"
            className="size-10 rounded-full border border-border/80 bg-card"
          />
          <span aria-hidden="true" className="h-5 w-px bg-border/80" />
          <nav
            aria-label="Lokasi halaman"
            className="flex min-w-0 items-center gap-2 text-sm"
          >
            <span className="hidden shrink-0 text-muted-foreground sm:inline">
              Operasional
            </span>
            <span
              aria-hidden="true"
              className="hidden text-muted-foreground sm:inline"
            >
              /
            </span>
            <span aria-current="page" className="truncate font-medium">
              {details.title}
            </span>
          </nav>
          <div className="ml-auto shrink-0">
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 px-4 py-7 md:px-8 md:py-9">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
            <div>
              <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.037em] md:text-[2rem]">
                {details.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {details.description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
