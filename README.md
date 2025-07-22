# ⚡ SparkTest OSS

[![CI](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml)
[![Test & Coverage](https://github.com/kevintatou/sparktest/actions/workflows/test.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/test.yml)

**SparkTest** is a lightweight, developer-focused test orchestrator for Kubernetes. Define tests as Docker containers, run them as Kubernetes Jobs, and view results in a clean, modern UI — no YAML editing required.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Quick Start](#-quick-start)
  - [Frontend Development](#frontend-development)
  - [Backend Development](#backend-development)
  - [Running Tests on Kubernetes](#-want-to-run-tests-on-kubernetes)
  - [Demo Data](#-want-to-see-demo-data)
  - [Testing](#testing)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 📋 Prerequisites

Before getting started with SparkTest, ensure you have the following installed:

### Required
- **Node.js** 18+ and **pnpm** 8+ - For frontend development
- **Rust** 1.70+ - For backend development
- **Docker** - For containerized test execution
- **Git** - For version control

### Optional (for Kubernetes features)
- **kubectl** - Kubernetes command-line tool
- **k3d** or **minikube** - For local Kubernetes development
- **PostgreSQL** - For production deployments (SQLite used in development)

### System Requirements
- **Memory**: 4GB+ RAM recommended
- **Storage**: 2GB+ free space for dependencies and container images
- **OS**: Linux, macOS, or Windows with WSL2

---

## ✨ Features

- 🧪 **Test Definitions** – Reusable test configs with Docker image + command
- ⚙️ **Executors** – Predefined runners like K6, Postman, Playwright  
- 🚀 **Test Runs** – Launch containerized tests as Kubernetes Jobs
- 🧾 **Test Suites** – Group related tests and trigger them together
- 📂 **Git-backed Definitions** – Auto-register tests from `/tests/*.json`
- 💾 **Mock Mode** – Instant demo using localStorage
- 🦀 **Rust Backend** – Fast API layer using Axum + Kubernetes + PostgreSQL

---

## 🛠 Tech Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | Next.js 14 App Router, Tailwind, shadcn/ui |
| Backend    | Rust (Axum), PostgreSQL, Kubernetes      |
| Testing    | Vitest, Playwright                       |
| CI/CD      | GitHub Actions, pnpm                     |

---

## 🏗 Architecture Overview

SparkTest follows a modern, cloud-native architecture designed for scalability and developer experience:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Kubernetes    │
│   (Next.js)     │◄──►│   (Rust/Axum)   │◄──►│   Jobs/Pods     │
│                 │    │                 │    │                 │
│ • Test UI       │    │ • REST API      │    │ • Test Runners  │
│ • Results View  │    │ • Job Manager   │    │ • Log Streaming │
│ • Live Logs     │    │ • Storage Layer │    │ • Resource Mgmt │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌─────────────────┐
                         │   Storage       │
                         │ (PostgreSQL/    │
                         │  SQLite/        │
                         │  LocalStorage)  │
                         └─────────────────┘
```

### Key Components

- **Frontend**: React-based UI built with Next.js 14, providing real-time test execution monitoring
- **Backend**: High-performance Rust API using Axum framework for job orchestration and data management  
- **Kubernetes Integration**: Native K8s job execution with live log streaming and resource management
- **Storage Layer**: Flexible storage supporting PostgreSQL (production), SQLite (development), and LocalStorage (demo mode)
- **Test Definitions**: Git-backed test configurations auto-discovered from `/tests/*.json` files

---

## 🚀 Quick Start

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the UI.

### Backend Development

```bash
cd backend
cargo run
```

### 🎯 Want to Run Tests on Kubernetes?

**Quick Setup (5 minutes):**
```bash
# Install k3d (lightweight Kubernetes)
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Create a local cluster
k3d cluster create sparktest

# Restart the backend - it will auto-detect Kubernetes!
cd backend && cargo run
```

Now your tests will run as Kubernetes Jobs and you'll see live logs in the UI! 

📚 [More details in the Kubernetes guide](backend/KUBERNETES.md)

### 🎯 Want to See Demo Data?

SparkTest includes comprehensive demo data with realistic testing scenarios:

- **Realistic Test Scenarios**: Jest, Cypress, Playwright, K6, OWASP security scans
- **Working Test Examples**: Self-contained tests that actually run through K8s
- **Production-Ready Examples**: Real-world configurations and test outputs

📖 [See the complete Demo Data Guide](DEMO_DATA_GUIDE.md)

### Testing

```bash
cd frontend
pnpm test          # Run unit tests
pnpm test:coverage # Run tests with coverage
pnpm lint          # Run ESLint
pnpm type-check    # Run TypeScript checks
```

---

## 🤝 Contributing

We welcome contributions to SparkTest! This section provides comprehensive guidelines for contributing to the project.

### 🚀 Quick Contribution Workflow

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `main`
3. **Set up your development environment** (see below)
4. **Make your changes** following our code standards
5. **Test thoroughly** in both mock and Kubernetes modes
6. **Submit a pull request** with a clear description

### 🛠 Development Environment Setup

#### Initial Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sparktest.git
cd sparktest

# Install dependencies
pnpm install

# Build packages
pnpm build:packages
```

#### Frontend Development
```bash
# Start the frontend development server
pnpm dev:frontend
# or
cd apps/oss && pnpm dev

# Run in a new terminal for full-stack development
pnpm dev:backend
```

#### Backend Development
```bash
# Run the Rust backend
cargo run -p sparktest-bin

# Or use the npm script
pnpm dev:backend

# Run both frontend and backend concurrently
pnpm dev:all
```

#### Kubernetes Development (Optional)
```bash
# Set up local Kubernetes cluster
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
k3d cluster create sparktest-dev

# Verify connection
kubectl cluster-info
```

### 📝 Code Standards & Guidelines

#### TypeScript/JavaScript
- Use **TypeScript** for all new code
- Follow **Prettier** formatting (runs automatically)
- Use **ESLint** rules (fix with `pnpm lint`)
- Prefer **functional components** with hooks
- Use **shadcn/ui** components when possible

#### Rust
- Follow **rustfmt** formatting (`cargo fmt`)
- Use **Clippy** for linting (`cargo clippy`)
- Write **comprehensive tests** for new functionality
- Use **error handling** with proper Result types
- Document public APIs with rustdoc comments

#### General Guidelines
- Write **clear, descriptive commit messages**
- Keep commits **atomic and focused**
- Update documentation for user-facing changes
- Add tests for new features and bug fixes

### 🧪 Testing Requirements

All contributions must include appropriate tests and pass existing test suites.

#### Frontend Testing
```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

#### Backend Testing
```bash
# Run Rust tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_name
```

#### Integration Testing
- Test in **mock mode** (localStorage backend)
- Test with **Rust API backend**
- Test **Kubernetes integration** if applicable
- Verify **error handling** and edge cases

### 📋 Pull Request Process

#### Before Submitting
1. **Update from main** and resolve conflicts
2. **Run all tests** and ensure they pass
3. **Test manually** in both mock and API modes
4. **Update documentation** if needed
5. **Write descriptive PR title** and description

#### PR Requirements
- **Clear description** of changes and motivation
- **Link to related issues** (use "Fixes #123")
- **Screenshots** for UI changes
- **Test coverage** for new functionality
- **Breaking changes** clearly documented

#### Review Process
- All PRs require **at least one review**
- **CI checks** must pass (tests, linting, builds)
- **Merge conflicts** must be resolved
- **Documentation** updates may be requested

### 🐛 Issue Reporting Guidelines

#### Bug Reports
Please include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (OS, browser, versions)
- **Screenshots/logs** if applicable
- **Minimal reproduction** example if possible

#### Feature Requests
Please include:
- **Clear description** of the proposed feature
- **Use case and motivation** for the feature
- **Possible implementation** approach
- **UI mockups** for frontend features

### 🔄 Development Workflow

#### Branching Strategy
- `main` - Production-ready code
- `feature/feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/update-description` - Documentation updates

#### Commit Message Format
```
type(scope): brief description

- Detailed explanation if needed
- List of changes
- Reference issues: Fixes #123

Types: feat, fix, docs, style, refactor, test, chore
```

#### Release Process
- Features merged to `main` via PR
- Releases tagged with semantic versioning
- Changelog updated for each release
- CI/CD handles automated testing and deployment

### 💡 Getting Help

- **Questions?** Open a [Discussion](https://github.com/kevintatou/sparktest/discussions)
- **Bugs?** Create an [Issue](https://github.com/kevintatou/sparktest/issues)
- **Chat?** Join our development community
- **Docs?** Check the [Wiki](https://github.com/kevintatou/sparktest/wiki)

### 🎯 Good First Issues

Look for issues labeled `good first issue` for newcomer-friendly contributions:
- Documentation improvements
- UI/UX enhancements
- Test coverage improvements
- Bug fixes in mock mode

Thank you for contributing to SparkTest! 🚀

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Development
**Issue**: `pnpm dev` fails with module not found
```bash
# Solution: Rebuild packages
pnpm clean
pnpm build:packages
pnpm dev
```

**Issue**: TypeScript errors in development
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules/.cache
pnpm install
pnpm type-check
```

#### Backend Development
**Issue**: Rust compilation errors
```bash
# Solution: Update dependencies and rebuild
cargo clean
cargo build
```

**Issue**: Database connection failures
```bash
# Check if PostgreSQL is running (if using production mode)
# Or verify SQLite permissions in development
```

#### Kubernetes Integration
**Issue**: Jobs not appearing in Kubernetes
```bash
# Verify kubectl connection
kubectl cluster-info

# Check namespace
kubectl get jobs -A

# Verify permissions
kubectl auth can-i create jobs
```

**Issue**: Logs not streaming in UI
```bash
# Check backend logs for connection errors
# Verify Kubernetes RBAC permissions
# Ensure pods are in correct namespace
```

#### General
**Issue**: Tests failing inconsistently
- Clear browser cache and localStorage
- Restart development servers
- Check for port conflicts (3000, 8080)

**Issue**: Build failures in CI
- Ensure all dependencies are in package.json
- Check for environment-specific code
- Verify test stability across platforms

### Getting Support

If you encounter issues not covered here:
1. Check existing [Issues](https://github.com/kevintatou/sparktest/issues)
2. Search [Discussions](https://github.com/kevintatou/sparktest/discussions)
3. Create a new issue with detailed information

---

## 📄 License

MIT — see `LICENSE`

MIT — see `LICENSE`