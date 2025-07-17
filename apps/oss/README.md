````markdown
# ⚡ SparkTest OSS

**SparkTest** is a lightweight, developer-focused test orchestrator for Kubernetes. Define tests as Docker containers, run them as Kubernetes Jobs, and view results in a clean, modern UI — no YAML editing required.

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
| Backend    | Rust (Axum, SQLx, Kubernetes)             |
| Database   | PostgreSQL (optional in mock mode)        |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_ORG/sparktest
cd sparktest
npm install
````

### 2. Start Dev Server

```bash
npm run dev
```

SparkTest starts in **mock mode by default** (no backend required).

---

## 🔧 Enable Rust Backend

1. Start the Rust backend (see `backend/` folder)
2. Create `.env.local` in the root with:

```bash
# .env.local
NEXT_PUBLIC_USE_RUST_API=true
NEXT_PUBLIC_RUST_API_URL=http://localhost:3001/api
```

3. Restart the frontend:

```bash
npm run dev
```

Now all data is fetched from the real API.

---

## 🗂 Folder Structure

```
lib/
  └─ storage/                 # API & localStorage logic
      └─ api-storage.ts
      └─ local-storage.ts
      └─ index.ts             # auto-selects storage strategy
  └─ types.ts                 # shared types
app/
  └─ executors/               # all executor views
  └─ definitions/             # test definitions views
  └─ runs/                    # test runs views
  └─ suites/                  # test suites views
components/                   # shared UI
```

---

## 🧠 Concepts

| Term           | Description                                       |
| -------------- | ------------------------------------------------- |
| **Executor**   | Defines a generic test runner (e.g., K6, Postman) |
| **Definition** | Specific test config using an executor            |
| **Run**        | A launched test job from a definition             |
| **Suite**      | A group of definitions that can be run together   |

---

## 🧪 Sample Executors

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
    "description": "Postman API tests"
  }
]

```
## 🧱 Database Schema (Rust) (Missing suites!!!!!!!!!)
```sql
CREATE TABLE
  public.test_definitions (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name text NOT NULL,
    description text NULL,
    image text NOT NULL,
    commands text[] NOT NULL,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP
  );

ALTER TABLE
  public.test_definitions
ADD
  CONSTRAINT test_definitions_pkey PRIMARY KEY (id)
```
CREATE TABLE
  public.test_executors (
    id uuid NOT NULL,
    name text NOT NULL,
    description text NULL,
    image text NOT NULL,
    default_command text NOT NULL,
    supported_file_types text[] NOT NULL,
    environment_variables text[] NOT NULL DEFAULT ARRAY[]::text[],
    icon text NULL
  );

ALTER TABLE
  public.test_executors
ADD
  CONSTRAINT test_executors_pkey PRIMARY KEY (id)
CREATE TABLE
  public.test_runs (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name text NOT NULL,
    image text NOT NULL,
    command text[] NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    duration integer NULL,
    logs text[] NULL,
    test_definition_id uuid NULL
  );

ALTER TABLE
  public.test_runs
ADD
  CONSTRAINT test_runs_pkey PRIMARY KEY (id)
---

## 🧾 API Endpoints (Rust)

| Method | Path                        | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/test-definitions`     | List all definitions     |
| POST   | `/api/test-definitions`     | Create new definition    |
| PUT    | `/api/test-definitions/:id` | Update definition        |
| DELETE | `/api/test-definitions/:id` | Delete definition        |
| GET    | `/api/test-runs`            | List test runs           |
| POST   | `/api/test-runs`            | Trigger a test run       |
| GET    | `/api/test-suites`          | List test suites         |
| GET    | `/api/executors`            | List available executors |

---

## ✅ `.env.local` Example

```env
# Enable Rust backend
NEXT_PUBLIC_USE_RUST_API=true
NEXT_PUBLIC_RUST_API_URL=http://localhost:3001/api
```

If `NEXT_PUBLIC_USE_RUST_API=false`, the app falls back to local mock data (no backend required).

---

## 👐 Contributing

1. Fork this repo
2. Create a new branch
3. Test both mock + Rust API modes
4. Submit a pull request

---

## 📄 License

MIT — see `LICENSE`

```

---

Let me know if you want a short separate `CONTRIBUTING.md` or a `backend/README.md` too.
```