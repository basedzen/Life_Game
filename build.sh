#!/bin/bash
# Build script that captures version information

# Get git commit hash
export GIT_COMMIT=$(git rev-parse HEAD)

# Get build timestamp
export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Building with:"
echo "  GIT_COMMIT: $GIT_COMMIT"
echo "  BUILD_TIME: $BUILD_TIME"

# Build with docker-compose
docker-compose build "$@"
