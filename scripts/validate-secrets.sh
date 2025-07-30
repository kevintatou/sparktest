#!/bin/bash

# Secret Validation Script for SparkTest Deployment
# This script helps validate that required secrets are properly configured
# for GitHub Actions workflows that deploy to Digital Ocean droplets.

set -e

echo "🔍 SparkTest Deployment Secrets Validation"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a secret is set (for local environment)
check_env_var() {
    local var_name="$1"
    local description="$2"
    
    if [ -n "${!var_name}" ]; then
        echo -e "${GREEN}✅ $var_name${NC} is set"
        return 0
    else
        echo -e "${RED}❌ $var_name${NC} is not set - $description"
        return 1
    fi
}

# Function to validate SSH key format
validate_ssh_key() {
    local key="$1"
    
    if [[ "$key" =~ ^-----BEGIN\ (OPENSSH\ )?PRIVATE\ KEY----- ]] && [[ "$key" =~ -----END\ (OPENSSH\ )?PRIVATE\ KEY-----$ ]]; then
        echo -e "${GREEN}✅ SSH key format${NC} appears valid"
        return 0
    else
        echo -e "${RED}❌ SSH key format${NC} appears invalid"
        echo "   Expected format: -----BEGIN [OPENSSH ]PRIVATE KEY----- ... -----END [OPENSSH ]PRIVATE KEY-----"
        return 1
    fi
}

# Function to validate IP address format
validate_ip() {
    local ip="$1"
    
    if [[ "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        IFS='.' read -ra ADDR <<< "$ip"
        for i in "${ADDR[@]}"; do
            if [ "$i" -gt 255 ]; then
                echo -e "${RED}❌ IP address format${NC} invalid: $ip"
                return 1
            fi
        done
        echo -e "${GREEN}✅ IP address format${NC} appears valid: $ip"
        return 0
    else
        echo -e "${RED}❌ IP address format${NC} invalid: $ip"
        echo "   Expected format: xxx.xxx.xxx.xxx"
        return 1
    fi
}

# Function to validate GitHub token format
validate_gh_token() {
    local token="$1"
    
    # GitHub runner tokens typically start with specific prefixes
    if [[ "$token" =~ ^[A-Z0-9]{7,}$ ]] && [ ${#token} -ge 10 ]; then
        echo -e "${GREEN}✅ GitHub token format${NC} appears valid"
        return 0
    else
        echo -e "${RED}❌ GitHub token format${NC} appears invalid"
        echo "   Expected: Alphanumeric token, typically 10+ characters"
        echo "   Get a new token from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
        return 1
    fi
}

echo -e "${BLUE}Checking required environment variables...${NC}"
echo ""

# Required secrets for deployment workflows
VALIDATION_FAILED=0

# Check DROPLET_IP
if check_env_var "DROPLET_IP" "Digital Ocean droplet IP address"; then
    validate_ip "$DROPLET_IP" || VALIDATION_FAILED=1
else
    VALIDATION_FAILED=1
fi

echo ""

# Check DROPLET_SSH_KEY
if check_env_var "DROPLET_SSH_KEY" "Private SSH key for droplet access"; then
    validate_ssh_key "$DROPLET_SSH_KEY" || VALIDATION_FAILED=1
else
    VALIDATION_FAILED=1
fi

echo ""

# Check GH_RUNNER_TOKEN
if check_env_var "GH_RUNNER_TOKEN" "GitHub runner registration token"; then
    validate_gh_token "$GH_RUNNER_TOKEN" || VALIDATION_FAILED=1
else
    VALIDATION_FAILED=1
fi

echo ""

# Check optional DROPLET_USER (used in deploy.yml)
if check_env_var "DROPLET_USER" "Username for droplet access (defaults to 'root')"; then
    echo -e "${GREEN}✅ DROPLET_USER${NC} is configured: $DROPLET_USER"
else
    echo -e "${YELLOW}⚠️  DROPLET_USER${NC} not set, will default to 'root'"
fi

echo ""
echo "=========================================="

if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All required secrets appear to be properly configured!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Set these values as GitHub repository secrets at:"
    echo "   https://github.com/kevintatou/sparktest/settings/secrets/actions"
    echo "2. Trigger a deployment by pushing to main or using workflow dispatch"
    echo "3. Monitor the deployment at:"
    echo "   https://github.com/kevintatou/sparktest/actions"
    exit 0
else
    echo -e "${RED}❌ Validation failed!${NC} Please fix the issues above."
    echo ""
    echo -e "${BLUE}Required GitHub Repository Secrets:${NC}"
    echo ""
    echo "🔑 DROPLET_IP"
    echo "   Description: IP address of your Digital Ocean droplet"
    echo "   Example: 192.168.1.100"
    echo ""
    echo "🔑 DROPLET_SSH_KEY"
    echo "   Description: Private SSH key for droplet access"
    echo "   Format: Full private key including headers"
    echo "   Example:"
    echo "   -----BEGIN OPENSSH PRIVATE KEY-----"
    echo "   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAAB..."
    echo "   -----END OPENSSH PRIVATE KEY-----"
    echo ""
    echo "🔑 GH_RUNNER_TOKEN"
    echo "   Description: GitHub runner registration token"
    echo "   Get from: https://github.com/kevintatou/sparktest/settings/actions/runners/new"
    echo "   Note: Tokens expire after 1 hour and need to be refreshed"
    echo ""
    echo "🔑 DROPLET_USER (optional)"
    echo "   Description: Username for droplet SSH access"
    echo "   Default: root"
    echo "   Example: ubuntu, admin, or custom username"
    echo ""
    echo -e "${BLUE}How to set secrets:${NC}"
    echo "1. Go to: https://github.com/kevintatou/sparktest/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo "3. Add each secret with its exact name and value"
    echo "4. Save and test with a workflow run"
    exit 1
fi