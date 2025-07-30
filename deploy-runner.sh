#!/bin/bash

# Deploy Self-Hosted Runner to Digital Ocean Droplet
# This script can be run locally to deploy the runner manually
# Requires: DROPLET_IP, DROPLET_SSH_KEY, GH_RUNNER_TOKEN environment variables

set -e

echo "🚀 Deploying Self-Hosted GitHub Runner to Digital Ocean..."

# Check required environment variables
if [ -z "$DROPLET_IP" ]; then
    echo "❌ Error: DROPLET_IP environment variable is not set"
    exit 1
fi

if [ -z "$DROPLET_SSH_KEY" ]; then
    echo "❌ Error: DROPLET_SSH_KEY environment variable is not set"
    exit 1
fi

if [ -z "$GH_RUNNER_TOKEN" ]; then
    echo "❌ Error: GH_RUNNER_TOKEN environment variable is not set"
    echo "Get your token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
    exit 1
fi

# Create temporary SSH key file
TEMP_KEY_FILE=$(mktemp)
echo "$DROPLET_SSH_KEY" > "$TEMP_KEY_FILE"
chmod 600 "$TEMP_KEY_FILE"

echo "📦 Copying runner files to droplet..."
scp -i "$TEMP_KEY_FILE" -r ./.deploy root@"$DROPLET_IP":~/sparktest/

echo "🔧 Deploying runner on droplet..."
ssh -i "$TEMP_KEY_FILE" root@"$DROPLET_IP" << EOF
cd ~/sparktest/.deploy

# Stop existing runner if running
docker stop github-runner || true
docker rm github-runner || true

# Build the runner image
echo "📦 Building runner Docker image..."
docker build -f Dockerfile.runner -t gh-runner .

# Run the runner container with the token
echo "🏃 Starting GitHub Actions runner..."
docker run -d \\
  --name github-runner \\
  --restart unless-stopped \\
  -e GH_REPO_URL="https://github.com/kevintatou/sparktest" \\
  -e GH_RUNNER_TOKEN="$GH_RUNNER_TOKEN" \\
  gh-runner

# Show status
echo "✅ Runner deployment complete!"
docker ps | grep github-runner || echo "❌ Runner not found in docker ps"
sleep 5
echo "📋 Runner logs:"
docker logs github-runner --tail 20 || echo "No logs available yet"
EOF

# Clean up temporary key file
rm -f "$TEMP_KEY_FILE"

echo ""
echo "🎉 Deployment complete!"
echo "📊 Check runner status at: https://github.com/kevintatou/sparktest/settings/actions/runners"