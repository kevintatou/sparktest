#!/bin/bash

# Git History Rewrite Script for SparkTest
# This script creates a clean git history with logical commits and proper changesets

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/.git-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
FORCE=false
VERBOSE=false

show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Rewrite git history with logical commits and proper changesets"
    echo ""
    echo "Options:"
    echo "  --dry-run     Show what would be done without making changes"
    echo "  --force       Proceed without confirmation prompts"
    echo "  --verbose     Show detailed output"
    echo "  --help        Show this help message"
    echo ""
    echo "This script will:"
    echo "  1. Backup current git state"
    echo "  2. Create new history with logical commits"
    echo "  3. Generate appropriate changesets"
    echo "  4. Set proper package versions"
    echo ""
    echo "WARNING: This will rewrite git history. Use with caution!"
}

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

verbose() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${CYAN}[VERBOSE]${NC} $1"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Backup current state
backup_current_state() {
    log "Creating backup of current state..."
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would create backup at: $BACKUP_DIR"
        return
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup .git directory
    cp -r "$ROOT_DIR/.git" "$BACKUP_DIR/.git"
    
    # Create a bundle of current state
    cd "$ROOT_DIR"
    git bundle create "$BACKUP_DIR/current-state.bundle" --all
    
    # Save current branch
    git branch --show-current > "$BACKUP_DIR/current-branch.txt"
    
    # Save current commit
    git rev-parse HEAD > "$BACKUP_DIR/current-commit.txt"
    
    success "Backup created at: $BACKUP_DIR"
}

# Set package version
set_package_version() {
    local package_path="$1"
    local version="$2"
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would set $package_path to version $version"
        return
    fi
    
    # Update package.json version
    if [[ -f "$package_path/package.json" ]]; then
        sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$version\"/" "$package_path/package.json"
        rm -f "$package_path/package.json.bak"
    fi
}

# Set cargo crate version
set_cargo_version() {
    local crate_path="$1"
    local version="$2"
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would set $crate_path to version $version"
        return
    fi
    
    # Update Cargo.toml version
    if [[ -f "$crate_path/Cargo.toml" ]]; then
        sed -i.bak "s/^version = \"[^\"]*\"/version = \"$version\"/" "$crate_path/Cargo.toml"
        rm -f "$crate_path/Cargo.toml.bak"
    fi
}

# Create a changeset file
create_changeset() {
    local package_name="$1"
    local change_type="$2"  # patch, minor, major
    local description="$3"
    local changeset_id="$(date +%s)-$(echo "$package_name" | tr '/' '-')"
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would create changeset for $package_name ($change_type): $description"
        return
    fi
    
    mkdir -p "$ROOT_DIR/.changeset"
    
    cat > "$ROOT_DIR/.changeset/$changeset_id.md" << EOF
---
"$package_name": $change_type
---

$description
EOF
    
    verbose "Created changeset: $changeset_id.md"
}

# Create cargo changeset
create_cargo_changeset() {
    local crate_name="$1"
    local change_type="$2"  # patch, minor, major
    local description="$3"
    local changeset_id="$(date +%s)-$(echo "$crate_name" | tr '/' '-')"
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would create cargo changeset for $crate_name ($change_type): $description"
        return
    fi
    
    mkdir -p "$ROOT_DIR/.cargo-changesets"
    
    cat > "$ROOT_DIR/.cargo-changesets/$changeset_id.md" << EOF
---
$crate_name: $change_type
---

$description
EOF
    
    verbose "Created cargo changeset: $changeset_id.md"
}

# Commit changes with message
commit_changes() {
    local message="$1"
    local author_date="${2:-}"
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would commit: $message"
        return
    fi
    
    cd "$ROOT_DIR"
    git add -A
    
    if [[ -n "$author_date" ]]; then
        GIT_AUTHOR_DATE="$author_date" GIT_COMMITTER_DATE="$author_date" git commit -m "$message"
    else
        git commit -m "$message"
    fi
    
    verbose "Committed: $message"
}

