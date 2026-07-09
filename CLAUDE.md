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
├── supabase/              # Supabase project link for the Vercel demo store
└── k8s/                   # Kubernetes manifests (CRD, RBAC, examples)
```

### Three Deployment Modes — Read This Before Touching `apps/oss/app/api/*`

Every route under `apps/oss/app/api/**/route.ts` (test-definitions, test-runs, test-suites, test-executors, runs) implements the **same branching pattern**, decided per-request:

1. **Supabase demo store** (used by the public Vercel deployment at sparktest-oss.vercel.app): if `isDemoStoreEnabled()` (from `apps/oss/lib/demo-store.ts`) returns true — i.e. `SPARKTEST_SUPABASE_URL` and `SPARKTEST_SUPABASE_SERVICE_ROLE_KEY` are both set — the route talks directly to Supabase's PostgREST API instead of the Rust backend. `demo-store.ts` owns all the row-mapping (snake_case DB rows → camelCase API shapes) and fakes run progression/log output based on row age (`getDemoRunStatus`/`getDemoLogs`) since there's no real Kubernetes execution behind this mode.
2. **Real Rust backend** (self-hosted / local dev): fallback path — `fetch`es `${NEXT_PUBLIC_BACKEND_URL}/api/...` (defaults to `http://localhost:8080`).
3. There is **no client-side localStorage mock mode anymore** — `getFromStorage`/`setToStorage` still exist in `packages/core/src/utils.ts` but are dead code, referenced only by their own unit test. Do not build new features assuming a mock-mode toggle exists client-side.

Writes (`POST`/`PATCH`/`DELETE`) on the demo-store path additionally require a bearer token: `apps/oss/lib/api-auth.ts`'s `requireDemoWriteToken()` checks the `Authorization: Bearer <token>` header against `SPARKTEST_DEMO_WRITE_TOKEN`. If that env var is unset, the check is a no-op (open writes) — this is only meant to be set on the public Vercel deployment.

**When adding a new API route or field**, mirror the existing branch structure (check `isDemoStoreEnabled()` first, add a mapper in `demo-store.ts`, then fall back to the Rust backend fetch) rather than inventing a new pattern.

### Data Flow (Rust backend mode)

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

**Important**: The Next.js API routes (`apps/oss/app/api/**`) act as a thin proxy/BFF layer — see "Three Deployment Modes" above. CRD runs show a blue "CRD" badge in the UI.

## Common Development Commands

### Quickstart (verified, no Docker Compose required)

```bash
docker run -d --name sparktest-postgres \
  -e POSTGRES_DB=sparktest -e POSTGRES_USER=sparktest \
  -e POSTGRES_PASSWORD=sparktest_dev_password \
  -p 5432:5432 postgres:15-alpine

export DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest"
cargo run -p sparktest-bin      # :8080, auto-migrates on startup

pnpm install && pnpm build:packages
pnpm dev                        # :3000, defaults to talking to localhost:8080
```

No frontend env vars needed for this path. See `.env.example` / `apps/oss/.env.example` for the full list.

### Full Stack Development (Docker Compose alternative)

```bash
# Start everything (PostgreSQL + backend + frontend) with Docker
./start-dev.sh

# Frontend on :3000, backend on :8080, PostgreSQL on :5432
# Works with either `docker compose` (plugin) or `docker-compose` (standalone binary).
# Kubernetes/minikube mounts are optional and overridable via KUBE_CONFIG_DIR / MINIKUBE_HOME.
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
pnpm test                # Unit tests (Vitest) — runs build:packages first
pnpm test:coverage       # With coverage report (apps/oss only)
pnpm lint               # ESLint (packages + apps/oss)
pnpm type-check         # TypeScript checks (packages + apps/oss)

# Run a single test file (from apps/oss/)
cd apps/oss && npx vitest run __tests__/path/to/file.test.ts
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

# Run all backend tests
cargo test
cargo test -p sparktest-core   # Single crate
cargo test -p sparktest-core some_test_name  # Single test

cargo clippy --all-targets -- -D warnings   # Linting (CI-equivalent)
cargo fmt                                    # Format code
cargo fmt --check --all                      # Check formatting only

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

There's also a `minikube` path — see `scripts/minikube-up.sh` and the `.minikube/` directory for a local minikube-based alternative to k3d.

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
# Run all checks (frontend + backend) — mirrors CI
pnpm check              # format, lint, types, build, test
pnpm ci                 # pnpm check + coverage

# Frontend only
pnpm lint:all           # Lint + format check
pnpm fix               # Auto-fix formatting and lint issues

# Backend only
cargo fmt --check --all
cargo clippy --all-targets -- -D warnings
```

