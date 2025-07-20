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

### GitHub Actions Setup
Create `.github/workflows/publish-npm.yml` for automated publishing on git tags:

```yaml
name: Publish NPM Packages
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org/'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build:packages
      - run: cd packages/core && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: cd packages/storage-service && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Rust Crates

### Prerequisites
- Ensure Cargo.toml files have proper metadata
- Login to crates.io: `cargo login`

### Publishing Rust Crates

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
- Core should be published first as other crates depend on it
- Use `cargo publish --dry-run` to test before actual publish
- Version bumps should be coordinated across dependent crates
