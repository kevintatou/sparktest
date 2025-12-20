# SparkTest on Minikube - Quick Start Guide

This guide shows you how to run SparkTest on Minikube. SparkTest works out of the box with just the API/GUI workflow - **no CRD controller needed**!

## 🎯 What Works Out of the Box

✅ **API/GUI Workflow** (Recommended):
- Create test definitions via Web UI
- Run tests as Kubernetes Jobs
- View logs in real-time
- Full PostgreSQL persistence

❓ **CRD Workflow** (Optional):
- Requires additional controller deployment
- For Kubernetes-native, GitOps workflows
- See [k8s/CONTROLLER_SETUP.md](k8s/CONTROLLER_SETUP.md) if needed

## 🚀 Quick Setup (10 minutes)

### Prerequisites

- Minikube installed ([Installation guide](https://minikube.sigs.k8s.io/docs/start/))
- kubectl installed
- Docker installed
- 4GB+ RAM available for Minikube

### Step 1: Start Minikube

```bash
# Start Minikube with sufficient resources
minikube start --memory=4096 --cpus=2

# Verify cluster is running
kubectl get nodes
```

### Step 2: Start SparkTest

You have two options:

#### Option A: Full Stack with Docker Compose (Easiest)

```bash
# Clone the repository
git clone https://github.com/kevintatou/sparktest.git
cd sparktest

# Start everything with Docker
./start-dev.sh
```

This starts:
- PostgreSQL on `:5432`
- Backend API on `:8080` (auto-connects to Minikube!)
- Frontend on `:3000`

#### Option B: Backend Only (If you already have frontend)

```bash
# Start PostgreSQL
docker run -d --name sparktest-postgres \
  -e POSTGRES_DB=sparktest \
  -e POSTGRES_USER=sparktest \
  -e POSTGRES_PASSWORD=sparktest_dev_password \
  -p 5432:5432 postgres:15-alpine

# Start backend
export DATABASE_URL="postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest"
cd backend
cargo run --bin sparktest-bin
```

### Step 3: Verify Everything Works

```bash
# Check backend is connected to Kubernetes
curl http://localhost:8080/api/k8s/health

# Expected response:
# {"kubernetes_connected": true}

# Open the UI
open http://localhost:3000
```

### Step 4: Run Your First Test

1. **Via Web UI**:
   - Navigate to http://localhost:3000
   - Click "Definitions" → "New Definition"
   - Fill in:
     - **Name**: "Hello World Test"
     - **Image**: `busybox:latest`
     - **Commands**: `["echo", "Hello from Minikube!"]`
   - Click "Save"
   - Go to "Runs" → "New Run"
   - Select your definition and click "Run Test"

2. **Via API**:
   ```bash
   curl -X POST http://localhost:8080/api/test-runs \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Hello Minikube",
       "image": "busybox:latest",
       "commands": ["echo", "Hello from Minikube!"]
     }'
   ```

3. **View the Job in Kubernetes**:
   ```bash
   kubectl get jobs
   kubectl get pods
   kubectl logs <pod-name>
   ```

## 🎉 That's It!

You now have SparkTest running on Minikube with the full API/GUI workflow. Tests run as Kubernetes Jobs and you can see logs in the UI.

## 🔧 Common Issues

### "Kubernetes not connected"

**Problem**: Backend shows `kubernetes_connected: false`

**Solutions**:
```bash
# 1. Make sure Minikube is running
minikube status

# 2. Set the correct kubectl context
kubectl config use-context minikube

# 3. Verify kubectl works
kubectl get nodes

# 4. Restart the backend
# It will auto-detect Kubernetes on startup
```

### "Cannot pull image"

**Problem**: Pods stuck in `ImagePullBackOff`

**Solutions**:
```bash
# For Minikube, you can use local images
minikube image load your-image:tag

# Or point Docker to Minikube's daemon
eval $(minikube docker-env)
docker build -t your-image:tag .
```

### "Permission denied" creating Jobs

**Problem**: Backend can't create Jobs

**Solution**:
The backend needs permissions to create Jobs in your cluster. If you're running the backend **outside** the cluster (as in this guide), it uses your local `~/.kube/config` which should have admin permissions by default with Minikube.

```bash
# Verify you have permissions
kubectl auth can-i create jobs
# Should return: yes

# If no, check your kubeconfig
kubectl config view
```

### Port conflicts

**Problem**: Ports 3000, 8080, or 5432 already in use

**Solutions**:
```bash
# Find what's using the port
lsof -i :3000  # or :8080 or :5432

# Stop conflicting services or change ports
# For frontend: edit apps/oss/package.json
# For backend: set PORT=8081 env var
# For PostgreSQL: use -p 5433:5432 in docker run
```

## 🔍 Troubleshooting Commands

```bash
# Check Minikube status
minikube status

# View cluster info
kubectl cluster-info

# Check backend logs
docker-compose -f docker-compose.dev.yml logs backend

# View PostgreSQL logs
docker logs sparktest-postgres

# Check Jobs in Kubernetes
kubectl get jobs -A
kubectl get pods -A

# Describe a failed pod
kubectl describe pod <pod-name>
```

## 📚 What About the CRD Controller?

The CRD controller is **100% optional** and only needed if you want to use `kubectl apply` to create test runs (the "Kubernetes-native" workflow).

**When you might want it**:
- You prefer YAML manifests over API/GUI
- You're using GitOps workflows
- You want to integrate with CI/CD pipelines using kubectl

**If you want to set it up**: See [k8s/CONTROLLER_SETUP.md](k8s/CONTROLLER_SETUP.md)

**Quick summary**:
```bash
# 1. Install CRD
kubectl apply -f k8s/crd/testrun.yaml

# 2. Build and load controller image
cd backend/controller
docker build -t sparktest-controller:latest -f Dockerfile ../..
minikube image load sparktest-controller:latest

# 3. Deploy controller
kubectl apply -f k8s/controller-rbac.yaml
kubectl apply -f k8s/controller-deployment.yaml
```

But again - **this is completely optional**! The API/GUI workflow is the primary way to use SparkTest.

## 🎓 Next Steps

- Read the [main README](README.md) for detailed usage
- Check [DEMO_DATA_GUIDE.md](DEMO_DATA_GUIDE.md) for example tests
- Read [backend/KUBERNETES.md](backend/KUBERNETES.md) for K8s integration details
- Join [Discussions](https://github.com/kevintatou/sparktest/discussions) for help

## 💡 Pro Tips

1. **Use Minikube dashboard**:
   ```bash
   minikube dashboard
   ```
   Great for visualizing Jobs, Pods, and logs!

2. **Access services easily**:
   ```bash
   minikube service list
   ```

3. **Save resources**:
   ```bash
   # Pause Minikube when not using
   minikube pause

   # Resume later
   minikube unpause
   ```

4. **Clean up old Jobs**:
   ```bash
   kubectl delete jobs --all
   ```

---

**Need help?** Open an issue or ask in [Discussions](https://github.com/kevintatou/sparktest/discussions)
