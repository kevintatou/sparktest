/**
 * Frontend validation utilities for sanitizing user inputs
 */

// Maximum length constraints
const MAX_NAME_LENGTH = 255
const MAX_DESCRIPTION_LENGTH = 1000
const MAX_COMMAND_LENGTH = 1000
const MAX_IMAGE_LENGTH = 255

export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitizedValue?: string
}

export interface ValidationArrayResult {
  isValid: boolean
  error?: string
  sanitizedValue?: string[]
}

/**
 * Sanitize and validate a name field
 */
export function sanitizeName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Name cannot be empty" }
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Name too long: ${name.length} characters (max ${MAX_NAME_LENGTH})`,
    }
  }

  // Allow alphanumeric, spaces, hyphens, underscores, and periods
  const allowedCharsRegex = /^[a-zA-Z0-9\s._-]+$/
  if (!allowedCharsRegex.test(name)) {
    return {
      isValid: false,
      error:
        "Name contains invalid characters. Only alphanumeric characters, spaces, hyphens, underscores, and periods are allowed",
    }
  }

  // Trim and normalize whitespace
  const sanitized = name.trim()

  return { isValid: true, sanitizedValue: sanitized }
}

/**
 * Sanitize and validate a description field
 */
export function sanitizeDescription(description: string): ValidationResult {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      isValid: false,
      error: `Description too long: ${description.length} characters (max ${MAX_DESCRIPTION_LENGTH})`,
    }
  }

  // Remove potential HTML/XML tags and harmful characters
  const sanitized = description
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")

  return { isValid: true, sanitizedValue: sanitized.trim() }
}

/**
 * Validate Docker image name format
 */
export function validateDockerImage(image: string): ValidationResult {
  if (!image || image.trim().length === 0) {
    return { isValid: false, error: "Docker image cannot be empty" }
  }

  if (image.length > MAX_IMAGE_LENGTH) {
    return {
      isValid: false,
      error: `Docker image name too long: ${image.length} characters (max ${MAX_IMAGE_LENGTH})`,
    }
  }

  // Prevent some obviously malicious patterns first
  const dangerousPatterns = ["../", "..\\", "$(", "`", ";", "&", "|", "&&", "||"]
  for (const pattern of dangerousPatterns) {
    if (image.includes(pattern)) {
      return {
        isValid: false,
        error: "Docker image contains potentially dangerous characters",
      }
    }
  }

  // Docker image name validation - simplified but secure
  // Allow alphanumeric, dots, hyphens, underscores, slashes, and colons
  const imageRegex = /^[a-zA-Z0-9._/-]+(?::[a-zA-Z0-9._-]+)?$/
  if (!imageRegex.test(image)) {
    return {
      isValid: false,
      error:
        "Invalid Docker image format. Must be in format: [registry/]namespace/repository[:tag]",
    }
  }

  return { isValid: true, sanitizedValue: image.trim() }
}

/**
 * Sanitize and validate command array
 */
export function sanitizeCommands(commands: string[]): ValidationArrayResult {
  if (!commands || commands.length === 0) {
    return { isValid: false, error: "Commands cannot be empty" }
  }

  if (commands.length > 100) {
    return { isValid: false, error: "Too many commands (max 100)" }
  }

  const sanitizedCommands: string[] = []

  for (const command of commands) {
    if (command.length > MAX_COMMAND_LENGTH) {
      return {
        isValid: false,
        error: `Command too long: ${command.length} characters (max ${MAX_COMMAND_LENGTH})`,
      }
    }

    // Trim whitespace
    const trimmed = command.trim()
    if (trimmed.length === 0) {
      continue // Skip empty commands
    }

    // Check for dangerous shell patterns
    const dangerousPatterns = [
      "$(",
      "`",
      ";",
      "&",
      "|",
      "&&",
      "||",
      ">",
      "<",
      ">>",
      "<<",
      "rm -rf",
      "dd if=",
      ":(){ :|:& };:",
      "chmod -R",
      "chown -R",
      "cat /etc/",
      "cat ~/",
      "cat ~/.ssh/",
      "grep -r",
      "find /",
      "history",
      "passwd",
      "sudo",
      "su ",
      "su -",
      "crontab",
      "systemctl",
      "service ",
      "pkill",
      "killall",
      "mount",
      "umount",
      "iptables",
      "usermod",
      "useradd",
      "userdel",
      "/etc/passwd",
      "/etc/shadow",
      "/etc/hosts",
      "/dev/",
      "/proc/",
      "/sys/",
      "~/.ssh/",
      "~/.bash_history",
      "curl ",
      "wget ",
      "nc ",
      "netcat ",
      "telnet ",
      "ssh ",
      "scp ",
      "rsync ",
      "tar ",
      "zip ",
      "unzip ",
      "gzip ",
      "gunzip ",
      "python -c",
      "node -e",
      "ruby -e",
      "php -e",
      "perl -e",
      "bash -c",
      "sh -c",
      "eval ",
      "exec ",
      "system(",
      "os.system",
      "child_process",
      "require(",
      "import os",
    ]

    for (const pattern of dangerousPatterns) {
      if (trimmed.includes(pattern)) {
        return {
          isValid: false,
          error: `Command contains potentially dangerous pattern: ${pattern}`,
        }
      }
    }

    sanitizedCommands.push(trimmed)
  }

  if (sanitizedCommands.length === 0) {
    return { isValid: false, error: "No valid commands found after sanitization" }
  }

  return { isValid: true, sanitizedValue: sanitizedCommands }
}

