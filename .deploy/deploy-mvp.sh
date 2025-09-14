#!/bin/bash

# SparkTest MVP Deployment Script
# Run this script on your droplet to deploy the latest release

set -e

echo "🚀 SparkTest MVP Deployment"
echo "=========================="
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        echo ""
        read -p "Would you like to install Docker now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📦 Installing Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            
            # Add current user to docker group
            sudo usermod -aG docker $USER
            
            # Start and enable Docker service
            sudo systemctl start docker
            sudo systemctl enable docker
            
            echo "✅ Docker installation completed"
            echo "⚠️  You may need to log out and back in for group membership to take effect"
            echo "   Or run: newgrp docker"
            docker --version
        else
            echo "Please install Docker manually: curl -fsSL https://get.docker.com | sh"
            exit 1
        fi
    fi
    
    # Check if Docker is accessible (try without sudo first, then with sudo)
    if docker info &> /dev/null; then
        echo "✅ Docker is accessible"
    elif sudo docker info &> /dev/null; then
        echo "✅ Docker is running (requires sudo)"
        echo "⚠️  Note: Docker commands will require sudo"
    else
        echo "❌ Error: Docker service is not running"
        echo "🔧 Attempting to start Docker service..."
        sudo systemctl start docker
        sleep 5
        if sudo docker info &> /dev/null; then
            echo "✅ Docker service started successfully"
        else
            echo "❌ Error: Failed to start Docker service"
            echo "Please start Docker manually: sudo systemctl start docker"
            exit 1
        fi
    fi
    
    # Check Docker Compose
    if docker compose version &> /dev/null || sudo docker compose version &> /dev/null; then
        echo "✅ Docker Compose is available"
    else
        echo "❌ Error: Docker Compose is not available"
        echo "Docker Compose should be included with modern Docker installations"
        exit 1
    fi
    
    echo "✅ All prerequisites met!"
    echo ""
}

# Function to deploy application
deploy_application() {
    echo "📦 Deploying SparkTest MVP..."
    
    # Function to run docker commands with fallback to sudo
    run_docker() {
        if docker "$@" 2>/dev/null; then
            return 0
        elif sudo docker "$@"; then
            return 0
        else
            return 1
        fi
    }
    
    # Function to run docker compose commands with fallback to sudo
    run_docker_compose() {
        if docker compose "$@" 2>/dev/null; then
            return 0
        elif sudo docker compose "$@"; then
            return 0
        else
            return 1
        fi
    }
    
    # Stop existing deployment
    echo "🧹 Stopping existing services..."
    run_docker_compose -f docker-compose.yml down --remove-orphans || echo "No existing deployment found"
    
    # Clean up old images
    echo "🧹 Cleaning up old images..."
    run_docker image prune -f
    
    # Build and start services
    echo "🔨 Building and starting services..."
    if ! run_docker_compose -f docker-compose.yml up --build -d; then
        echo "❌ Error: Failed to deploy SparkTest MVP"
        echo ""
        echo "📋 Checking logs for errors..."
        run_docker_compose -f docker-compose.yml logs --tail 50
        exit 1
    fi
    
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Show status
    echo "📋 Service status:"
    run_docker_compose -f docker-compose.yml ps
    
    echo ""
    echo "✅ SparkTest MVP deployed successfully!"
    echo ""
    echo "🌐 Access your application:"
    # Get external IP (try multiple methods for reliability)
    EXTERNAL_IP=""
    if command -v curl &> /dev/null; then
        EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || curl -s ipecho.net/plain 2>/dev/null)
    fi
    
    # Fallback to hostname -I if external IP detection fails
    if [ -z "$EXTERNAL_IP" ]; then
        EXTERNAL_IP=$(hostname -I | awk '{print $1}')
        echo "   Frontend: http://$EXTERNAL_IP (Note: This may be an internal IP)"
    else
        echo "   Frontend: http://$EXTERNAL_IP"
    fi
    echo ""
    echo "ℹ️  MVP Mode: Using local storage (no backend required)"
    echo ""
}

# Function to show management commands
show_management_info() {
    echo "🔧 Management commands:"
    echo "   View logs:     docker compose -f docker-compose.yml logs -f"
    echo "   Stop services: docker compose -f docker-compose.yml down"
    echo "   Restart:       docker compose -f docker-compose.yml restart"
    echo "   Update:        git pull && ./deploy-mvp.sh"
    echo ""
    echo "📊 Monitor resources:"
    echo "   Docker stats:  docker stats"
    echo "   Disk usage:    df -h"
    echo "   Memory usage:  free -h"
    echo ""
    echo "💡 If Docker commands require sudo, add 'sudo' before 'docker':"
    echo "   sudo docker compose -f docker-compose.yml logs -f"
    echo ""
    echo "🔄 To enable backend API (exit MVP mode):"
    echo "   1. Edit docker-compose.yml: uncomment backend service and volume"
    echo "   2. Set NEXT_PUBLIC_USE_RUST_API=true in frontend environment"
    echo "   3. Add 'depends_on: - backend' to frontend service"
    echo "   4. Redeploy: ./deploy-mvp.sh"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    deploy_application
    show_management_info
    
    echo "🎉 Deployment complete! Your SparkTest MVP is now running in local storage mode."
}

# Run main function
main "$@"