# Create the new git history
create_new_history() {
    log "Creating new git history..."
    
    if [[ "$DRY_RUN" == true ]]; then
        verbose "Would create new git history with logical commits"
        return
    fi
    
    cd "$ROOT_DIR"
    
    # Create a new orphan branch
    git checkout --orphan new-main
    git rm -rf --cached .
    
    # Base date for commits (6 months ago)
    local base_date=$(date -d "6 months ago" '+%Y-%m-%d %H:%M:%S')
    local current_date="$base_date"
    
    # Helper function to increment date by days
    increment_date() {
        local days="$1"
        current_date=$(date -d "$current_date + $days days" '+%Y-%m-%d %H:%M:%S')
    }
    
    # 1. Initial project setup
    log "Step 1: Initial project setup"
    
    # Create basic workspace files
    cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF
    
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
target/
.pnpm-store/

# Build outputs
dist/
build/
.next/

# Environment
.env*
!.env.example

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Temporary folders
tmp/
temp/

# Lock files (except pnpm)
package-lock.json
yarn.lock
EOF
    
    # Create basic package.json
    cat > package.json << 'EOF'
{
  "name": "sparktest-monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "SparkTest monorepo for OSS packages and application",
  "packageManager": "pnpm@10.12.4+sha512.5ea8b0deed94ed68691c9bad4c955492705c5eeb8a87ef86bc62c74a26b037b08ff9570f108b2e4dbd1dd1a9186fea925e527f141c648e85af45631074680184",
  "scripts": {
    "build": "echo 'Build script placeholder'",
    "dev": "echo 'Dev script placeholder'",
    "test": "echo 'Test script placeholder'"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
EOF
    
    # Create Cargo workspace
    mkdir -p backend
    cat > Cargo.toml << 'EOF'
[workspace]
members = ["backend/*"]
resolver = "2"
EOF
    
    cat > README.md << 'EOF'
# SparkTest OSS

A lightweight, developer-focused test orchestrator for Kubernetes.

## Getting Started

This is a monorepo containing:
- TypeScript packages for shared utilities and UI components
- Rust backend for API and Kubernetes orchestration
- Next.js frontend application

More documentation coming soon!
EOF
    
    commit_changes "Initial project setup with workspace configuration" "$current_date"
    increment_date 3
    
    # 2. Core package foundation
    log "Step 2: Core package foundation"
    
    mkdir -p packages/core/src
    set_package_version "packages/core" "0.1.0"
    
    cat > packages/core/package.json << 'EOF'
{
  "name": "@tatou/core",
  "version": "0.1.0",
  "description": "Shared TypeScript types and utilities for SparkTest",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc --build --force",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "pnpm build"
  },
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
EOF
    
    cat > packages/core/src/index.ts << 'EOF'
// Core types and utilities for SparkTest
export * from './types';
export * from './utils';
EOF
    
    cat > packages/core/src/types.ts << 'EOF'
// Basic domain types for SparkTest

export interface TestDefinition {
  id: string;
  name: string;
  description: string;
  image: string;
  commands: string[];
  createdAt: string;
  variables?: Record<string, string>;
  labels?: string[];
}

export interface TestRun {
  id: string;
  definitionId: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  logs?: string;
}

export interface Executor {
  id: string;
  name: string;
  type: string;
  image: string;
  defaultCommands: string[];
  description: string;
  createdAt: string;
}
EOF
    
    cat > packages/core/src/utils.ts << 'EOF'
// Utility functions for SparkTest

export function validateTestDefinition(def: any): boolean {
  return !!(def.id && def.name && def.image && def.commands);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
EOF
    
    cat > packages/core/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF
    
    create_changeset "@tatou/core" "minor" "Initial core package with basic domain types and utilities"
    commit_changes "feat: add core package with basic domain types" "$current_date"
    increment_date 5
    
    # 3. Storage service implementation
    log "Step 3: Storage service implementation"
    
    mkdir -p packages/storage-service/src/generic
    set_package_version "packages/storage-service" "0.1.0"
    
    # Copy the current storage service content but start with basic version
    cat > packages/storage-service/package.json << 'EOF'
{
  "name": "@tatou/storage-service",
  "version": "0.1.0",
  "description": "Storage service implementations for SparkTest",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "pnpm build"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@tatou/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
EOF
    
    # Start with basic storage interface
    cat > packages/storage-service/src/index.ts << 'EOF'
// Storage service for SparkTest
export * from './storage';
EOF
    
    cat > packages/storage-service/src/storage.ts << 'EOF'
import type { TestDefinition, TestRun, Executor } from '@tatou/core';

export interface StorageService {
  // Test Definitions
  getDefinitions(): Promise<TestDefinition[]>;
  getDefinition(id: string): Promise<TestDefinition | null>;
  createDefinition(definition: Omit<TestDefinition, 'id' | 'createdAt'>): Promise<TestDefinition>;
  updateDefinition(id: string, updates: Partial<TestDefinition>): Promise<TestDefinition>;
  deleteDefinition(id: string): Promise<void>;
  
  // Test Runs
  getRuns(): Promise<TestRun[]>;
  getRun(id: string): Promise<TestRun | null>;
  createRun(run: Omit<TestRun, 'id' | 'createdAt'>): Promise<TestRun>;
  updateRun(id: string, updates: Partial<TestRun>): Promise<TestRun>;
  deleteRun(id: string): Promise<void>;
  
  // Executors
  getExecutors(): Promise<Executor[]>;
  getExecutor(id: string): Promise<Executor | null>;
  createExecutor(executor: Omit<Executor, 'id' | 'createdAt'>): Promise<Executor>;
  updateExecutor(id: string, updates: Partial<Executor>): Promise<Executor>;
  deleteExecutor(id: string): Promise<void>;
}
EOF
    
    create_changeset "@tatou/storage-service" "minor" "Initial storage service with basic interface"
    commit_changes "feat: add storage service package with basic interface" "$current_date"
    increment_date 4
    
    # 4. Rust backend foundation  
    log "Step 4: Rust backend foundation"
    
    mkdir -p backend/core/src
    set_cargo_version "backend/core" "0.1.0"
    
    cat > backend/core/Cargo.toml << 'EOF'
[package]
name = "sparktest-core"
version = "0.1.0"
edition = "2021"
description = "Core types and database models for SparkTest"
license = "MIT"
repository = "https://github.com/kevintatou/sparktest"
homepage = "https://github.com/kevintatou/sparktest"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1", features = ["serde", "v4"] }
chrono = { version = "0.4", features = ["serde"] }
anyhow = "1.0"
EOF
    
    cat > backend/core/src/lib.rs << 'EOF'
//! Core types for SparkTest backend

pub mod models;

pub use models::*;
EOF
    
    cat > backend/core/src/models.rs << 'EOF'
//! Core domain models for SparkTest

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestDefinition {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub image: String,
    pub commands: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub variables: std::collections::HashMap<String, String>,
    pub labels: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestRun {
    pub id: Uuid,
    pub definition_id: Uuid,
    pub status: RunStatus,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub logs: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RunStatus {
    Pending,
    Running,
    Succeeded,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Executor {
    pub id: Uuid,
    pub name: String,
    pub executor_type: String,
    pub image: String,
    pub default_commands: Vec<String>,
    pub description: String,
    pub created_at: DateTime<Utc>,
}
EOF
    
    create_cargo_changeset "sparktest-core" "minor" "Initial Rust core package with domain models"
    commit_changes "feat: add Rust core package with domain models" "$current_date"
    increment_date 6
    
    # 5. UI Components package
    log "Step 5: UI Components package"
    
    mkdir -p packages/ui/src/components packages/ui/src/lib
    set_package_version "packages/ui" "0.1.0"
    
    cat > packages/ui/package.json << 'EOF'
{
  "name": "@tatou/ui",
  "version": "0.1.0",
  "description": "Reusable UI components for SparkTest applications",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "pnpm build"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  },
  "peerDependencies": {
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5"
  }
}
EOF
    
    cat > packages/ui/src/index.ts << 'EOF'
// UI components for SparkTest
export * from './lib/utils';
export * from './components/use-toast';
EOF
    
    cat > packages/ui/src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF
    
    cat > packages/ui/src/components/use-toast.ts << 'EOF'
// Basic toast utility for SparkTest UI
export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toasts: Toast[] = [];

export function useToast() {
  const toast = (props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts.push({ ...props, id });
  };

  return { toast };
}
EOF
    
    create_changeset "@tatou/ui" "minor" "Initial UI components package with basic utilities"
    commit_changes "feat: add UI components package with basic utilities" "$current_date"
    increment_date 4
    
    # 6. Expand core package with samples and config
    log "Step 6: Expand core package with samples and configuration"
    
    # Increment core version for new features
    set_package_version "packages/core" "0.1.1"
    
    cat > packages/core/src/config.ts << 'EOF'
// Configuration utilities for SparkTest

export interface SparkTestConfig {
  apiUrl: string;
  storageMode: 'api' | 'local' | 'mock';
  kubernetes: {
    namespace: string;
    jobTimeoutMs: number;
  };
}

export const defaultConfig: SparkTestConfig = {
  apiUrl: 'http://localhost:8080',
  storageMode: 'api',
  kubernetes: {
    namespace: 'default',
    jobTimeoutMs: 300000, // 5 minutes
  },
};

export function createConfig(overrides: Partial<SparkTestConfig> = {}): SparkTestConfig {
  return { ...defaultConfig, ...overrides };
}
EOF
    
    cat > packages/core/src/samples.ts << 'EOF'
// Sample data for SparkTest demonstrations

import type { TestDefinition, Executor, TestRun } from './types';

export const sampleExecutors: Executor[] = [
  {
    id: 'jest-executor',
    name: 'Jest Test Runner',
    type: 'unit-test',
    image: 'node:18-alpine',
    defaultCommands: ['npm ci', 'npm test'],
    description: 'Run JavaScript/TypeScript unit tests with Jest',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'curl-executor',
    name: 'HTTP Test Runner',
    type: 'api-test',
    image: 'curlimages/curl:latest',
    defaultCommands: ['curl -f $TARGET_URL'],
    description: 'Simple HTTP endpoint testing with curl',
    createdAt: new Date().toISOString(),
  },
];

export const sampleDefinitions: TestDefinition[] = [
  {
    id: 'simple-health-check',
    name: 'Simple Health Check',
    description: 'Basic system health check using curl to test network connectivity',
    image: 'curlimages/curl:latest',
    commands: [
      'curl -f -s -o /dev/null -w "%{http_code}" https://httpbin.org/status/200 && echo "Health check passed"',
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    variables: {
      TARGET_URL: 'https://httpbin.org/status/200',
    },
    labels: ['health', 'api', 'curl'],
  },
];
EOF
    
    # Update core index to export new modules
    cat > packages/core/src/index.ts << 'EOF'
// Core types and utilities for SparkTest
export * from './types';
export * from './utils';
export * from './config';
export * from './samples';
EOF
    
    create_changeset "@tatou/core" "patch" "Add configuration utilities and sample data"
    commit_changes "feat(core): add configuration utilities and sample data" "$current_date"
    increment_date 3
    
    # 7. API layer development
    log "Step 7: API layer development"
    
    mkdir -p backend/api/src
    set_cargo_version "backend/api" "0.1.0"
    
    cat > backend/api/Cargo.toml << 'EOF'
[package]
name = "sparktest-api"
version = "0.1.0"
edition = "2021"
description = "API server and Kubernetes integration for SparkTest"
license = "MIT"
repository = "https://github.com/kevintatou/sparktest"
homepage = "https://github.com/kevintatou/sparktest"

[dependencies]
sparktest-core = { path = "../core" }
axum = "0.7"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.36", features = ["full"] }
tower-http = { version = "0.5", features = ["cors"] }
tracing = "0.1"
uuid = { version = "1", features = ["serde", "v4"] }
chrono = { version = "0.4", features = ["serde"] }
anyhow = "1.0"
EOF
    
    cat > backend/api/src/lib.rs << 'EOF'
//! SparkTest API server

pub mod handlers;
pub mod routes;

pub use routes::create_app;
EOF
    
    cat > backend/api/src/routes.rs << 'EOF'
//! API routes for SparkTest

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;

use crate::handlers;

pub fn create_app() -> Router {
    Router::new()
        .route("/health", get(handlers::health_check))
        .route("/api/definitions", get(handlers::get_definitions))
        .route("/api/definitions", post(handlers::create_definition))
        .route("/api/runs", get(handlers::get_runs))
        .route("/api/runs", post(handlers::create_run))
        .route("/api/executors", get(handlers::get_executors))
        .layer(CorsLayer::permissive())
}
EOF
    
    cat > backend/api/src/handlers.rs << 'EOF'
//! HTTP handlers for SparkTest API

use axum::{
    http::StatusCode,
    response::Json,
};
use serde_json::{json, Value};

pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "service": "sparktest-api",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

pub async fn get_definitions() -> Result<Json<Value>, StatusCode> {
    // TODO: Implement database queries
    Ok(Json(json!({
        "definitions": []
    })))
}

pub async fn create_definition() -> Result<Json<Value>, StatusCode> {
    // TODO: Implement definition creation
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_runs() -> Result<Json<Value>, StatusCode> {
    // TODO: Implement database queries  
    Ok(Json(json!({
        "runs": []
    })))
}

pub async fn create_run() -> Result<Json<Value>, StatusCode> {
    // TODO: Implement run creation
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_executors() -> Result<Json<Value>, StatusCode> {
    // TODO: Implement database queries
    Ok(Json(json!({
        "executors": []
    })))
}
EOF
    
    create_cargo_changeset "sparktest-api" "minor" "Initial API server with basic routes and handlers"
    commit_changes "feat: add API server with basic HTTP routes" "$current_date"
    increment_date 5
    
    # 8. Backend binary
    log "Step 8: Backend binary application"
    
    mkdir -p backend/bin/src
    set_cargo_version "backend/bin" "0.1.0"
    
    cat > backend/bin/Cargo.toml << 'EOF'
[package]
name = "sparktest-bin"
version = "0.1.0"
edition = "2021"
description = "SparkTest backend server binary"
license = "MIT"
repository = "https://github.com/kevintatou/sparktest"
homepage = "https://github.com/kevintatou/sparktest"

[dependencies]
sparktest-core = { path = "../core" }
sparktest-api = { path = "../api" }
axum = "0.7"
tokio = { version = "1.36", features = ["full"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
anyhow = "1.0"
EOF
    
    cat > backend/bin/src/main.rs << 'EOF'
//! SparkTest backend server

use tracing::{info, Level};
use tracing_subscriber;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    info!("Starting SparkTest backend server");

    // Create the application
    let app = sparktest_api::create_app();

    // Start the server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await?;
    
    info!("Server listening on http://0.0.0.0:8080");
    
    axum::serve(listener, app)
        .await?;

    Ok(())
}
EOF
    
    create_cargo_changeset "sparktest-bin" "minor" "Initial backend server binary with HTTP listener"
    commit_changes "feat: add backend server binary" "$current_date"
    increment_date 3
    
    # 9. Frontend application foundation
    log "Step 9: Frontend application foundation"
    
    mkdir -p apps/oss/src/app
    
    cat > apps/oss/package.json << 'EOF'
{
  "name": "@tatou/oss",
  "version": "0.1.0",
  "private": true,
  "description": "SparkTest OSS frontend application",
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@tatou/core": "workspace:*",
    "@tatou/storage-service": "workspace:*",
    "@tatou/ui": "workspace:*",
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "typescript": "^5"
  }
}
EOF
    
    cat > apps/oss/src/app/page.tsx << 'EOF'
import { sampleDefinitions, sampleExecutors } from '@tatou/core/samples';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">SparkTest OSS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Sample Definitions</h2>
          <div className="space-y-2">
            {sampleDefinitions.map((def) => (
              <div key={def.id} className="p-3 border rounded">
                <h3 className="font-medium">{def.name}</h3>
                <p className="text-sm text-gray-600">{def.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Sample Executors</h2>
          <div className="space-y-2">
            {sampleExecutors.map((exec) => (
              <div key={exec.id} className="p-3 border rounded">
                <h3 className="font-medium">{exec.name}</h3>
                <p className="text-sm text-gray-600">{exec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
    
    cat > apps/oss/src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SparkTest OSS',
  description: 'Lightweight test orchestrator for Kubernetes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF
    
    commit_changes "feat: add frontend application foundation" "$current_date"
    increment_date 4
    
    # 10. Changeset system setup
    log "Step 10: Changeset system setup"
    
    mkdir -p .changeset
    
    cat > .changeset/config.json << 'EOF'
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "kevintatou/sparktest" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@tatou/oss"]
}
EOF
    
    cat > .changeset/README.md << 'EOF'
# Changesets

Hello and welcome! This folder has been automatically generated by `@changesets/cli`, a build tool that works
with multi-package repos, or single-package repos to help you version and publish your code. You can
find the full documentation for it [in our repository](https://github.com/changesets/changesets)

We have a quick list of common questions to get you started engaging with this project in
[our documentation](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
EOF
    
    # Add changeset scripts to main package.json
    cat > package.json << 'EOF'
{
  "name": "sparktest-monorepo",
  "version": "0.2.0",
  "private": true,
  "description": "SparkTest monorepo for OSS packages and application",
  "packageManager": "pnpm@10.12.4+sha512.5ea8b0deed94ed68691c9bad4c955492705c5eeb8a87ef86bc62c74a26b037b08ff9570f108b2e4dbd1dd1a9186fea925e527f141c648e85af45631074680184",
  "scripts": {
    "build": "pnpm build:core && pnpm build:ui && pnpm build:storage-service",
    "build:core": "pnpm --filter '@tatou/core' build",
    "build:ui": "pnpm --filter '@tatou/ui' build",
    "build:storage-service": "pnpm --filter '@tatou/storage-service' build",
    "build:packages": "pnpm build:core && pnpm build:ui && pnpm build:storage-service",
    "build:app": "pnpm --filter '@tatou/oss' build",
    "dev": "pnpm --filter '@tatou/oss' dev",
    "dev:backend": "cargo run -p sparktest-bin --manifest-path backend/bin/Cargo.toml",
    "dev:frontend": "pnpm --filter '@tatou/oss' dev",
    "test": "pnpm build:packages && pnpm --filter '@tatou/oss' test",
    "lint": "pnpm --filter './packages/*' lint && pnpm --filter '@tatou/oss' lint",
    "type-check": "pnpm --filter './packages/*' type-check && pnpm --filter '@tatou/oss' type-check",
    "clean": "pnpm --filter './packages/*' clean",
    "cargo-build": "cargo build",
    "cargo-test": "cargo test",
    "cargo-run": "cargo run -p sparktest-bin",
    "changeset": "changeset",
    "changeset:version": "changeset version",
    "changeset:publish": "changeset publish",
    "changeset:status": "changeset status"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "@changesets/changelog-github": "^0.5.1",
    "@changesets/cli": "^2.29.6",
    "prettier": "^3.6.2",
    "typescript": "^5"
  }
}
EOF
    
    commit_changes "feat: add changeset system for package versioning" "$current_date"
    increment_date 2
    
    # 11. Documentation and deployment
    log "Step 11: Documentation and deployment configuration"
    
    # Copy current comprehensive README
    cp "$BACKUP_DIR/../README.md" README.md 2>/dev/null || echo "# SparkTest OSS Documentation updated" > README.md
    
    # Create basic deployment files
    cat > Dockerfile << 'EOF'
# Frontend Dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm@10.12.4

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/oss/package.json apps/oss/
RUN pnpm install --frozen-lockfile --filter=@tatou/oss...

# Build
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build:packages && pnpm --filter=@tatou/oss build

# Runtime
FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/oss/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/oss/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/oss/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
EOF
    
    cat > Dockerfile.backend << 'EOF'
# Backend Dockerfile
FROM rust:1.70 AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY backend/ backend/
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/sparktest-bin /usr/local/bin/sparktest
EXPOSE 8080
CMD ["sparktest"]
EOF
    
    commit_changes "docs: add comprehensive documentation and deployment config" "$current_date"
    increment_date 2
    
    # 12. Enhanced storage implementations
    log "Step 12: Enhanced storage implementations"
    
    set_package_version "packages/storage-service" "0.2.0"
    
    # Add more storage implementations (copy from current)
    mkdir -p packages/storage-service/src
    
    # Copy current storage implementations to get the full feature set
    if [[ -f "$BACKUP_DIR/../packages/storage-service/src/api-storage.ts" ]]; then
        cp "$BACKUP_DIR/../packages/storage-service/src/"*.ts packages/storage-service/src/ 2>/dev/null || true
    fi
    
    create_changeset "@tatou/storage-service" "minor" "Add comprehensive storage implementations (API, local, hybrid)"
    commit_changes "feat(storage): add comprehensive storage implementations" "$current_date"
    increment_date 3
    
    # 13. UI component library expansion
    log "Step 13: UI component library expansion"
    
    set_package_version "packages/ui" "0.2.0"
    
    # Copy current UI components
    if [[ -d "$BACKUP_DIR/../packages/ui/src/components" ]]; then
        cp -r "$BACKUP_DIR/../packages/ui/src/"* packages/ui/src/ 2>/dev/null || true
    fi
    
    # Update package.json with current dependencies
    cp "$BACKUP_DIR/../packages/ui/package.json" packages/ui/package.json 2>/dev/null || true
    set_package_version "packages/ui" "0.2.0"
    
    create_changeset "@tatou/ui" "minor" "Add comprehensive UI component library with shadcn/ui integration"
    commit_changes "feat(ui): add comprehensive UI component library" "$current_date"
    increment_date 3
    
    # 14. Database integration and Kubernetes support
    log "Step 14: Database integration and Kubernetes support"
    
    set_cargo_version "backend/core" "0.2.0"
    set_cargo_version "backend/api" "0.2.0"
    
    # Add database support to core
    cat >> backend/core/Cargo.toml << 'EOF'
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres", "uuid", "chrono", "macros"] }
tokio = { version = "1.36", features = ["full"] }
EOF
    
    # Add Kubernetes support to API
    cat >> backend/api/Cargo.toml << 'EOF'
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres", "uuid", "chrono", "macros"] }
kube = { version = "0.90", features = ["runtime", "derive"] }
k8s-openapi = { version = "0.21", default-features = false, features = ["v1_28"] }
EOF
    
    # Copy current implementations if available
    if [[ -f "$BACKUP_DIR/../backend/core/src/db.rs" ]]; then
        cp "$BACKUP_DIR/../backend/core/src/db.rs" backend/core/src/ 2>/dev/null || true
    fi
    
    if [[ -f "$BACKUP_DIR/../backend/api/src/k8s.rs" ]]; then
        cp "$BACKUP_DIR/../backend/api/src/k8s.rs" backend/api/src/ 2>/dev/null || true
    fi
    
    create_cargo_changeset "sparktest-core" "minor" "Add database integration with PostgreSQL"
    create_cargo_changeset "sparktest-api" "minor" "Add Kubernetes job orchestration support"
    commit_changes "feat(backend): add database and Kubernetes integration" "$current_date"
    increment_date 4
    
    # 15. Advanced tooling and scripts
    log "Step 15: Advanced tooling and scripts"
    
    mkdir -p scripts
    
    # Copy current scripts
    if [[ -d "$BACKUP_DIR/../scripts" ]]; then
        cp "$BACKUP_DIR/../scripts/"*.sh scripts/ 2>/dev/null || true
        chmod +x scripts/*.sh 2>/dev/null || true
    fi
    
    commit_changes "feat: add comprehensive tooling and development scripts" "$current_date"
    increment_date 2
    
    # 16. Current state restoration
    log "Step 16: Restore current package versions and features"
    
    # Copy all current source files to get the complete current state
    if [[ -d "$BACKUP_DIR/../packages" ]]; then
        cp -r "$BACKUP_DIR/../packages/"* packages/ 2>/dev/null || true
    fi
    
    if [[ -d "$BACKUP_DIR/../backend" ]]; then
        cp -r "$BACKUP_DIR/../backend/"* backend/ 2>/dev/null || true
    fi
    
    if [[ -d "$BACKUP_DIR/../apps" ]]; then
        cp -r "$BACKUP_DIR/../apps/"* apps/ 2>/dev/null || true
    fi
    
    # Copy documentation
    cp "$BACKUP_DIR/../"*.md . 2>/dev/null || true
    
    # Set final versions to match current state
    set_package_version "packages/core" "0.2.1"
    set_package_version "packages/ui" "0.2.0"  
    set_package_version "packages/storage-service" "0.2.1"
    set_cargo_version "backend/core" "0.2.1"
    set_cargo_version "backend/api" "0.2.0"
    set_cargo_version "backend/bin" "0.2.0"
    
    # Final package.json with all current scripts
    if [[ -f "$BACKUP_DIR/../package.json" ]]; then
        cp "$BACKUP_DIR/../package.json" package.json
    fi
    
    create_changeset "@tatou/core" "patch" "Final refinements and current state restoration"
    create_changeset "@tatou/storage-service" "patch" "Final refinements and current state restoration"
    commit_changes "feat: restore complete current state with all features" "$current_date"
    
    # 17. Version tag
    log "Step 17: Create version tag"
    
    git tag v0.2.0
    
    log "History rewrite completed successfully!"
}

# Confirm with user before proceeding
confirm_proceed() {
    if [[ "$FORCE" == true ]] || [[ "$DRY_RUN" == true ]]; then
        return
    fi
    
    warn "This will rewrite your git history!"
    warn "All existing commits will be replaced with new logical commits."
    warn "Make sure you have pushed any important work to remote branches."
    echo ""
    read -p "Do you want to proceed? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operation cancelled."
        exit 0
    fi
}

# Main execution
main() {
    log "Starting git history rewrite for SparkTest"
    log "Root directory: $ROOT_DIR"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN MODE - No changes will be made"
    fi
    
    confirm_proceed
    backup_current_state
    create_new_history
    
    if [[ "$DRY_RUN" != true ]]; then
        success "Git history rewrite completed!"
        echo ""
        echo "Next steps:"
        echo "1. Review the new history: git log --oneline"
        echo "2. Apply changesets: pnpm changeset:version"
        echo "3. Push to new branch: git push origin new-main"
        echo ""
        echo "To restore original state if needed:"
        echo "  git checkout main"
        echo "  cp -r $BACKUP_DIR/.git .git"
    fi
}

# Run main function
main "$@"