/**
 * Validate and sanitize labels
 */
export function sanitizeLabels(labels: string[]): ValidationArrayResult {
  if (labels.length > 50) {
    return { isValid: false, error: "Too many labels (max 50)" }
  }

  const sanitizedLabels: string[] = []
  const seenLabels = new Set<string>()

  for (const label of labels) {
    if (label.length > 100) {
      return {
        isValid: false,
        error: `Label too long: ${label.length} characters (max 100)`,
      }
    }

    // Allow alphanumeric, hyphens, underscores, and periods
    const labelRegex = /^[a-zA-Z0-9._-]+$/
    if (!labelRegex.test(label)) {
      return {
        isValid: false,
        error:
          "Label contains invalid characters. Only alphanumeric characters, hyphens, underscores, and periods are allowed",
      }
    }

    const trimmed = label.trim().toLowerCase()
    if (trimmed.length === 0) {
      continue // Skip empty labels
    }

    // Prevent duplicates
    if (seenLabels.has(trimmed)) {
      continue
    }

    seenLabels.add(trimmed)
    sanitizedLabels.push(trimmed)
  }

  return { isValid: true, sanitizedValue: sanitizedLabels }
}

/**
 * Validate execution mode for test suites
 */
export function validateExecutionMode(mode: string): ValidationResult {
  const normalizedMode = mode.toLowerCase()
  if (normalizedMode === "sequential" || normalizedMode === "parallel") {
    return { isValid: true, sanitizedValue: normalizedMode }
  }
  return {
    isValid: false,
    error: "Execution mode must be 'sequential' or 'parallel'",
  }
}

/**
 * Validate form data for test definition
 */
export function validateTestDefinition(data: {
  name: string
  description?: string
  image: string
  commands: string[]
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const nameResult = sanitizeName(data.name)
  if (!nameResult.isValid) {
    errors.name = nameResult.error!
  }

  if (data.description) {
    const descResult = sanitizeDescription(data.description)
    if (!descResult.isValid) {
      errors.description = descResult.error!
    }
  }

  const imageResult = validateDockerImage(data.image)
  if (!imageResult.isValid) {
    errors.image = imageResult.error!
  }

  const commandsResult = sanitizeCommands(data.commands)
  if (!commandsResult.isValid) {
    errors.commands = commandsResult.error!
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

/**
 * Validate form data for test executor
 */
export function validateTestExecutor(data: {
  name: string
  description?: string
  image: string
  default_command: string
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const nameResult = sanitizeName(data.name)
  if (!nameResult.isValid) {
    errors.name = nameResult.error!
  }

  if (data.description) {
    const descResult = sanitizeDescription(data.description)
    if (!descResult.isValid) {
      errors.description = descResult.error!
    }
  }

  const imageResult = validateDockerImage(data.image)
  if (!imageResult.isValid) {
    errors.image = imageResult.error!
  }

  const commandsResult = sanitizeCommands([data.default_command])
  if (!commandsResult.isValid) {
    errors.default_command = commandsResult.error!
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

/**
 * Validate form data for test suite
 */
export function validateSuite(data: {
  name: string
  description?: string
  execution_mode: string
  labels: string[]
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const nameResult = sanitizeName(data.name)
  if (!nameResult.isValid) {
    errors.name = nameResult.error!
  }

  if (data.description) {
    const descResult = sanitizeDescription(data.description)
    if (!descResult.isValid) {
      errors.description = descResult.error!
    }
  }

  const executionModeResult = validateExecutionMode(data.execution_mode)
  if (!executionModeResult.isValid) {
    errors.execution_mode = executionModeResult.error!
  }

  const labelsResult = sanitizeLabels(data.labels)
  if (!labelsResult.isValid) {
    errors.labels = labelsResult.error!
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}
