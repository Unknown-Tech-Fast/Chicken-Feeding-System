import { useState } from "react"
import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, BirdIcon } from "@hugeicons/core-free-icons"

import { routes, type RouteKey } from "@/routes"
import {
  sidebarRoutes,
  type SidebarMenuGroup,
  type SidebarMenuItem as SidebarMenuItemData,
} from "@/routes-sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ route }: { route: RouteKey }) {
  const isGroup = (item: SidebarMenuItemData): item is SidebarMenuGroup =>
    Array.isArray((item as SidebarMenuGroup).children)

  // Grup yang berisi halaman aktif TIDAK bisa ditutup — mencegah user "hilang" di route aktif.
  const activeGroupId = sidebarRoutes
    .filter(isGroup)
    .find((item) => item.children.some((child) => child.route === route))?.id

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const isOpen = (id: string) => id === activeGroupId || !collapsedGroups[id]

  const { state, setOpen } = useSidebar()

  function toggleGroup(id: string) {
    if (state === "collapsed") {
      setOpen(true)
      setCollapsedGroups((current) => ({ ...current, [id]: false }))
      return
    }

    setCollapsedGroups((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-[4.5rem] justify-center border-b px-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <HugeiconsIcon icon={BirdIcon} strokeWidth={1.8} className="size-[1.15rem]" aria-hidden="true" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-tight text-foreground">Chicken Project</div>
            <p className="text-xs text-muted-foreground">Operasional</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 pt-5 group-data-[collapsible=icon]:px-2">
          <SidebarGroupLabel className="mb-2 px-3 text-xs font-medium text-muted-foreground">Menu utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {sidebarRoutes.map((item) => (
                <SidebarMenuItem key={item.id}>
                  {isGroup(item) ? (
                    <>
                      <SidebarMenuButton
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        isActive={item.children.some((child) => child.route === route)}
                        aria-expanded={Boolean(isOpen(item.id))}
                        tooltip={item.label}
                        className="h-11 gap-3 rounded-full px-3 transition-colors duration-200 motion-reduce:transition-none data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                      >
                        <HugeiconsIcon icon={item.icon} strokeWidth={1.8} aria-hidden="true" />
                        <span>{item.label}</span>
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className={`ml-auto text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-[collapsible=icon]:hidden ${isOpen(item.id) ? "rotate-180" : ""}`}
                        />
                      </SidebarMenuButton>
                      {isOpen(item.id) && (
                        <SidebarMenuSub className="animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.route}>
                              <SidebarMenuSubButton
                                render={<Link to={routes[child.route].path} />}
                                isActive={child.route === route}
                                aria-current={child.route === route ? "page" : undefined}
                                className="my-1 h-10 rounded-full px-3 data-active:font-medium"
                              >
                                {child.label}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton
                      render={<Link to={routes[item.route].path} />}
                      isActive={item.route === route}
                      aria-current={item.route === route ? "page" : undefined}
                      tooltip={item.label}
                      className="h-11 gap-3 rounded-full px-3 transition-colors duration-200 motion-reduce:transition-none data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.8} aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        Prototipe Apps
      </SidebarFooter>
    </Sidebar>
  )
}
