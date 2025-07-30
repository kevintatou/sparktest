#!/bin/bash

# GitHub Self-Hosted Runner Setup Script
# Run this on your droplet to start the self-hosted runner
# Make sure GH_RUNNER_TOKEN environment variable is set

set -e

echo "🚀 Setting up GitHub Self-Hosted Runner in Docker..."
echo ""

# Function to validate environment
validate_environment() {
    echo "🔍 Validating environment..."
    
    # Check if GH_RUNNER_TOKEN is set
    if [ -z "$GH_RUNNER_TOKEN" ]; then
        echo "❌ Error: GH_RUNNER_TOKEN environment variable is not set"
        echo "   Set it with: export GH_RUNNER_TOKEN=\"your_token_here\""
        echo "   Get your token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
        echo ""
        echo "💡 Note: GitHub tokens expire after 1 hour and need to be refreshed"
        exit 1
    fi
    
    # Basic token format validation
    if [[ "$GH_RUNNER_TOKEN" =~ ^[A-Z0-9]{7,}$ ]] && [ ${#GH_RUNNER_TOKEN} -ge 10 ]; then
        echo "✅ GitHub token format appears valid (${#GH_RUNNER_TOKEN} characters)"
    else
        echo "❌ Warning: GitHub token format may be invalid"
        echo "   Expected: Alphanumeric token, typically 10+ characters"
        echo "   Current: ${#GH_RUNNER_TOKEN} characters"
    fi
    
    # Check Docker availability
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker is not installed"
        echo "   Install Docker: https://docs.docker.com/engine/install/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo "❌ Error: Docker service is not running"
        echo "   Start Docker: sudo systemctl start docker"
        exit 1
    fi
    
    echo "✅ Docker is available"
    echo "✅ Environment validation passed!"
    echo ""
}

# Run validation
validate_environment

# Navigate to the deploy directory if not already there
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Build the runner image
echo "📦 Building runner Docker image..."
if ! docker build -f Dockerfile.runner -t gh-runner .; then
    echo "❌ Error: Failed to build Docker image"
    echo "   Check Dockerfile.runner and dependencies"
    exit 1
fi
echo "✅ Docker image built successfully!"

# Set the GitHub repo URL
GH_REPO_URL="https://github.com/kevintatou/sparktest"

# Stop existing runner if running
echo "🔄 Cleaning up existing runner..."
if docker ps -q -f name=github-runner | grep -q .; then
    echo "   Stopping existing runner..."
    docker stop github-runner || true
else
    echo "   No existing runner found"
fi

if docker ps -aq -f name=github-runner | grep -q .; then
    echo "   Removing existing runner container..."
    docker rm github-runner || true
fi

# Run the runner container
echo "🏃 Starting GitHub Actions runner..."
if ! docker run -d \
  --name github-runner \
  --restart unless-stopped \
  -e GH_REPO_URL="$GH_REPO_URL" \
  -e GH_RUNNER_TOKEN="$GH_RUNNER_TOKEN" \
  gh-runner; then
    echo "❌ Error: Failed to start runner container"
    exit 1
fi

# Verify deployment
sleep 3
if docker ps | grep github-runner > /dev/null; then
    echo "✅ Runner started successfully!"
    echo ""
    echo "📋 Container status:"
    docker ps | grep github-runner
    echo ""
    echo "📋 Recent logs:"
    docker logs github-runner --tail 10 || echo "   No logs available yet"
else
    echo "❌ Warning: Runner container not found"
    echo "📋 Checking logs for issues:"
    docker logs github-runner --tail 20 || echo "   No logs available"
    exit 1
fi

echo ""
echo "🎉 Runner deployment complete!"
echo ""
echo "📊 Check runner status at:"
echo "   https://github.com/kevintatou/sparktest/settings/actions/runners"
echo ""
echo "💡 Monitor runner with these commands:"
echo "   docker logs github-runner        # View logs"
echo "   docker ps | grep github-runner   # Check status"
echo "   docker restart github-runner     # Restart if needed"
