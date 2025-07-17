use regex::Regex;
use std::collections::HashSet;

/// Maximum length for names and descriptions
const MAX_NAME_LENGTH: usize = 255;
const MAX_DESCRIPTION_LENGTH: usize = 1000;
const MAX_COMMAND_LENGTH: usize = 1000;
const MAX_IMAGE_LENGTH: usize = 255;

/// Sanitize and validate a name field
pub fn sanitize_name(name: &str) -> Result<String, String> {
    if name.is_empty() {
        return Err("Name cannot be empty".to_string());
    }
    
    if name.len() > MAX_NAME_LENGTH {
        return Err(format!("Name too long: {} characters (max {})", name.len(), MAX_NAME_LENGTH));
    }
    
    // Allow alphanumeric, spaces, hyphens, underscores, and periods
    let allowed_chars_regex = Regex::new(r"^[a-zA-Z0-9\s._-]+$").unwrap();
    if !allowed_chars_regex.is_match(name) {
        return Err("Name contains invalid characters. Only alphanumeric characters, spaces, hyphens, underscores, and periods are allowed".to_string());
    }
    
    // Trim and normalize whitespace
    let sanitized = name.trim().to_string();
    
    // Prevent names that are just whitespace
    if sanitized.is_empty() {
        return Err("Name cannot be empty after trimming".to_string());
    }
    
    Ok(sanitized)
}

/// Sanitize and validate a description field
pub fn sanitize_description(description: &str) -> Result<String, String> {
    if description.len() > MAX_DESCRIPTION_LENGTH {
        return Err(format!("Description too long: {} characters (max {})", description.len(), MAX_DESCRIPTION_LENGTH));
    }
    
    // Remove potential HTML/XML tags and harmful characters
    let sanitized = description
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
        .replace('/', "&#x2F;");
    
    Ok(sanitized.trim().to_string())
}

/// Validate Docker image name format
pub fn validate_docker_image(image: &str) -> Result<String, String> {
    if image.is_empty() {
        return Err("Docker image cannot be empty".to_string());
    }
    
    if image.len() > MAX_IMAGE_LENGTH {
        return Err(format!("Docker image name too long: {} characters (max {})", image.len(), MAX_IMAGE_LENGTH));
    }
    
    // Docker image name regex: [registry/]namespace/repository[:tag]
    // This is a simplified version - real docker image validation is complex
    let image_regex = Regex::new(r"^[a-zA-Z0-9._-]+(?:/[a-zA-Z0-9._-]+)*(?::[a-zA-Z0-9._-]+)?$").unwrap();
    if !image_regex.is_match(image) {
        return Err("Invalid Docker image format. Must be in format: [registry/]namespace/repository[:tag]".to_string());
    }
    
    // Prevent some obviously malicious patterns
    let dangerous_patterns = ["../", "..\\", "$(", "`", ";", "&", "|", "&&", "||"];
    for pattern in &dangerous_patterns {
        if image.contains(pattern) {
            return Err("Docker image contains potentially dangerous characters".to_string());
        }
    }
    
    Ok(image.trim().to_string())
}

/// Sanitize and validate command array
pub fn sanitize_commands(commands: &[String]) -> Result<Vec<String>, String> {
    if commands.is_empty() {
        return Err("Commands cannot be empty".to_string());
    }
    
    if commands.len() > 100 {
        return Err("Too many commands (max 100)".to_string());
    }
    
    let mut sanitized_commands = Vec::new();
    
    for command in commands {
        if command.len() > MAX_COMMAND_LENGTH {
            return Err(format!("Command too long: {} characters (max {})", command.len(), MAX_COMMAND_LENGTH));
        }
        
        // Trim whitespace
        let trimmed = command.trim();
        if trimmed.is_empty() {
            continue; // Skip empty commands
        }
        
        // Check for dangerous shell patterns
        let dangerous_patterns = [
            "$(", "`", ";", "&", "|", "&&", "||", ">", "<", ">>", "<<",
            "rm -rf", "dd if=", ":(){ :|:& };:", "chmod -R", "chown -R"
        ];
        
        for pattern in &dangerous_patterns {
            if trimmed.contains(pattern) {
                return Err(format!("Command contains potentially dangerous pattern: {}", pattern));
            }
        }
        
        sanitized_commands.push(trimmed.to_string());
    }
    
    if sanitized_commands.is_empty() {
        return Err("No valid commands found after sanitization".to_string());
    }
    
    Ok(sanitized_commands)
}

