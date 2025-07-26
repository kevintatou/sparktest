import type { Definition } from "@tatou/core/types"

export function prepareRunOptions(formData: {
  name: string
  image: string
  commands: string[]
  useCustomSettings: boolean
}) {
  return formData.useCustomSettings
    ? {
        name: formData.name,
        image: formData.image,
        commands: formData.commands.filter(Boolean),
      }
    : { name: formData.name }
}

export function validateRunData(formData: {
  name: string
  commands: string[]
  useCustomSettings: boolean
}) {
  const errors: string[] = []

  if (!formData.name.trim()) {
    errors.push("Run name is required")
  }

  if (formData.useCustomSettings && !formData.commands.some((cmd) => cmd.trim())) {
    errors.push("At least one command is required when using custom settings")
  }

  return errors
}

export function getDefaultFormData(definition: Definition) {
  return {
    name: `${definition.name} Run`,
    image: definition.image,
    commands: [...definition.commands],
    useCustomSettings: false,
  }
}
