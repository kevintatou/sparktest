# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SparkTest is a lightweight, developer-focused test orchestrator for Kubernetes. It allows users to define tests as Docker containers, run them as Kubernetes Jobs, and view results in a modern UI.

## Architecture

### Monorepo Structure

SparkTest uses a **pnpm workspace** for frontend/packages and **Cargo workspace** for Rust backend:

```
sparktest/
├── apps/oss/              # Next.js 14 frontend (App Router)
├── packages/
│   ├── core/             # Shared TypeScript types
│   └── ui/               # Shared React components
├── backend/
│   ├── core/             # Rust models and database logic
│   ├── api/              # Axum HTTP handlers and routes
│   ├── bin/              # Main backend binary
│   └── controller/       # Kubernetes CRD controller (optional)
└── k8s/                  # Kubernetes manifests (CRD, RBAC, examples)
```

### Data Flow

1. **Dual Entry Points**:
   - **API/GUI**: Users create test runs via Next.js UI → Axum API → PostgreSQL
   - **CRD** (optional): Users `kubectl apply` TestRun CRD → Controller watches CRD → Creates Job + POSTs to API

2. **Test Execution**:
   - Backend creates Kubernetes Job from test definition
   - Job runs test container (K6, Playwright, etc.)
   - Logs streamed to frontend via polling
   - Status updates tracked in PostgreSQL

3. **Key Concepts**:
   - **Test Definition**: Reusable test config (image + commands)
   - **Executor**: Predefined test runner (K6, Postman, Playwright)
   - **Test Run**: Single execution instance of a test
   - **Test Suite**: Group of related test definitions

### Backend Architecture (Rust)

- **sparktest-core**: Models (`TestRun`, `TestDefinition`, etc.) and database logic (SQLx)
- **sparktest-api**: Axum HTTP layer with handlers for CRUD operations and K8s integration
- **sparktest-bin**: Main server binary that starts Axum on port 8080
- **sparktest-controller**: Optional CRD controller for Kubernetes-native workflows

**Important**: Backend uses `RunOrigin` enum to distinguish between API-created runs (`Api`) and CRD-created runs (`Crd`). CRD runs include `k8s_ref` with namespace/name for linking back to TestRun CRD.

### Frontend Architecture (TypeScript/React)

- **Next.js 14 App Router**: File-based routing in `apps/oss/app/`
- **State Management**: React Query (@tanstack/react-query) for API calls
- **UI Components**: shadcn/ui components in `apps/oss/components/ui/`
- **Shared Packages**:
  - `@tatou/core`: TypeScript types matching Rust backend models
  - `@tatou/ui`: Reusable components

**Important**: Frontend can run in "mock mode" (localStorage) or "API mode" (real backend). CRD runs show a blue "CRD" badge in the UI.

## Common Development Commands

### Full Stack Development

```bash
# Start everything (PostgreSQL + backend + frontend) with Docker
./start-dev.sh

# Frontend on :3000, backend on :8080, PostgreSQL on :5432
```

### Frontend Development

```bash
# Install dependencies (run from root)
pnpm install

# Build shared packages before first frontend dev run
pnpm build:packages

# Start Next.js dev server (from root)
pnpm dev
# OR from apps/oss/
cd apps/oss && pnpm dev

# Run tests
pnpm test                # Unit tests (Vitest)
pnpm test:coverage       # With coverage report
pnpm lint               # ESLint
pnpm type-check         # TypeScript checks
```

### Backend Development

```bash
# Start PostgreSQL first (if not using Docker)
docker run -d --name sparktest-postgres \
  -e POSTGRES_DB=sparktest \
  -e POSTGRES_USER=sparktest \
  -e POSTGRES_PASSWORD=sparktest_dev_password \
  -p 5432:5432 postgres:15-alpine

# Set database URL
export DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest"

# Run backend (from root)
pnpm dev:backend
# OR
cargo run -p sparktest-bin

# Run tests
cargo test              # All backend tests
cargo test -p sparktest-core  # Core tests only
cargo clippy            # Linting
cargo fmt              # Format code

# Run controller (optional, requires CRD setup)
cargo run -p sparktest-controller
```

### Kubernetes Setup (Optional)

```bash
# Create local k3d cluster
k3d cluster create sparktest

# Install TestRun CRD
kubectl apply -f k8s/crd/testrun.yaml

# Deploy controller (after building image)
kubectl apply -f k8s/controller-rbac.yaml
kubectl apply -f k8s/controller-deployment.yaml
```

### Build Commands

```bash
# Build everything
pnpm build:packages     # Build @tatou/core and @tatou/ui
pnpm build:app          # Build Next.js app
cargo build            # Build Rust backend

# Production builds
cargo build --release
pnpm build:app
```

### Quality Checks

