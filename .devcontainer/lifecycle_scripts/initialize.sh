#!/bin/bash

echo ""
echo "Running initialize script..."
echo ""

set -Eeuo pipefail

# This script runs on the host machine before the container starts
# Add any host-side preparations here if needed
echo "Initialize complete!"