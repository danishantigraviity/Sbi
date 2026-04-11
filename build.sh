#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- STARTING CONSOLIDATED BUILD ---"

echo "--- INSTALLING ROOT DEPENDENCIES ---"
npm install

echo "--- INSTALLING BACKEND DEPENDENCIES ---"
cd backend && npm install
cd ..

echo "--- INSTALLING FRONTEND DEPENDENCIES ---"
cd frontend && npm install
cd ..

echo "--- BUILDING FRONTEND ---"
cd frontend && npm run build
cd ..

echo "--- VERIFYING BUILD OUTPUT ---"
if [ -d "frontend/dist" ]; then
  echo "✅ BUILD SUCCESS: frontend/dist exists."
  ls -la frontend/dist
else
  echo "❌ BUILD ERROR: frontend/dist was not created!"
  exit 1
fi

echo "--- PREPARING MONOLITH STRUCTURE ---"
# Create a symlink or copy to ensure backend can find it easily
mkdir -p backend/dist
cp -r frontend/dist/* backend/dist/
echo "✅ MONOLITH READY: backend/dist is populated."

echo "--- BUILD COMPLETE ---"
