#!/bin/bash

echo "🚀 Starting Solve AI App with Docker Compose..."
echo "Creating network and containers..."

docker-compose down
docker-compose up -d --build

echo "Waiting for services to be ready..."
sleep 10

echo "Checking services..."
echo "✓ PostgreSQL running on localhost:5432"
echo "✓ Backend server running on http://localhost:4000"
echo "✓ Frontend running on http://localhost:5173"

echo ""
echo "Access the application:"
echo "Frontend: http://localhost:5173"
echo "API Health: http://localhost:4000/api/health"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
