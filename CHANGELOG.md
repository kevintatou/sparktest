# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [v0.2.0] - 2024-12-19
### Added
- Tagged new minor version for release

## [v0.1.0] - 2025-07-18
### Added
- **Initial OSS release** of SparkTest with a modular foundation
- **Frontend app (`apps/oss`)**:
  - Dashboard for managing test definitions, executors, and runs
  - Sidebar navigation, responsive UI (desktop + mobile)
- **Storage layer refactor**:
  - Extracted `StorageService` into `@sparktest/storage-service` package
  - Supports API, local, and mock storage strategies
- **Core package (`@sparktest/core`)**:
  - Domain types for orchestrations: `Definition`, `Run`, `Executor`
  - Validation logic for commands and images
- **Rust backend (Axum)**:
  - CRUD for test definitions, executors, and runs
  - Integrated PostgreSQL using `sqlx`
  - Kubernetes Job orchestration for test runs
- **Workspace setup**:
  - Monorepo with `pnpm-workspace.yaml` for TS packages
  - Rust Cargo workspace planned (split into `core`, `api`, `bin`)

### Changed
- Removed legacy “test-” prefix from orchestration models and routes
- Improved UI layout and loading states (spinners, input focus)


---

[Unreleased]: https://github.com/kevintatou/sparktest/compare/v0.2.0...HEAD
[v0.2.0]: https://github.com/kevintatou/sparktest/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/kevintatou/sparktest/releases/tag/v0.1.0