```bash
# Run all checks (frontend + backend)
pnpm check              # Format, lint, types, build, test

# Frontend only
pnpm lint:all           # Lint + format check
pnpm fix               # Auto-fix formatting and lint issues

# Backend only
cargo fmt --check       # Check Rust formatting
cargo clippy -- -D warnings  # Lint with warnings as errors
```

## Database

- **Production**: PostgreSQL 15+ (SQLx with compile-time query verification)
- **Migrations**: Embedded in backend binary, run automatically on startup
- **Schema**: Located in `backend/api/migrations/` (SQLx format)

Key tables:
- `test_definitions` - Reusable test configs
- `executors` - Predefined test runners
- `test_runs` - Execution history with K8s job status
- `test_suites` - Groupings of test definitions

**Important**: Backend automatically creates tables on first run. No manual migration commands needed.

## Testing Strategy

### Frontend
- **Unit Tests**: Vitest with React Testing Library
- **Coverage**: Minimum 70% line coverage (enforced in CI)
- **Location**: `apps/oss/__tests__/`

### Backend
- **Unit Tests**: Rust `#[test]` and `#[tokio::test]`
- **Integration Tests**: In `tests/` directories within each crate
- **Coverage**: 18+ tests across core, api, and controller

### Manual Testing
- Mock mode for rapid UI iteration (no backend needed)
- Docker Compose for full-stack testing
- k3d for Kubernetes integration testing

## Kubernetes Integration

SparkTest supports two modes:

1. **Standard Mode** (always available):
   - Backend creates K8s Jobs using kubectl/kube-rs
   - Frontend displays logs via backend API

2. **CRD Mode** (optional):
   - Users `kubectl apply` TestRun CRD manifests
   - Controller watches TestRun resources and creates Jobs
   - Frontend shows CRD badge and kubectl commands

**Key Implementation Details**:
- Backend auto-detects Kubernetes using `~/.kube/config`
- Jobs run in same namespace as backend (or specified namespace)
- Job cleanup happens automatically after completion
- Controller requires RBAC setup (see `k8s/controller-rbac.yaml`)

## Important Patterns

### Adding a New Test Definition Field

1. **Backend**:
   - Update `TestDefinition` struct in `backend/core/src/models.rs`
   - Add SQL migration in `backend/api/migrations/`
   - Update create/update handlers in `backend/api/src/handlers.rs`

2. **Frontend**:
   - Update `TestDefinition` interface in `packages/core/src/types.ts`
   - Rebuild packages: `pnpm build:packages`
   - Update form in `apps/oss/components/TestDefinitionForm/`

### Adding a New API Endpoint

1. Create handler in `backend/api/src/handlers.rs`
2. Add route in `backend/api/src/routes.rs`
3. Mount route in `backend/bin/src/main.rs`
4. Add TypeScript type in `packages/core/src/types.ts`
5. Create React Query hook in frontend component

### CRD Workflow Changes

1. Update CRD spec in `backend/controller/src/crd.rs`
2. Regenerate YAML: Update `k8s/crd/testrun.yaml` manually (no codegen)
3. Update controller reconciler in `backend/controller/src/reconciler.rs`
4. Test with example: `kubectl apply -f k8s/examples/testrun-example.yaml`

## Deployment

- **Frontend**: Vercel (deploys on GitHub releases only)
- **Backend**: Self-hosted via GitHub Actions (see `.github/workflows/deploy.yml`)
- **Production Config**: Uses environment variables for DB connection and K8s access

## Port Configuration

- Frontend: `3000` (Next.js dev server)
- Backend: `8080` (Axum API)
- PostgreSQL: `5432` (standard)

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string (required)
- `RUST_LOG` - Logging level (debug, info, warn, error)
- `PORT` - Override default port 8080

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to `http://localhost:8080`)

## Troubleshooting

### "Module not found" errors in frontend
```bash
pnpm clean && pnpm build:packages && pnpm dev
```

### Backend compilation errors
```bash
cargo clean && cargo build
```

### Tests not running in Kubernetes
- Check `kubectl cluster-info` works
- Verify backend logs for K8s connection status
- Check `/api/k8s/health` endpoint returns `kubernetes_connected: true`

### CRD controller not creating Jobs
- Verify CRD installed: `kubectl get crd testruns.sparktest.dev`
- Check RBAC: `kubectl get clusterrole sparktest-controller`
- View controller logs: `kubectl logs -n sparktest deployment/sparktest-controller`

## Key Files to Know

- `README.md` - User-facing documentation
- `FLOW_DIAGRAM.md` - Complete CRD workflow visualization
- `backend/KUBERNETES.md` - K8s integration quick start
- `k8s/CRD_README.md` - CRD installation and usage guide
- `DEMO_DATA_GUIDE.md` - Sample test scenarios
