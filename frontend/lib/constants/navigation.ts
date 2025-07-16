import { Home, Play, FileText, Layers, Cpu, PlayCircle, FileTextIcon, LayersIcon, CpuIcon } from "lucide-react"

export const NAVIGATION_ITEMS = [
  { name: "🐴 Stable", href: "/", icon: Home },
  { name: "🏇 Races", href: "/runs", icon: Play },
  { name: "📋 Breeds", href: "/definitions", icon: FileText },
  { name: "🏆 Competitions", href: "/suites", icon: Layers },
  { name: "🐎 Trainers", href: "/executors", icon: Cpu },
] as const

export const CREATE_OPTIONS = [
  { name: "New Race 🏇", href: "/new", icon: PlayCircle },
  { name: "New Breed 📋", href: "/definitions/new", icon: FileTextIcon },
  { name: "New Competition 🏆", href: "/suites/new", icon: LayersIcon },
  { name: "New Trainer 🐎", href: "/executors/new", icon: CpuIcon },
] as const

export const SIDEBAR_CONFIG = {
  width: 16,
  logoSize: 8,
  iconSize: 5,
  createIconSize: 4,
  tooltipDelay: 200,
  animationDuration: 200,
} as const
