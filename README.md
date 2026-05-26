# Star Citizen Component List

Script which extracts component data from erkul.games and generates an HTML page listing all available components with their class, grade, and size.

## What it shows

Each component category (Power Plants, Coolers, Shields, Quantum Drives, Weapons, Radars) is displayed in its own table with:

- **Component** — full component name
- **Class** — full class name (e.g. Military, Stealth, Competition)
- **Grade** — grade number
- **Size** — component size

## Usage

```bash
bash main.sh
```

This downloads fresh data from erkul.games and generates `index.html`. Open it in your browser.

## Data Source

- Data from [erkul.games](https://www.erkul.games) API
