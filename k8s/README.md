# SparkTest Kubernetes Deployment

Fixes the GLIBC compatibility and SQLite database issues from [GitHub Issue #159](https://github.com/kevintatou/sparktest/issues/159).

## Usage

```bash
# Build images
docker build -f k8s/Dockerfile.backend.k8s -t sparktest-backend:local .
docker build -f k8s/Dockerfile.frontend -t sparktest-frontend:local .

# Deploy everything
kubectl apply -f k8s/deployment.yaml

# Access frontend
kubectl port-forward service/sparktest-frontend-service 3000:3000 -n sparktest
```

Open http://localhost:3000 for the SparkTest UI.
