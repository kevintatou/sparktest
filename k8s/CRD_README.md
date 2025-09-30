# SparkTest TestRun CRD & Controller

This document describes how to install and use the SparkTest TestRun Custom Resource Definition (CRD) and controller.

## Overview

The TestRun CRD allows you to trigger test runs declaratively using Kubernetes manifests. Runs created via CRDs appear in the SparkTest UI alongside API-started runs, clearly marked with a `CRD` badge.

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured to access your cluster
- SparkTest backend running and accessible from the cluster

## Installation

### 1. Install the CRD

```bash
kubectl apply -f k8s/crd/testrun.yaml
```

Verify the CRD was installed:

```bash
kubectl get crd testruns.sparktest.dev
```

### 2. Deploy the Controller

The controller watches for TestRun resources and creates corresponding Kubernetes Jobs.

**Note:** The controller requires access to the SparkTest backend API. Set the `SPARKTEST_BACKEND_URL` environment variable to point to your backend.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sparktest-controller
  namespace: sparktest
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sparktest-controller
  template:
    metadata:
      labels:
        app: sparktest-controller
    spec:
      serviceAccountName: sparktest-controller
      containers:
      - name: controller
        image: your-registry/sparktest-controller:latest
        env:
        - name: SPARKTEST_BACKEND_URL
          value: "http://sparktest-backend:3001/api"
        - name: RUST_LOG
          value: "info"
```

### 3. Create RBAC Resources

The controller needs permissions to watch TestRuns and create Jobs:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sparktest-controller
  namespace: sparktest
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: sparktest-controller
rules:
- apiGroups: ["sparktest.dev"]
  resources: ["testruns"]
  verbs: ["get", "list", "watch", "update", "patch"]
- apiGroups: ["sparktest.dev"]
  resources: ["testruns/status"]
  verbs: ["get", "update", "patch"]
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "create", "delete"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: sparktest-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: sparktest-controller
subjects:
- kind: ServiceAccount
  name: sparktest-controller
  namespace: sparktest
```

## Usage

### Creating a TestRun

Create a TestRun manifest referencing a test definition:

```yaml
apiVersion: sparktest.dev/v1alpha1
kind: TestRun
metadata:
  name: k6-smoke-001
  namespace: sparktest
spec:
  definitionId: b7e6c1e2-1a2b-4c3d-8e9f-100000000006  # K6 Load Tests
  env:
    TARGET_URL: https://api.example.com
    TEST_DURATION: "30s"
    VUS: "10"
  timeoutSeconds: 900
  ttlSecondsAfterFinished: 3600
```

Apply the manifest:

```bash
kubectl apply -f testrun.yaml
```

### Monitoring TestRun Status

Check the status:

```bash
kubectl get testrun k6-smoke-001 -n sparktest
```

Output:
```
NAME            PHASE       DEFINITION                              AGE
k6-smoke-001    Running     b7e6c1e2-1a2b-4c3d-8e9f-100000000006   1m
```

Get detailed status:

```bash
kubectl describe testrun k6-smoke-001 -n sparktest
```

### Viewing in the UI

TestRuns created via CRDs appear in the SparkTest UI with:

1. **CRD Badge** - A blue badge labeled "CRD" next to the run name
2. **Source Section** - Shows namespace, TestRun name, and kubectl helper commands
3. **kubectl Commands** - Copy-pastable commands for inspecting the TestRun

### Deleting a TestRun

```bash
kubectl delete testrun k6-smoke-001 -n sparktest
```

This will also delete the associated Kubernetes Job.

## TestRun Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `definitionId` | string | Yes | UUID of the test definition to run |
| `env` | object | No | Environment variables to inject (key-value pairs) |
| `timeoutSeconds` | integer | No | Maximum duration in seconds before timing out |
| `ttlSecondsAfterFinished` | integer | No | Seconds to keep the Job after it finishes |

## TestRun Status

The controller updates the TestRun status automatically:

- `Pending` - Job is being created
- `Running` - Test is actively running
- `Succeeded` - Test completed successfully
- `Failed` - Test failed
- `TimedOut` - Test exceeded timeoutSeconds

## Architecture

```
┌─────────────────┐
│   kubectl apply │
│   testrun.yaml  │
└────────┬────────┘
         │
         v
┌────────────────────────────┐
│  TestRun CRD (Kubernetes)  │
└────────┬───────────────────┘
         │
         v
┌────────────────────────────┐
│  SparkTest Controller      │
│  (watches TestRun CRDs)    │
└────┬───────────────┬───────┘
     │               │
     v               v
┌─────────────┐  ┌──────────────────┐
│ Create Job  │  │  POST to Backend │
│             │  │  /runs endpoint  │
└─────────────┘  └──────────────────┘
     │                    │
     v                    v
┌─────────────┐  ┌──────────────────┐
│ Pod Running │  │  Run in Database │
└─────────────┘  └──────────────────┘
     │                    │
     v                    v
┌─────────────┐  ┌──────────────────┐
│ Update      │  │  Visible in UI   │
│ TestRun     │  │  with CRD badge  │
│ Status      │  │                  │
└─────────────┘  └──────────────────┘
```

## Troubleshooting

### TestRun stuck in Pending

Check controller logs:
```bash
kubectl logs -n sparktest deployment/sparktest-controller
```

Common issues:
- Test definition ID not found
- Backend API not reachable
- RBAC permissions missing

### Job not created

Verify the controller has permissions:
```bash
kubectl auth can-i create jobs --as=system:serviceaccount:sparktest:sparktest-controller
```

### Status not updating

Check if the controller is running:
```bash
kubectl get pods -n sparktest -l app=sparktest-controller
```

## Building the Controller

To build the controller image:

```bash
cd backend/controller
cargo build --release
docker build -t your-registry/sparktest-controller:latest .
docker push your-registry/sparktest-controller:latest
```

## Notes

- The API and GUI remain the primary entry points for SparkTest
- CRD support is optional and designed for Kubernetes-native workflows
- All runs (API and CRD) share the same backend database
- CRD runs can be filtered in the UI using the Origin filter
