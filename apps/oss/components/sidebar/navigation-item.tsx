// components/sidebar/navigation-item.tsx
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { NavigationItem } from "@sparktest/core/constants/navigation"

interface Props {
  item: NavigationItem
  isActive: boolean
}

export function NavigationItemComponent({ item, isActive }: Props) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md transition-colors",
          isActive
            ? "bg-blue-700 text-white"
            : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        <item.icon className="h-5 w-5" />
      </Link>

      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {item.name}
      </div>
    </div>
  )
}
