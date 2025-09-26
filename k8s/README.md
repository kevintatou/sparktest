# SparkTest Kubernetes Deployment

Simple deployment for Minikube and K3s that addresses GLIBC compatibility and database connectivity issues from GitHub Issue #159.

## Quick Start

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
