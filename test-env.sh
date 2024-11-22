#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check_service() {
    local url=$1
    local name=$2
    echo "Testing $name..."
    
    # Add verbose curl output for debugging
    echo "Trying $url"
    curl -v "$url" 2>&1 | grep "< HTTP"
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name is running${NC}"
        return 0
    fi
    
    echo -e "${RED}✗ $name failed to respond${NC}"
    return 1
}

echo "Starting services..."
docker-compose up -d

# Give services more time to start
sleep 10

# Check network status
echo "Docker network status:"
docker network ls
echo "Docker container status:"
docker-compose ps


check_service "http://localhost:3001/health" "WebSocket Service"
check_service "http://localhost:3000/health" "API Service"

# Print recent logs for both services
echo -e "\nRecent API logs:"
docker-compose logs --tail=50 api
echo -e "\nRecent WebSocket logs:"
docker-compose logs --tail=50 websocket