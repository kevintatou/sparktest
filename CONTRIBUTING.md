# Contributing to SparkTest

1. Fork, clone, `pnpm install && pnpm build:packages`
2. Run frontend (`cd apps/oss && pnpm dev`) and backend (`cargo run -p sparktest-bin`) — see the Quick Start in [README.md](README.md)
3. Make changes, add tests, run `pnpm check && cargo test && cargo clippy`
4. Open a PR with a clear description; screenshots for UI changes

## Code Standards

- **TypeScript**: Prettier, ESLint, functional components
- **Rust**: `cargo fmt`, `cargo clippy --all-targets -- -D warnings`, tests for new behavior
- **General**: clear commit messages, atomic commits, update docs alongside code

## Before opening a PR

- `pnpm check` (format, lint, types, build, test) and `cargo test && cargo clippy` both pass
- Manually verified against the real Rust backend (not just mock/demo data)
- Linked issues, and screenshots for any UI change

## Reporting issues

**Bugs**: steps to reproduce, expected vs actual behavior, environment details
**Features**: clear description, use case, possible implementation approach

For help: [Discussions](https://github.com/kevintatou/sparktest/discussions) | [Issues](https://github.com/kevintatou/sparktest/issues)
