#!/bin/bash

# Start GitHub Actions Runner in Docker
# This script builds and runs the GitHub Actions runner as a Docker container

set -e

echo "🏃 Starting GitHub Actions Runner in Docker..."
echo ""

# Check if GitHub runner token is set
if [ -z "$GH_RUNNER_TOKEN" ]; then
    echo "❌ Error: GH_RUNNER_TOKEN environment variable is not set"
    echo ""
    echo "💡 To get a token:"
    echo "   1. Go to: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
    echo "   2. Click 'New self-hosted runner'"
    echo "   3. Select 'Linux'"
    echo "   4. Copy the token from the config command"
    echo ""
    echo "💡 Then set it:"
    echo "   export GH_RUNNER_TOKEN=\"your_token_here\""
    echo "   ./start-runner.sh"
    exit 1
fi

echo "✅ GitHub runner token is set (${#GH_RUNNER_TOKEN} characters)"

# Stop and remove existing runner container if it exists
echo "🧹 Cleaning up existing runner container..."
docker stop github-runner 2>/dev/null || echo "   No existing runner to stop"
docker rm github-runner 2>/dev/null || echo "   No existing runner to remove"

# Build the runner Docker image
echo "📦 Building GitHub Actions runner Docker image..."
if ! docker build -f Dockerfile.runner -t gh-actions-runner .; then
    echo "❌ Error: Failed to build Docker image"
    echo "   Make sure Dockerfile.runner exists and Docker is working"
    exit 1
fi

echo "✅ Docker image built successfully"

# Start the runner container
echo "🚀 Starting GitHub Actions runner container..."
if docker run -d \
    --name github-runner \
    --restart unless-stopped \
    -e GH_REPO_URL="https://github.com/kevintatou/sparktest" \
    -e GH_RUNNER_TOKEN="$GH_RUNNER_TOKEN" \
    -e GH_RUNNER_LABELS="spark-runner" \
    -e GH_RUNNER_NAME="docker-runner-$(hostname)" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    gh-actions-runner; then
    
    echo "✅ GitHub Actions runner started successfully!"
    echo ""
    echo "📋 Container status:"
    docker ps | grep github-runner
    
    echo ""
    echo "📋 Runner logs (last 10 lines):"
    sleep 5  # Give the container time to start
    docker logs github-runner --tail 10
    
    echo ""
    echo "🎉 Runner should now appear online at:"
    echo "   https://github.com/kevintatou/sparktest/settings/actions/runners"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker logs github-runner -f"
    echo "   Stop runner: docker stop github-runner"
    echo "   Remove runner: docker rm github-runner"
    
else
    echo "❌ Error: Failed to start runner container"
    echo ""
    echo "🔧 Debug information:"
    echo "   Docker version: $(docker --version)"
    echo "   Available images: $(docker images | grep gh-actions-runner || echo 'Image not found')"
    echo ""
    echo "💡 Try building the image manually:"
    echo "   docker build -f Dockerfile.runner -t gh-actions-runner ."
    exit 1
fi