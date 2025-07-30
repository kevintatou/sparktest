#!/bin/bash

# Copy SparkTest project to your droplet
# Run this from your LOCAL machine (not the droplet)

set -e

echo "📦 Copying SparkTest to your droplet..."
echo ""

# Get droplet details from environment or use defaults
DROPLET_IP="${DROPLET_IP:-your-droplet-ip}"
DROPLET_USER="${DROPLET_USER:-root}"
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
    
    # Check if we're in a SparkTest project directory
    if [ ! -f "$LOCAL_PROJECT_PATH/package.json" ] || [ ! -d "$LOCAL_PROJECT_PATH/.deploy" ]; then
        echo "❌ Error: This doesn't appear to be a SparkTest project directory"
        echo "   Missing package.json or .deploy directory"
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

# Copy the entire project
echo "📤 Copying from $LOCAL_PROJECT_PATH to $DROPLET_USER@$DROPLET_IP:~/"
if ! scp -r "$LOCAL_PROJECT_PATH" "$DROPLET_USER@$DROPLET_IP:~/"; then
    echo "❌ Error: Failed to copy files to droplet"
    echo "   Please check:"
    echo "   - Available disk space on droplet"
    echo "   - File permissions"
    echo "   - Network connectivity"
    exit 1
fi

echo "✅ Project copied to droplet successfully!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. SSH into your droplet:"
echo "   ssh $DROPLET_USER@$DROPLET_IP"
echo ""
echo "2. Navigate to the project directory:"
echo "   cd ~/sparktest/.deploy"
echo ""
echo "3. Set your GitHub runner token:"
echo "   export GH_RUNNER_TOKEN=\"your_token_here\""
echo "   # Get token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
echo ""
echo "4. Start the runner:"
echo "   ./start-runner.sh"
echo ""
echo "💡 Alternative: Use the automated deployment script from your local machine:"
echo "   ./deploy-runner.sh"
