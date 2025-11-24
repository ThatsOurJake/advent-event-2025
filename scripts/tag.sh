#!/bin/bash

# Script to tag Docker images with git commit hash and latest tag
# Usage: ./tag.sh <docker_image_id> <registry> <docker_registry_image_name>

# Check if all required arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <docker_image_id> <registry> <docker_registry_image_name>"
    exit 1
fi

DOCKER_IMAGE_ID=$1
REGISTRY=$2
DOCKER_REGISTRY_IMAGE_NAME=$3

# Get the latest commit hash (first 7 characters)
COMMIT_HASH=$(git rev-parse --short=7 HEAD)

if [ -z "$COMMIT_HASH" ]; then
    echo "Error: Failed to get git commit hash"
    exit 1
fi

# Construct the image names
IMAGE_WITH_HASH="${REGISTRY}/${DOCKER_REGISTRY_IMAGE_NAME}:${COMMIT_HASH}"
IMAGE_WITH_LATEST="${REGISTRY}/${DOCKER_REGISTRY_IMAGE_NAME}:latest"

# Tag the Docker image with commit hash
echo "Tagging ${DOCKER_IMAGE_ID} as ${IMAGE_WITH_HASH}"
docker tag "${DOCKER_IMAGE_ID}" "${IMAGE_WITH_HASH}"

if [ $? -ne 0 ]; then
    echo "Error: Failed to tag image with commit hash"
    exit 1
fi

# Tag the Docker image with latest
echo "Tagging ${DOCKER_IMAGE_ID} as ${IMAGE_WITH_LATEST}"
docker tag "${DOCKER_IMAGE_ID}" "${IMAGE_WITH_LATEST}"

if [ $? -ne 0 ]; then
    echo "Error: Failed to tag image with latest"
    exit 1
fi

echo "Successfully tagged image:"
echo "  - ${IMAGE_WITH_HASH}"
echo "  - ${IMAGE_WITH_LATEST}"
