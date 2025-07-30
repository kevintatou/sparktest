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
        echo "❌ Error: Docker is not installed"
        echo "Install Docker: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo "❌ Error: Docker service is not running"
        echo "Start Docker: sudo systemctl start docker"
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
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
    
    # Stop existing deployment
    echo "🧹 Stopping existing services..."
    docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || echo "No existing deployment found"
    
    # Clean up old images
    echo "🧹 Cleaning up old images..."
    docker image prune -f
    
    # Build and start services
    echo "🔨 Building and starting services..."
    if ! docker compose -f docker-compose.yml up --build -d; then
        echo "❌ Error: Failed to deploy SparkTest MVP"
        echo ""
        echo "📋 Checking logs for errors..."
        docker compose -f docker-compose.yml logs --tail 50
        exit 1
    fi
    
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Show status
    echo "📋 Service status:"
    docker compose -f docker-compose.yml ps
    
    echo ""
    echo "✅ SparkTest MVP deployed successfully!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://$(hostname -I | awk '{print $1}'):80"
    echo "   Backend API: http://$(hostname -I | awk '{print $1}'):8080"
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
}

# Main execution
main() {
    check_prerequisites
    deploy_application
    show_management_info
    
    echo "🎉 Deployment complete! Your SparkTest MVP is now running."
}

# Run main function
main "$@"
