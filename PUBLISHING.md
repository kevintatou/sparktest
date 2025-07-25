# Publishing Guide

## NPM Packages

### Prerequisites

- Set up NPM_TOKEN environment variable with access to @sparktest organization
- Ensure packages are properly built

### Publishing Core and Storage-Service Packages

1. **Build packages**:

   ```bash
   pnpm build:packages
   ```

2. **Publish packages** (from package directories):

   ```bash
   cd packages/core
   npm publish

   cd ../storage-service
   npm publish
   ```

### Automated Publishing with GitHub Actions

**Automated publishing is configured** via `.github/workflows/publish-npm.yml` that triggers on git tags starting with `v*`.

**To publish npm packages:**

1. Create and push a version tag: `git tag v1.0.0 && git push origin v1.0.0`
2. The GitHub Action will automatically build and publish both packages to npm
3. Requires `NPM_TOKEN` secret to be configured in repository settings

## Rust Crates

### Prerequisites

- Ensure Cargo.toml files have proper metadata
- Login to crates.io: `cargo login`

### Automated Publishing with GitHub Actions

**Automated publishing is configured** via `.github/workflows/publish-cargo.yml` that triggers on git tags starting with `v*`.

**To publish Rust crates:**

1. Create and push a version tag: `git tag v1.0.0 && git push origin v1.0.0`
2. The GitHub Action will automatically build, test, and publish all crates in dependency order
3. Requires `CRATES_IO_TOKEN` secret to be configured in repository settings

### Manual Publishing (Alternative)

1. **Build and test**:

   ```bash
   cargo build
   cargo test
   ```

2. **Publish crates** (order matters due to dependencies):
   ```bash
   cargo publish -p sparktest-core
   cargo publish -p sparktest-api
   cargo publish -p sparktest-bin
   ```

### Notes

- **Safeguard**: Both npm and cargo publishing workflows only trigger on version tags (e.g., `v1.0.0`), not on direct merges to main
- Core packages should be published first as other packages/crates depend on them (workflows handle this automatically)
- Use `cargo publish --dry-run` to test before actual publish
- Version bumps should be coordinated across dependent packages/crates
- Configure repository secrets: `NPM_TOKEN` for npm publishing, `CRATES_IO_TOKEN` for cargo publishing
