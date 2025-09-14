# Kubernetes Integration - Quick Start 🚀

SparkTest can run your tests as Kubernetes Jobs and show you the logs in real-time. Here's how to get started:

## 🏃‍♂️ Quick Setup (5 minutes)

### Option 1: Local Development with k3d (Recommended)

```bash
# Install k3d (lightweight Kubernetes)
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Create a local cluster
k3d cluster create sparktest

# That's it! SparkTest will auto-detect and connect
```

### Option 2: Using an Existing Cluster

If you already have `kubectl` working:

```bash
# Just make sure this works:
kubectl get pods

# SparkTest will automatically use your current kubectl context
```

## ✅ Verification

1. Start SparkTest backend: `cargo run`
2. Check the health endpoint: `curl http://localhost:3001/api/k8s/health`
3. You should see: `{"kubernetes_connected": true}`

## 🎯 What You Get

- **Test Execution**: Tests run as Kubernetes Jobs
- **Live Logs**: View logs directly in the SparkTest UI with auto-refresh
- **Auto-cleanup**: Failed jobs are automatically cleaned up
- **Status Monitoring**: See if tests are pending, running, or completed

## 🔧 Authentication (It Just Works™)

SparkTest automatically tries these methods in order:

1. **In-cluster** (if running inside Kubernetes)
2. **Kubeconfig** (your local `~/.kube/config`)
3. **Environment variables** (for custom setups)

Most users don't need to worry about this!

## 🐛 Common Issues

**"Kubernetes not available"**

- Make sure `kubectl get pods` works
- Try restarting the SparkTest backend

**"Pod is pending"**

- Check disk space: `kubectl describe nodes`
- Your cluster might be out of resources

**Need help?**

- Check the [main README](../README.md)
- Open an issue on GitHub

## 🔗 API Endpoints (for developers)

- `GET /api/k8s/health` - Check if Kubernetes is connected
- `GET /api/test-runs/{id}/logs` - Get logs for a test run
- `GET /api/k8s/jobs/{name}/status` - Get job status
- `DELETE /api/k8s/jobs/{name}` - Clean up a job
