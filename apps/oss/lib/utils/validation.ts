// Validation utilities for SparkTest frontend

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: any;
  error?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface MultiFieldValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Sanitize and validate names
export function sanitizeName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: 'Name cannot be empty'
    };
  }

  const trimmed = name.trim();
  
  // Check length
  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: `Name too long: ${trimmed.length} characters (max 255)`
    };
  }

  // Check for invalid characters (only alphanumeric, spaces, hyphens, underscores, periods)
  const validPattern = /^[a-zA-Z0-9\s\-_.]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name contains invalid characters. Only alphanumeric characters, spaces, hyphens, underscores, and periods are allowed'
    };
  }

  return {
    isValid: true,
    sanitizedValue: trimmed
  };
}

// Sanitize and validate descriptions
export function sanitizeDescription(description: string): ValidationResult {
  const trimmed = description?.trim() || '';
  
  // Check length
  if (trimmed.length > 1000) {
    return {
      isValid: false,
      error: `Description too long: ${trimmed.length} characters (max 1000)`
    };
  }

  // HTML escape the description to prevent XSS
  const escaped = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&amp;lt;')
    .replace(/>/g, '&amp;gt;')
    .replace(/"/g, '&amp;quot;')
    .replace(/'/g, '&amp;#x27;');

  return {
    isValid: true,
    sanitizedValue: escaped
  };
}

// Validate Docker image names
export function validateDockerImage(image: string): ValidationResult {
  if (!image || !image.trim()) {
    return {
      isValid: false,
      error: 'Docker image cannot be empty'
    };
  }

  const trimmed = image.trim();

  // Check for dangerous characters that could be used for command injection
  const dangerousPatterns = [
    /[;&|`$()@]/,  // Shell metacharacters and @ symbol
    /\.\./,       // Path traversal
    /^[\/\.]/,    // Absolute or relative paths
    /\s/          // Whitespace
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Docker image contains potentially dangerous characters'
      };
    }
  }

  return {
    isValid: true,
    sanitizedValue: trimmed
  };
}

// Sanitize and validate commands
export function sanitizeCommands(commands: string[]): ValidationResult {
  if (!commands || commands.length === 0) {
    return {
      isValid: false,
      error: 'Commands cannot be empty'
    };
  }

  // Filter out empty commands
  const nonEmptyCommands = commands.filter(cmd => cmd && cmd.trim());

  if (nonEmptyCommands.length === 0) {
    return {
      isValid: false,
      error: 'Commands cannot be empty'
    };
  }

  // Dangerous patterns to look for
  const dangerousPatterns = [
    { pattern: /rm\s+-rf/, msg: 'rm -rf' },
    { pattern: /\$\(/, msg: '$(' },
    { pattern: /`/, msg: '`' },
    { pattern: /;/, msg: ';' },
    { pattern: /\|\|/, msg: '||' },
    { pattern: /&&/, msg: '&&' },
    { pattern: /\|(?!\s*$)/, msg: '|' },
    { pattern: />/, msg: '>' },
    { pattern: /</, msg: '<' },
    { pattern: /curl.*\|/, msg: 'curl piped' },
    { pattern: /wget.*\|/, msg: 'wget piped' },
    { pattern: /nc\s+-l/, msg: 'netcat listener' },
    { pattern: /\/etc\/passwd/, msg: '/etc/passwd' },
    { pattern: /\/etc\/shadow/, msg: '/etc/shadow' },
    { pattern: /~\/\.ssh/, msg: 'SSH directory access' },
    { pattern: /\/\.ssh/, msg: 'SSH directory access' },
    { pattern: /id_rsa/, msg: 'SSH key access' },
    { pattern: /password/, msg: 'password' },
    { pattern: /\.key/, msg: 'key file access' },
    { pattern: /tar.*--absolute-names/, msg: 'tar with absolute paths' },
    { pattern: /rsync.*--delete/, msg: 'rsync with delete' },
    { pattern: /chmod\s+-R/, msg: 'chmod -R' },
    { pattern: /chown\s+-R/, msg: 'chown -R' },
    { pattern: /dd\s+if=/, msg: 'dd command' },
    { pattern: /mount/, msg: 'mount' },
    { pattern: /umount/, msg: 'umount' },
    { pattern: /systemctl/, msg: 'systemctl' },
    { pattern: /service/, msg: 'service' },
    { pattern: /iptables/, msg: 'iptables' },
    { pattern: /sudo/, msg: 'sudo' },
    { pattern: /su\s/, msg: 'su' },
    { pattern: /passwd/, msg: 'passwd' },
    { pattern: /usermod/, msg: 'usermod' },
    { pattern: /crontab/, msg: 'crontab' },
    { pattern: /pkill/, msg: 'pkill' },
    { pattern: /killall/, msg: 'killall' }
  ];

  for (const command of nonEmptyCommands) {
    // Check length
    if (command.length > 1000) {
      return {
        isValid: false,
        error: `Command too long: ${command.length} characters (max 1000)`
      };
    }

    // Check for dangerous patterns
    for (const { pattern, msg } of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          isValid: false,
          error: `Command contains potentially dangerous pattern: ${msg}`
        };
      }
    }
  }

  return {
    isValid: true,
    sanitizedValue: nonEmptyCommands
  };
}

