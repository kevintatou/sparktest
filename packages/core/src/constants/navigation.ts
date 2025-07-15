import { Home, Play, FileText, Layers, Cpu, PlayCircle, FileTextIcon, LayersIcon, CpuIcon } from "lucide-react"
import { NavigationItem, CreateOption } from "../types/navigation"

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Test Runs", href: "/runs", icon: Play },
  { name: "Definitions", href: "/definitions", icon: FileText },
  { name: "Suites", href: "/suites", icon: Layers },
  { name: "Executors", href: "/executors", icon: Cpu },
] as const

export const CREATE_OPTIONS: readonly CreateOption[] = [
  { name: "New Test Run", href: "/new", icon: PlayCircle },
  { name: "New Definition", href: "/definitions/new", icon: FileTextIcon },
  { name: "New Suite", href: "/suites/new", icon: LayersIcon },
  { name: "New Executor", href: "/executors/new", icon: CpuIcon },
] as const
