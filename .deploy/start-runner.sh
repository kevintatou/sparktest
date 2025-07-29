#!/bin/bash

# GitHub Self-Hosted Runner Setup Script
# Run this on your droplet to start the self-hosted runner

echo "🚀 Setting up GitHub Self-Hosted Runner in Docker..."

# Navigate to the deploy directory
cd /root/sparktest/.deploy

# Build the runner image
echo "📦 Building runner Docker image..."
docker build -f Dockerfile.runner -t gh-runner .

# Get the GitHub token from user
echo "🔑 You need to get the GitHub runner token:"
echo "1. Go to: https://github.com/YOUR-USERNAME/sparktest/settings/actions/runners/new"
echo "2. Copy the token from the configuration command"
echo ""
read -p "Enter your GitHub runner token: " GH_TOKEN

# Set your GitHub repo URL
GH_REPO_URL="https://github.com/kevintatou/sparktest"  # Replace YOUR-USERNAME
GH_TOKEN=""
# Run the runner container
echo "🏃 Starting GitHub Actions runner..."
docker run -d \
  --name github-runner \
  --restart unless-stopped \
  -e GH_REPO_URL="$GH_REPO_URL" \
  -e GH_RUNNER_TOKEN="$GH_TOKEN" \
  gh-runner

echo "✅ Runner started! Check status with:"
echo "docker logs github-runner"
echo ""
echo "🔍 To see if it's working:"
echo "docker ps | grep github-runner"
