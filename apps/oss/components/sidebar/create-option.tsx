// components/sidebar/create-option.tsx
import { cn } from "@/lib/utils"
import type { CreateOption } from "@/lib/navigation"
import Link from "next/link"

interface Props {
  option: CreateOption
  onClose: () => void
  isMobile?: boolean
  isMobileMenuOpen?: boolean
}

export function CreateOptionComponent({ option, onClose, isMobile, isMobileMenuOpen }: Props) {
  return (
    <div className="group relative">
      <Link
        href={option.href}
        onClick={onClose}
        className={cn(
          "flex items-center rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-muted-foreground transition-colors",
          isMobile && isMobileMenuOpen
            ? "w-full h-10 px-3 gap-3 justify-start"
            : "justify-center w-10 h-10"
        )}
        aria-label={option.name}
      >
        <option.icon className="h-5 w-5 flex-shrink-0" />
        {isMobile && isMobileMenuOpen && <span className="font-medium">{option.name}</span>}
      </Link>

      {/* Tooltip - only show on desktop */}
      {!isMobile && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {option.name}
        </div>
      )}
    </div>
  )
}
