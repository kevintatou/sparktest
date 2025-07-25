export function validateFormData(formData: { name: string; image: string; commands: string[] }) {
  const errors: string[] = []
  
  if (!formData.name.trim()) {
    errors.push("Test name is required")
  }
  
  if (!formData.image.trim()) {
    errors.push("Container image is required")
  }
  
  if (!formData.commands.some(cmd => cmd.trim())) {
    errors.push("At least one command is required")
  }
  
  return errors
}

export function prepareSubmissionData(formData: any, existingTest?: any) {
  return {
    ...formData,
    commands: formData.commands.filter(Boolean),
    createdAt: existingTest?.createdAt || new Date().toISOString(),
    executorId: formData.executorId === "none" ? undefined : formData.executorId,
  }
}