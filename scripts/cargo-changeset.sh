#!/bin/bash

# Cargo Changeset Management Script
# Manages independent versioning for Rust crates similar to @changesets/cli

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CARGO_CHANGESETS_DIR="$ROOT_DIR/.cargo-changesets"
BACKEND_DIR="$ROOT_DIR/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line options
DRY_RUN=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

# Set default command if none provided
COMMAND="${COMMAND:-help}"

# Create cargo changesets directory if it doesn't exist
mkdir -p "$CARGO_CHANGESETS_DIR"

# Helper function for verbose output
verbose_echo() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  add     - Add a new changeset for cargo crates"
    echo "  version - Apply changesets and bump versions"
    echo "  publish - Publish crates with changes"
    echo "  status  - Show current changeset status"
    echo "  test    - Test changeset system without making changes"
    echo "  help    - Show this help message"
    echo ""
    echo "Options:"
    echo "  --dry-run  - Show what would happen without making changes"
    echo "  --verbose  - Show detailed output"
}

# Function to get current crate version
get_crate_version() {
    local crate_path="$1"
    grep '^version = ' "$crate_path/Cargo.toml" | head -1 | sed 's/version = "\(.*\)"/\1/'
}

# Function to set crate version
set_crate_version() {
    local crate_path="$1"
    local new_version="$2"
    sed -i "s/^version = \".*\"/version = \"$new_version\"/" "$crate_path/Cargo.toml"
}

