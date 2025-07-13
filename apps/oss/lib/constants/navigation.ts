import { Home, Play, FileText, Layers, Cpu, PlayCircle, FileTextIcon, LayersIcon, CpuIcon } from "lucide-react"

export const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Test Runs", href: "/runs", icon: Play },
  { name: "Definitions", href: "/definitions", icon: FileText },
  { name: "Suites", href: "/suites", icon: Layers },
  { name: "Executors", href: "/executors", icon: Cpu },
] as const

export const CREATE_OPTIONS = [
  { name: "New Test Run", href: "/new", icon: PlayCircle },
  { name: "New Definition", href: "/definitions/new", icon: FileTextIcon },
  { name: "New Suite", href: "/suites/new", icon: LayersIcon },
  { name: "New Executor", href: "/executors/new", icon: CpuIcon },
] as const

export const SIDEBAR_CONFIG = {
  width: 16,
  logoSize: 8,
  iconSize: 5,
  createIconSize: 4,
  tooltipDelay: 200,
  animationDuration: 200,
} as const
