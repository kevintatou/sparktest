"use client"

import Link from "next/link"
import { getTooltipClasses } from "@/lib/utils/navigation"
import type { CreateOption } from "@/lib/types/navigation"

interface CreateOptionProps {
  option: CreateOption
  onClose: () => void
}

export function CreateOptionComponent({ option, onClose }: CreateOptionProps) {
  return (
    <div className="group relative">
      <Link
        href={option.href}
        className="flex items-center justify-center w-10 h-10 rounded-md text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors"
        onClick={onClose}
      >
        <option.icon className="h-4 w-4" />
      </Link>
      <div className={getTooltipClasses(false, true)}>{option.name}</div>
    </div>
  )
}
