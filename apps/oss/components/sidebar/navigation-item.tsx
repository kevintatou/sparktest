// components/sidebar/navigation-item.tsx
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { NavigationItem } from "@tatou/core/constants/navigation"

interface Props {
  item: NavigationItem
  isActive: boolean
  isMobile?: boolean
  isMobileMenuOpen?: boolean
  onMobileNavigate?: () => void
}

export function NavigationItemComponent({ item, isActive, isMobile, isMobileMenuOpen, onMobileNavigate }: Props) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        onClick={isMobile ? onMobileNavigate : undefined}
        className={cn(
          "flex items-center transition-colors rounded-md",
          isMobile && isMobileMenuOpen 
            ? "w-full h-10 px-3 gap-3 justify-start" 
            : "justify-center w-10 h-10",
          isActive
            ? "bg-blue-700 text-white"
            : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {isMobile && isMobileMenuOpen && <span className="font-medium">{item.name}</span>}
      </Link>

      {/* Tooltip - only show on desktop */}
      {!isMobile && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {item.name}
        </div>
      )}
    </div>
  )
}
