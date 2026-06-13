#!/bin/bash

echo ""
echo "Running post create script..."
echo ""

set -Eeuo pipefail

# Install git if not already installed
if ! command -v git &> /dev/null; then
  echo "Installing git..."
  apk add --no-cache git
fi

# Install dependencies for backend and frontend
echo "Installing dependencies..."

# Backend dependencies
if [ -d "backend" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install
  echo "Fixing backend vulnerabilities..."
  npm audit fix || true
  cd ..
fi

# Frontend dependencies  
if [ -d "frontend" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  echo "Fixing frontend vulnerabilities..."
  npm audit fix || true
  cd ..
fi

echo "Post create script completed successfully!"