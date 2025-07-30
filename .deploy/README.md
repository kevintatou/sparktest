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

The deployment includes:

- **Frontend** (Next.js): Available on port 80
  - Modern React/Next.js application
  - Responsive UI with Tailwind CSS
  - Production-optimized build

- **Backend** (Rust): Available on port 8080
  - High-performance Axum web server
  - SQLite database for persistence
  - RESTful API endpoints

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

- **Frontend**: `http://your-droplet-ip:80`
- **Backend API**: `http://your-droplet-ip:8080`
- **Health checks**: 
  - Frontend: `http://your-droplet-ip:80/api/health`
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
# Check what's using ports 80 and 8080
sudo netstat -tlnp | grep ':80\|:8080'

# Kill processes if needed
sudo fuser -k 80/tcp
sudo fuser -k 8080/tcp
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
- SQLite database is persisted in a Docker volume
- Frontend and backend communicate over the internal Docker network
- Only necessary ports (80, 8080) are exposed

## 📝 Configuration

Key files:
- `docker-compose.yml`: Service orchestration
- `Dockerfile.backend`: Rust backend container
- `../Dockerfile`: Next.js frontend container (in project root)
- `deploy-mvp.sh`: Manual deployment script
