# TestRun CRD Flow Diagram

## Complete End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          User Actions                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Option 1: API/GUI (Traditional)                                       │
│  ┌──────────────┐                                                      │
│  │ POST /runs   │ ────────────────┐                                    │
│  └──────────────┘                 │                                    │
│                                   ▼                                    │
│  Option 2: CRD (Kubernetes)      ┌────────────────────┐               │
│  ┌──────────────┐                │  SparkTest Backend │               │
│  │kubectl apply │ ──┐             │  (Rust/Axum)       │               │
│  │testrun.yaml  │   │             └────────────────────┘               │
│  └──────────────┘   │                      │                          │
│                     │                      │ Creates                  │
└─────────────────────┼──────────────────────┼──────────────────────────┘
                      │                      │
                      │                      ▼
┌─────────────────────┼──────────────┌──────────────┐
│  Kubernetes         │              │ Postgres DB  │
│                     │              └──────────────┘
│  ┌─────────────┐    │                     ▲
│  │  TestRun    │◄───┘                     │
│  │  CRD        │                          │
│  │  Resource   │                          │
│  └──────┬──────┘                          │
│         │ watched by                      │
│         │                                 │
│  ┌──────▼───────────┐                     │
│  │   Controller     │                     │
│  │   (Rust/kube-rs) │                     │
│  └──────┬───────────┘                     │
│         │                                 │
│         ├─────────────────────────────────┘
│         │  POSTs run with origin=crd
│         │
│         ├───► Fetches test definition
│         │
│         ▼
│  ┌──────────────┐
│  │  Kubernetes  │
│  │  Job         │
│  └──────┬───────┘
│         │
│         │ Runs
│         ▼
│  ┌──────────────┐
│  │  Pod         │
│  │  (test exe)  │
│  └──────┬───────┘
│         │
│         │ Updates status
│         ▼
│  ┌──────────────┐
│  │  TestRun     │
│  │  .status     │
│  └──────────────┘
│
└─────────────────────────────────────────────────┐
                                                  │
                                                  │
┌─────────────────────────────────────────────────▼────┐
│  Frontend (Next.js/React)                            │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  Runs List                                   │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ ✓ Test Run ABC123                   │    │    │
│  │  │   [completed]                        │    │    │
│  │  ├─────────────────────────────────────┤    │    │
│  │  │ ⟳ TestRun: k6-smoke-001 [CRD]      │    │    │
│  │  │   [running]                         │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  Run Details (CRD runs)                      │    │
│  │                                              │    │
│  │  Source: Started from TestRun CRD           │    │
│  │  ┌────────────────────────────────────┐     │    │
│  │  │ Namespace: sparktest [📋]         │     │    │
│  │  │ TestRun Name: k6-smoke-001 [📋]   │     │    │
│  │  │                                    │     │    │
│  │  │ kubectl Commands:                  │     │    │
│  │  │ $ kubectl get testrun ... [📋]    │     │    │
│  │  │ $ kubectl describe testrun ... [📋]│     │    │
│  │  └────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Data Flow

### 1. CRD Creation
```yaml
apiVersion: sparktest.dev/v1alpha1
kind: TestRun
metadata:
  name: k6-smoke-001
  namespace: sparktest
spec:
  definitionId: b7e6c1e2-1a2b-4c3d-8e9f-100000000006
  env:
    TARGET_URL: https://api.example.com
  timeoutSeconds: 900
```

### 2. Controller Reconciliation
```rust
// Watch for TestRun resources
Controller::new(testruns, Config::default())
  .run(reconcile, error_policy, context)
  
// On create:
// 1. Fetch definition from backend
// 2. Build Job with env vars
// 3. Create Job in Kubernetes
// 4. POST to backend with origin=crd
// 5. Update TestRun status
```

### 3. Backend Storage
```sql
INSERT INTO test_runs (
  id, name, image, command, status,
  origin,           -- 'crd'
  k8s_ref_namespace,  -- 'sparktest'
  k8s_ref_name        -- 'k6-smoke-001'
) VALUES (...)
```

### 4. API Response
```json
{
  "id": "...",
  "name": "TestRun: k6-smoke-001",
  "status": "running",
  "origin": "crd",
  "k8sRef": {
    "namespace": "sparktest",
    "name": "k6-smoke-001"
  }
}
```

### 5. Frontend Rendering
```tsx
// In RunsList
{run.origin === "crd" && (
  <span className="...">CRD</span>
)}

// In RunDetails
<CrdSourceDetails run={run} />
```

## Status Updates

```
TestRun Status       Job Status          Backend Status
──────────────       ──────────          ──────────────
Pending       ──┐
                │──► Job Created  ──┐
Running       ◄─┘                   │──► running
                                    │
Succeeded     ◄──── Job Succeeded ──┘──► completed
Failed        ◄──── Job Failed    ────► failed
TimedOut      ◄──── Deadline Hit  ────► failed
```

## Component Architecture

```
sparktest/
├── backend/
│   ├── core/              # Models (RunOrigin, K8sRef)
│   ├── api/               # REST handlers
│   ├── controller/        # CRD controller
│   │   ├── src/
│   │   │   ├── crd.rs     # TestRun CRD definition
│   │   │   ├── reconciler.rs  # Reconciliation logic
│   │   │   └── lib.rs     # Controller runner
│   │   └── Cargo.toml
│   └── migrations/        # SQL migrations
├── k8s/
│   ├── crd/
│   │   └── testrun.yaml   # CRD manifest
│   ├── examples/
│   │   └── testrun-example.yaml
│   └── CRD_README.md      # Documentation
├── packages/
│   └── core/
│       └── src/
│           └── types.ts   # Run interface
└── apps/
    └── oss/
        └── components/
            ├── test-runs-list.tsx  # CRD badge
            └── RunDetails/
                └── CrdSourceDetails.tsx  # Source info
```

## Test Coverage

```
Backend (Rust)          Frontend (TypeScript)
──────────────          ─────────────────────
✅ 7 API tests          ⏸️ UI tests (deferred)
✅ 5 Controller tests   ⏸️ Integration tests
✅ 6 Core tests         
──────────────          
✅ 18 total passing     
```

## Key Features

1. **Dual Entry Points**
   - API/GUI (primary, existing)
   - CRD (optional, new)

2. **Unified Storage**
   - Same `test_runs` table
   - `origin` field distinguishes source
   - `k8sRef` links to CRD resource

3. **Status Sync**
   - Controller watches Job
   - Updates TestRun.status
   - Backend reflects current state

4. **UI Integration**
   - CRD badge for identification
   - Source details with kubectl commands
   - Same UI for all runs

5. **Clean Separation**
   - CRD logic isolated in controller
   - Backend remains API-focused
   - Frontend agnostic to source
