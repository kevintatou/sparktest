#!/bin/bash

# SparkTest Git History Rewrite Orchestrator
# This script guides you through the complete history rewrite process

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Display banner
show_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                SparkTest Git History Rewrite                 ║
║                                                               ║
║  This tool will rewrite your git history to create a clean,  ║
║  logical progression of commits with proper changesets and    ║
║  semantic versioning for all packages.                       ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check git status
    cd "$ROOT_DIR"
    if ! git diff-index --quiet HEAD --; then
        error "You have uncommitted changes. Please commit or stash them first."
    fi
    
    # Check required tools
    local missing_tools=()
    
    if ! command -v git >/dev/null 2>&1; then
        missing_tools+=("git")
    fi
    
    if ! command -v pnpm >/dev/null 2>&1; then
        missing_tools+=("pnpm")
    fi
    
    if ! command -v cargo >/dev/null 2>&1; then
        missing_tools+=("cargo")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
    fi
    
    # Check script permissions
    if [[ ! -x "$SCRIPT_DIR/rewrite-git-history.sh" ]]; then
        chmod +x "$SCRIPT_DIR/rewrite-git-history.sh"
    fi
    
    if [[ ! -x "$SCRIPT_DIR/post-rewrite-setup.sh" ]]; then
        chmod +x "$SCRIPT_DIR/post-rewrite-setup.sh"
    fi
    
    success "Prerequisites check passed"
}

# Show current state
show_current_state() {
    log "Current repository state:"
    
    cd "$ROOT_DIR"
    
    echo "  Git branch: $(git branch --show-current)"
    echo "  Git commits: $(git rev-list --count HEAD)"
    echo "  Last commit: $(git log -1 --oneline)"
    
    echo ""
    echo "  Package versions:"
    
    if [[ -f "packages/core/package.json" ]]; then
        local core_version=$(grep '"version"' packages/core/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
        echo "    @tatou/core: $core_version"
    fi
    
    if [[ -f "packages/ui/package.json" ]]; then
        local ui_version=$(grep '"version"' packages/ui/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
        echo "    @tatou/ui: $ui_version"
    fi
    
    if [[ -f "packages/storage-service/package.json" ]]; then
        local storage_version=$(grep '"version"' packages/storage-service/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
        echo "    @tatou/storage-service: $storage_version"
    fi
    
    if [[ -f "backend/core/Cargo.toml" ]]; then
        local core_cargo_version=$(grep '^version = ' backend/core/Cargo.toml | head -1 | sed 's/version = "\([^"]*\)"/\1/')
        echo "    sparktest-core: $core_cargo_version"
    fi
    
    if [[ -f "backend/api/Cargo.toml" ]]; then
        local api_cargo_version=$(grep '^version = ' backend/api/Cargo.toml | head -1 | sed 's/version = "\([^"]*\)"/\1/')
        echo "    sparktest-api: $api_cargo_version"
    fi
    
    if [[ -f "backend/bin/Cargo.toml" ]]; then
        local bin_cargo_version=$(grep '^version = ' backend/bin/Cargo.toml | head -1 | sed 's/version = "\([^"]*\)"/\1/')
        echo "    sparktest-bin: $bin_cargo_version"
    fi
    
    echo ""
}

# Get user confirmation
get_confirmation() {
    echo -e "${YELLOW}⚠️  WARNING: This will rewrite your git history!${NC}"
    echo ""
    echo "This process will:"
    echo "  1. Create a complete backup of your current git state"
    echo "  2. Replace your current history with 17 logical commits"
    echo "  3. Generate appropriate changesets for each change"
    echo "  4. Set proper semantic versions for all packages"
    echo "  5. Create documentation and setup guides"
    echo ""
    echo "Your current state will be backed up and can be restored if needed."
    echo ""
    
    read -p "Do you want to proceed? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operation cancelled by user."
        exit 0
    fi
}

# Perform the rewrite
perform_rewrite() {
    log "Starting git history rewrite..."
    
    cd "$ROOT_DIR"
    
    # Run the main rewrite script
    if ! ./scripts/rewrite-git-history.sh --force; then
        error "Git history rewrite failed"
    fi
    
    success "Git history rewrite completed"
}

# Run post-rewrite setup
run_post_setup() {
    log "Running post-rewrite setup..."
    
    cd "$ROOT_DIR"
    
    # Run the post-setup script
    if ! ./scripts/post-rewrite-setup.sh; then
        warn "Post-rewrite setup encountered issues (this may be normal)"
    fi
    
    success "Post-rewrite setup completed"
}

# Show results
show_results() {
    log "Rewrite completed! Here's what changed:"
    
    cd "$ROOT_DIR"
    
    echo ""
    echo "New git history:"
    git log --oneline --graph -n 10
    
    echo ""
    echo "Created files:"
    if [[ -f "HISTORY_REWRITE.md" ]]; then
        echo "  ✅ HISTORY_REWRITE.md - Detailed documentation"
    fi
    
    if [[ -f "GIT_HISTORY_REWRITE_GUIDE.md" ]]; then
        echo "  ✅ GIT_HISTORY_REWRITE_GUIDE.md - Usage guide"
    fi
    
    # Find backup directory
    local backup_dir=$(find . -maxdepth 1 -name ".git-backup-*" -type d | head -1)
    if [[ -n "$backup_dir" ]]; then
        echo "  ✅ $backup_dir - Complete backup of original state"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Git history rewrite completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review the new history: git log --oneline --graph"
    echo "  2. Read the documentation: cat HISTORY_REWRITE.md"
    echo "  3. Test changeset system: pnpm changeset:test"
    echo "  4. Create a new branch: git checkout -b clean-history"
    echo "  5. Push to remote: git push origin clean-history"
    echo ""
    echo "To restore original state if needed:"
    if [[ -n "$backup_dir" ]]; then
        echo "  cp -r $backup_dir/.git .git && git checkout main"
    fi
    echo ""
}

# Main function
main() {
    show_banner
    check_prerequisites
    show_current_state
    get_confirmation
    perform_rewrite
    run_post_setup
    show_results
}

# Show help
show_help() {
    echo "SparkTest Git History Rewrite Orchestrator"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help    Show this help message"
    echo "  --dry-run Run in preview mode (shows what would be done)"
    echo ""
    echo "This script guides you through rewriting your git history to create"
    echo "a clean, logical progression of commits with proper changesets."
    echo ""
    echo "For detailed information, see GIT_HISTORY_REWRITE_GUIDE.md"
}

# Parse arguments
case "${1:-}" in
    --help)
        show_help
        exit 0
        ;;
    --dry-run)
        log "Running in dry-run mode..."
        show_banner
        check_prerequisites
        show_current_state
        echo ""
        log "Would run: ./scripts/rewrite-git-history.sh --force"
        log "Would run: ./scripts/post-rewrite-setup.sh"
        echo ""
        log "Use without --dry-run to perform the actual rewrite"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1 (use --help for usage)"
        ;;
esac