// Sanitize and validate labels
export function sanitizeLabels(labels: string[]): ValidationResult {
  if (!labels || labels.length === 0) {
    return {
      isValid: true,
      sanitizedValue: []
    };
  }

  const processedLabels: string[] = [];
  const seen = new Set<string>();

  for (const label of labels) {
    if (!label || !label.trim()) {
      continue;
    }

    const trimmed = label.trim().toLowerCase();

    // Check length
    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: `Label too long: ${trimmed.length} characters (max 100)`
      };
    }

    // Check for invalid characters (only alphanumeric, hyphens, underscores, periods)
    const validPattern = /^[a-zA-Z0-9\-_.]+$/;
    if (!validPattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Label contains invalid characters. Only alphanumeric characters, hyphens, underscores, and periods are allowed'
      };
    }

    // Deduplicate
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      processedLabels.push(trimmed);
    }
  }

  return {
    isValid: true,
    sanitizedValue: processedLabels
  };
}

// Validate execution mode
export function validateExecutionMode(mode: string): ValidationResult {
  if (!mode || !mode.trim()) {
    return {
      isValid: false,
      error: "Execution mode must be 'sequential' or 'parallel'"
    };
  }

  const normalized = mode.trim().toLowerCase();
  
  if (normalized !== 'sequential' && normalized !== 'parallel') {
    return {
      isValid: false,
      error: "Execution mode must be 'sequential' or 'parallel'"
    };
  }

  return {
    isValid: true,
    sanitizedValue: normalized
  };
}

// Validate test definition
export function validateTestDefinition(data: any): MultiFieldValidationResult {
  const errors: ValidationErrors = {};

  // Validate name
  const nameResult = sanitizeName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }

  // Validate description (optional)
  if (data.description) {
    const descResult = sanitizeDescription(data.description);
    if (!descResult.isValid) {
      errors.description = descResult.error!;
    }
  }

  // Validate image
  const imageResult = validateDockerImage(data.image);
  if (!imageResult.isValid) {
    errors.image = imageResult.error!;
  }

  // Validate commands
  const commandsResult = sanitizeCommands(data.commands);
  if (!commandsResult.isValid) {
    errors.commands = commandsResult.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate test executor
export function validateTestExecutor(data: any): MultiFieldValidationResult {
  const errors: ValidationErrors = {};

  // Validate name
  const nameResult = sanitizeName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }

  // Validate description (optional)
  if (data.description) {
    const descResult = sanitizeDescription(data.description);
    if (!descResult.isValid) {
      errors.description = descResult.error!;
    }
  }

  // Validate image
  const imageResult = validateDockerImage(data.image);
  if (!imageResult.isValid) {
    errors.image = imageResult.error!;
  }

  // Validate default_command
  if (data.default_command) {
    const commandResult = sanitizeCommands([data.default_command]);
    if (!commandResult.isValid) {
      errors.default_command = commandResult.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate test suite
export function validateSuite(data: any): MultiFieldValidationResult {
  const errors: ValidationErrors = {};

  // Validate name
  const nameResult = sanitizeName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }

  // Validate description (optional)
  if (data.description) {
    const descResult = sanitizeDescription(data.description);
    if (!descResult.isValid) {
      errors.description = descResult.error!;
    }
  }

  // Validate execution_mode
  if (data.execution_mode) {
    const modeResult = validateExecutionMode(data.execution_mode);
    if (!modeResult.isValid) {
      errors.execution_mode = modeResult.error!;
    }
  }

  // Validate labels
  if (data.labels) {
    const labelsResult = sanitizeLabels(data.labels);
    if (!labelsResult.isValid) {
      errors.labels = labelsResult.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}