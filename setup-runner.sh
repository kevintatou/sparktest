#!/bin/bash

# GitHub Self-Hosted Runner Setup Script
# Run this after getting the token from GitHub Settings > Actions > Runners

echo "🚀 Setting up GitHub Self-Hosted Runner..."

# Create a folder for the runner
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download the latest runner package (you'll get the exact URL from GitHub)
echo "📥 Download the runner package from GitHub first, then run:"
echo "1. Go to your GitHub account Settings > Actions > Runners"
echo "2. Click 'New self-hosted runner'"
echo "3. Follow the download and configuration instructions"

echo ""
echo "📋 After downloading and extracting, configure with:"
echo "./config.sh --url https://github.com/[YOUR-USERNAME] --token [YOUR-TOKEN]"

echo ""
echo "🏃 To run the runner as a service:"
echo "sudo ./svc.sh install"
echo "sudo ./svc.sh start"

echo ""
echo "⚠️  IMPORTANT: Label your runner as 'self-hosted' and 'linux'"
echo "Then update your workflows to use: runs-on: [self-hosted, linux]"
