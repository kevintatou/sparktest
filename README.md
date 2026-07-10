# ⚡ SparkTest OSS

[![CI](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml)
[![Test & Coverage](https://github.com/kevintatou/sparktest/actions/workflows/test.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/test.yml)

**SparkTest** is a lightweight, developer-focused test orchestrator for Kubernetes. Define tests as Docker containers, run them as Kubernetes Jobs, and view results in a clean, modern UI — no YAML editing required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kevintatou/sparktest&root-directory=apps/oss&env=NEXT_PUBLIC_BACKEND_URL,SPARKTEST_SUPABASE_URL,SPARKTEST_SUPABASE_SERVICE_ROLE_KEY&envDescription=Frontend-only+deploy.+Either+point+NEXT_PUBLIC_BACKEND_URL+at+a+running+SparkTest+backend%2C+or+set+the+two+SPARKTEST_SUPABASE_*+vars+to+back+it+with+Supabase+instead.&project-name=sparktest-oss)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https://github.com/kevintatou/sparktest)
[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/kevintatou/sparktest/tree/main)

Vercel deploys the frontend only. Railway/DO deploy the full stack (Postgres + Rust backend + frontend) but can't give you a real Kubernetes API — run `scripts/provision-k3s-vps.sh` against any cheap VPS and paste the resulting kubeconfig into the backend's `KUBECONFIG` env var to actually execute tests as Jobs. See [Deployment](#-deployment) for details.

## ✨ Features

- 🧪 **Test Definitions** – Reusable test configs with Docker image + command
- ⚙️ **Executors** – Predefined runners like K6, Postman, Playwright
- 🚀 **Test Runs** – Launch containerized tests as Kubernetes Jobs
- 🧾 **Test Suites** – Group related tests and trigger them together
- 📂 **Git-backed Definitions** – Auto-register tests from `/tests/*.json`
- 🦀 **Rust Backend** – Fast API layer using Axum + Kubernetes + PostgreSQL
- ☸️ **CRD Support** – Optional Kubernetes-native workflow with TestRun CRD

**Stack:** Next.js 14 + Tailwind + shadcn/ui (frontend) · Rust/Axum + PostgreSQL + Kubernetes (backend) · Vitest/Playwright (testing)

## 🚀 Quick Start

Three steps, no Docker Compose required:

```bash
# 1. Start PostgreSQL (change the host port if 5432 is taken)
docker run -d --name sparktest-postgres \
  -e POSTGRES_DB=sparktest -e POSTGRES_USER=sparktest \
  -e POSTGRES_PASSWORD=sparktest_dev_password \
  -p 5432:5432 postgres:15-alpine

# 2. Start the Rust backend (auto-runs migrations, serves :8080)
export DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest"
cargo run -p sparktest-bin

# 3. Start the frontend (serves :3000, defaults to talking to localhost:8080)
pnpm install && pnpm build:packages && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No frontend env vars needed — see `.env.example` / `apps/oss/.env.example` for the full optional list.

Port `5432`/`3000`/`8080` already in use (e.g. a local Postgres install, or another dev server)? Change the `-p` host port and matching `DATABASE_URL` in step 1/2, or set `PORT`/`NEXT_PUBLIC_BACKEND_URL` for the backend/frontend — Next.js also auto-picks the next free port (3001, ...) if 3000 is busy.

**Prefer one command?** `./start-dev.sh` starts the same three pieces via Docker Compose instead (works with either `docker compose` or `docker-compose`).

**Want tests to actually run?** Install [k3d](https://k3d.io) (`curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash`), run `k3d cluster create sparktest`, then restart the backend — it auto-detects Kubernetes via `~/.kube/config`. Full walkthrough: [backend/KUBERNETES.md](backend/KUBERNETES.md).

## 📖 Usage

Create a test definition (image + commands), then run it — via the UI ("Definitions" → "New Definition" → "Run") or the API:

```bash
curl -X POST http://localhost:8080/api/test-definitions \
  -H "Content-Type: application/json" \
  -d '{"name": "K6 Load Test", "image": "grafana/k6:latest", "commands": ["run /scripts/test.js"]}'
```

`commands` is a list of shell command strings run under `sh -c "cmd1 && cmd2 && ..."` — not argv, so `["echo hello"]` not `["echo", "hello"]`.

Prefer declarative, GitOps-style test runs? SparkTest also supports a Kubernetes-native **TestRun CRD** workflow (`kubectl apply -f testrun.yaml`) — see [k8s/CRD_README.md](k8s/CRD_README.md) for installation and usage. Demo data with realistic scenarios (Jest, Cypress, K6, OWASP scans) is described in [docs/DEMO_DATA_GUIDE.md](docs/DEMO_DATA_GUIDE.md).

## 🧪 Testing

```bash
# Frontend
cd apps/oss && pnpm test && pnpm lint && pnpm type-check

# Backend
cargo test && cargo clippy

# Everything (mirrors CI)
pnpm check
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 🔧 Troubleshooting

**Frontend module not found**: `pnpm clean && pnpm build:packages && pnpm dev`
**Backend compilation errors**: `cargo clean && cargo build`
**Kubernetes Jobs not appearing**: `kubectl cluster-info && kubectl get jobs -A`, check `/api/k8s/health` returns `kubernetes_connected: true`

## 🚀 Deployment

- **Public demo (Vercel)**: deploys `apps/oss` only, on GitHub release publish. Backed by Supabase (see `apps/oss/lib/demo-store.ts`), not the Rust backend.
- **Full stack (Railway / DigitalOcean)**: one-click via the buttons above, from `railway.json` / `.do/app.yaml`. Test execution requires an external Kubernetes cluster — see `scripts/provision-k3s-vps.sh`.

## 📄 License

MIT — see `LICENSE`
