#!/bin/bash

echo "Starting data download and HTML generation..."
echo ""

echo "Fetching component data from cdn.erkul.games..."
node fetch_cdn.js

echo ""
echo "Generating HTML from data..."
node transform.js

echo ""
echo "Done! Open index.html in your browser to view the results."
