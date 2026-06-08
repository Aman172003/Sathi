#!/bin/bash

echo ""
echo "Running post attach script..."
echo ""

set -Eeuo pipefail

# This script runs when VS Code attaches to the container
echo "Post attach complete!"