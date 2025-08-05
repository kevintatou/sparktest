# SparkTest MVP Deployment

This directory contains the deployment configuration for the SparkTest MVP (OSS version).

## 🚀 Automatic Deployment (Recommended)

The easiest way to deploy is through GitHub releases, which automatically triggers deployment on your self-hosted runner:

1. **Create a release** on GitHub:
   - Go to your repository
   - Click "Releases" → "Create a new release"
   - Tag version (e.g., `v0.2.0`)
   - Add release notes
   - Click "Publish release"

2. **Automatic deployment** will start:
   - GitHub Actions workflow runs on your self-hosted runner
   - Builds both frontend (Next.js) and backend (Rust)
   - Deploys using Docker Compose
   - Services become available on your droplet

## 🖥️ Manual Deployment

If you need to deploy manually on your droplet:

```bash
# 1. Copy deployment files to your droplet
./copy-to-droplet.sh

# 2. SSH into your droplet
ssh runner@your-droplet-ip

# 3. Navigate to the deployment directory
cd ~/sparktest/.deploy

# 4. Run the deployment script
./deploy-mvp.sh
```

## 📋 Services

The MVP deployment includes:

- **Frontend** (Next.js): Available on port 80
  - Modern React/Next.js application
  - Responsive UI with Tailwind CSS
  - Production-optimized build
  - **MVP Mode**: Uses local storage (no backend required)

*Note: Backend service is commented out for MVP deployment to reduce resource usage and simplify deployment.*

## 🔧 Management Commands

Once deployed, you can manage your services:

```bash
# View live logs
docker compose -f docker-compose.yml logs -f

# Check service status
docker compose -f docker-compose.yml ps

# Restart services
docker compose -f docker-compose.yml restart

# Stop all services
docker compose -f docker-compose.yml down

# Update deployment (after git pull)
./deploy-mvp.sh
```

## 🌐 Access Your Application

After successful deployment:

- **Frontend**: `http://your-droplet-ip` (MVP mode with local storage)

### To Enable Backend (Exit MVP Mode)

To add backend API support:

1. Edit `docker-compose.yml`:
   - Uncomment the backend service section
   - Uncomment the backend_data volume section
   - Set `NEXT_PUBLIC_USE_RUST_API=true` in frontend environment
   - Add `depends_on: - backend` to frontend service

2. Redeploy: `./deploy-mvp.sh`

3. Backend will be available at: `http://your-droplet-ip:8080`

### Health Checks (Full Mode)
- Frontend: `http://your-droplet-ip/api/health`  
- Backend: `http://your-droplet-ip:8080/health`

## 🐛 Troubleshooting

### Deployment fails
```bash
# Check Docker status
docker info

# Check available resources
df -h        # Disk space
free -h      # Memory
docker stats # Container resources
```

### Services not starting
```bash
# Check detailed logs
docker compose -f docker-compose.yml logs

# Rebuild services
docker compose -f docker-compose.yml up --build --force-recreate
```

### Port conflicts
```bash
# Check what's using port 80 (backend port 8080 not used in MVP mode)
sudo netstat -tlnp | grep ':80'

# Kill processes if needed
sudo fuser -k 80/tcp
```

## 📊 Monitoring

Keep an eye on your deployment:

```bash
# System resources
htop

# Docker container stats
docker stats

# Service logs
docker compose -f docker-compose.yml logs -f --tail 100

# Disk usage
docker system df
```

## 🔄 Updates

To update your deployment with the latest code:

1. **Using releases** (recommended): Create a new GitHub release
2. **Manual update**:
   ```bash
   git pull
   ./deploy-mvp.sh
   ```

## 🛡️ Security Notes

- Services run as non-root users in containers
- **MVP Mode**: Data stored in browser localStorage (no database)
- Only necessary port (80) is exposed in MVP mode
- Frontend runs in production mode with optimized build

*Note: When backend is enabled, SQLite database will be persisted in a Docker volume and internal Docker networking will be used for frontend-backend communication.*

## 📝 Configuration

Key files:
- `docker-compose.yml`: Service orchestration (MVP: frontend only)
- `Dockerfile.backend`: Rust backend container (commented out for MVP)
- `../Dockerfile`: Next.js frontend container (in project root)
- `deploy-mvp.sh`: Manual deployment script (shows external IP)
