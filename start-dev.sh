#!/bin/bash

# SparkTest Development Environment Startup Script

set -e

echo "🚀 Starting SparkTest Development Environment..."
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

echo "📦 Building and starting services..."
echo "   - PostgreSQL database on :5432"
echo "   - Rust backend API on :8080" 
echo "   - Next.js frontend on :3000"
echo "   - Frontend will call backend via internal host 'backend' (Docker network)"
echo ""

# Start services
docker-compose -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be healthy..."

if docker-compose -f docker-compose.dev.yml ps postgres >/dev/null 2>&1; then
    # Wait for PostgreSQL
    echo "   Waiting for PostgreSQL..."
    until docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U sparktest -d sparktest >/dev/null 2>&1; do
            sleep 2
    done
    echo "   ✅ PostgreSQL ready"
else
    echo "   ⚠️  Postgres service not found (skipping)"
fi

# Wait for backend
echo "   Waiting for backend API..."
until curl -f http://localhost:8080/api/health >/dev/null 2>&1; do
    sleep 2
done
echo "   ✅ Backend API ready"

# Wait for frontend
echo "   Waiting for frontend..."
until curl -f http://localhost:3000 >/dev/null 2>&1; do
    sleep 2
done
echo "   ✅ Frontend ready"

echo ""
echo "🎉 SparkTest is now running!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8080/api/health"
echo "   Database:  postgresql://sparktest:sparktest_dev_password@localhost:5432/sparktest"
echo "   API Base (inside frontend container): http://backend:8080"
echo ""
echo "📊 View logs:"
echo "   docker-compose -f docker-compose.dev.yml logs -f [service]"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
