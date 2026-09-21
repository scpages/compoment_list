#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Fetching component data from cdn.erkul.games..."
node fetch_cdn.js

echo ""
git add power.json cooler.json shield.json qdrives.json radars.json weapons.json

if git diff --staged --quiet; then
  echo "No changes in component data."
  exit 0
fi

git commit -m "Update component data"
git push
echo "Component data updated and pushed."
