export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href
  }
  return pathname.startsWith(href)
}

export function getTooltipClasses(isVisible: boolean, hasHover = true): string {
  const baseClasses =
    "absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap pointer-events-none hidden sm:block z-50 transition-opacity duration-200"

  if (isVisible) {
    return `${baseClasses} opacity-100`
  }

  return hasHover ? `${baseClasses} opacity-0 group-hover:opacity-100` : `${baseClasses} opacity-0`
}