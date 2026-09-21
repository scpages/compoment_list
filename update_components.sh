#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Fetching component data from api.uexcorp.space..."
node fetch.js

echo ""
git add power.json cooler.json shield.json qdrives.json radars.json

if git diff --staged --quiet; then
  echo "No changes in component data."
  exit 0
fi

git commit -m "Update component data"
git push
echo "Component data updated and pushed."
