import Link from "next/link"
import { cn } from "@/lib/utils"
import { getTooltipClasses } from "@/lib/utils/navigation"
import type { NavigationItem } from "@/lib/types/navigation"

interface NavigationItemProps {
  item: NavigationItem
  isActive: boolean
}

export function NavigationItemComponent({ item, isActive }: NavigationItemProps) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md transition-colors",
          isActive
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300",
        )}
      >
        <item.icon className="h-5 w-5" />
      </Link>
      <div className={getTooltipClasses(false, true)}>{item.name}</div>
    </div>
  )
}
