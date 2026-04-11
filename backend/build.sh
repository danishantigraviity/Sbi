#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- STARTING UNIVERSAL BUILD ---"

# Detect if we are in the project root or inside the backend folder
if [ -d "backend" ]; then
    echo "✅ Running from Project Root"
    echo "--- INSTALLING BACKEND DEPENDENCIES ---"
    cd backend && npm install
    cd ..
elif [ -f "server.js" ]; then
    echo "✅ Running from Backend Folder"
    echo "--- INSTALLING DEPENDENCIES ---"
    npm install
else
    echo "❌ ERROR: Cannot find project structure. Current Dir: $(pwd)"
    ls -la
    exit 1
fi

echo "--- BUILD COMPLETE ---"
