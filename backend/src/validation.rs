use regex::Regex;

pub fn validate_name(name: &str) -> bool {
    let re = Regex::new(r"^[a-zA-Z0-9_-]{1,64}$").unwrap();
    re.is_match(name)
}

pub fn validate_image(image: &str) -> bool {
    // Docker image regex (simplified)
    let re = Regex::new(r"^([a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*)(/[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*)*(:[a-zA-Z0-9._-]+)?(@[A-Za-z0-9]+)?$").unwrap();
    re.is_match(image)
}

pub fn validate_command(commands: &[String]) -> bool {
    let forbidden = [";", "&&", "|", "`", "$()", ">", "<", "\"", "'", "\\"];
    for cmd in commands {
        for bad in &forbidden {
            if cmd.contains(bad) {
                return false;
            }
        }
    }
    true
}
