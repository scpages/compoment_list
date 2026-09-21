# Ship Component List

Fetches ship component data from the [UEX Corp API](https://uexcorp.space) and generates a static HTML page listing all components with their stats and in-game buy prices.

Live at: **https://scpages.github.io/component-list/**

## What it shows

Each category (Power Plants, Coolers, Shield Generators, Quantum Drives, Radars) has its own table with:

| Column | Description |
|---|---|
| Component | Component name |
| Size | S1 / S2 / S3 … |
| Class | Military, Stealth, Competition, Industrial, Civilian |
| Grade | A, B, C, D |
| Buy Price | In-game aUEC price (toggleable) |
| Location | City · Terminal (toggleable) |

Buy price and location columns are hidden by default — toggle them with the **Show Buy Prices** button.

Items are sorted by size, then grade (A→D), then class, then name.

## Workflow

```bash
# Generate HTML from local JSON data
bash main.sh

# Fetch fresh data from UEX Corp API, then commit + push
bash update_components.sh
```

`main.sh` only reads local JSON files and regenerates `index.html`.
`update_components.sh` hits the UEX API + scrapes uexcorp.space for class/grade, then pushes if data changed.

## Data Sources

- Item list & prices: [UEX Corp API](https://api.uexcorp.space/2.0/) (`/items`, `/items_prices`)
- Class & grade: scraped from [uexcorp.space/vehicles/components](https://uexcorp.space/vehicles/components)
