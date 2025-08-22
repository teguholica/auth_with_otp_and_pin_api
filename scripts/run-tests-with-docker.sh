#!/bin/bash

# Script to run tests with Docker PostgreSQL
# This script starts a PostgreSQL container, waits for it to be ready,
# runs the tests, and then stops the container

set -e

# Configuration
CONTAINER_NAME="auth-api-test-postgres"
POSTGRES_DB="auth_test"
POSTGRES_USER="testuser"
POSTGRES_PASSWORD="testpass"
POSTGRES_PORT="5433"  # Use different port to avoid conflicts
DOCKER_IMAGE="postgres:15-alpine"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting test environment with Docker PostgreSQL...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Stopping existing container...${NC}"
    docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
    docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true
fi

# Start PostgreSQL container
echo -e "${GREEN}Starting PostgreSQL container...${NC}"
docker run -d \
    --name ${CONTAINER_NAME} \
    -e POSTGRES_DB=${POSTGRES_DB} \
    -e POSTGRES_USER=${POSTGRES_USER} \
    -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
    -p ${POSTGRES_PORT}:5432 \
    ${DOCKER_IMAGE} > /dev/null

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

until docker exec ${CONTAINER_NAME} pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} > /dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo -e "${RED}PostgreSQL failed to start within expected time${NC}"
        docker logs ${CONTAINER_NAME}
        docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
        docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true
        exit 1
    fi
    echo -e "${YELLOW}Attempt $ATTEMPT/$MAX_ATTEMPTS - waiting for database...${NC}"
    sleep 2
done

echo -e "${GREEN}PostgreSQL is ready!${NC}"

# Set environment variables for tests
export NODE_ENV=test
export DB_HOST=localhost
export DB_PORT=${POSTGRES_PORT}
export DB_NAME=${POSTGRES_DB}
export DB_USER=${POSTGRES_USER}
export DB_PASSWORD=${POSTGRES_PASSWORD}

# Initialize database
echo -e "${GREEN}Initializing database...${NC}"
cd "$(dirname "$0")/.."

# Try to find npm in common locations
NPM_CMD=$(which npm || which npm || echo "npm")
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm command not found. Please ensure Node.js and npm are installed and in your PATH.${NC}"
    echo -e "${YELLOW}Current PATH: $PATH${NC}"
    docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
    docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true
    exit 1
fi

echo -e "${GREEN}Using npm: $(which npm)${NC}"
npm run db:init || {
    echo -e "${RED}Failed to initialize database${NC}"
    docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
    docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true
    exit 1
}

# Run tests
echo -e "${GREEN}Running tests...${NC}"
npm test

# Store test exit code
TEST_EXIT_CODE=$?

# Clean up
echo -e "${YELLOW}Cleaning up...${NC}"
docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true
docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true

# Exit with test result
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed${NC}"
fi

exit $TEST_EXIT_CODE