Changesets (`pnpm changeset`, `pnpm changeset:version`, `pnpm changeset:publish`) drive NPM package versioning for `@tatou/core`/`@tatou/ui`; `./scripts/cargo-changeset.sh` (aliased as `pnpm cargo-changeset*`) does the equivalent for the Rust crates. See `CHANGESET_WORKFLOW.md` if you need the full release flow.

## Database

- **Production**: PostgreSQL 15+ (SQLx with compile-time query verification)
- **Migrations**: Embedded in backend binary, run automatically on startup
- **Schema**: Located in `backend/api/migrations/` (SQLx format)
- **Public demo deployment**: uses Supabase Postgres via PostgREST instead — see "Three Deployment Modes" above. Its schema is managed independently through the linked project in `supabase/`, not the SQLx migrations.

Key tables (Rust backend):
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
- Docker Compose for full-stack testing against the real Rust backend
- k3d/minikube for Kubernetes integration testing
- The Supabase demo path can't be exercised meaningfully in local dev without setting `SPARKTEST_SUPABASE_URL`/`SPARKTEST_SUPABASE_SERVICE_ROLE_KEY`; local dev without those falls through to the Rust backend fetch path

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
   - Update the mapper (e.g. `mapDefinition`) in `apps/oss/lib/demo-store.ts` so the Supabase demo path stays in sync

### Adding a New API Endpoint

1. Create handler in `backend/api/src/handlers.rs`
2. Add route in `backend/api/src/routes.rs`
3. Mount route in `backend/bin/src/main.rs`
4. Add TypeScript type in `packages/core/src/types.ts`
5. Add the corresponding Next.js route in `apps/oss/app/api/**/route.ts`, following the existing `isDemoStoreEnabled()` → Supabase, else `fetch(BACKEND_URL)` branch pattern; guard writes with `requireDemoWriteToken()`
6. Create React Query hook in frontend component

### CRD Workflow Changes

1. Update CRD spec in `backend/controller/src/crd.rs`
2. Regenerate YAML: Update `k8s/crd/testrun.yaml` manually (no codegen)
3. Update controller reconciler in `backend/controller/src/reconciler.rs`
4. Test with example: `kubectl apply -f k8s/examples/testrun-example.yaml`

## Deployment

- **Frontend (public demo)**: Vercel, deployed via `.github/workflows/deploy-vercel.yml` on GitHub release publish (or manual `workflow_dispatch`). Backed by Supabase, not the Rust backend — see "Three Deployment Modes".
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
- `NEXT_PUBLIC_BACKEND_URL` - Rust backend API URL (defaults to `http://localhost:8080`); used when the Supabase demo store is not configured
- `SPARKTEST_SUPABASE_URL` / `SPARKTEST_SUPABASE_SERVICE_ROLE_KEY` - When both are set, Next.js API routes serve data from Supabase instead of the Rust backend (public demo mode)
- `SPARKTEST_DEMO_WRITE_TOKEN` - If set, required as a `Bearer` token on write requests to the demo-store routes; unset means open writes

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

### Frontend API routes returning unexpected data locally
- If `SPARKTEST_SUPABASE_URL`/`SPARKTEST_SUPABASE_SERVICE_ROLE_KEY` are set in your local `.env`, the Next.js API routes will silently read/write Supabase instead of your local Rust backend — unset them for local backend development.

## Key Files to Know

- `README.md` - User-facing documentation
- `FLOW_DIAGRAM.md` - Complete CRD workflow visualization
- `backend/KUBERNETES.md` - K8s integration quick start
- `k8s/CRD_README.md` - CRD installation and usage guide
- `DEMO_DATA_GUIDE.md` - Sample test scenarios
- `CHANGESET_WORKFLOW.md` - NPM/Cargo release process via changesets
- `apps/oss/lib/demo-store.ts` - Supabase-backed demo store implementation (public Vercel deployment)
