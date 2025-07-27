# SparkTest Fly.io Deployment

This guide explains how to deploy SparkTest to Fly.io for demo purposes.

## Overview

This deployment configuration creates a simple demo instance of SparkTest on Fly.io using the frontend-only approach with mock data mode. This provides a lightweight demonstration without requiring external database or backend infrastructure.

## Files Added

- **`Dockerfile`** - Multi-stage build that creates a production Next.js standalone application
- **`fly.toml`** - Fly.io application configuration optimized for frontend deployment
- **`.github/workflows/deploy-fly.yml`** - GitHub Actions workflow for automatic deployment on release
- **`.dockerignore`** - Optimizes Docker build by excluding unnecessary files

## Architecture

The deployed application includes:

- **Frontend**: Next.js application running on port 3000
- **Mock Data**: Uses localStorage for demo data (no external dependencies)
- **Health Checks**: Health endpoint for monitoring
- **Standalone Mode**: Self-contained deployment with all dependencies included

## Demo Features

The demo deployment showcases:

- Test Definition management
- Test Executor configuration
- Test Run orchestration (mock mode)
- Test Suite organization
- Modern UI built with Next.js, Tailwind, and shadcn/ui

All data is stored in browser localStorage, making it perfect for demonstrations and trying out the interface.

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

4. **Deploy**:
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

- `NODE_ENV` - Node.js environment (set to 'production')
- `NEXT_TELEMETRY_DISABLED` - Disables Next.js telemetry
- `PORT` - Application port (defaults to 3000)

## Health Checks

- **Application**: `GET /` - Returns the Next.js application homepage
- **API**: `GET /api/run-test` - Mock API endpoint for testing

## Accessing the Application

After deployment:

- **Web UI**: `https://sparktest-demo.fly.dev` (or your configured app name)

## Scaling

This is configured as a lightweight demo deployment with:

- 512 MB RAM
- 1 shared CPU
- Auto-stop when idle
- Auto-start on traffic

For production use with the full backend, you would need to:

1. Deploy the Rust backend separately or include it in the container
2. Set up a PostgreSQL database
3. Configure Kubernetes connectivity
4. Adjust resource allocation accordingly

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

## Extending to Full Stack

To upgrade from this demo to a full deployment:

1. **Add the Rust backend** - Modify the Dockerfile to include the backend build steps
2. **Database** - Add PostgreSQL as a Fly.io addon
3. **Kubernetes** - Configure K8s connectivity for test execution
4. **Persistent Storage** - Add volumes for data persistence

The current demo provides the complete frontend experience and is perfect for showcasing the SparkTest interface and workflow.
