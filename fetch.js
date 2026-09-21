#!/usr/bin/env node
const fs = require("fs");

const BASE = "https://api.uexcorp.space/2.0";
const HEADERS = { "Accept": "application/json", "User-Agent": "scpages-component-list/1.0" };

const CATEGORIES = [
  { id: 21, file: "power.json",  label: "Power Plants"   },
  { id: 19, file: "cooler.json", label: "Coolers"        },
  { id: 23, file: "shield.json", label: "Shield Generators" },
  { id: 22, file: "qdrives.json",label: "Quantum Drives" },
  { id: 83, file: "radars.json", label: "Radars"         },
];

async function get(path) {
  const resp = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${path}`);
  const d = await resp.json();
  if (d.status !== "ok") throw new Error(`API error: ${d.message}`);
  return d.data;
}

async function main() {
  for (const cat of CATEGORIES) {
    process.stdout.write(`Fetching ${cat.label}...`);
    const [items, prices] = await Promise.all([
      get(`/items?id_category=${cat.id}`),
      get(`/items_prices?id_category=${cat.id}`),
    ]);

    // Group prices by item id
    const pricesByItem = {};
    for (const p of prices) {
      if (!pricesByItem[p.id_item]) pricesByItem[p.id_item] = [];
      pricesByItem[p.id_item].push(p);
    }

    const data = items.map(item => ({
      id:        item.id,
      name:      item.name,
      size:      item.size,
      maker:     item.company_name,
      version:   item.game_version,
      prices:    (pricesByItem[item.id] || []).map(p => ({
        buy:      p.price_buy,
        city:     p.city_name,
        terminal: p.terminal_name,
      })).filter(p => p.buy > 0).sort((a, b) => a.buy - b.buy),
    })).sort((a, b) => {
      const sa = parseInt(a.size) || 99, sb = parseInt(b.size) || 99;
      return sa !== sb ? sa - sb : a.name.localeCompare(b.name);
    });

    fs.writeFileSync(cat.file, JSON.stringify(data, null, 2));
    console.log(` ${items.length} items, ${prices.length} price records → ${cat.file}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