/// Validate and sanitize labels
pub fn sanitize_labels(labels: &[String]) -> Result<Vec<String>, String> {
    if labels.len() > 50 {
        return Err("Too many labels (max 50)".to_string());
    }
    
    let mut sanitized_labels = Vec::new();
    let mut seen_labels = HashSet::new();
    
    for label in labels {
        if label.len() > 100 {
            return Err(format!("Label too long: {} characters (max 100)", label.len()));
        }
        
        // Allow alphanumeric, hyphens, underscores, and periods
        let label_regex = Regex::new(r"^[a-zA-Z0-9._-]+$").unwrap();
        if !label_regex.is_match(label) {
            return Err("Label contains invalid characters. Only alphanumeric characters, hyphens, underscores, and periods are allowed".to_string());
        }
        
        let trimmed = label.trim().to_lowercase();
        if trimmed.is_empty() {
            continue; // Skip empty labels
        }
        
        // Prevent duplicates
        if seen_labels.contains(&trimmed) {
            continue;
        }
        
        seen_labels.insert(trimmed.clone());
        sanitized_labels.push(trimmed);
    }
    
    Ok(sanitized_labels)
}

/// Validate execution mode for test suites
pub fn validate_execution_mode(mode: &str) -> Result<String, String> {
    match mode.to_lowercase().as_str() {
        "sequential" | "parallel" => Ok(mode.to_lowercase()),
        _ => Err("Execution mode must be 'sequential' or 'parallel'".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_name_valid() {
        assert_eq!(sanitize_name("Valid Name").unwrap(), "Valid Name");
        assert_eq!(sanitize_name("test-name_123").unwrap(), "test-name_123");
        assert_eq!(sanitize_name("  spaced  ").unwrap(), "spaced");
    }

    #[test]
    fn test_sanitize_name_invalid() {
        assert!(sanitize_name("").is_err());
        assert!(sanitize_name("   ").is_err());
        assert!(sanitize_name("name@with$pecial").is_err());
        assert!(sanitize_name(&"a".repeat(300)).is_err());
    }

    #[test]
    fn test_sanitize_description_valid() {
        assert_eq!(sanitize_description("Valid description").unwrap(), "Valid description");
        assert_eq!(sanitize_description("").unwrap(), "");
    }

    #[test]
    fn test_sanitize_description_escapes_html() {
        let desc = "<script>alert('xss')</script>";
        let result = sanitize_description(desc).unwrap();
        assert!(!result.contains("<script>"));
        assert!(result.contains("&amp;lt;script&amp;gt;"));
    }

    #[test]
    fn test_validate_docker_image_valid() {
        assert_eq!(validate_docker_image("nginx:latest").unwrap(), "nginx:latest");
        assert_eq!(validate_docker_image("registry.com/user/repo:tag").unwrap(), "registry.com/user/repo:tag");
        assert_eq!(validate_docker_image("ubuntu").unwrap(), "ubuntu");
    }

    #[test]
    fn test_validate_docker_image_invalid() {
        assert!(validate_docker_image("").is_err());
        assert!(validate_docker_image("image$(whoami)").is_err());
        assert!(validate_docker_image("image;rm -rf /").is_err());
        assert!(validate_docker_image("../malicious").is_err());
    }

    #[test]
    fn test_sanitize_commands_valid() {
        let commands = vec!["echo".to_string(), "hello".to_string()];
        let result = sanitize_commands(&commands).unwrap();
        assert_eq!(result, vec!["echo", "hello"]);
    }

    #[test]
    fn test_sanitize_commands_invalid() {
        assert!(sanitize_commands(&[]).is_err());
        assert!(sanitize_commands(&["rm -rf /".to_string()]).is_err());
        assert!(sanitize_commands(&["echo $(whoami)".to_string()]).is_err());
        assert!(sanitize_commands(&["cmd;malicious".to_string()]).is_err());
    }

    #[test]
    fn test_sanitize_labels_valid() {
        let labels = vec!["test".to_string(), "production".to_string()];
        let result = sanitize_labels(&labels).unwrap();
        assert_eq!(result, vec!["test", "production"]);
    }

    #[test]
    fn test_sanitize_labels_removes_duplicates() {
        let labels = vec!["test".to_string(), "TEST".to_string(), "test".to_string()];
        let result = sanitize_labels(&labels).unwrap();
        assert_eq!(result, vec!["test"]);
    }

    #[test]
    fn test_validate_execution_mode() {
        assert_eq!(validate_execution_mode("sequential").unwrap(), "sequential");
        assert_eq!(validate_execution_mode("PARALLEL").unwrap(), "parallel");
        assert!(validate_execution_mode("invalid").is_err());
    }
}