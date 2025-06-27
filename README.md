# ⚡ SparkTest OSS

[![CI](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/ci.yml)
[![Test & Coverage](https://github.com/kevintatou/sparktest/actions/workflows/test.yml/badge.svg)](https://github.com/kevintatou/sparktest/actions/workflows/test.yml)

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
| Backend    | Rust (Axum), PostgreSQL, Kubernetes      |
| Testing    | Vitest, Playwright                       |
| CI/CD      | GitHub Actions, pnpm                     |

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

### Testing

```bash
cd frontend
pnpm test          # Run unit tests
pnpm test:coverage # Run tests with coverage
pnpm lint          # Run ESLint
pnpm type-check    # Run TypeScript checks
```

---

## 👐 Contributing

1. Fork this repo
2. Create a new branch
3. Test both mock + Rust API modes
4. Submit a pull request

---

## 📄 License

MIT — see `LICENSE`