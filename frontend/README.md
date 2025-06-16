Got it! You want a **fully-polished OSS README** that reflects the **final vision for the open-source project**, not the SaaS version — and **Test Suites should be included** because they *are* part of the OSS roadmap.

Here's your corrected and focused **README.md**, aligned with that:

---

````markdown
# ⚡ SparkTest OSS

**SparkTest** is a lightweight, developer-focused test orchestrator for Kubernetes. Define tests as Docker containers, run them as Kubernetes Jobs, and view results with a clean UI — no YAML editing required.

---

## ✨ Features

- 🧪 **Test Definitions** – Reusable test configs with Docker image + command
- 🚀 **Test Runs** – Launch containerized tests as Kubernetes Jobs
- 🎯 **Test Suites** – Group related tests and trigger them together
- ⚙️ **Executors** – Predefined test runners (e.g. K6, Postman, Playwright)
- 📂 **Git-Backed Definitions** – Auto-register tests from GitHub push events
- 🧾 **Run History** – View past test results, duration, and status
- 🦀 **Rust Backend** – Fast API layer with Kubernetes + PostgreSQL
- 💾 **Local Mock Mode** – Works out of the box using localStorage

---

## 🛠 Architecture

| Layer        | Tech                                 |
|--------------|--------------------------------------|
| Frontend     | Next.js 14 (App Router) + Tailwind + shadcn/ui |
| Backend      | Rust + Axum + SQLx + Kubernetes client |
| Database     | PostgreSQL (optional, used with Rust backend) |
| Dev Mode     | localStorage-based mock API          |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/sparktest
cd sparktest
npm install
````

### 2. Start Dev Server

```bash
npm run dev
```

* Visit: [http://localhost:3000](http://localhost:3000)
* Works instantly using mock data

---

## 🔄 Switch to Rust API

When your backend is ready:

### Step 1 — Edit `lib/api-service.ts`:

```ts
const USE_RUST_API = true
```

### Step 2 — Set the API URL:

```bash
NEXT_PUBLIC_RUST_API_URL=http://localhost:3001/api
```

---

## 🔧 Rust Backend Endpoints

| Method | Path                        | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/health`               | Health check             |
| GET    | `/api/test-definitions`     | List test definitions    |
| GET    | `/api/test-definitions/:id` | Get a test definition    |
| POST   | `/api/test-definitions`     | Create a test definition |
| PUT    | `/api/test-definitions/:id` | Update a test definition |
| DELETE | `/api/test-definitions/:id` | Delete a test definition |
| GET    | `/api/test-runs`            | List test runs           |
| GET    | `/api/test-runs/:id`        | Get a test run           |
| POST   | `/api/test-runs`            | Create a test run        |
| GET    | `/api/test-suites`          | List test suites         |

> Note: Logs, WebSockets, and auth are **not part of the OSS scope**.

---

## 📂 Git Integration (OSS)

* SparkTest can listen to GitHub webhooks (push events)
* It scans `/tests/*.json` in public repos and registers test definitions
* Perfect for Git-backed config without CRDs or YAML

---

## 🧱 Database Schema (Rust)

```sql
CREATE TABLE test_definitions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  commands TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE test_runs (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  command TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  test_definition_id UUID REFERENCES test_definitions(id),
  duration INTEGER,
  logs TEXT[]
);

CREATE TABLE test_suites (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE test_suite_members (
  suite_id UUID REFERENCES test_suites(id),
  test_definition_id UUID REFERENCES test_definitions(id),
  PRIMARY KEY (suite_id, test_definition_id)
);
```

---

## 📦 Sample Executors

```json
[
  {
    "id": "k6",
    "image": "grafana/k6",
    "command": ["run", "/scripts/loadtest.js"],
    "fileTypes": ["js"],
    "description": "Load testing with K6"
  },
  {
    "id": "postman",
    "image": "postman/newman",
    "command": ["run", "/collections/api.json"],
    "fileTypes": ["json"],
    "description": "Postman collections"
  }
]
```

---

## 🧪 Sample Use Cases

* Load testing a microservice with K6
* Running a Postman API collection
* Triggering Playwright tests in CI
* Executing DB migrations in a container
* Grouping tests into Suites for staging/pre-prod checks

---

## 💻 Development Notes

* `lib/types.ts` – shared types
* `lib/api-service.ts` – handles backend switch
* `components/` – shared UI
* `app/` – Next.js App Router pages

---

## 👐 Contributing

1. Fork this repo
2. Create a feature branch
3. Test with both `USE_RUST_API=true` and `false`
4. Submit a pull request!

---

## 📄 License

MIT — see `LICENSE`

```

---

Let me know if you want this copy pasted into your repo now or customized for your org's GitHub link.
```
