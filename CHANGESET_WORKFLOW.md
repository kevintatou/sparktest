# Changeset Workflow for SparkTest

This document describes how to use changesets for managing independent versioning and publishing of NPM packages and Cargo crates in the SparkTest monorepo.

## Overview

The SparkTest monorepo contains:

- **NPM packages**: `@tatou/core`, `@tatou/storage-service`, `@tatou/ui`
- **Cargo crates**: `sparktest-core`, `sparktest-api`, `sparktest-bin`

Previously, all packages shared the same version and were published together, causing issues with duplicate version publishing. Now we use changesets to:

1. **Version packages independently** based on actual changes
2. **Only publish packages that have changes**
3. **Prevent duplicate version conflicts**
4. **Maintain proper semantic versioning**

## NPM Packages (using @changesets/cli)

### Testing the Changeset System

Before creating actual changesets, you can test the system:

```bash
# Test the entire changeset system
pnpm run changeset:test

# Test just the cargo changeset system
pnpm run cargo-changeset:test

# Test dry-run operations
pnpm run cargo-changeset version --dry-run
pnpm run cargo-changeset publish --dry-run
```

See `TESTING_CHANGESETS.md` for detailed testing instructions.

### Creating a Changeset

When you make changes to NPM packages, create a changeset:

```bash
# Interactive changeset creation
pnpm changeset

# Or use the npm script
pnpm run changeset
```

This will:

1. Ask which packages have changes
2. Ask what type of change (patch/minor/major)
3. Ask for a description of changes
4. Create a changeset file in `.changeset/`

### Checking Changeset Status

```bash
# Check which packages will be published
pnpm changeset:status

# Or directly
npx changeset status
```

### Applying Changesets (Version Bump)

```bash
# Apply all pending changesets and bump versions
pnpm changeset:version

# This will:
# - Update package.json versions
# - Update CHANGELOG.md files
# - Remove consumed changeset files
```

### Publishing

```bash
# Publish packages with changes
pnpm changeset:publish

# This only publishes packages that have version changes
```

## Cargo Crates (using custom script)

### Creating a Changeset

```bash
# Interactive changeset creation for cargo crates
pnpm run cargo-changeset:add

# Or directly
./scripts/cargo-changeset.sh add
```

This will:

1. Show available crates (sparktest-core, sparktest-api, sparktest-bin)
2. Ask which crates have changes
3. Ask what type of change (patch/minor/major)
4. Ask for a description
5. Create a changeset file in `.cargo-changesets/`

### Checking Changeset Status

```bash
# Check cargo changeset status
pnpm run cargo-changeset:status

# Or directly
./scripts/cargo-changeset.sh status
```

### Applying Changesets (Version Bump)

```bash
# Apply cargo changesets and bump versions
pnpm run cargo-changeset:version

# This updates Cargo.toml versions and removes changeset files
```

### Publishing

```bash
# Publish cargo crates with changes
pnpm run cargo-changeset:publish

# This publishes in dependency order: core → api → bin
```

## Automated Publishing via GitHub Actions

### Triggering Publication

1. **Create changesets** for your changes (both NPM and Cargo as needed)
2. **Apply changesets** to bump versions:
   ```bash
   pnpm changeset:version
   pnpm run cargo-changeset:version
   ```
3. **Commit the version changes**
4. **Create a git tag** and push:
   ```bash
   git tag v0.3.0
   git push origin v0.3.0
   ```

### What Happens in CI

When a tag is pushed:

1. **NPM workflow** (`.github/workflows/publish-npm.yml`):
   - Checks if there are packages to publish using `changeset status`
   - Only publishes packages that have version changes
   - Skips publishing if no changes

2. **Cargo workflow** (`.github/workflows/publish-cargo.yml`):
   - Checks for cargo changesets
   - Publishes crates in dependency order
   - Handles dependency updates automatically
   - Skips already-published versions

## Example Workflow

### Scenario: Update only the core package

1. **Make changes** to `packages/core/src/index.ts`

2. **Create NPM changeset**:

   ```bash
   pnpm changeset
   # Select: @tatou/core
   # Type: minor (new feature)
   # Description: "Add new utility function"
   ```

3. **Apply changeset**:

   ```bash
   pnpm changeset:version
   # This bumps @tatou/core from 0.2.0 to 0.3.0
   # Other packages stay at 0.2.0
   ```

4. **Commit and tag**:

   ```bash
   git add .
   git commit -m "Release @tatou/core v0.3.0"
   git tag v0.3.0
   git push origin main --tags
   ```

5. **Automated publishing**:
   - Only `@tatou/core@0.3.0` gets published
   - Other packages are skipped (no version changes)

### Scenario: Update multiple packages

1. **Make changes** to both `packages/core` and `backend/api`

2. **Create changesets**:

   ```bash
   # NPM changeset
   pnpm changeset
   # Select: @tatou/core
   # Type: patch

   # Cargo changeset
   pnpm run cargo-changeset:add
   # Select: sparktest-api
   # Type: minor
   ```

3. **Apply changesets**:

   ```bash
   pnpm changeset:version
   pnpm run cargo-changeset:version
   ```

4. **Commit and tag**:

   ```bash
   git add .
   git commit -m "Release multiple packages"
   git tag v0.3.1
   git push origin main --tags
   ```

5. **Result**:
   - `@tatou/core` bumped to 0.2.1
   - `sparktest-api` bumped to 0.3.0
   - Other packages unchanged

## Best Practices

### 1. Create changesets for every change

- Always create a changeset when modifying packages
- Be descriptive in changeset descriptions
- Choose appropriate semver levels (patch/minor/major)

### 2. Review changeset status before releasing

```bash
pnpm changeset:status
pnpm run cargo-changeset:status
```

### 3. Test locally before publishing

```bash
# Build all packages
pnpm build:packages

# Test cargo crates
cd backend && cargo test
```

### 4. Use consistent commit messages

```bash
git commit -m "Release packages [changeset]"
```

### 5. Tag releases meaningfully

```bash
# Use semantic versioning for tags
git tag v0.3.0  # Major release
git tag v0.2.1  # Patch release
```

## Troubleshooting

### NPM Publishing Issues

```bash
# Check NPM authentication
npm whoami

# Verify package access
npm access list packages

# Check changeset status
npx changeset status --verbose
```

### Cargo Publishing Issues

```bash
# Check crates.io authentication
cargo login --help

# Verify crate exists
cargo search sparktest-core

# Check versions
./scripts/cargo-changeset.sh status
```

### Version Conflicts

If you get version conflicts:

1. **Check if version already exists**:

   ```bash
   npm view @tatou/core versions --json
   cargo search sparktest-core
   ```

2. **Create new changeset** with higher version bump

3. **Re-apply changesets**:
   ```bash
   pnpm changeset:version
   pnpm run cargo-changeset:version
   ```

## Configuration Files

- **`.changeset/config.json`**: NPM changeset configuration
- **`.cargo-changesets/`**: Cargo changeset storage
- **`.github/workflows/publish-npm.yml`**: NPM publishing workflow
- **`.github/workflows/publish-cargo.yml`**: Cargo publishing workflow
- **`scripts/cargo-changeset.sh`**: Cargo changeset management script

## Migration from Old System

The old system published all packages with the same version on every release. The new system:

✅ **Prevents duplicate version publishing**
✅ **Allows independent package versioning**  
✅ **Only publishes changed packages**
✅ **Maintains proper semantic versioning**
✅ **Reduces unnecessary publishes**

This solves the original issue where "we have one npm packages that is v0.2 and another v0.1. Once we bump v0.2 the other v0.2 will try to push a duplicate version to npm".
