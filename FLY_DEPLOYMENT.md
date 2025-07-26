# SparkTest Fly.io Deployment

This guide explains how to deploy SparkTest to Fly.io for demo purposes.

## Overview

This deployment configuration creates a demo instance of SparkTest on Fly.io that runs both the Next.js frontend and Rust backend in a single container.

## Files Added

- **`Dockerfile`** - Multi-stage build that creates a production image with both frontend and backend
- **`fly.toml`** - Fly.io application configuration
- **`.github/workflows/deploy-fly.yml`** - GitHub Actions workflow for automatic deployment on release
- **`.dockerignore`** - Optimizes Docker build by excluding unnecessary files

## Architecture

The deployed application includes:
- **Frontend**: Next.js application running on port 3000
- **Backend**: Rust (Axum) API server running on port 8080  
- **Database**: SQLite for persistent storage (mounted volume)
- **Health Checks**: Both services have health endpoints for monitoring

## Manual Deployment

To deploy manually:

1. **Install Fly CLI**: 
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**:
   ```bash
   fly auth login
   ```

3. **Launch the application** (first time):
   ```bash
   fly launch --no-deploy
   ```

4. **Create a volume for persistent storage**:
   ```bash
   fly volumes create sparktest_data --size 1
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

## Automatic Deployment

The GitHub Actions workflow automatically deploys on new releases:

1. **Set up Fly.io API token**:
   - Go to your GitHub repository settings
   - Add a secret named `FLY_API_TOKEN`
   - Set the value to your Fly.io API token (get from `fly auth token`)

2. **Create a release**:
   - The workflow triggers when you publish a new release
   - The application will be built and deployed automatically

## Environment Variables

The application supports these environment variables:

- `DATABASE_URL` - Database connection string (defaults to SQLite)
- `PORT` - Backend server port (defaults to 8080)
- `NODE_ENV` - Node.js environment (set to 'production')
- `RUST_LOG` - Rust logging level

## Health Checks

- **Frontend**: `GET /` - Returns the Next.js application
- **Backend**: `GET /health` - Returns JSON health status
- **K8s**: `GET /k8s/health` - Returns Kubernetes connectivity status

## Accessing the Application

After deployment:
- **Web UI**: `https://sparktest-demo.fly.dev` (or your app name)
- **API**: `https://sparktest-demo.fly.dev:8080` (backend endpoints)

## Storage

The application uses a persistent volume mounted at `/data` for SQLite database storage. This ensures data persists across deployments.

## Scaling

This is configured as a demo deployment with:
- 1 GB RAM
- 1 shared CPU
- Auto-stop when idle
- Auto-start on traffic

For production use, adjust the machine configuration in `fly.toml`.

## Troubleshooting

Check application logs:
```bash
fly logs
```

Check app status:
```bash
fly status
```

SSH into the running machine:
```bash
fly ssh console
```