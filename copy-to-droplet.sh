#!/bin/bash

# Copy SparkTest project to your droplet
# Run this from your LOCAL machine (not the droplet)

echo "📦 Copying SparkTest to your droplet..."

# Get droplet details from environment or use defaults
DROPLET_IP="${DROPLET_IP:-your-droplet-ip}"
DROPLET_USER="${DROPLET_USER:-root}"
LOCAL_PROJECT_PATH="${LOCAL_PROJECT_PATH:-$(pwd)}"

# Check if DROPLET_IP is set
if [ "$DROPLET_IP" = "your-droplet-ip" ]; then
    echo "❌ Error: Please set DROPLET_IP environment variable"
    echo "Usage: DROPLET_IP=your.droplet.ip.address ./copy-to-droplet.sh"
    exit 1
fi

# Copy the entire project
echo "📤 Copying from $LOCAL_PROJECT_PATH to $DROPLET_USER@$DROPLET_IP:~/"
scp -r "$LOCAL_PROJECT_PATH" "$DROPLET_USER@$DROPLET_IP:~/"

echo "✅ Project copied to droplet!"
echo ""
echo "🚀 Now SSH into your droplet and run:"
echo "ssh $DROPLET_USER@$DROPLET_IP"
echo "cd ~/sparktest/.deploy"
echo "export GH_RUNNER_TOKEN=your_token_here"
echo "./start-runner.sh"
