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

# Create cargo changesets directory if it doesn't exist
mkdir -p "$CARGO_CHANGESETS_DIR"

# Function to show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  add     - Add a new changeset for cargo crates"
    echo "  version - Apply changesets and bump versions"
    echo "  publish - Publish crates with changes"
    echo "  status  - Show current changeset status"
    echo "  help    - Show this help message"
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
        
        echo -e "${GREEN}Bumping $crate: $current_version → $new_version ($change_type)${NC}"
        set_crate_version "$crate_path" "$new_version"
    done
    
    # Remove processed changesets
    for changeset in "${changesets[@]}"; do
        rm "$changeset"
    done
    
    echo ""
    echo -e "${GREEN}✅ All changesets applied successfully${NC}"
}

# Function to publish crates
publish_crates() {
    echo -e "${BLUE}🦀 Publishing cargo crates${NC}"
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
    echo -e "${GREEN}✅ All crates published successfully${NC}"
}

# Main command dispatcher
case "${1:-help}" in
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
    "help"|*)
        show_help
        ;;
esac