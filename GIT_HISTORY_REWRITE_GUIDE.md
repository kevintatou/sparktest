# Git History Rewrite Guide for SparkTest

This guide explains how to use the git history rewrite scripts to clean up your git history and establish proper versioning with changesets.

## Overview

The SparkTest repository currently has a minimal git history that doesn't reflect the actual development work. These scripts will:

1. **Create a backup** of your current git state
2. **Rewrite history** with logical, semantic commits  
3. **Generate changesets** for each logical change
4. **Establish proper versioning** for all packages
5. **Maintain current functionality** while providing clear development story

## Package Versioning Strategy

The rewrite will establish logical version progression:

### NPM Packages
- **@tatou/core**: Core types and utilities (0.1.0 → 0.2.1)
- **@tatou/ui**: UI component library (0.1.0 → 0.2.0)
- **@tatou/storage-service**: Storage implementations (0.1.0 → 0.2.1)

### Cargo Crates  
- **sparktest-core**: Backend domain models (0.1.0 → 0.2.1)
- **sparktest-api**: HTTP API and Kubernetes (0.1.0 → 0.2.0)
- **sparktest-bin**: Server binary (0.1.0 → 0.2.0)

## Scripts Provided

### 1. `scripts/rewrite-git-history.sh`
Main script that performs the history rewrite.

**Usage:**
```bash
# Preview what will happen (recommended first step)
./scripts/rewrite-git-history.sh --dry-run --verbose

# Perform the rewrite (with confirmation)
./scripts/rewrite-git-history.sh

# Perform the rewrite (no confirmation)
./scripts/rewrite-git-history.sh --force
```

**Options:**
- `--dry-run`: Show what would be done without making changes
- `--force`: Skip confirmation prompts  
- `--verbose`: Show detailed output
- `--help`: Show usage information

### 2. `scripts/post-rewrite-setup.sh`
Companion script for post-rewrite setup and validation.

**Usage:**
```bash
# Run after the main rewrite
./scripts/post-rewrite-setup.sh
```

## Step-by-Step Process

### Step 1: Preparation

1. **Ensure clean working directory:**
   ```bash
   git status  # Should show no uncommitted changes
   git push    # Push any important work to remote
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Test current state:**
   ```bash
   pnpm build:packages
   pnpm cargo-build
   ```

### Step 2: Preview the Rewrite

```bash
# See what the script will do
./scripts/rewrite-git-history.sh --dry-run --verbose
```

This shows you:
- Where backup will be created
- What commits will be generated
- What changesets will be created
- Final package versions

### Step 3: Perform the Rewrite

```bash
# Run the actual rewrite
./scripts/rewrite-git-history.sh
```

The script will:
1. **Create backup** at `.git-backup-YYYYMMDD-HHMMSS/`
2. **Create new orphan branch** `new-main`
3. **Generate 17 logical commits** with proper dates
4. **Create changesets** for each package change
5. **Set proper versions** for all packages
6. **Tag the final version** as `v0.2.0`

### Step 4: Post-Rewrite Setup

```bash
# Setup changeset system and validate
./scripts/post-rewrite-setup.sh
```

This will:
- Configure cargo changeset integration
- Test the changeset system
- Create documentation
- Validate builds and functionality

### Step 5: Review and Deploy

1. **Review the new history:**
   ```bash
   git log --oneline --graph
   git show --name-only HEAD~5..HEAD
   ```

2. **Test changeset system:**
   ```bash
   pnpm changeset:test
   pnpm run cargo-changeset:test
   ```

3. **Create clean history branch:**
   ```bash
   git checkout -b clean-history
   git push origin clean-history
   ```

4. **Update main branch (when ready):**
   ```bash
   git checkout main
   git reset --hard new-main
   git push --force-with-lease origin main
   ```

## New History Structure

The rewritten history will contain these logical commits:

1. **Initial project setup** (workspace config, gitignore, basic package.json)
2. **Core package foundation** (basic domain types and utilities)
3. **Storage service implementation** (storage interface and basic implementations)
4. **UI components package** (basic UI utilities and components)
5. **Rust backend foundation** (core domain models in Rust)
6. **API layer development** (HTTP routes and handlers)
7. **Backend binary** (server application entry point)
8. **Frontend application** (Next.js app foundation)
9. **Changeset system setup** (version management configuration)
10. **Documentation and deployment** (README, Dockerfiles, configs)
11. **Enhanced storage implementations** (API, local, hybrid storage)
12. **UI component library expansion** (full component library with shadcn/ui)
13. **Database and Kubernetes integration** (PostgreSQL and K8s job orchestration)
14. **Advanced tooling** (development scripts and testing)
15. **Current state restoration** (all current features and refinements)
16. **Version tagging** (v0.2.0 release tag)

Each commit includes:
- **Semantic commit message** following conventional commits
- **Appropriate changesets** documenting the changes
- **Logical version progression** for affected packages
- **Realistic commit dates** spread over several months

## Changeset Integration

After the rewrite, you'll have:

### NPM Changesets (via @changesets/cli)
```bash
# Create new changeset
pnpm changeset

