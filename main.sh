#!/bin/bash

echo "🚀 Starting data download and HTML generation..."
echo ""

echo "📥 Downloading component data from erkul.games..."

curl -s "https://server.erkul.games/live/power-plants" \
  -H "Origin: https://www.erkul.games" \
  -H "Referer: https://www.erkul.games/" \
  > power.json
echo "  ✓ power.json"

curl -s "https://server.erkul.games/live/coolers" \
  -H "Origin: https://www.erkul.games" \
  -H "Referer: https://www.erkul.games/" \
  > cooler.json
echo "  ✓ cooler.json"

curl -s "https://server.erkul.games/live/shields" \
  -H "Origin: https://www.erkul.games" \
  -H "Referer: https://www.erkul.games/" \
  > shield.json
echo "  ✓ shield.json"

curl -s "https://server.erkul.games/live/qdrives" \
  -H "Origin: https://www.erkul.games" \
  -H "Referer: https://www.erkul.games/" \
  > qdrives.json
echo "  ✓ qdrives.json"

curl -s "https://server.erkul.games/live/weapons" \
  -H "Origin: https://www.erkul.games" \
  -H "Referer: https://www.erkul.games/" \
  > weapons.json
echo "  ✓ weapons.json"

curl -s "https://server.erkul.games/live/radars" \
  -H "Origin: https://www.erkul.games" \
  -H "Referer: https://www.erkul.games/" \
  > radars.json
echo "  ✓ radars.json"

echo ""
echo "🔧 Generating HTML from data..."

node transform.js

echo ""
echo "✅ Done! Open index.html in your browser to view the results."
