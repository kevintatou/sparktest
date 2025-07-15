// components/sidebar/create-option.tsx
import { cn } from "@/lib/utils"
import type { CreateOption } from "@sparktest/core/constants/navigation"
import Link from "next/link"

interface Props {
  option: CreateOption
  onClose: () => void
}

export function CreateOptionComponent({ option, onClose }: Props) {
  return (
    <div className="group relative">
      <Link
        href={option.href}
        onClick={onClose}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-muted-foreground"
        )}
        aria-label={option.name}
      >
        <option.icon className="h-5 w-5" />
      </Link>

      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {option.name}
      </div>
    </div>
  )
}