# Check status
pnpm changeset:status

# Apply version bumps
pnpm changeset:version

# Publish packages
pnpm changeset:publish
```

### Cargo Changesets (via custom script)
```bash
# Create new changeset
pnpm run cargo-changeset:add

# Check status  
pnpm run cargo-changeset:status

# Apply version bumps
pnpm run cargo-changeset:version

# Publish crates
pnpm run cargo-changeset:publish
```

## Safety and Recovery

### Backup Information
The script creates a complete backup at `.git-backup-YYYYMMDD-HHMMSS/` containing:
- Complete `.git` directory
- Git bundle of all refs
- Current branch name
- Current commit SHA

### Recovery Process
If you need to restore the original history:

```bash
# Find your backup
ls -la .git-backup-*

# Restore original git state
cp -r .git-backup-YYYYMMDD-HHMMSS/.git .git

# Checkout original branch
git checkout main
```

### Validation
The scripts include validation to ensure:
- All packages build successfully
- Changeset system is functional
- Version numbers are consistent
- No functionality is lost

## Best Practices After Rewrite

1. **Use semantic commit messages:**
   ```bash
   git commit -m "feat(core): add new test execution engine"
   git commit -m "fix(ui): resolve layout issue in dashboard"
   git commit -m "docs: update deployment guide"
   ```

2. **Create changesets for every change:**
   ```bash
   # For NPM packages
   pnpm changeset

   # For Cargo crates
   pnpm run cargo-changeset:add
   ```

3. **Test before releasing:**
   ```bash
   pnpm build:packages
   pnpm cargo-build
   pnpm test
   ```

4. **Use proper versioning:**
   - **patch**: Bug fixes, documentation updates
   - **minor**: New features, backwards-compatible changes  
   - **major**: Breaking changes

## Troubleshooting

### Common Issues

**"Script fails during rewrite"**
- Check that you have no uncommitted changes
- Ensure you have write permissions
- Try with `--verbose` flag for more details

**"Packages don't build after rewrite"**
- Run `pnpm install` to restore dependencies
- Check that all workspace dependencies are available
- Use `./scripts/post-rewrite-setup.sh` to validate

**"Changeset system not working"**
- Ensure `.changeset/config.json` exists
- Run `pnpm changeset:test` to verify setup
- Check that `@changesets/cli` is installed

**"Cargo crates not building"**
- Run `cargo clean && cargo build`
- Check Cargo.toml dependency paths
- Ensure Rust toolchain is up to date

### Getting Help

If you encounter issues:
1. Check the backup directory was created successfully
2. Review `HISTORY_REWRITE.md` for details
3. Use `git log --oneline` to verify commit structure
4. Test individual package builds
5. Restore from backup if needed

## Summary

The git history rewrite provides:

✅ **Clean, logical commit history** reflecting actual development  
✅ **Proper semantic versioning** for all packages  
✅ **Comprehensive changeset system** for future development  
✅ **Independent package versioning** based on actual changes  
✅ **Complete backup** for safety and recovery  
✅ **Validated functionality** ensuring nothing is broken  

This establishes a solid foundation for future development with proper version management and clear development history.