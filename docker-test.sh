#!/bin/bash

# scripts/test.sh

# Stop and remove any existing test containers
docker-compose -f docker-compose.test.yml down -v

# Start fresh test environment
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test_runner

# Cleanup after tests
docker-compose -f docker-compose.test.yml down -v