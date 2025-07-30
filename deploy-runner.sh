#!/bin/bash

# Deploy Self-Hosted Runner to Digital Ocean Droplet
# This script can be run locally to deploy the runner manually
# Requires: DROPLET_IP, SSH_PRIVATE_KEY, GH_RUNNER_TOKEN environment variables

set -e

echo "🚀 Deploying Self-Hosted GitHub Runner to Digital Ocean..."
echo ""

# Function to validate environment variables
validate_environment() {
    local errors=0
    
    echo "🔍 Validating environment variables..."
    
    if [ -z "$DROPLET_IP" ]; then
        echo "❌ Error: DROPLET_IP environment variable is not set"
        echo "   Set it with: export DROPLET_IP=\"your.droplet.ip.address\""
        ((errors++))
    else
        echo "✅ DROPLET_IP is set: $DROPLET_IP"
    fi

    if [ -z "$SSH_PRIVATE_KEY" ]; then
        echo "❌ Error: SSH_PRIVATE_KEY environment variable is not set"
        echo "   Set it with your private SSH key content"
        ((errors++))
    else
        echo "✅ SSH_PRIVATE_KEY is set (${#SSH_PRIVATE_KEY} characters)"
        
        # Validate SSH key format
        if [[ "$SSH_PRIVATE_KEY" =~ ^-----BEGIN\ (OPENSSH\ )?PRIVATE\ KEY----- ]] && [[ "$SSH_PRIVATE_KEY" =~ -----END\ (OPENSSH\ )?PRIVATE\ KEY-----$ ]]; then
            echo "✅ SSH key format appears valid"
        else
            echo "❌ Warning: SSH key format may be invalid"
            echo "   Expected format: -----BEGIN [OPENSSH ]PRIVATE KEY----- ... -----END [OPENSSH ]PRIVATE KEY-----"
            ((errors++))
        fi
    fi

    if [ -z "$GH_RUNNER_TOKEN" ]; then
        echo "❌ Error: GH_RUNNER_TOKEN environment variable is not set"
        echo "   Get your token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
        echo "   Set it with: export GH_RUNNER_TOKEN=\"your_token_here\""
        ((errors++))
    else
        echo "✅ GH_RUNNER_TOKEN is set (${#GH_RUNNER_TOKEN} characters)"
        
        # Basic token format validation
        if [[ "$GH_RUNNER_TOKEN" =~ ^[A-Z0-9]{7,}$ ]] && [ ${#GH_RUNNER_TOKEN} -ge 10 ]; then
            echo "✅ GitHub token format appears valid"
        else
            echo "❌ Warning: GitHub token format may be invalid"
            echo "   Expected: Alphanumeric token, typically 10+ characters"
        fi
    fi
    
    if [ $errors -gt 0 ]; then
        echo ""
        echo "❌ Found $errors error(s). Please fix the issues above and try again."
        echo ""
        echo "💡 Tip: You can use the validation script to check your configuration:"
        echo "   ./scripts/validate-secrets.sh"
        exit 1
    fi
    
    echo "✅ All environment variables are properly configured!"
    echo ""
}

# Run validation
validate_environment

# Create temporary SSH key file with proper error handling
echo "🔧 Setting up SSH connection..."
TEMP_KEY_FILE=$(mktemp)
echo "$SSH_PRIVATE_KEY" > "$TEMP_KEY_FILE"
chmod 600 "$TEMP_KEY_FILE"

# Test SSH connection first
echo "🔍 Testing SSH connection to droplet..."
if ! ssh -i "$TEMP_KEY_FILE" -o ConnectTimeout=10 -o BatchMode=yes root@"$DROPLET_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ Error: Cannot connect to droplet via SSH"
    echo "   Please check:"
    echo "   - DROPLET_IP is correct and reachable"
    echo "   - SSH key is valid and has access to the droplet"
    echo "   - Droplet is running and SSH service is active"
    rm -f "$TEMP_KEY_FILE"
    exit 1
fi
echo "✅ SSH connection successful!"

echo "📦 Copying runner files to droplet..."
if ! scp -i "$TEMP_KEY_FILE" -r ./.deploy root@"$DROPLET_IP":~/sparktest/ 2>/dev/null; then
    echo "❌ Error: Failed to copy files to droplet"
    echo "   Please check file permissions and available disk space on droplet"
    rm -f "$TEMP_KEY_FILE"
    exit 1
fi
echo "✅ Files copied successfully!"

echo "🔧 Deploying runner on droplet..."
ssh -i "$TEMP_KEY_FILE" root@"$DROPLET_IP" << 'EOF'
set -e

cd ~/sparktest/.deploy

echo "🧹 Cleaning up existing runner..."
# Stop existing runner if running
if docker ps -q -f name=github-runner | grep -q .; then
    echo "  Stopping existing runner..."
    docker stop github-runner || true
else
    echo "  No existing runner found"
fi

if docker ps -aq -f name=github-runner | grep -q .; then
    echo "  Removing existing runner container..."
    docker rm github-runner || true
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed on the droplet"
    echo "   Please install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check Docker service status
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker service is not running"
    echo "   Start Docker with: sudo systemctl start docker"
    exit 1
fi

# Build the runner image
echo "📦 Building runner Docker image..."
if ! docker build -f Dockerfile.runner -t gh-runner .; then
    echo "❌ Error: Failed to build Docker image"
    echo "   Please check Dockerfile.runner and dependencies"
    exit 1
fi
echo "✅ Docker image built successfully!"

# Run the runner container with the token
echo "🏃 Starting GitHub Actions runner..."
if ! docker run -d \
  --name github-runner \
  --restart unless-stopped \
  -e GH_REPO_URL="https://github.com/kevintatou/sparktest" \
  -e GH_RUNNER_TOKEN="$GH_RUNNER_TOKEN" \
  gh-runner; then
    echo "❌ Error: Failed to start runner container"
    echo "   Check Docker logs for more details"
    exit 1
fi

# Show status
echo "✅ Runner deployment complete!"
sleep 3

if docker ps | grep github-runner > /dev/null; then
    echo "✅ Runner container is running"
    echo "📋 Recent runner logs:"
    docker logs github-runner --tail 10 2>/dev/null || echo "   No logs available yet"
else
    echo "❌ Warning: Runner container not found in docker ps"
    echo "📋 Checking recent logs for issues:"
    docker logs github-runner --tail 20 2>/dev/null || echo "   No logs available"
fi
EOF

# Clean up temporary key file
rm -f "$TEMP_KEY_FILE"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Check runner status at: https://github.com/kevintatou/sparktest/settings/actions/runners"
echo "   2. The runner should appear as 'docker-runner' with 'spark-runner' label"
echo "   3. Monitor runner logs with: docker logs github-runner"
echo ""
echo "💡 Troubleshooting:"
echo "   - If runner doesn't appear, check the GitHub token hasn't expired"
echo "   - Tokens expire after 1 hour and need to be refreshed"
echo "   - Get a new token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"