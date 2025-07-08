# Kubernetes Integration for SparkTest

This document describes the Kubernetes integration features in SparkTest's Rust backend.

## Features

### 1. Kubernetes Client with Authentication
- **In-cluster authentication**: Automatically detects and uses service account tokens when running inside Kubernetes
- **Kubeconfig support**: Falls back to standard kubeconfig file authentication
- **Environment-based config**: Supports environment variable configuration
- **Multiple fallback mechanisms**: Tries different authentication methods in order of preference

### 2. Job Log Retrieval
- Fetch logs from Kubernetes Jobs by job name
- Retrieve logs from test runs by test run ID
- Automatic pod discovery for jobs
- Configurable log limits and timestamps

### 3. Job Management
- Get job status (running, completed, failed)
- Delete jobs and associated pods
- Health check for Kubernetes connectivity

### 4. Error Handling
- Comprehensive error handling with context
- Graceful fallbacks when Kubernetes is unavailable
- Structured error responses

## API Endpoints

### Health Check
```
GET /api/k8s/health
```
Check if the Kubernetes cluster is accessible.

**Response:**
```json
{
  "kubernetes_connected": true,
  "timestamp": "2025-07-07T10:30:00Z"
}
```

### Get Job Logs
```
GET /api/k8s/jobs/{job_name}/logs
```
Retrieve logs for a specific Kubernetes job.

**Response:**
```json
{
  "job_name": "test-job-123",
  "pod_name": "test-job-123-abcde",
  "logs": "2025-07-07T10:30:00Z Starting test...\n2025-07-07T10:30:01Z Test completed",
  "timestamp": "2025-07-07T10:30:00Z",
  "status": "completed"
}
```

### Get Test Run Logs
```
GET /api/test-runs/{run_id}/logs
```
Retrieve logs for a test run (maps to Kubernetes job `test-run-{run_id}`).

**Response:** Same as job logs endpoint.

### Get Job Status
```
GET /api/k8s/jobs/{job_name}/status
```
Get the current status of a Kubernetes job.

**Response:**
```json
{
  "job_name": "test-job-123",
  "status": "running",
  "timestamp": "2025-07-07T10:30:00Z"
}
```

### Delete Job
```
DELETE /api/k8s/jobs/{job_name}
```
Delete a Kubernetes job and its associated pods.

**Response:**
```json
{
  "message": "Job 'test-job-123' deleted successfully",
  "timestamp": "2025-07-07T10:30:00Z"
}
```

## Configuration

### Environment Variables
- `KUBERNETES_SERVICE_HOST`: Kubernetes API server host (set automatically in cluster)
- `KUBERNETES_SERVICE_PORT`: Kubernetes API server port (set automatically in cluster)

### Default Configuration
```rust
KubeConfig {
    namespace: "default",
    timeout_seconds: 300,
    max_log_lines: Some(1000),
}
```

## Authentication Methods

### 1. In-Cluster (Preferred)
When running inside a Kubernetes pod, the client automatically uses the service account token:
- Token: `/var/run/secrets/kubernetes.io/serviceaccount/token`
- CA Certificate: `/var/run/secrets/kubernetes.io/serviceaccount/ca.crt`

### 2. Kubeconfig
Falls back to the standard kubeconfig file from:
- `$KUBECONFIG` environment variable
- `~/.kube/config`

### 3. Environment Variables
Uses `KUBERNETES_SERVICE_HOST` and `KUBERNETES_SERVICE_PORT` if available.

## Error Handling

### Error Types
- **KubernetesError**: General Kubernetes API errors
- **AuthenticationError**: Authentication/authorization failures
- **NotFoundError**: Job or pod not found
- **NetworkError**: Connection issues

### Fallback Mechanisms
- If Kubernetes is unavailable, endpoints return appropriate HTTP status codes
- Health check endpoint indicates cluster connectivity status
- Graceful degradation when running without Kubernetes

## Usage Examples

### Frontend Integration
```javascript
// Check Kubernetes health
const healthCheck = async () => {
  const response = await fetch('/api/k8s/health');
  const data = await response.json();
  return data.kubernetes_connected;
};

// Get test run logs
const getTestRunLogs = async (runId) => {
  const response = await fetch(`/api/test-runs/${runId}/logs`);
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch logs');
};

// Get job status
const getJobStatus = async (jobName) => {
  const response = await fetch(`/api/k8s/jobs/${jobName}/status`);
  return await response.json();
};
```

### Curl Examples
```bash
# Health check
curl http://localhost:3001/api/k8s/health

# Get job logs
curl http://localhost:3001/api/k8s/jobs/test-job-123/logs

# Get test run logs
curl http://localhost:3001/api/test-runs/550e8400-e29b-41d4-a716-446655440000/logs

# Get job status
curl http://localhost:3001/api/k8s/jobs/test-job-123/status

# Delete job
curl -X DELETE http://localhost:3001/api/k8s/jobs/test-job-123
```

## Security Considerations

### RBAC Requirements
The service account needs the following permissions:
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: sparktest-backend
rules:
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "create", "delete"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get"]
```

### Network Policies
Consider implementing network policies to restrict access to the Kubernetes API server.

## Monitoring and Observability

### Logging
All Kubernetes operations are logged using the `tracing` crate:
- Info level: Successful operations, authentication method used
- Warn level: Non-fatal errors, fallback scenarios
- Error level: Critical failures, authentication errors

### Metrics
Future enhancements could include:
- Job creation/deletion counters
- Log retrieval latency metrics
- Authentication failure rates
- Health check status

## Testing

### Unit Tests
```bash
cargo test
```

### Integration Tests (requires Kubernetes cluster)
```bash
cargo test -- --ignored
```

### Health Check
```bash
curl http://localhost:3001/api/k8s/health
```

## Troubleshooting

### Common Issues

1. **"Failed to create Kubernetes client"**
   - Check if kubeconfig is available
   - Verify service account permissions if running in cluster
   - Check network connectivity to Kubernetes API

2. **"Job not found"**
   - Verify job name is correct
   - Check if job exists in the specified namespace
   - Jobs may have been automatically cleaned up (TTL)

3. **"Pod not found for job"**
   - Job may not have created pods yet
   - Pods may have been deleted due to cleanup policies
   - Check job status for failures

4. **"Failed to get logs"**
   - Pod may not be ready yet
   - Container may not have started
   - Logs may have been rotated or truncated

### Debug Mode
Enable debug logging:
```bash
RUST_LOG=debug cargo run
```

## Future Enhancements

1. **Real-time Log Streaming**: WebSocket support for live log streaming
2. **Multi-namespace Support**: Configure different namespaces per test
3. **Resource Limits**: Set CPU/memory limits for test jobs
4. **Job Templates**: Predefined job templates for different test types
5. **Metrics Collection**: Prometheus metrics for job execution
6. **Event Watching**: Real-time job status updates via Kubernetes events
