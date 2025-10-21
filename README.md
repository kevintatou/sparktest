# ⚡ SparkTest OSS

[![CI](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml)
[![Test & Coverage](https://github.com/kevintatou/sparktest/actions/workflows/test.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/test.yml)

**SparkTest** is a lightweight, developer-focused test orchestrator for Kubernetes. Define tests as Docker containers, run them as Kubernetes Jobs, and view results in a clean, modern UI — no YAML editing required.

> **Note:** Portions of this codebase were developed with assistance from GitHub Copilot and other AI coding tools.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Quick Start](#-quick-start)
  - [Frontend Development](#frontend-development)
  - [Backend Development](#backend-development)
  - [Running Tests on Kubernetes](#-want-to-run-tests-on-kubernetes)
- [Usage Guide](#-usage-guide)
  - [Method 1: API/GUI Workflow](#method-1-apigui-workflow-recommended)
  - [Method 2: CRD Workflow](#method-2-crd-workflow-kubernetes-native)
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
- ☸️ **CRD Support** – Optional Kubernetes-native workflow with TestRun CRD

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
- **Storage**: PostgreSQL (production/development), LocalStorage (demo)

---

## 🚀 Quick Start

### 🐳 Full Stack Development (Recommended)

The easiest way to run SparkTest with PostgreSQL backend:

```bash
# Clone and start everything with Docker
git clone https://github.com/kevintatou/sparktest.git
cd sparktest
./start-dev.sh
```

This starts:

- **PostgreSQL** database on `:5432`
- **Rust backend** API on `:8080`
- **Next.js frontend** on `:3000`

Open [http://localhost:3000](http://localhost:3000) to see SparkTest with real database persistence.

### 🎯 Frontend-Only Development

For rapid UI development using localStorage (no backend required):

```bash
# Install dependencies and start frontend
pnpm install
pnpm dev
```

This starts the frontend on `:3000` with sample data from localStorage.

### 🦀 Backend Development

For backend-only development:

```bash
# Start PostgreSQL
docker run -d --name postgres-sparktest \
  -e POSTGRES_DB=sparktest \
  -e POSTGRES_USER=sparktest \
  -e POSTGRES_PASSWORD=sparktest_dev_password \
  -p 5432:5432 postgres:15-alpine

# Run backend
cd backend
RUST_LOG=debug DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest" \
cargo run --bin sparktest-bin
```

### 🐘 PostgreSQL Development Setup

SparkTest backend requires PostgreSQL (SQLite support has been removed for simplicity).

#### Option 1: Use Local PostgreSQL (Recommended)

```bash
# Install PostgreSQL if not already installed
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql  # macOS

# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Create database and user
sudo -u postgres psql
CREATE DATABASE sparktest;
CREATE USER sparktest WITH PASSWORD 'sparktest_dev_password';
GRANT ALL PRIVILEGES ON DATABASE sparktest TO sparktest;
\q

# Set environment variable
export DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest"

# Run backend
cd backend && cargo run --bin sparktest-bin
```

#### Option 2: Use Docker PostgreSQL

```bash
# Start PostgreSQL container (change port if 5432 is in use)
docker run -d --name sparktest-postgres \
  -e POSTGRES_DB=sparktest \
  -e POSTGRES_USER=sparktest \
  -e POSTGRES_PASSWORD=sparktest_dev_password \
  -p 5433:5432 \
  postgres:15-alpine

# Set environment variable
export DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5433/sparktest"

# Run backend
cd backend && cargo run --bin sparktest-bin
```

#### Option 3: Full Docker Development

```bash
# Use docker-compose for full stack (if ports are available)
docker-compose -f docker-compose.dev.yml up
```

### Legacy Development Sections

#### Frontend Development

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

---

## 📖 Usage Guide

SparkTest offers two ways to run tests: **API/GUI workflow** (traditional) and **CRD workflow** (Kubernetes-native).

### Method 1: API/GUI Workflow (Recommended)

The traditional approach using the REST API and web interface.

#### Step 1: Create a Test Definition

**Via GUI:**
1. Navigate to "Definitions" in the SparkTest UI
2. Click "New Definition"
3. Fill in:
   - **Name**: "K6 Load Test"
   - **Image**: `grafana/k6:latest`
   - **Commands**: `["run", "/scripts/test.js"]`
4. Save and note the generated `definitionId`

**Via API:**
```bash
curl -X POST http://localhost:8080/api/test-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "K6 Load Test",
    "description": "Load test for API endpoints",
    "image": "grafana/k6:latest",
    "commands": ["run", "/scripts/test.js"]
  }'

# Response includes: "id": "b7e6c1e2-1a2b-4c3d-8e9f-100000000006"
```

#### Step 2: Run the Test

**Via GUI:**
1. Navigate to "Runs"
2. Click "New Run" and select your definition
3. Add environment variables if needed
4. Click "Run Test"

**Via API:**
```bash
curl -X POST http://localhost:8080/api/test-runs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Load Test Run",
    "image": "grafana/k6:latest",
    "commands": ["run", "/scripts/test.js"]
  }'
```

### Method 2: CRD Workflow (Kubernetes-Native)

For teams preferring declarative Kubernetes manifests.

#### Prerequisites

1. **Install the TestRun CRD:**
   ```bash
   kubectl apply -f k8s/crd/testrun.yaml
   ```

2. **Set up RBAC permissions:**
   ```bash
   kubectl apply -f k8s/controller-rbac.yaml
   ```

3. **Build and deploy the controller:**
   ```bash
   # Build the controller image
   cd backend/controller
   docker build -t sparktest-controller:latest .
   
   # Load into your cluster (for k3d/kind)
   k3d image import sparktest-controller:latest -c your-cluster-name
   # OR for kind: kind load docker-image sparktest-controller:latest
   
   # Deploy the controller
   kubectl apply -f k8s/controller-deployment.yaml
   ```
   
   See `k8s/CRD_README.md` for detailed instructions.

#### Step 1: Create a Test Definition (Same as Method 1)

You still need to create a test definition first via GUI or API:

```bash
# Create definition via API
curl -X POST http://localhost:8080/api/test-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "K6 Load Test",
    "description": "Load test for API endpoints",
    "image": "grafana/k6:latest",
    "commands": ["run", "/scripts/test.js"]
  }'

# Save the returned definitionId: b7e6c1e2-1a2b-4c3d-8e9f-100000000006
```

#### Step 2: Create a TestRun CRD

Create a `testrun.yaml` file:

```yaml
apiVersion: sparktest.dev/v1alpha1
kind: TestRun
metadata:
  name: k6-load-test-001
  namespace: sparktest
spec:
  # Reference the definition ID from Step 1
  definitionId: b7e6c1e2-1a2b-4c3d-8e9f-100000000006
  
  # Optional: Override environment variables
  env:
    TARGET_URL: https://api.example.com
    TEST_DURATION: "30s"
    VUS: "10"
  
  # Optional: Set timeout (in seconds)
  timeoutSeconds: 900
  
  # Optional: Auto-cleanup after completion
  ttlSecondsAfterFinished: 3600
```

Apply the TestRun:

```bash
kubectl apply -f testrun.yaml
```

#### Step 3: Monitor the Test

**Via kubectl:**
```bash
# Check status
kubectl get testrun k6-load-test-001 -n sparktest

# Get detailed info
kubectl describe testrun k6-load-test-001 -n sparktest

# Watch for updates
kubectl get testrun k6-load-test-001 -n sparktest -w
```

**Via SparkTest UI:**
- The run appears automatically in the "Runs" page
- Look for the blue **CRD** badge next to the run name
- Click the run to see kubectl commands and Kubernetes details

### Comparison: API/GUI vs CRD

| Feature | API/GUI Workflow | CRD Workflow |
|---------|-----------------|--------------|
| **Setup** | None (default) | Requires CRD + controller |
| **Test Creation** | GUI or `curl` | `kubectl apply` |
| **Version Control** | JSON in Git | YAML in Git |
| **Monitoring** | SparkTest UI | kubectl + SparkTest UI |
| **Best For** | Quick testing, UI-first teams | GitOps, K8s-native teams |

### Common Workflows

**Reusing a Definition:**
```bash
# Create definition once
DEFINITION_ID=$(curl -X POST ... | jq -r '.id')

# Run it multiple times with different configs

# Via API:
curl -X POST http://localhost:8080/api/test-runs -d "..."

# Via CRD:
kubectl apply -f testrun-staging.yaml  # definitionId: $DEFINITION_ID
kubectl apply -f testrun-prod.yaml     # definitionId: $DEFINITION_ID
```

**Cleaning up:**
```bash
# API: Delete via UI or
curl -X DELETE http://localhost:8080/api/test-runs/{runId}

# CRD: Delete via kubectl
kubectl delete testrun k6-load-test-001 -n sparktest
```

📚 For detailed CRD documentation, see [k8s/CRD_README.md](k8s/CRD_README.md)

---

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
