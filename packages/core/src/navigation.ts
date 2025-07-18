import type { LucideIcon } from "lucide-react"

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface CreateOption {
  name: string
  href: string
  icon: LucideIcon
}

export interface SidebarState {
  isCreateOpen: boolean
  setIsCreateOpen: (open: boolean) => void
}