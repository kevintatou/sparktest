#!/bin/bash

# Enhanced Changeset Status Script
# Provides better guidance when no changesets exist

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if we have any changesets
check_npm_changesets() {
    local changeset_count=$(find "$ROOT_DIR/.changeset" -name "*.md" 2>/dev/null | grep -v README | wc -l)
    echo $changeset_count
}

# Function to show enhanced status
show_enhanced_status() {
    echo -e "${BLUE}🦋 NPM Changeset Status${NC}"
    echo ""
    
    # Run the actual changeset status command and capture output
    local status_output
    if status_output=$(cd "$ROOT_DIR" && npx changeset status 2>&1); then
        echo "$status_output"
        
        # Check if the output indicates no changes (strip ANSI codes first)
        local clean_output=$(echo "$status_output" | sed 's/\x1b\[[0-9;]*m//g')
        if echo "$clean_output" | grep -q "NO packages to be bumped"; then
            local changeset_count=$(check_npm_changesets)
            echo ""
            echo -e "${YELLOW}No changesets found.${NC}"
            echo ""
            echo "This means you haven't created any changesets yet."
            echo ""
            echo "To get started:"
            echo -e "  • Create a changeset: ${BLUE}pnpm changeset${NC}"
            echo -e "  • Or run directly: ${BLUE}npx changeset${NC}"
            echo ""
            echo "After making changes to your packages, create a changeset to track"
            echo "what changed and how the versions should be updated."
        fi
    else
        echo -e "${RED}Error running changeset status:${NC}"
        echo "$status_output"
        echo ""
        echo "This might happen if:"
        echo "  • The repository is not set up correctly"
        echo "  • Git branches are not properly configured"
        echo "  • Dependencies are not installed (run 'pnpm install')"
        echo ""
        echo "Try:"
        echo -e "  • Run: ${BLUE}pnpm install${NC}"
        echo -e "  • Check git status: ${BLUE}git status${NC}"
        echo -e "  • Test changeset system: ${BLUE}pnpm run changeset:test${NC}"
    fi
}

# Main execution
show_enhanced_status