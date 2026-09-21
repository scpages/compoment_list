#!/usr/bin/env node
const { inflateRawSync } = require("zlib");
const fs = require("fs");

const CDN = "https://cdn.erkul.games";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://erkul.games/",
  "Origin": "https://erkul.games",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
};

const CATEGORY_FILES = {
  PowerPlant:         "power.json",
  Cooler:             "cooler.json",
  Shield:             "shield.json",
  QuantumDrive:       "qdrives.json",
  Radar:              "radars.json",
};

async function fetchBin(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const resp = await fetch(url, { headers: HEADERS });
    if (resp.status === 429 || resp.status === 503) {
      await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
    const buf = await resp.arrayBuffer();
    return JSON.parse(inflateRawSync(Buffer.from(buf)).toString("utf-8"));
  }
  throw new Error(`Failed after ${retries} attempts: ${url}`);
}

async function main() {
  const catalog = await fetchBin(`${CDN}/LIVE/catalog.bin`);
  const groupPath = catalog.groups.find(g => g.kind === "ships").indexPath;
  const group = await fetchBin(`${CDN}/LIVE/${groupPath}`);
  console.log(`Game version: ${catalog.dataVersion}  |  Ships: ${group.blobs.length}`);

  // bucket: filename -> Map<name+size+grade, item>
  const buckets = {};
  for (const f of new Set(Object.values(CATEGORY_FILES))) buckets[f] = new Map();

  for (let i = 0; i < group.blobs.length; i++) {
    const blob = group.blobs[i];
    process.stdout.write(`  [${String(i + 1).padStart(3)}/${group.blobs.length}] ${blob.id}\r`);
    try {
      const data = await fetchBin(`${CDN}/LIVE/${blob.path}`);
      for (const slot of data.slots || []) {
        const item = slot.item;
        if (!item) continue;
        const file = CATEGORY_FILES[item.category];
        if (!file) continue;
        const name = item.i18n?.name;
        if (!name) continue;
        const key = `${name}|${item.size}|${item.grade}`;
        if (!buckets[file].has(key)) {
          buckets[file].set(key, {
            data: {
              name,
              class: item.i18n?.class || null,
              grade: item.grade || null,
              size: item.size != null ? item.size : null,
            },
          });
        }
      }
    } catch (e) {
      process.stdout.write(`\n  ERROR ${blob.id}: ${e.message}\n`);
    }
    await new Promise(r => setTimeout(r, 80));
  }

  process.stdout.write("\n");

  for (const [file, map] of Object.entries(buckets)) {
    const items = [...map.values()].sort((a, b) => {
      const sa = a.data.size ?? 999, sb = b.data.size ?? 999;
      if (sa !== sb) return sa - sb;
      return (a.data.name || "").localeCompare(b.data.name || "");
    });
    fs.writeFileSync(file, JSON.stringify(items, null, 2));
    console.log(`  Saved ${items.length} items → ${file}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
