#!/usr/bin/env node
const fs = require("fs");

const API  = "https://api.uexcorp.space/2.0";
const SITE = "https://uexcorp.space/vehicles/components/tab";
const HEADERS_API  = { "Accept": "application/json", "User-Agent": "scpages-component-list/1.0" };
const HEADERS_HTML = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" };

const CATEGORIES = [
  { id: 21, slug: "power-plants",    file: "power.json",   label: "Power Plants"      },
  { id: 19, slug: "coolers",         file: "cooler.json",  label: "Coolers"           },
  { id: 23, slug: "shield-generators", file: "shield.json", label: "Shield Generators" },
  { id: 22, slug: "quantum-drives",  file: "qdrives.json", label: "Quantum Drives"    },
  { id: 83, slug: "radar",           file: "radars.json",  label: "Radars"            },
];

async function apiGet(path) {
  const resp = await fetch(`${API}${path}`, { headers: HEADERS_API });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${path}`);
  const d = await resp.json();
  if (d.status !== "ok") throw new Error(`API error: ${d.message}`);
  return d.data;
}

// Parse class + grade from UEX HTML table
async function scrapeClassGrade(slug) {
  const resp = await fetch(`${SITE}/${slug}/`, { headers: HEADERS_HTML });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${slug}`);
  const html = await resp.text();

  // Find column indices for Class and Grade from thead
  const theadMatch = html.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
  const headers = [];
  if (theadMatch) {
    const thRegex = /<th[^>]*>\s*([\w\s.]+?)\s*<\/th>/gi;
    let m;
    while ((m = thRegex.exec(theadMatch[1])) !== null) headers.push(m[1].trim());
  }
  const classIdx  = headers.findIndex(h => h === "Class");
  const gradeIdx  = headers.findIndex(h => h === "Grade");

  // Parse each row
  const result = {};
  const rowRegex = /<tr[^>]*class="[^"]*item-row[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    // Extract all cell text values
    const cells = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      // Strip HTML tags, decode entities, trim
      const text = tdMatch[1].replace(/<[^>]+>/g, " ").replace(/&mdash;/g, "—").replace(/\s+/g, " ").trim();
      cells.push(text);
    }
    // Name is in first cell — extract link text
    const nameMatch = rowHtml.match(/data-value="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    result[name] = {
      class: classIdx >= 0 && cells[classIdx] !== "—" ? cells[classIdx] : null,
      grade: gradeIdx >= 0 && cells[gradeIdx] !== "—" ? cells[gradeIdx] : null,
    };
  }
  return result;
}

async function main() {
  for (const cat of CATEGORIES) {
    process.stdout.write(`Fetching ${cat.label}...`);

    const [items, prices, classGrade] = await Promise.all([
      apiGet(`/items?id_category=${cat.id}`),
      apiGet(`/items_prices?id_category=${cat.id}`),
      scrapeClassGrade(cat.slug),
    ]);

    // Group prices by item id
    const pricesByItem = {};
    for (const p of prices) {
      if (!pricesByItem[p.id_item]) pricesByItem[p.id_item] = [];
      pricesByItem[p.id_item].push(p);
    }

    const data = items.map(item => {
      const cg = classGrade[item.name] || {};
      return {
        id:      item.id,
        name:    item.name,
        size:    item.size,
        grade:   cg.grade || null,
        class:   cg.class || null,
        maker:   item.company_name,
        version: item.game_version,
        prices:  (pricesByItem[item.id] || [])
          .map(p => ({ buy: p.price_buy, city: p.city_name, terminal: p.terminal_name }))
          .filter(p => p.buy > 0)
          .sort((a, b) => a.buy - b.buy),
      };
    }).sort((a, b) => {
      const sa = parseInt(a.size) || 99, sb = parseInt(b.size) || 99;
      return sa !== sb ? sa - sb : a.name.localeCompare(b.name);
    });

    fs.writeFileSync(cat.file, JSON.stringify(data, null, 2));
    const withCG = data.filter(d => d.grade || d.class).length;
    console.log(` ${items.length} items (${withCG} with class/grade) → ${cat.file}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
