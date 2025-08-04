#!/bin/bash

# Copy SparkTest project to your droplet
# Run this from your LOCAL machine (not the droplet)

set -e

echo "📦 Copying SparkTest to your droplet..."
echo ""

# Get droplet details from environment or use defaults
DROPLET_IP="${DROPLET_IP:-209.38.43.8}"  # Replace with your IP
DROPLET_USER="${DROPLET_USER:-runner}"
LOCAL_PROJECT_PATH="${LOCAL_PROJECT_PATH:-$(pwd)}"

# Function to validate environment
validate_setup() {
    local errors=0
    
    echo "🔍 Validating setup..."
    
    # Check if DROPLET_IP is set to a real value
    if [ "$DROPLET_IP" = "your-droplet-ip" ] || [ -z "$DROPLET_IP" ]; then
        echo "❌ Error: DROPLET_IP is not properly set"
        echo "   Usage: DROPLET_IP=your.droplet.ip.address ./copy-to-droplet.sh"
        echo "   Or set: export DROPLET_IP=\"your.droplet.ip.address\""
        ((errors++))
    else
        echo "✅ DROPLET_IP: $DROPLET_IP"
        
        # Validate IP format
        if [[ "$DROPLET_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "✅ IP address format appears valid"
        else
            echo "❌ Warning: IP address format may be invalid"
            echo "   Expected format: xxx.xxx.xxx.xxx"
        fi
    fi
    
    echo "✅ DROPLET_USER: $DROPLET_USER"
    echo "✅ LOCAL_PROJECT_PATH: $LOCAL_PROJECT_PATH"
    
    # Check if local project path exists
    if [ ! -d "$LOCAL_PROJECT_PATH" ]; then
        echo "❌ Error: Local project path does not exist: $LOCAL_PROJECT_PATH"
        ((errors++))
    fi
    
    # Check if we're in a SparkTest project directory and have the required files
    missing_files=()
    [ ! -f "$LOCAL_PROJECT_PATH/.deploy/Dockerfile.runner" ] && missing_files+=("Dockerfile.runner")
    [ ! -f "$LOCAL_PROJECT_PATH/.deploy/start-runner.sh" ] && missing_files+=("start-runner.sh")
    [ ! -f "$LOCAL_PROJECT_PATH/.deploy/deploy-mvp.sh" ] && missing_files+=("deploy-mvp.sh")
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo "❌ Error: Required files not found in .deploy directory:"
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
        echo "   Make sure you're running this from the SparkTest root directory"
        ((errors++))
    fi
    
    if [ $errors -gt 0 ]; then
        echo ""
        echo "❌ Found $errors error(s). Please fix the issues above and try again."
        exit 1
    fi
    
    echo "✅ Setup validation passed!"
    echo ""
}

# Run validation
validate_setup

# Test SSH connection first
echo "🔍 Testing SSH connection to droplet..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$DROPLET_USER@$DROPLET_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ Error: Cannot connect to droplet via SSH"
    echo "   Please check:"
    echo "   - DROPLET_IP is correct and reachable: $DROPLET_IP"
    echo "   - DROPLET_USER has access: $DROPLET_USER"
    echo "   - SSH key is properly configured"
    echo "   - Droplet is running and SSH service is active"
    echo ""
    echo "💡 Test SSH manually with:"
    echo "   ssh $DROPLET_USER@$DROPLET_IP"
    exit 1
fi
echo "✅ SSH connection successful!"

# Copy the deploy files to droplet
echo "📤 Copying deployment files to $DROPLET_USER@$DROPLET_IP:~/"

# Create the target directory on the droplet
if ! ssh "$DROPLET_USER@$DROPLET_IP" "mkdir -p ~/runner-setup"; then
    echo "❌ Error: Failed to create directory on droplet"
    exit 1
fi

# Copy the Docker runner and deployment files
if ! scp "$LOCAL_PROJECT_PATH/.deploy/Dockerfile.runner" \
        "$LOCAL_PROJECT_PATH/.deploy/start-runner.sh" \
        "$LOCAL_PROJECT_PATH/.deploy/deploy-mvp.sh" \
        "$DROPLET_USER@$DROPLET_IP:~/runner-setup/"; then
    echo "❌ Error: Failed to copy deployment files to droplet"
    echo "   Please check:"
    echo "   - Available disk space on droplet"
    echo "   - File permissions"
    echo "   - Network connectivity"
    echo "   - That .deploy directory exists with required files"
    exit 1
fi

echo "✅ Deployment files copied to droplet successfully!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. SSH into your droplet:"
echo "   ssh $DROPLET_USER@$DROPLET_IP"
echo ""
echo "2. Navigate to the runner setup directory:"
echo "   cd ~/runner-setup"
echo ""
echo "3. Get your GitHub runner token:"
echo "   # Go to: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
echo "   # Copy the token and set it:"
echo "   export GH_RUNNER_TOKEN=\"your_token_here\""
echo ""
echo "4. Start the Docker runner:"
echo "   ./start-runner.sh"
echo ""
echo "💡 The runner will be created as a Docker container named 'github-runner'"
