import type React from "react"
import { Plus, Upload, Download, Settings, Trash2, Edit, Copy, ExternalLink } from "lucide-react"

// Common action configurations for consistent UI patterns
export interface ActionConfig {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  loading?: boolean
  tooltip?: string
}

export interface EntityAction extends ActionConfig {
  key: string
  onClick?: (id: string) => void
  href?: string
  shortcut?: string
}

// Default CRUD actions that can be imported and extended
export const defaultCrudActions: EntityAction[] = [
  {
    key: "edit",
    label: "Edit",
    icon: Edit,
    variant: "ghost",
    size: "sm",
    tooltip: "Edit this item",
  },
  {
    key: "copy",
    label: "Duplicate",
    icon: Copy,
    variant: "ghost",
    size: "sm",
    tooltip: "Duplicate this item",
  },
  {
    key: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "ghost",
    size: "sm",
    tooltip: "Delete this item",
  },
]

// Default create actions for different entity types
export const defaultCreateActions: Record<string, EntityAction> = {
  run: {
    key: "create-run",
    label: "New Run",
    icon: Plus,
    variant: "default",
    tooltip: "Create a new test run",
  },
  definition: {
    key: "create-definition",
    label: "New Definition",
    icon: Plus,
    variant: "default",
    tooltip: "Create a new test definition",
  },
  executor: {
    key: "create-executor",
    label: "New Executor",
    icon: Plus,
    variant: "default",
    tooltip: "Create a new executor",
  },
  suite: {
    key: "create-suite",
    label: "New Suite",
    icon: Plus,
    variant: "default",
    tooltip: "Create a new test suite",
  },
}

// Default bulk actions for list views
export const defaultBulkActions: EntityAction[] = [
  {
    key: "delete-selected",
    label: "Delete Selected",
    icon: Trash2,
    variant: "destructive",
    tooltip: "Delete all selected items",
  },
  {
    key: "export-selected",
    label: "Export",
    icon: Download,
    variant: "outline",
    tooltip: "Export selected items",
  },
]

// Default import/export actions
export const defaultImportExportActions: EntityAction[] = [
  {
    key: "import",
    label: "Import",
    icon: Upload,
    variant: "outline",
    tooltip: "Import from file",
  },
  {
    key: "export",
    label: "Export",
    icon: Download,
    variant: "outline",
    tooltip: "Export to file",
  },
]

// Common toolbar actions
export const defaultToolbarActions: EntityAction[] = [
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    variant: "ghost",
    size: "icon",
    tooltip: "Open settings",
  },
  {
    key: "external",
    label: "Open External",
    icon: ExternalLink,
    variant: "ghost",
    size: "icon",
    tooltip: "Open in new window",
  },
]

// Helper function to get actions by category
export function getActionsByCategory(category: "crud" | "create" | "bulk" | "toolbar" | "import-export"): EntityAction[] {
  switch (category) {
    case "crud":
      return defaultCrudActions
    case "create":
      return Object.values(defaultCreateActions)
    case "bulk":
      return defaultBulkActions
    case "toolbar":
      return defaultToolbarActions
    case "import-export":
      return defaultImportExportActions
    default:
      return []
  }
}

// Helper function to get specific create action
export function getCreateAction(entityType: string): EntityAction | undefined {
  return defaultCreateActions[entityType]
}

// Helper to merge custom actions with defaults
export function mergeActions(defaults: EntityAction[], custom: Partial<EntityAction>[]): EntityAction[] {
  const merged = [...defaults]
  
  custom.forEach((customAction) => {
    const existingIndex = merged.findIndex((action) => action.key === customAction.key)
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...customAction }
    } else if (customAction.key) {
      merged.push(customAction as EntityAction)
    }
  })
  
  return merged
}