# SparkTest MVP Deployment Guide

## 🚀 Automated Deployment

Your SparkTest MVP is now configured for automated deployment using your self-hosted GitHub Actions runner on your DigitalOcean droplet.

### How it works:

1. **Trigger**: When you create a new release on GitHub, the deployment workflow automatically starts
2. **Build**: Frontend (Next.js) is built as Docker container in MVP mode
3. **Deploy**: Frontend service deployed using docker-compose with health checks
4. **Access**: Your app will be available at:
   - Frontend: `http://your-droplet-ip` (MVP mode with local storage)

### Manual Deployment:

You can also trigger deployment manually:

1. Go to Actions tab in your GitHub repo
2. Select "Deploy SparkTest MVP to Droplet" workflow
3. Click "Run workflow"

### Services:

- **Frontend**: Next.js app with React UI (Port 80)
  - **MVP Mode**: Uses local storage for data persistence
  - No backend dependency for simplified deployment
- **Backend**: Rust API with Axum framework (Port 8080) - _Commented out in MVP_
  - Available when enabled: SQLite database for persistence
  - Can be re-enabled by uncommenting in docker-compose.yml

### Health Checks:

- Frontend: `http://your-droplet-ip/`
- Backend (when enabled): `http://your-droplet-ip:8080/api/health`

### Files Created:

- `Dockerfile` - Frontend production build
- `Dockerfile.backend` - Backend production build
- `docker-compose.prod.yml` - Production orchestration
- `.github/workflows/deploy.yml` - Deployment workflow

### Next Steps:

1. Create a release on GitHub to trigger your first deployment
2. Monitor the Actions tab to see deployment progress
3. Access your deployed MVP at your droplet IP

### Troubleshooting:

- Check workflow logs in GitHub Actions
- SSH to droplet and run: `docker compose -f docker-compose.prod.yml logs`
- Verify services: `docker compose -f docker-compose.prod.yml ps`