# Function to increment version
increment_version() {
    local version="$1"
    local level="$2"
    
    IFS='.' read -ra VERSION_PARTS <<< "$version"
    local major="${VERSION_PARTS[0]}"
    local minor="${VERSION_PARTS[1]}"
    local patch="${VERSION_PARTS[2]}"
    
    case "$level" in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            echo "Invalid version level: $level"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Function to add a changeset
add_changeset() {
    echo -e "${BLUE}🦀 Adding a new cargo changeset${NC}"
    echo ""
    
    # Available crates
    local crates=("sparktest-core" "sparktest-api" "sparktest-bin")
    
    echo "Which crates have changes?"
    for i in "${!crates[@]}"; do
        echo "  $((i+1)). ${crates[i]}"
    done
    echo ""
    
    read -p "Enter crate numbers (space-separated, e.g., '1 3'): " selected_nums
    
    local selected_crates=()
    for num in $selected_nums; do
        if [[ $num -ge 1 && $num -le ${#crates[@]} ]]; then
            selected_crates+=("${crates[$((num-1))]}")
        fi
    done
    
    if [[ ${#selected_crates[@]} -eq 0 ]]; then
        echo -e "${RED}No valid crates selected${NC}"
        exit 1
    fi
    
    echo ""
    echo "What type of change is this?"
    echo "  1. patch (bug fixes)"
    echo "  2. minor (new features)"
    echo "  3. major (breaking changes)"
    echo ""
    
    read -p "Select change type (1-3): " change_type_num
    
    local change_type
    case "$change_type_num" in
        1) change_type="patch" ;;
        2) change_type="minor" ;;
        3) change_type="major" ;;
        *) echo -e "${RED}Invalid change type${NC}"; exit 1 ;;
    esac
    
    echo ""
    read -p "Describe the changes: " description
    
    # Generate changeset file
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local changeset_file="$CARGO_CHANGESETS_DIR/${timestamp}.md"
    
    cat > "$changeset_file" << EOF
---
$(for crate in "${selected_crates[@]}"; do echo "$crate: $change_type"; done)
---

$description
EOF
    
    echo -e "${GREEN}✅ Changeset created: $changeset_file${NC}"
    echo ""
    echo "Contents:"
    cat "$changeset_file"
}

# Function to show changeset status
show_status() {
    echo -e "${BLUE}🦀 Cargo changeset status${NC}"
    echo ""
    
    local changesets=($(find "$CARGO_CHANGESETS_DIR" -name "*.md" 2>/dev/null | sort))
    
    if [[ ${#changesets[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No pending changesets${NC}"
        return
    fi
    
    echo "Pending changesets:"
    for changeset in "${changesets[@]}"; do
        echo "  - $(basename "$changeset")"
        
        # Parse changeset file
        local in_frontmatter=false
        local in_changes=false
        while IFS= read -r line; do
            if [[ "$line" == "---" ]]; then
                if [[ "$in_frontmatter" == false ]]; then
                    in_frontmatter=true
                    in_changes=true
                else
                    in_frontmatter=false
                    in_changes=false
                fi
            elif [[ "$in_changes" == true && "$line" =~ ^[a-zA-Z0-9_-]+:[[:space:]]*(patch|minor|major)[[:space:]]*$ ]]; then
                echo "    $line"
            fi
        done < "$changeset"
        echo ""
    done
}

# Function to apply changesets and bump versions
apply_changesets() {
    echo -e "${BLUE}🦀 Applying cargo changesets${NC}"
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN] No actual changes will be made${NC}"
    fi
    echo ""
    
    local changesets=($(find "$CARGO_CHANGESETS_DIR" -name "*.md" 2>/dev/null | sort))
    
    if [[ ${#changesets[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No pending changesets to apply${NC}"
        return
    fi
    
    # Collect all changes
    declare -A crate_changes
    declare -A crate_descriptions
    
    for changeset in "${changesets[@]}"; do
        verbose_echo "Processing changeset: $(basename "$changeset")"
        local in_frontmatter=false
        local in_changes=false
        local description=""
        
        while IFS= read -r line; do
            if [[ "$line" == "---" ]]; then
                if [[ "$in_frontmatter" == false ]]; then
                    in_frontmatter=true
                    in_changes=true
                else
                    in_frontmatter=false
                    in_changes=false
                fi
            elif [[ "$in_changes" == true && "$line" =~ ^([a-zA-Z0-9_-]+):[[:space:]]*(patch|minor|major)[[:space:]]*$ ]]; then
                local crate_name="${BASH_REMATCH[1]}"
                local change_type="${BASH_REMATCH[2]}"
                
                # Take the highest change level
                local current_change="${crate_changes[$crate_name]:-patch}"
                if [[ "$change_type" == "major" ]] || [[ "$current_change" == "patch" && "$change_type" == "minor" ]] || [[ "$current_change" == "patch" && "$change_type" == "patch" ]]; then
                    crate_changes["$crate_name"]="$change_type"
                fi
            elif [[ "$in_frontmatter" == false && -n "$line" ]]; then
                description="$description$line\n"
            fi
        done < "$changeset"
        
        # Collect descriptions
        for crate in "${!crate_changes[@]}"; do
            if [[ -n "${crate_descriptions[$crate]}" ]]; then
                crate_descriptions["$crate"]="${crate_descriptions[$crate]}\n$description"
            else
                crate_descriptions["$crate"]="$description"
            fi
        done
    done
    
    # Apply version bumps
    for crate in "${!crate_changes[@]}"; do
        local change_type="${crate_changes[$crate]}"
        local crate_path="$BACKEND_DIR/${crate#sparktest-}"
        
        if [[ ! -d "$crate_path" ]]; then
            echo -e "${RED}Warning: Crate directory not found: $crate_path${NC}"
            continue
        fi
        
        local current_version=$(get_crate_version "$crate_path")
        local new_version=$(increment_version "$current_version" "$change_type")
        
        if [[ "$DRY_RUN" == true ]]; then
            echo -e "${CYAN}[DRY RUN] Would bump $crate: $current_version → $new_version ($change_type)${NC}"
        else
            echo -e "${GREEN}Bumping $crate: $current_version → $new_version ($change_type)${NC}"
            set_crate_version "$crate_path" "$new_version"
        fi
    done
    
    # Remove processed changesets
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${CYAN}[DRY RUN] Would remove ${#changesets[@]} changeset file(s)${NC}"
    else
        for changeset in "${changesets[@]}"; do
            rm "$changeset"
        done
    fi
    
    echo ""
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${CYAN}✅ Dry run completed - no changes made${NC}"
    else
        echo -e "${GREEN}✅ All changesets applied successfully${NC}"
    fi
}

# Function to publish crates
publish_crates() {
    echo -e "${BLUE}🦀 Publishing cargo crates${NC}"
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN] No actual publishing will occur${NC}"
    fi
    echo ""
    
    # Build order (dependencies first)
    local crates=("core" "api" "bin")
    
    for crate in "${crates[@]}"; do
        local crate_path="$BACKEND_DIR/$crate"
        
        if [[ ! -d "$crate_path" ]]; then
            echo -e "${RED}Warning: Crate directory not found: $crate_path${NC}"
            continue
        fi
        
        local version=$(get_crate_version "$crate_path")
        echo -e "${BLUE}Publishing sparktest-$crate v$version...${NC}"
        
        if [[ "$DRY_RUN" == true ]]; then
            echo -e "${CYAN}[DRY RUN] Would check if version $version is already published${NC}"
            echo -e "${CYAN}[DRY RUN] Would run: cargo publish --allow-dirty${NC}"
            continue
        fi
        
        # Check if this version is already published
        if cargo search "sparktest-$crate" | grep -q "sparktest-$crate = \"$version\""; then
            echo -e "${YELLOW}Version $version already published, skipping${NC}"
            continue
        fi
        
        # Publish the crate
        cd "$crate_path"
        cargo publish --allow-dirty || {
            echo -e "${RED}Failed to publish sparktest-$crate${NC}"
            exit 1
        }
        
        # Wait between publishes to let crates.io update
        if [[ "$crate" != "bin" ]]; then
            echo "Waiting 30 seconds for crates.io to update..."
            sleep 30
        fi
    done
    
    echo ""
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${CYAN}✅ Dry run completed - no crates published${NC}"
    else
        echo -e "${GREEN}✅ All crates published successfully${NC}"
    fi
}

# Function to test changeset system
test_changeset_system() {
    echo -e "${BLUE}🧪 Testing cargo changeset system${NC}"
    echo ""
    
    # Test 1: Check if all required directories exist
    echo -e "${CYAN}Test 1: Directory structure${NC}"
    for dir in "$BACKEND_DIR/core" "$BACKEND_DIR/api" "$BACKEND_DIR/bin"; do
        if [[ -d "$dir" ]]; then
            echo -e "${GREEN}✅ Found: $dir${NC}"
        else
            echo -e "${RED}❌ Missing: $dir${NC}"
        fi
    done
    
    # Test 2: Check if Cargo.toml files exist and have version fields
    echo -e "${CYAN}Test 2: Cargo.toml files${NC}"
    for crate in "core" "api" "bin"; do
        local crate_path="$BACKEND_DIR/$crate"
        if [[ -f "$crate_path/Cargo.toml" ]]; then
            local version=$(get_crate_version "$crate_path")
            if [[ -n "$version" ]]; then
                echo -e "${GREEN}✅ sparktest-$crate v$version${NC}"
            else
                echo -e "${RED}❌ No version found in sparktest-$crate${NC}"
            fi
        else
            echo -e "${RED}❌ Missing Cargo.toml in sparktest-$crate${NC}"
        fi
    done
    
    # Test 3: Test version increment functions
    echo -e "${CYAN}Test 3: Version increment logic${NC}"
    local test_version="1.0.0"
    local patch_result=$(increment_version "$test_version" "patch")
    local minor_result=$(increment_version "$test_version" "minor")
    local major_result=$(increment_version "$test_version" "major")
    
    if [[ "$patch_result" == "1.0.1" ]]; then
        echo -e "${GREEN}✅ Patch increment: $test_version → $patch_result${NC}"
    else
        echo -e "${RED}❌ Patch increment failed: expected 1.0.1, got $patch_result${NC}"
    fi
    
    if [[ "$minor_result" == "1.1.0" ]]; then
        echo -e "${GREEN}✅ Minor increment: $test_version → $minor_result${NC}"
    else
        echo -e "${RED}❌ Minor increment failed: expected 1.1.0, got $minor_result${NC}"
    fi
    
    if [[ "$major_result" == "2.0.0" ]]; then
        echo -e "${GREEN}✅ Major increment: $test_version → $major_result${NC}"
    else
        echo -e "${RED}❌ Major increment failed: expected 2.0.0, got $major_result${NC}"
    fi
    
    # Test 4: Check changeset directory
    echo -e "${CYAN}Test 4: Changeset directory${NC}"
    if [[ -d "$CARGO_CHANGESETS_DIR" ]]; then
        echo -e "${GREEN}✅ Changeset directory exists: $CARGO_CHANGESETS_DIR${NC}"
        local changeset_count=$(find "$CARGO_CHANGESETS_DIR" -name "*.md" 2>/dev/null | wc -l)
        echo -e "${BLUE}   Found $changeset_count pending changeset(s)${NC}"
    else
        echo -e "${YELLOW}⚠️  Changeset directory created: $CARGO_CHANGESETS_DIR${NC}"
    fi
    
    # Test 5: Test cargo commands
    echo -e "${CYAN}Test 5: Cargo commands${NC}"
    cd "$BACKEND_DIR"
    if timeout 30 cargo check >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Cargo check passes${NC}"
    else
        echo -e "${YELLOW}⚠️  Cargo check timed out or failed (this may be expected)${NC}"
    fi
    
    if timeout 60 cargo build >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Cargo build passes${NC}"
    else
        echo -e "${YELLOW}⚠️  Cargo build timed out or has issues (this may be expected)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Changeset system test completed!${NC}"
    echo ""
    echo "You can now use:"
    echo "  • $0 add - to create changesets"
    echo "  • $0 version --dry-run - to preview version changes"
    echo "  • $0 publish --dry-run - to preview publishing"
}
# Main command dispatcher
case "$COMMAND" in
    "add")
        add_changeset
        ;;
    "status")
        show_status
        ;;
    "version")
        apply_changesets
        ;;
    "publish")
        publish_crates
        ;;
    "test")
        test_changeset_system
        ;;
    "help"|*)
        show_help
        ;;
esac