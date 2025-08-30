# Git History Rewrite Scripts

This directory contains scripts to rewrite the git history of SparkTest with proper semantic commits and changeset versioning.

## Quick Start

```bash
# Preview what will happen
./scripts/rewrite-history.sh --dry-run

# Perform the rewrite (interactive)
./scripts/rewrite-history.sh

# Or use the individual scripts for more control
./scripts/rewrite-git-history.sh --dry-run --verbose
./scripts/rewrite-git-history.sh --force
./scripts/post-rewrite-setup.sh
```

## Scripts Overview

### 🚀 `rewrite-history.sh` (Recommended)
**Main orchestrator script** - Guides you through the complete process with safety checks and user-friendly output.

**Features:**
- Interactive confirmation prompts
- Prerequisites checking
- Current state analysis
- Complete process orchestration
- Results summary and next steps

**Usage:**
```bash
./scripts/rewrite-history.sh          # Interactive mode
./scripts/rewrite-history.sh --dry-run # Preview mode
./scripts/rewrite-history.sh --help    # Show help
```

### ⚙️ `rewrite-git-history.sh` (Core Engine)
**Main rewrite engine** - Performs the actual git history rewrite with logical commits and changesets.

**Features:**
- Creates complete backup of current state
- Generates 17 logical commits with realistic dates
- Creates appropriate changesets for each change
- Establishes proper semantic versioning
- Maintains all current functionality

**Usage:**
```bash
./scripts/rewrite-git-history.sh --dry-run --verbose  # Preview
./scripts/rewrite-git-history.sh --force             # Execute
./scripts/rewrite-git-history.sh --help              # Help
```

### 🔧 `post-rewrite-setup.sh` (Post-Processing)
**Post-rewrite configuration** - Sets up changeset system and validates the rewritten history.

**Features:**
- Configures cargo changeset integration
- Tests changeset system functionality
- Creates comprehensive documentation
- Validates builds and package integrity

**Usage:**
```bash
./scripts/post-rewrite-setup.sh  # Run after main rewrite
```

## What the Rewrite Does

### New Git History (17 Logical Commits)
1. **Initial project setup** - Workspace configuration and basic files
2. **Core package foundation** - TypeScript domain types and utilities  
3. **Storage service implementation** - Storage abstraction layer
4. **UI components package** - Basic UI utilities and components
5. **Rust backend foundation** - Core domain models in Rust
6. **API layer development** - HTTP routes and handlers
7. **Backend binary** - Server application entry point
8. **Frontend application** - Next.js app foundation
9. **Changeset system setup** - Version management configuration
10. **Documentation and deployment** - README, Dockerfiles, configs
11. **Enhanced storage implementations** - API, local, hybrid storage
12. **UI component library expansion** - Full component library
13. **Database and Kubernetes integration** - PostgreSQL and K8s orchestration  
14. **Advanced tooling** - Development scripts and testing
15. **Current state restoration** - All current features and refinements
16. **Version tagging** - v0.2.0 release tag

### Package Versioning Strategy
- **NPM Packages**: Independent versioning based on changes
  - `@tatou/core`: 0.1.0 → 0.1.1 → 0.2.1
  - `@tatou/ui`: 0.1.0 → 0.2.0  
  - `@tatou/storage-service`: 0.1.0 → 0.2.0 → 0.2.1

- **Cargo Crates**: Semantic versioning progression
  - `sparktest-core`: 0.1.0 → 0.2.0 → 0.2.1
  - `sparktest-api`: 0.1.0 → 0.2.0
  - `sparktest-bin`: 0.1.0 → 0.2.0

### Changeset Integration
- **NPM changesets** via @changesets/cli for TypeScript packages
- **Cargo changesets** via custom script for Rust crates
- Each commit includes appropriate changesets documenting changes
- Proper semver levels (patch/minor/major) based on change impact

## Prerequisites

- **Git** (for version control)
- **Node.js 18+** and **pnpm** (for NPM packages)
- **Rust 1.70+** and **Cargo** (for Rust crates)
- **Clean working directory** (no uncommitted changes)

## Safety Features

### Complete Backup
- Full `.git` directory backup
- Git bundle with all refs
- Current branch and commit tracking
- Easy restoration process

### Validation
- Prerequisites checking
- Build validation (NPM + Cargo)
- Changeset system testing
- Functionality preservation

### Recovery
```bash
# Find backup directory
ls -la .git-backup-*

# Restore original state  
cp -r .git-backup-YYYYMMDD-HHMMSS/.git .git
git checkout main
```

## Output Files

After running the scripts, you'll have:

- **HISTORY_REWRITE.md** - Detailed documentation of changes
- **GIT_HISTORY_REWRITE_GUIDE.md** - Comprehensive usage guide  
- **.git-backup-YYYYMMDD-HHMMSS/** - Complete backup directory
- **New git history** with logical commits and changesets
- **Updated package versions** with proper progression

## Example Workflow

```bash
# 1. Check current state
git status
git log --oneline

# 2. Preview the rewrite
./scripts/rewrite-history.sh --dry-run

# 3. Perform the rewrite
./scripts/rewrite-history.sh

# 4. Review results
git log --oneline --graph
cat HISTORY_REWRITE.md

# 5. Test changeset system
pnpm changeset:test
pnpm run cargo-changeset:test

# 6. Create clean branch
git checkout -b clean-history
git push origin clean-history

# 7. Update main (when ready)
git checkout main
git reset --hard new-main
git push --force-with-lease origin main
```

## Troubleshooting

### Common Issues

**Script fails with "uncommitted changes"**
```bash
git status
git add . && git commit -m "Save current work"
# Or: git stash
```

**Missing dependencies**
```bash
# Install Node.js and pnpm
npm install -g pnpm

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Packages don't build after rewrite**
```bash
pnpm install
pnpm build:packages
cargo clean && cargo build
```

**Changeset system not working**
```bash
pnpm changeset:test
./scripts/post-rewrite-setup.sh
```

### Need Help?

1. Read the comprehensive guide: `GIT_HISTORY_REWRITE_GUIDE.md`
2. Check the generated documentation: `HISTORY_REWRITE.md`
3. Use `--dry-run` mode to preview changes
4. Restore from backup if needed

## Script Maintenance

These scripts are designed to be:
- **Self-contained** - No external dependencies beyond standard tools
- **Safe** - Multiple validation and backup layers
- **Transparent** - Detailed logging and dry-run capabilities
- **Recoverable** - Complete backup and restoration process

For updates or modifications, test thoroughly with `--dry-run` mode first.