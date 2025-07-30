# Quick Setup for Deployment Secrets

This file provides a quick reference for setting up the required GitHub repository secrets for SparkTest deployment.

## 🚀 Quick Setup Steps

### 1. Get Your Values Ready

**DROPLET_IP**: Your Digital Ocean droplet IP address
```bash
# Find your droplet IP in Digital Ocean dashboard or run on droplet:
curl ifconfig.me
```

**SSH_PRIVATE_KEY**: Your private SSH key
```bash
# Display your private key (usually ~/.ssh/id_rsa):
cat ~/.ssh/id_rsa
```

**GH_RUNNER_TOKEN**: GitHub runner token (for runner deployment only)
```bash
# Get from: https://github.com/kevintatou/sparktest/settings/actions/runners/new
# Look for the --token parameter in the configuration command
```

### 2. Set GitHub Repository Secrets

1. Go to: https://github.com/kevintatou/sparktest/settings/secrets/actions
2. Click "New repository secret" for each:

| Secret Name | Value | Required For |
|-------------|-------|--------------|
| `DROPLET_IP` | `192.168.1.100` (your IP) | All deployments |
| `SSH_PRIVATE_KEY` | Complete private key with headers | All deployments |
| `GH_RUNNER_TOKEN` | GitHub runner token | Runner deployment only |
| `DROPLET_USER` | `root` or your username | App deployment (optional) |

### 3. Test Your Setup

```bash
# Set environment variables to match your secrets
export DROPLET_IP="your.droplet.ip.address"
export SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
your-private-key-content
-----END OPENSSH PRIVATE KEY-----"
export GH_RUNNER_TOKEN="your_github_runner_token"

# Run validation
./scripts/validate-secrets.sh
```

### 4. Deploy

**Deploy Runner (automatic)**:
- Push changes to main branch OR
- Go to Actions → Deploy Self-Hosted Runner → Run workflow

**Deploy Application**:
- Create and publish a release

## 🔧 Troubleshooting

**If deployment fails:**
1. Check GitHub Actions logs for specific errors
2. Run `./scripts/validate-secrets.sh` locally
3. Test SSH connection: `ssh root@your-droplet-ip`
4. For runner deployment: Get fresh GitHub token (they expire in 1 hour)

**Common Issues:**
- GitHub token expired → Get new token from runner settings
- SSH connection failed → Check IP, key, and droplet status
- Docker not available → Install Docker on droplet
- Permission denied → Check SSH key has access to droplet

## 📚 Full Documentation

- [Complete Setup Guide](SECRETS_SETUP.md) - Detailed instructions and troubleshooting
- [Runner Deployment Guide](RUNNER_DEPLOYMENT.md) - Runner-specific setup
- [Deployment Issue Template](.github/ISSUE_TEMPLATE/deployment-issue.md) - For reporting problems

## ⚡ Commands Reference

```bash
# Validate configuration
./scripts/validate-secrets.sh

# Manual runner deployment (alternative to GitHub Actions)
./deploy-runner.sh

# Copy project to droplet (alternative method)
DROPLET_IP=your-ip ./copy-to-droplet.sh

# Test SSH connection
ssh root@your-droplet-ip "echo 'Connected!' && docker --version"

# Check runner status on droplet
ssh root@your-droplet-ip "docker logs github-runner"

# View deployment logs
# Go to: https://github.com/kevintatou/sparktest/actions
```

---

**Need help?** Open an issue using the [Deployment Issue Template](.github/ISSUE_TEMPLATE/deployment-issue.md)