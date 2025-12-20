# SparkTest Kubernetes Deployment

> 💡 **Quick Start**: See [MINIKUBE.md](../MINIKUBE.md) for a beginner-friendly guide to running SparkTest on Minikube.

This directory contains Kubernetes deployment manifests for SparkTest. 

## What's Here

### Core Application Deployment
- `deployment.yaml` - Full SparkTest deployment (backend + frontend + PostgreSQL)
- `README.md` - This file

### CRD Workflow (Optional)
- `crd/testrun.yaml` - TestRun Custom Resource Definition
- `controller-rbac.yaml` - RBAC for the optional CRD controller
- `controller-deployment.yaml` - Deployment for the optional CRD controller
- `CRD_README.md` - Documentation for CRD workflow
- `CONTROLLER_SETUP.md` - Setup guide for CRD controller
- `examples/` - Example TestRun CRD manifests

## Quick Start

Simple deployment for Minikube and K3s that addresses GLIBC compatibility and database connectivity issues from GitHub Issue #159.

### ⚠️ Important Notes

1. **CRD Controller is Optional**: The controller is only needed for `kubectl apply` workflows. Most users should use the API/GUI workflow instead.
2. **Security**: Before deploying, update the database password in `k8s/deployment.yaml` - replace `CHANGE_ME_PASSWORD` with a secure password.

### Deploy SparkTest

```bash
# For Minikube (build in Minikube's Docker environment)
eval $(minikube docker-env)

# Build images (using root Dockerfiles - more optimized)
docker build -f Dockerfile.backend -t sparktest-backend:local .
docker build -f Dockerfile -t sparktest-frontend:local .

# Deploy everything (includes PostgreSQL database)
kubectl apply -f k8s/deployment.yaml

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all -n sparktest --timeout=300s

# Access the application (run in background)
kubectl port-forward -n sparktest service/sparktest-backend-service 8080:8080 > /dev/null 2>&1 &
kubectl port-forward -n sparktest service/sparktest-frontend-service 3000:3000 > /dev/null 2>&1 &
```

## Access

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

## Components

- **Backend**: Rust API with PostgreSQL database
- **Frontend**: Next.js application
- **Database**: PostgreSQL 15 with persistent storage
- **Networking**: ClusterIP services with port-forwarding for local access
