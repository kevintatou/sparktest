#!/bin/bash

# GitHub Self-Hosted Runner Setup Script
# Run this on your droplet to start the self-hosted runner
# Make sure GH_RUNNER_TOKEN environment variable is set

echo "🚀 Setting up GitHub Self-Hosted Runner in Docker..."

# Check if GH_RUNNER_TOKEN is set
if [ -z "$GH_RUNNER_TOKEN" ]; then
    echo "❌ Error: GH_RUNNER_TOKEN environment variable is not set"
    echo "Please set it with: export GH_RUNNER_TOKEN=your_token_here"
    echo "Get your token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
    exit 1
fi

# Navigate to the deploy directory
cd /root/sparktest/.deploy

# Build the runner image
echo "📦 Building runner Docker image..."
docker build -f Dockerfile.runner -t gh-runner .

# Set the GitHub repo URL
GH_REPO_URL="https://github.com/kevintatou/sparktest"

# Stop existing runner if running
echo "🔄 Stopping existing runner..."
docker stop github-runner 2>/dev/null || true
docker rm github-runner 2>/dev/null || true

# Run the runner container
echo "🏃 Starting GitHub Actions runner..."
docker run -d \
  --name github-runner \
  --restart unless-stopped \
  -e GH_REPO_URL="$GH_REPO_URL" \
  -e GH_RUNNER_TOKEN="$GH_RUNNER_TOKEN" \
  gh-runner

echo "✅ Runner started! Check status with:"
echo "docker logs github-runner"
echo ""
echo "🔍 To see if it's working:"
echo "docker ps | grep github-runner"
