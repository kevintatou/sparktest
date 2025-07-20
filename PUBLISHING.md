# Publishing Guide

This document describes how to publish new versions of SparkTest packages and crates.

## TypeScript Packages

The project includes two TypeScript packages ready for npm publishing:

- `@sparktest/core` - Domain logic, types, and utilities
- `@sparktest/storage-service` - Storage abstraction layer

### Publishing Workflow

Packages are automatically published to npm when a new git tag is pushed:

```bash
# Bump version in package.json files
# Create and push a tag
git tag v0.1.1
git push origin v0.1.1
```

This triggers the GitHub Action in `.github/workflows/npm-publish.yml` which:
1. Builds all packages
2. Publishes them to npm

### Manual Publishing

To publish manually:

```bash
# Build all packages
pnpm build

# Publish all packages (requires npm login)
pnpm --filter './packages/*' publish
```

## Rust Crates

The project includes three Rust crates:

- `sparktest-core` - Domain models and database logic
- `sparktest-api` - Axum API routes and handlers  
- `sparktest-bin` - Application entrypoint

### Publishing Rust Crates

Rust crates can be published to crates.io:

```bash
# From the workspace root
cargo publish -p sparktest-core
cargo publish -p sparktest-api  
cargo publish -p sparktest-bin
```

Note: Dependencies must be published in order (core → api → bin).

## Development Workflow

### Building

```bash
# Build TypeScript packages
pnpm build

# Build Rust crates
cargo build --release
```

### Testing

```bash
# Test TypeScript packages
pnpm --filter "@sparktest/oss" test

# Test Rust crates
cargo test
```

### Type Checking

```bash
# Check TypeScript types
pnpm type-check

# Check Rust types
cargo check
```

## Package Structure

```
packages/
  core/                    # @sparktest/core
  storage-service/         # @sparktest/storage-service
backend/
  core/                    # sparktest-core crate
  api/                     # sparktest-api crate
  bin/                     # sparktest-bin crate
```

## Configuration

- `.npmrc` - npm registry configuration
- `pnpm-workspace.yaml` - TypeScript workspace configuration
- `Cargo.toml` - Rust workspace configuration
- `.github/workflows/npm-publish.yml` - Automated npm publishing
- `.github/workflows/crate-publish.yml` - Automated Rust crate publishing

## Merge History

*Note: Main branch changes have been incorporated into this refactoring branch. The storage package improvements that were made in main have been implemented more comprehensively in this branch structure.*

## Publishing Workflows

### TypeScript Packages

Packages are automatically published to npm when version tags are pushed:

```bash
git tag v0.1.1
git push origin v0.1.1
```

### Rust Crates

Crates are automatically published to crates.io when crate version tags are pushed:

```bash
git tag crate-v0.1.1
git push origin crate-v0.1.1
```

This enables:
- **SaaS integration** through modular package imports
- **External reuse** of both TypeScript packages and Rust crates
- **Long-term maintainability** with clear separation of concerns

**Note**: Make sure to set up the `CARGO_REGISTRY_TOKEN` secret in the repository settings for automatic crate publishing.