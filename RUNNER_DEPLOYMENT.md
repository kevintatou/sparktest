# Self-Hosted GitHub Runner Deployment

This repository includes automated deployment of a self-hosted GitHub Actions runner to Digital Ocean droplets.

## Quick Start

⚠️ **Important**: Before proceeding, you must configure the required GitHub repository secrets. See the [Secrets Setup Guide](SECRETS_SETUP.md) for detailed instructions.

### Prerequisites

1. **Digital Ocean Droplet** with Docker installed
2. **SSH Key Access** to the droplet  
3. **GitHub Repository Secrets** configured (see [setup guide](SECRETS_SETUP.md))

### Validate Your Setup

Before deploying, validate your configuration:

```bash
# Set your environment variables locally
export DROPLET_IP="your.droplet.ip.address"
export DROPLET_SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
your-private-key-content
-----END OPENSSH PRIVATE KEY-----"
export GH_RUNNER_TOKEN="your_github_runner_token"

# Run validation
./scripts/validate-secrets.sh
```

## Automatic Deployment (Recommended)

The runner is automatically deployed via GitHub Actions when changes are made to runner-related files.

### Required Secrets

Set these in your GitHub repository secrets at: `https://github.com/kevintatou/sparktest/settings/secrets/actions`

- `DROPLET_IP` - Your Digital Ocean droplet IP address
- `DROPLET_SSH_KEY` - Private SSH key for accessing the droplet
- `GH_RUNNER_TOKEN` - GitHub runner registration token

📚 **For detailed setup instructions, see [SECRETS_SETUP.md](SECRETS_SETUP.md)**

### Getting a GitHub Runner Token

⚠️ **Important**: Runner tokens expire after 1 hour and are single-use.

1. Go to: https://github.com/kevintatou/sparktest/settings/actions/runners/new
2. Copy the token from the configuration command
3. Add it as the `GH_RUNNER_TOKEN` secret in your repository
4. If deployment fails, generate a fresh token and update the secret

**Example**: In the GitHub UI, you'll see:
```bash
./config.sh --url https://github.com/kevintatou/sparktest --token ABCDEF123456789
```
The token is the value after `--token` (e.g., `ABCDEF123456789`).

### Triggering Deployment

The runner deploys automatically when:

- Changes are pushed to main branch affecting runner files
- Manual trigger via GitHub Actions workflow dispatch

## Manual Deployment

### Option 1: Using the deployment script

```bash
# Set required environment variables
export DROPLET_IP="your.droplet.ip.address"
export DROPLET_SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
your-private-key-content
-----END OPENSSH PRIVATE KEY-----"
export GH_RUNNER_TOKEN="your_github_runner_token"

# Run the deployment script
./deploy-runner.sh
```

### Option 2: Using individual scripts

1. **Copy files to droplet:**

   ```bash
   DROPLET_IP=your.droplet.ip.address ./copy-to-droplet.sh
   ```

2. **SSH into droplet and start runner:**
   ```bash
   ssh root@your.droplet.ip.address
   cd ~/sparktest/.deploy
   export GH_RUNNER_TOKEN=your_token_here
   ./start-runner.sh
   ```

### Option 3: Using Docker Compose

```bash
# On your droplet
cd ~/sparktest/.deploy
export GH_RUNNER_TOKEN=your_token_here
docker compose up runner -d
```

## Monitoring

### Check runner status:

```bash
# On your droplet
docker ps | grep github-runner
docker logs github-runner
```

### Check in GitHub:

Go to: https://github.com/kevintatou/sparktest/settings/actions/runners

## Troubleshooting

### Runner not appearing in GitHub:

- Check the token is valid and not expired
- Verify the repository URL is correct
- Check docker logs for error messages

### Docker container won't start:

- Ensure Docker is installed on the droplet
- Check available disk space and memory
- Verify environment variables are set correctly

### SSH connection issues:

- Verify the droplet IP address is correct
- Ensure the SSH key has proper permissions (600)
- Check if the droplet is running and accessible

## Files Overview

- `.deploy/Dockerfile.runner` - Docker image for the GitHub runner
- `.deploy/entrypoint.sh` - Container entrypoint script
- `.deploy/start-runner.sh` - Manual runner deployment script
- `.deploy/docker-compose.yml` - Docker Compose configuration
- `.github/workflows/deploy-runner.yml` - Automated deployment workflow
- `deploy-runner.sh` - Comprehensive manual deployment script
- `copy-to-droplet.sh` - File copy utility script
