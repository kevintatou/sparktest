#!/bin/bash

# Copy SparkTest project to your droplet
# Run this from your LOCAL machine (not the droplet)

echo "📦 Copying SparkTest to your droplet..."

# Replace these with your actual droplet details
DROPLET_IP="your-droplet-ip"
DROPLET_USER="root"
LOCAL_PROJECT_PATH="/home/kevin/code/sparktest"

# Copy the entire project
scp -r "$LOCAL_PROJECT_PATH" "$DROPLET_USER@$DROPLET_IP:~/"

echo "✅ Project copied to droplet!"
echo ""
echo "🚀 Now SSH into your droplet and run:"
echo "ssh $DROPLET_USER@$DROPLET_IP"
echo "cd ~/sparktest/.deploy"
echo "./start-runner.sh"
