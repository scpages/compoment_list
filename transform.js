const fs = require("fs");

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    console.log(`⚠️  ${file} not found, skipping...`);
    return [];
  }
}

const powerPlants = loadJson("power.json");
const coolers    = loadJson("cooler.json");
const shields    = loadJson("shield.json");
const qdrives    = loadJson("qdrives.json");
const weapons    = loadJson("weapons.json");
const radars     = loadJson("radars.json");

function buildRows(items) {
  const seen = new Set();
  let rows = "";

  for (const item of items) {
    const d = item.data;
    if (!d) continue;

    const name = d.name || d.shortName;
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const cls   = d.class || "-";
    const grade = d.grade || "-";
    const size  = d.size  != null ? d.size : "-";

    rows += `
      <tr>
        <td class="comp-name">${name}</td>
        <td>${cls}</td>
        <td>${grade}</td>
        <td>${size}</td>
      </tr>`;
  }

  return rows || `<tr><td colspan="4">No data</td></tr>`;
}

function section(title, items) {
  const rows = buildRows(items);
  return `
    <div class="section-header">
      <h2>${title}</h2>
    </div>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Class</th>
          <th>Grade</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Component List - Star Citizen</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🔧%3C/text%3E%3C/svg%3E">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
      color: #e8e8e8;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
    }

    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }

    header {
      background: rgba(10, 14, 39, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid #2a9fd6;
      padding: 20px 0;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }

    h1 {
      color: #ffffff;
      font-size: 2rem;
      font-weight: 600;
      text-align: center;
      text-shadow: 0 0 20px rgba(42,159,214,0.5);
    }

    .subtitle {
      text-align: center;
      color: #a0a0a0;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background: rgba(20, 25, 45, 0.6);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }

    th {
      background: linear-gradient(180deg, #1e3a5f 0%, #152840 100%);
      color: #ffffff;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      padding: 16px 12px;
      text-align: left;
      border-bottom: 2px solid #2a9fd6;
    }

    td {
      padding: 12px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #d0d0d0;
      font-size: 0.9rem;
    }

    tr:hover { background-color: rgba(42,159,214,0.1); transition: background-color 0.2s ease; }
    tr:last-child td { border-bottom: none; }

    .comp-name { font-weight: 600; color: #2a9fd6; }

    .section-header {
      background: rgba(42,159,214,0.1);
      border-left: 4px solid #2a9fd6;
      padding: 15px 20px;
      margin: 40px 0 20px 0;
      border-radius: 4px;
    }

    .section-header h2 { color: #2a9fd6; font-size: 1.4rem; font-weight: 600; }

    .footer {
      margin-top: 50px;
      padding: 20px 0;
      border-top: 1px solid rgba(42,159,214,0.3);
      color: #888;
      font-size: 0.85rem;
      text-align: center;
    }

    .footer a { color: #2a9fd6; text-decoration: none; margin: 0 8px; }
    .footer a:hover { color: #4fc3f7; text-decoration: underline; }

    @media (max-width: 600px) {
      th, td { padding: 10px 8px; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>

  <header>
    <div class="container">
      <h1>Component List</h1>
      <div class="subtitle">Star Citizen - Components by Class &amp; Grade</div>
    </div>
  </header>

  <div class="container">
    ${section("Power Plants", powerPlants)}
    ${section("Coolers",     coolers)}
    ${section("Shields",     shields)}
    ${section("Quantum Drives", qdrives)}
    ${section("Weapons",    weapons)}
    ${section("Radars",     radars)}

    <div class="footer">
      Generated: ${new Date().toUTCString()} |
      <a href="https://github.com/scpages/compoment_list" target="_blank">GitHub Repository</a> |
      Data from <a href="https://www.erkul.games" target="_blank">erkul.games</a>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync("index.html", html);
console.log("✅ index.html generated successfully");
