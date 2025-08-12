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

**Required**: Node.js 18+, pnpm 8+, Rust 1.70+, Docker, Git  
**Optional**: kubectl, k3d/minikube (for Kubernetes), PostgreSQL (production)  
**System**: 4GB+ RAM, 2GB+ storage, Linux/macOS/Windows+WSL2

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

| Layer    | Tech                                       |
| -------- | ------------------------------------------ |
| Frontend | Next.js 14 App Router, Tailwind, shadcn/ui |
| Backend  | Rust (Axum), PostgreSQL, Kubernetes        |
| Testing  | Vitest, Playwright                         |
| CI/CD    | GitHub Actions, pnpm                       |

---

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Kubernetes    │
│   (Next.js)     │◄──►│   (Rust/Axum)   │◄──►│   Jobs/Pods     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend**: Next.js 14 UI for test execution monitoring
- **Backend**: Rust API for job orchestration and data management
- **Kubernetes**: Native job execution with live log streaming
- **Storage**: PostgreSQL (production), SQLite (dev), LocalStorage (demo)

---

## 🚀 Quick Start

### Frontend Development

```bash
cd apps/oss
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
cd apps/oss
pnpm test          # Run unit tests
pnpm test:coverage # Run with coverage
pnpm lint          # Run ESLint
pnpm type-check    # TypeScript checks
```

---

## 🤝 Contributing

### Quick Start

1. Fork and clone the repository
2. Set up development environment
3. Make changes following code standards
4. Test thoroughly in mock and Kubernetes modes
5. Submit pull request with clear description

### Development Setup

```bash
# Clone and install dependencies
git clone https://github.com/YOUR_USERNAME/sparktest.git
cd sparktest && pnpm install && pnpm build:packages

# Frontend development
cd apps/oss && pnpm dev

# Backend development (separate terminal)
cd backend && cargo run

# Kubernetes (optional)
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
k3d cluster create sparktest-dev
```

### Code Standards

- **TypeScript**: Use TypeScript, Prettier, ESLint, functional components
- **Rust**: Use rustfmt, Clippy, comprehensive tests, proper error handling
- **General**: Clear commit messages, atomic commits, update docs, add tests

### Testing

```bash
# Frontend
pnpm test && pnpm lint && pnpm type-check

# Backend
cargo test && cargo clippy
```

### Pull Request Requirements

- Update from main and resolve conflicts
- All tests pass (frontend + backend)
- Test manually in mock and API modes
- Clear description linking related issues
- Screenshots for UI changes

### Issue Reporting

**Bugs**: Steps to reproduce, expected vs actual behavior, environment details  
**Features**: Clear description, use case, possible implementation approach

For help: [Discussions](https://github.com/kevintatou/sparktest/discussions) | [Issues](https://github.com/kevintatou/sparktest/issues)

---

## 🔧 Troubleshooting

### Common Issues

**Frontend**: Module not found → `pnpm clean && pnpm build:packages && pnpm dev`  
**TypeScript errors**: Clear cache → `rm -rf .next node_modules/.cache && pnpm install`  
**Backend**: Compilation errors → `cargo clean && cargo build`  
**Kubernetes**: Jobs not appearing → `kubectl cluster-info && kubectl get jobs -A`  
**Tests failing**: Clear browser cache, restart servers, check port conflicts

For more help: [Issues](https://github.com/kevintatou/sparktest/issues) | [Discussions](https://github.com/kevintatou/sparktest/discussions)

---

## 🚀 Deployment

### Vercel (Frontend Only)

SparkTest is configured to **only deploy on releases** via Vercel. Automatic deployments on commits/PRs are disabled.

- **Manual deployments**: Disabled on all branches
- **Release deployments**: Enable by creating a GitHub release tag
- **Frontend app**: Only the Next.js app (`apps/oss`) is deployed to Vercel
- **Backend**: Deployed separately using self-hosted runners (see `.github/workflows/deploy.yml`)

To enable Vercel deployment for a release:

1. Create a release tag in GitHub: `git tag v1.0.0 && git push origin v1.0.0`
2. Create a release from the tag in GitHub UI
3. Vercel will automatically deploy the frontend

**Note**: The backend (Rust API) is not deployed to Vercel and requires separate hosting.

---

## 📄 License

MIT — see `LICENSE`
