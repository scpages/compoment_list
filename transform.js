const fs = require("fs");

function load(f) {
  try { return JSON.parse(fs.readFileSync(f, "utf-8")); }
  catch { console.warn(`${f} not found`); return []; }
}

const SECTIONS = [
  { file: "power.json",   title: "Power Plants"      },
  { file: "cooler.json",  title: "Coolers"           },
  { file: "shield.json",  title: "Shield Generators" },
  { file: "qdrives.json", title: "Quantum Drives"    },
  { file: "radars.json",  title: "Radars"            },
];

function fmtAUEC(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function buildRows(items) {
  if (!items.length) return `<tr><td colspan="5" class="no-data">No data</td></tr>`;
  return items.map(item => {
    const priceHtml = item.prices.length
      ? item.prices.map(p => `<span class="price-val">${fmtAUEC(p.buy)} aUEC</span>`).join("")
      : `<span class="no-data">—</span>`;
    const locHtml = item.prices.length
      ? item.prices.map(p => `<span class="loc">${p.city ? p.city + " · " : ""}${p.terminal}</span>`).join("")
      : `<span class="no-data">—</span>`;

    return `
      <tr>
        <td class="comp-name">${item.name}</td>
        <td class="size-cell"><span class="size-badge">S${item.size || "?"}</span></td>
        <td class="maker-cell">${item.maker || "—"}</td>
        <td>${priceHtml}</td>
        <td>${locHtml}</td>
      </tr>`;
  }).join("");
}

function section(title, items) {
  return `
    <div class="section-header">
      <h2>${title}</h2>
      <span class="count">${items.length} items</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Size</th>
            <th>Manufacturer</th>
            <th>Buy Price (aUEC)</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>${buildRows(items)}</tbody>
      </table>
    </div>`;
}

const sectionsHtml = SECTIONS.map(s => section(s.title, load(s.file))).join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ship Component List - Star Citizen</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:linear-gradient(135deg,#0a0e27 0%,#1a1f3a 100%);color:#e8e8e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;min-height:100vh}
    header{background:rgba(10,14,39,.8);backdrop-filter:blur(10px);border-bottom:2px solid #2a9fd6;padding:20px 0;margin-bottom:30px;box-shadow:0 4px 6px rgba(0,0,0,.3)}
    h1{color:#fff;font-size:2rem;font-weight:600;text-align:center;text-shadow:0 0 20px rgba(42,159,214,.5)}
    .subtitle{text-align:center;color:#a0a0a0;font-size:.9rem;margin-top:8px}
    .container{max-width:1200px;margin:0 auto;padding:20px}
    .section-header{display:flex;align-items:center;gap:14px;background:rgba(42,159,214,.1);border-left:4px solid #2a9fd6;padding:14px 20px;margin:40px 0 0;border-radius:4px}
    .section-header:first-of-type{margin-top:0}
    .section-header h2{color:#2a9fd6;font-size:1.3rem;font-weight:600}
    .count{color:#888;font-size:.82rem}
    .table-wrap{overflow-x:auto;border-radius:0 0 8px 8px;box-shadow:0 8px 16px rgba(0,0,0,.4);margin-bottom:10px}
    table{width:100%;border-collapse:separate;border-spacing:0;background:rgba(20,25,45,.6)}
    th{background:linear-gradient(180deg,#1e3a5f 0%,#152840 100%);color:#fff;font-weight:600;text-transform:uppercase;font-size:.78rem;letter-spacing:.5px;padding:13px 12px;text-align:left;border-bottom:2px solid #2a9fd6;white-space:nowrap}
    td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:top;font-size:.85rem}
    tr:hover td{background:rgba(42,159,214,.08)}
    tr:last-child td{border-bottom:none}
    .comp-name{font-weight:600;color:#2a9fd6;min-width:160px}
    .size-cell{white-space:nowrap}
    .size-badge{display:inline-block;background:rgba(42,159,214,.15);color:#4fc3f7;border:1px solid rgba(42,159,214,.3);border-radius:4px;font-size:.78rem;font-weight:700;padding:2px 7px}
    .maker-cell{color:#aaa;font-size:.82rem;white-space:nowrap}
    .price-val{display:block;font-weight:600;color:#e8e8e8;white-space:nowrap}
    .loc{display:block;color:#888;font-size:.78rem}
    .no-data{color:#555;text-align:center}
    .footer{margin-top:50px;padding:20px 0;border-top:1px solid rgba(42,159,214,.3);color:#888;font-size:.85rem;text-align:center}
    .footer a{color:#2a9fd6;text-decoration:none;margin:0 8px}
    .footer a:hover{color:#4fc3f7;text-decoration:underline}
  </style>
</head>
<body>
<header>
  <div class="container">
    <h1>Ship Component List</h1>
    <div class="subtitle">Star Citizen · In-Game Buy Prices &amp; Locations</div>
  </div>
</header>
<div class="container">
  ${sectionsHtml}
  <div class="footer">
    Generated: ${new Date().toUTCString()} ·
    <a href="https://github.com/scpages/compoment_list" target="_blank">GitHub</a> ·
    Data from <a href="https://uexcorp.space" target="_blank">UEX Corp</a>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync("index.html", html);
console.log("index.html generated successfully");
