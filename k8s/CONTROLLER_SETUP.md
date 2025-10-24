# SparkTest Controller Setup Guide

This guide walks you through setting up the SparkTest controller for TestRun CRD support.

## Prerequisites

- Kubernetes cluster (k3d, kind, minikube, or production cluster)
- kubectl configured to access your cluster
- Docker for building the controller image

## Quick Start

### 1. Install the CRD

```bash
kubectl apply -f k8s/crd/testrun.yaml
```

Verify the CRD is installed:

```bash
kubectl get crd testruns.sparktest.dev
```

### 2. Set up RBAC

The controller needs permissions to watch TestRuns and create Jobs:

```bash
kubectl apply -f k8s/controller-rbac.yaml
```

This creates:

- ServiceAccount: `sparktest-controller`
- ClusterRole: `sparktest-controller` (with permissions for TestRuns, Jobs, Pods)
- ClusterRoleBinding: Links the ServiceAccount to the ClusterRole

### 3. Build the Controller Image

```bash
# From the repository root
cd backend/controller
docker build -t sparktest-controller:latest -f Dockerfile ../..
```

### 4. Load Image into Cluster

**For k3d:**

```bash
k3d image import sparktest-controller:latest -c your-cluster-name
```

**For kind:**

```bash
kind load docker-image sparktest-controller:latest
```

**For minikube:**

```bash
minikube image load sparktest-controller:latest
```

### 5. Deploy the Controller

```bash
kubectl apply -f k8s/controller-deployment.yaml
```

Check the controller is running:

```bash
kubectl get pods -n sparktest -l app=sparktest-controller
kubectl logs -n sparktest -l app=sparktest-controller -f
```

## Configuration

The controller requires the SparkTest backend URL to be configured. Edit `k8s/controller-deployment.yaml`:

```yaml
env:
  - name: SPARKTEST_BACKEND_URL
    value: "http://sparktest-backend-service:8080/api" # Change if needed
```

**Development setup (backend running locally):**
If your backend is running on localhost, you can use port-forwarding or update the URL to point to your host:

```yaml
- name: SPARKTEST_BACKEND_URL
  value: "http://host.docker.internal:8080/api" # macOS/Windows
  # OR value: "http://172.17.0.1:8080/api"  # Linux
```

## Testing

Create a test definition via the API or GUI, then apply a TestRun:

```bash
# Apply the example TestRun
kubectl apply -f k8s/examples/testrun-example.yaml

# Watch the TestRun status
kubectl get testrun -n sparktest -w

# Check the created Job
kubectl get jobs -n sparktest

# View logs
kubectl logs -n sparktest -l app=sparktest-controller -f
```

## Troubleshooting

### Controller won't start

Check logs:

```bash
kubectl logs -n sparktest -l app=sparktest-controller
```

Common issues:

- **"Forbidden" errors**: RBAC not set up correctly. Reapply `k8s/controller-rbac.yaml`
- **"Connection refused"**: Backend URL is incorrect or backend is not accessible
- **Image pull errors**: Image not loaded into cluster. Re-run the image import step

### TestRuns not reconciling

1. Check controller is running:

   ```bash
   kubectl get pods -n sparktest -l app=sparktest-controller
   ```

2. Check controller logs:

   ```bash
   kubectl logs -n sparktest -l app=sparktest-controller -f
   ```

3. Verify CRD is installed:

   ```bash
   kubectl get crd testruns.sparktest.dev
   ```

4. Check TestRun status:
   ```bash
   kubectl describe testrun <name> -n sparktest
   ```

### Jobs not being created

- Verify the `definitionId` in your TestRun exists in the backend
- Check controller can reach the backend API
- Review controller logs for errors

## Updating the Controller

To update the controller after making changes:

```bash
# Rebuild image
cd backend/controller
docker build -t sparktest-controller:latest -f Dockerfile ../..

# Reload into cluster
k3d image import sparktest-controller:latest -c your-cluster-name  # or kind/minikube

# Restart controller
kubectl rollout restart deployment sparktest-controller -n sparktest

# Watch rollout
kubectl rollout status deployment sparktest-controller -n sparktest
```

## Production Deployment

For production:

1. **Push to a registry:**

   ```bash
   docker tag sparktest-controller:latest your-registry/sparktest-controller:v1.0.0
   docker push your-registry/sparktest-controller:v1.0.0
   ```

2. **Update deployment image:**
   Edit `k8s/controller-deployment.yaml`:

   ```yaml
   image: your-registry/sparktest-controller:v1.0.0
   imagePullPolicy: IfNotPresent # or Always
   ```

3. **Consider:**
   - Resource limits (adjust based on cluster size)
   - Multiple replicas for HA (requires leader election)
   - Monitoring and alerting
   - Log aggregation

## Uninstalling

```bash
# Delete controller
kubectl delete -f k8s/controller-deployment.yaml

# Delete RBAC
kubectl delete -f k8s/controller-rbac.yaml

# Delete CRD (this will delete all TestRun resources!)
kubectl delete -f k8s/crd/testrun.yaml
```
