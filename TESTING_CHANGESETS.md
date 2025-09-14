# Testing Changeset System

This guide explains how to test the changeset-based deployment system without actually publishing packages to NPM or crates.io registries.

## Quick Test Commands

### Test Everything

Run a comprehensive test of the entire changeset system:

```bash
# Test both NPM and Cargo changeset systems
pnpm run changeset:test
```

### Test NPM Changesets

```bash
# Check changeset status (safe - no changes)
pnpm changeset:status

# Dry-run publish (safe - shows what would be published)
pnpm changeset:publish --dry-run
```

### Test Cargo Changesets

```bash
# Test the cargo changeset system
pnpm run cargo-changeset:test

# Check status (safe - no changes)
pnpm run cargo-changeset:status

# Dry-run version bump (safe - shows what would change)
pnpm run cargo-changeset version --dry-run

# Dry-run publish (safe - shows what would be published)
pnpm run cargo-changeset publish --dry-run
```

## Detailed Testing Workflow

### 1. Test System Integrity

First, verify that your changeset system is properly configured:

```bash
# Run comprehensive tests
pnpm run changeset:test
```

This will check:

- ✅ Package.json scripts are properly configured
- ✅ NPM changeset configuration is valid
- ✅ Cargo changeset script works correctly
- ✅ Version increment logic is correct
- ✅ GitHub workflow files exist and are valid
- ✅ Build processes work
- ✅ All packages can be detected

### 2. Test Changeset Creation

#### NPM Packages

```bash
# Interactive changeset creation (you can cancel without saving)
pnpm changeset
# Follow prompts, but don't commit the changeset if just testing

# Check what would be published
pnpm changeset:status
```

#### Cargo Crates

```bash
# Test the cargo changeset system first
pnpm run cargo-changeset:test

# Interactive changeset creation (you can cancel)
pnpm run cargo-changeset:add
# Follow prompts, but don't save if just testing

# Check status
pnpm run cargo-changeset:status
```

### 3. Test Version Bumping (Dry Run)

Test what version changes would be applied:

```bash
# NPM packages - preview version changes
pnpm changeset version --dry-run

# Cargo crates - preview version changes
pnpm run cargo-changeset version --dry-run --verbose
```

### 4. Test Publishing (Dry Run)

Test what would be published without actually publishing:

```bash
# NPM packages - dry run publish
pnpm changeset:publish --dry-run

# Cargo crates - dry run publish
pnpm run cargo-changeset publish --dry-run --verbose
```

### 5. Test Build Processes

Ensure all packages build correctly:

```bash
# Test NPM package builds
pnpm build:packages

# Test Cargo builds
pnpm cargo-build

# Test everything together
pnpm build && pnpm cargo-build
```

## Test Scenarios

### Scenario 1: No Changes

When no changesets exist, test that:

- Status commands show "no changes"
- Publish commands skip publishing
- Version commands don't modify anything

### Scenario 2: Single Package Change

Create a test changeset for one package and verify:

- Only that package gets version bumped
- Dependencies are handled correctly
- Publishing would only affect changed packages

### Scenario 3: Multiple Package Changes

Test with multiple packages to ensure:

- Version bumping respects dependency order
- Related packages are updated appropriately
- Publishing follows correct order

## Cleaning Up Test Data

If you created test changesets during testing:

```bash
# Remove NPM changesets (if any were created)
rm -f .changeset/*.md

# Remove Cargo changesets (if any were created)
rm -rf .cargo-changesets/

# Reset any version changes (if testing wasn't in dry-run mode)
git checkout -- packages/*/package.json backend/*/Cargo.toml
```

## Continuous Integration Testing

The GitHub workflows will also test changesets:

1. **Push to feature branch** - workflows detect changesets but don't publish
2. **Create PR** - workflows validate changeset format
3. **Merge to main** - workflows would publish (but can be disabled for testing)

## Troubleshooting Tests

### Common Issues

1. **"No changesets found"**
   - Expected when no changes have been made
   - Run `pnpm changeset:status` to confirm

2. **"Build failures"**
   - Run `pnpm build:packages` to check NPM builds
   - Run `pnpm cargo-build` to check Cargo builds

3. **"Version parsing errors"**
   - Check that package.json and Cargo.toml files have valid versions
   - Run `pnpm run cargo-changeset:test` for detailed diagnostics

4. **"Script not found"**
   - Ensure scripts are executable: `chmod +x scripts/*.sh`
   - Check that package.json scripts reference correct paths

### Getting Help

If tests fail, the output will show:

- ✅ **Green checkmarks** for passing tests
- ❌ **Red X marks** for failing tests
- ⚠️ **Yellow warnings** for issues that may need attention

The test scripts provide detailed information about what's working and what needs to be fixed.

## Next Steps

Once all tests pass:

1. **Create real changesets** for your changes
2. **Apply version bumps** using `pnpm changeset:version` and `pnpm run cargo-changeset:version`
3. **Publish packages** using `pnpm changeset:publish` and `pnpm run cargo-changeset:publish`
4. **Push to GitHub** to trigger automated publishing workflows

Remember: Testing is safe and doesn't modify your packages or publish anything. Only the actual `publish` commands (without `--dry-run`) will publish to registries.
