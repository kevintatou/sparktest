use backend::validation::{validate_name, validate_image, validate_command};

#[test]
fn test_validate_name() {
    assert!(validate_name("abc"));
    assert!(validate_name("abc-123_ABC"));
    assert!(validate_name("a"));
    assert!(validate_name(&"a".repeat(64)));
    assert!(!validate_name(""));
    assert!(!validate_name("abc!@#"));
    assert!(!validate_name(&"a".repeat(65)));
    assert!(!validate_name("name with spaces"));
}

#[test]
fn test_validate_image() {
    assert!(validate_image("ubuntu:latest"));
    assert!(validate_image("myrepo/myimage:v1.2.3"));
    assert!(validate_image("nginx"));
    assert!(validate_image("repo/image"));
    assert!(validate_image("repo/image:tag"));
    assert!(!validate_image(""));
    assert!(!validate_image("invalid image name"));
    assert!(!validate_image("image:tag:extra"));
    assert!(!validate_image("image@sha256:bad"));
}

#[test]
fn test_validate_command() {
    assert!(validate_command(&vec!["echo hello".to_string()]));
    assert!(validate_command(&vec!["ls -la".to_string()]));
    assert!(validate_command(&vec!["run".to_string(), "test".to_string()]));
    assert!(!validate_command(&vec!["rm -rf /; echo hacked".to_string()]));
    assert!(!validate_command(&vec!["echo foo && shutdown".to_string()]));
    assert!(!validate_command(&vec!["cat /etc/passwd | grep root".to_string()]));
    assert!(!validate_command(&vec!["bad`command`".to_string()]));
    assert!(!validate_command(&vec!["echo $()".to_string()]));
    assert!(!validate_command(&vec!["ls > out.txt".to_string()]));
    assert!(!validate_command(&vec!["ls < in.txt".to_string()]));
    assert!(!validate_command(&vec!["echo \"quoted\"".to_string()]));
    assert!(!validate_command(&vec!["echo 'single'".to_string()]));
    assert!(!validate_command(&vec!["echo \\backslash".to_string()]));
}
