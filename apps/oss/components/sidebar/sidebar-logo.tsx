import Link from "next/link"
import { getTooltipClasses } from "@/lib/utils/navigation"
import { SIDEBAR_CONFIG } from "@/lib/constants/navigation"

export function SidebarLogo() {
  return (
    <div className="flex h-16 items-center justify-center border-b border-slate-200 dark:border-slate-700">
      <div className="group relative">
        <Link href="/" className="flex items-center justify-center">
          <div
            className={`h-${SIDEBAR_CONFIG.logoSize} w-${SIDEBAR_CONFIG.logoSize} rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors`}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
        </Link>
        <div className={getTooltipClasses(false, true)}>SparkTest</div>
      </div>
    </div>
  )
}
