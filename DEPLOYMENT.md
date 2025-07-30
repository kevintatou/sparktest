# SparkTest MVP Deployment Guide

## 🚀 Automated Deployment

Your SparkTest MVP is now configured for automated deployment using your self-hosted GitHub Actions runner on your DigitalOcean droplet.

### How it works:

1. **Trigger**: When you create a new release on GitHub, the deployment workflow automatically starts
2. **Build**: Both frontend (Next.js) and backend (Rust) are built as Docker containers
3. **Deploy**: Services are deployed using docker-compose with health checks
4. **Access**: Your app will be available at:
   - Frontend: `http://your-droplet-ip:80`
   - Backend API: `http://your-droplet-ip:8080`

### Manual Deployment:

You can also trigger deployment manually:
1. Go to Actions tab in your GitHub repo
2. Select "Deploy SparkTest MVP to Droplet" workflow
3. Click "Run workflow"

### Services:

- **Frontend**: Next.js app with React UI (Port 80)
- **Backend**: Rust API with Axum framework (Port 8080)
- **Database**: SQLite for persistence
- **Networking**: Docker bridge network for service communication

### Health Checks:

- Frontend: `http://your-droplet-ip:80/`
- Backend: `http://your-droplet-ip:8080/api/health`

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
