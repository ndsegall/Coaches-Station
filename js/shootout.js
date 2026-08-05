// ===========================================================================
// Shootout tab — Erik's shootout scout, converted from an iframe embed to a
// native module. Everything is inside this IIFE so nothing leaks into
// Coaches Station's globals.
//
// The 7.17MB window.__SO_EMBEDDED__ snapshot is GONE: /api/shootout/* serves
// this live, and a stale offline copy earns nothing when the rest of the app
// needs the network anyway. @font-face and :root went too — this now inherits
// Coaches Station's fonts and design tokens instead of duplicating them.
// ===========================================================================
const ShootoutTab = (function () {
  const SO_CSS = `
#so-root * {box-sizing:border-box;}
#so-root {
  margin:0; background:var(--surface);
  color:var(--text); font-family:'Rubik',sans-serif;
  -webkit-font-smoothing:antialiased;
}
#so-root header {
  padding:1.25rem 2rem;
  background:var(--navy);
  border-bottom:4px solid var(--oilers-orange);
  display:flex; align-items:center; gap:1rem; flex-wrap:wrap;
  position:sticky; top:0; z-index:20;
  margin-bottom:0;
}
#so-root header .brand {display:flex;align-items:center;gap:0.6rem;}
#so-root header .brand img {height:40px;width:40px;object-fit:contain;}
#so-root header .brand-text {display:flex;flex-direction:column;line-height:1.25;}
#so-root header h1 {
  margin:0; font-size:1.1rem; font-weight:700; font-style:italic;
  font-family:'Rift','Rubik',sans-serif; letter-spacing:0.01em;
  color:#fff; text-transform:uppercase;
}
#so-root header .subtitle {
  font-size:0.78rem; font-weight:500; letter-spacing:0.02em;
  text-transform:uppercase; color:rgba(255,255,255,0.8);
}
#so-root .header-right {display:flex;align-items:center;gap:12px;margin-left:auto;}
#so-root .so-header-btn {
  background:none; border:1px solid rgba(255,255,255,0.35);
  border-radius:6px; padding:0.3rem 0.75rem;
  font-family:'Rubik',sans-serif; font-size:0.78rem; font-weight:500;
  color:rgba(255,255,255,0.85); cursor:pointer; transition:all 0.15s; white-space:nowrap;
}
#so-root .so-header-btn:hover {border-color:var(--oilers-orange);color:#fff;}
#so-root .status-banner {
  font-size:12px; padding:8px 14px;
  display:flex; align-items:center; gap:8px;
  border-bottom:1px solid var(--border);
}
#so-root .status-banner.sample {background:#fffbeb;border-bottom-color:#fcd34d;color:#92400e;}
#so-root .status-banner.live {background:#f0fdf4;border-bottom-color:#86efac;color:#166534;}
#so-root .wrap {padding:20px 32px 72px;}
#so-root .scoreboard {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:16px 22px;
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:14px; margin-bottom:14px;
}
#so-root .matchup-title {
  font-family:'Rift','Rubik',sans-serif; font-weight:700; font-style:italic;
  letter-spacing:0.5px; font-size:26px; text-transform:uppercase;
  display:flex; align-items:baseline; gap:10px; color:var(--navy);
}
#so-root .matchup-title .vs {color:var(--text3); font-size:16px; font-weight:500; font-style:normal;}
#so-root .search-box {position:relative; width:280px;}
#so-root .search-box input {
  width:100%; padding:10px 14px; border-radius:8px;
  background:var(--surface); border:1px solid var(--border); color:var(--text);
  font-family:'Rubik'; font-size:13px;
}
#so-root .search-box input:focus {outline:2px solid var(--accent); outline-offset:1px;}
#so-root .search-box input::placeholder {color:var(--text3);}
#so-root .search-results {
  position:absolute; top:calc(100% + 6px); left:0; right:0;
  background:var(--surface); border:1px solid var(--border); border-radius:8px;
  max-height:280px; overflow-y:auto; z-index:20; display:none;
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
}
#so-root .search-results.show {display:block;}
#so-root .search-result-row {
  padding:9px 12px; font-size:13px; cursor:pointer;
  display:flex; justify-content:space-between; border-bottom:1px solid var(--border);
}
#so-root .search-result-row:last-child {border-bottom:none;}
#so-root .search-result-row:hover {background:var(--surface2);}
#so-root .search-result-row .team-tag {color:var(--text3); font-family:'DM Mono',monospace; font-size:11px;}
#so-root .selector-bar {
  display:flex; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap;
}
#so-root .so-team-select {
  background:var(--surface); border:1px solid var(--border); color:var(--text);
  padding:8px 12px; border-radius:6px; font-family:'Rubik'; font-size:13px;
  min-width:220px; cursor:pointer;
}
#so-root .so-team-select:focus {outline:2px solid var(--accent); outline-offset:1px;}
#so-root .selector-bar .vs-label {color:var(--text3); font-family:'Rubik'; font-size:14px;}
#so-root .legend {display:flex; gap:18px; font-size:12px; color:var(--text3); margin-bottom:14px; flex-wrap:wrap;}
#so-root .legend span {display:flex; align-items:center; gap:6px;}
#so-root .panels {display:grid; grid-template-columns:1fr 1fr; gap:16px;}
@media (max-width:860px) {
#so-root .panels {grid-template-columns:1fr;} 
}
#so-root .team-panel {background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden;}
#so-root .team-header {
  padding:10px 14px; border-bottom:1px solid var(--border);
  font-family:'Rift','Rubik',sans-serif; letter-spacing:0.6px; font-size:14px; font-weight:700;
  font-style:italic; text-transform:uppercase;
  display:flex; justify-content:space-between; align-items:center;
  background:var(--navy); color:#fff;
}
#so-root .team-header .opp-goalie {
  font-size:10px; font-family:'DM Mono',monospace; color:rgba(255,255,255,0.75);
  font-weight:400; font-style:normal; letter-spacing:0; text-align:right;
  white-space:normal; max-width:60%;
}
#so-root table {width:100%; border-collapse:collapse; font-size:12.5px; table-layout:auto;}
#so-root thead th {
  position:sticky; top:0; text-align:right;
  font-family:'DM Mono',monospace; font-weight:700; font-size:10px;
  color:var(--text3); text-transform:uppercase; letter-spacing:0.4px;
  padding:7px 8px; border-bottom:2px solid var(--border); white-space:nowrap;
  cursor:pointer; user-select:none; background:var(--surface2);
}
#so-root thead th:hover {color:var(--accent);}
#so-root thead th.sort-asc::after {content:' ▲'; color:var(--accent);}
#so-root thead th.sort-desc::after {content:' ▼'; color:var(--accent);}
#so-root thead th:first-child {text-align:left; cursor:default; background:var(--surface2);}
#so-root thead th:first-child::after {content:'';}
#so-root tbody td {padding:7px 8px; border-bottom:1px solid var(--border); text-align:right; white-space:nowrap; color:var(--text);}
#so-root tbody td:first-child {text-align:left; white-space:normal;}
#so-root tbody tr:hover {background:var(--accent-light);}
#so-root .detail-row td { padding:0 !important; border-bottom:2px solid var(--border) !important; }
#so-root .detail-panel {
  background:var(--surface2); padding:14px 16px; display:grid;
  grid-template-columns:1fr 1fr; gap:16px;
}
#so-root .detail-section h4 {
  font-family:'Rubik'; font-size:11px; font-weight:700; letter-spacing:0.5px;
  color:var(--text3); margin:0 0 8px; text-transform:uppercase;
}
#so-root .detail-table { width:100%; font-size:11px; border-collapse:collapse; }
#so-root .detail-table td { padding:3px 8px; border-bottom:1px solid var(--border); color:var(--text); }
#so-root .detail-table td:last-child { text-align:right; font-family:'DM Mono',monospace; }
#so-root .detail-table tr:last-child td { border-bottom:none; }
#so-root .shot-bar {
  display:inline-block; height:6px; background:var(--accent);
  border-radius:3px; vertical-align:middle; margin-left:6px; opacity:0.5;
}
#so-root .player-name {font-weight:500; cursor:pointer; color:var(--text);}
#so-root .player-name:hover { color:var(--accent); }
#so-root .player-num {color:var(--text3); font-family:'DM Mono',monospace; font-size:10px; font-weight:500;}
#so-root .pct {font-family:'DM Mono',monospace; font-weight:600;}
#so-root .pct.hot {color:var(--hot);}
#so-root .pct.cold {color:var(--text3);}
#so-root .so-no-data {color:var(--text3); font-style:italic;}
#so-root .vsg-col {background:#e8eef7; width:52px; min-width:52px;}
#so-root thead th.vsg-col {background:#d8e3f0;}
#so-root .empty-panel {padding:26px 16px; color:var(--text3); font-size:13px; text-align:center;}
#so-root .goalie-row {display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;}
@media (max-width:860px) {
#so-root .goalie-row {grid-template-columns:1fr;} 
}
#so-root .goalie-col {display:flex; flex-direction:column; gap:10px;}
#so-root .goalie-card {
  background:var(--surface); border:1px solid var(--border); border-radius:var(--radius);
  overflow:hidden; cursor:pointer; transition:border-color 0.15s;
}
#so-root .goalie-card:hover {border-color:var(--accent);}
#so-root .goalie-card h3 {margin:0 0 2px; font-family:'Rubik'; font-size:15px; font-weight:600; color:var(--navy);}
#so-root .goalie-card .record {color:var(--text3); font-size:11.5px;}
#so-root .goalie-stat {text-align:right;}
#so-root .goalie-stat .big {font-family:'DM Mono',monospace; font-size:22px; font-weight:700; color:var(--navy);}
#so-root .goalie-stat .lbl {font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.4px;}
#so-root .section-toggle {margin-top:20px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden;}
#so-root .section-toggle summary {
  padding:12px 16px; cursor:pointer;
  font-family:'Rubik'; font-size:13px; font-weight:600; letter-spacing:0.2px; text-transform:uppercase; color:var(--navy);
  display:flex; justify-content:space-between; align-items:center; list-style:none; background:var(--surface2);
  border-bottom:1px solid var(--border);
}
#so-root .section-toggle summary::-webkit-details-marker {display:none;}
#so-root .section-toggle summary::after {content:'+'; font-size:18px; color:var(--text3);}
#so-root .section-toggle[open] summary::after {content:'3';}
#so-root .section-body {padding:14px 16px;}
#so-root .alltime-grid {display:grid; grid-template-columns:1fr 1fr; gap:20px;}
@media (max-width:760px) {
#so-root .alltime-grid {grid-template-columns:1fr;} 
}
#so-root .attempt-chip {
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 8px;border-radius:4px;font-size:11px;margin:1px 2px;
  font-family:'DM Mono',monospace; font-weight:500;
}
#so-root .attempt-chip.goal {background:#fef2ee;border:1px solid var(--goal);color:#9a2c0f;}
#so-root .attempt-chip.save {background:#eff6ff;border:1px solid #93c5fd;color:#1e40af;}
#so-root .attempt-chip.miss {background:var(--surface2);border:1px solid var(--border);color:var(--text3);}
#so-root .streak-hot {color:var(--hot);font-size:11px;font-family:'DM Mono',monospace;}
#so-root .streak-cold {color:var(--text3);font-size:11px;font-family:'DM Mono',monospace;}
#so-root .upcoming-bar {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:10px 14px; margin-bottom:14px;
  overflow-x:auto;
}
#so-root .upcoming-bar-label {
  font-size:10px; font-weight:700; text-transform:uppercase;
  letter-spacing:0.06em; color:var(--text3);
  margin-bottom:8px; font-family:'DM Mono',monospace;
}
#so-root .upcoming-games {display:flex; gap:8px; flex-wrap:nowrap; padding-bottom:2px;}
#so-root .upcoming-game {
  display:flex; flex-direction:column; align-items:center;
  padding:7px 12px; border-radius:8px; cursor:pointer;
  border:1.5px solid var(--border); background:var(--surface);
  transition:all 0.15s; white-space:nowrap; min-width:72px; flex-shrink:0;
}
#so-root .upcoming-game:hover { border-color:var(--oilers-orange); background:var(--surface2); }
#so-root .upcoming-game.selected { border-color:var(--navy); background:var(--accent-light); }
#so-root .upcoming-game .ug-date { font-size:10px; color:var(--text3); font-family:'DM Mono',monospace; }
#so-root .upcoming-game .ug-opp { font-size:14px; font-weight:700; color:var(--navy); font-family:'Rift','Rubik',sans-serif; font-style:italic; text-transform:uppercase; letter-spacing:0.3px; }
#so-root .upcoming-game .ug-loc { font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.04em; }
@media print {
#so-root * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
#so-root { background:white !important; color:#111 !important; padding:0; margin:0; font-family:'Rubik',sans-serif; }
#so-root .status-banner, #so-root .selector-bar, #so-root .search-box, #so-root #printBtn, #so-root .section-toggle, #so-root .legend, #so-root #searchResults, #so-root .upcoming-bar { display:none !important; }
#so-root header { position:static !important; background:var(--navy) !important; padding:8px 16px !important; margin-bottom:10px !important; }
#so-root .wrap { padding:0 !important; }
#so-root .scoreboard { background:white !important; border:none !important; border-bottom:2px solid #111 !important; padding:6px 0 !important; margin-bottom:8px !important; }
#so-root .matchup-title { color:#111 !important; font-size:18px !important; }
#so-root .matchup-title .vs { color:#444 !important; }
#so-root #gameMeta { color:#444 !important; font-size:10px !important; }
#so-root .panels { display:grid !important; grid-template-columns:1fr 1fr !important; gap:10px !important; margin-bottom:10px !important; }
#so-root .team-panel { border:1.5px solid #ccc !important; background:white !important; border-radius:0 !important; page-break-inside:avoid; }
#so-root .team-header { background:var(--navy) !important; color:white !important; padding:5px 10px !important; font-size:10px !important; display:flex !important; justify-content:space-between !important; }
#so-root .opp-goalie { color:#ccc !important; font-size:8px !important; white-space:normal !important; }
#so-root table { width:100% !important; border-collapse:collapse !important; font-size:7px !important; table-layout:fixed !important; }
#so-root thead th { background:#f0f0f0 !important; color:#333 !important; border-bottom:1.5px solid #999 !important; padding:3px 3px !important; font-size:6.5px !important; white-space:nowrap !important; overflow:hidden !important; }
#so-root thead th:first-child { text-align:left !important; width:24% !important; }
#so-root thead th:nth-child(2) { width:10% !important; }
#so-root thead th:nth-child(3) { width:7% !important; }
#so-root thead th:nth-child(4) { width:9% !important; }
#so-root thead th:nth-child(5) { width:9% !important; }
#so-root thead th.vsg-col { width:8% !important; }
#so-root tbody td { padding:3px 3px !important; border-bottom:1px solid #e8e8e8 !important; color:#111 !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; }
#so-root tbody td:first-child { text-align:left !important; font-size:7px !important; }
#so-root tbody tr:nth-child(even) { background:#fafafa !important; }
#so-root tbody tr:hover { background:transparent !important; }
#so-root .vsg-col { background:#eef3ff !important; }
#so-root .pct.hot { color:#8B6914 !important; font-weight:700 !important; }
#so-root .pct.cold { color:#999 !important; }
#so-root .so-no-data { color:#bbb !important; }
#so-root .no-attempts { display:none !important; }
#so-root .detail-row { display:none !important; }
#so-root #searchModal { display:none !important; }
#so-root .player-name { color:#111 !important; cursor:default !important; }
#so-root .player-num { color:#888 !important; font-size:6px !important; }
#so-root .goalie-row { display:grid !important; grid-template-columns:1fr 1fr !important; gap:10px !important; margin-top:8px !important; page-break-inside:avoid; }
#so-root .goalie-col { display:flex !important; flex-direction:column !important; gap:5px !important; }
#so-root .goalie-card { border:1.5px solid #ccc !important; background:white !important; border-radius:0 !important; padding:6px 10px !important; display:flex !important; justify-content:space-between !important; align-items:center !important; }
#so-root .goalie-card h3 { color:#111 !important; font-size:9px !important; margin:0 0 1px !important; }
#so-root .goalie-card .record { color:#555 !important; font-size:7.5px !important; }
#so-root .goalie-stat .big { color:#00205B !important; font-size:14px !important; font-weight:700 !important; }
#so-root .goalie-stat .lbl { color:#555 !important; font-size:7.5px !important; }
#so-root .print-notes { display:block !important; margin-top:12px; border-top:1px solid #ccc; padding-top:6px; }
#so-root .print-notes-label { font-size:8px; color:#777; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:20px; }
#so-root .print-notes-line { border-bottom:1px solid #ddd; margin-bottom:12px; height:1px; }
@page { margin:1cm 1.2cm; size:letter portrait; }

}


/* ---- Coaches Station native fit (see the faceoff module for rationale) --- */
#so-root { max-width:100%; overflow-x:hidden; background:none; }
#so-root .wrap { padding:0 0 1.25rem; }
/* grid children default to min-width:auto, so a wide table inside one column
   stretches the grid past its container instead of scrolling. */
#so-root .panels { min-width:0; }
#so-root .panels > * { min-width:0; }
#so-root .team-panel, #so-root .goalie-card { overflow-x:auto; }
#so-root header {
  background:none; border-bottom:1px solid var(--border);
  padding:0 0 0.85rem; margin:0 0 1.1rem; gap:0.75rem;
}
#so-root .so-header-btn {
  background:none; border:1px solid var(--header-border, var(--border));
  border-radius:6px; padding:0.35rem 0.85rem;
  font-family:'Rubik',sans-serif; font-size:0.8rem; font-weight:600;
  color:var(--text2); cursor:pointer; transition:all 0.15s;
}
#so-root .so-header-btn:hover { border-color:var(--oilers-orange); color:var(--text); }
`;
  const SO_HTML = `

<header>
  
  <div class="header-right">
    <button class="so-header-btn" id="printBtn" onclick="window.print()">⎙ Print / Export</button>
    <div class="search-box">
      <input id="searchInput" type="text" placeholder="Search any player or goalie…" autocomplete="off">
      <div class="search-results" id="searchResults"></div>
    </div>
  </div>
</header>

<div class="status-banner sample" id="statusBanner">Loading data…</div>

<div class="wrap">

  <div class="upcoming-bar" id="upcomingBar">
    <div class="upcoming-bar-label" id="upcomingLabel">EDM — Next 10 Games</div>
    <div class="upcoming-games" id="upcomingGames">
      <div class="upcoming-game" style="opacity:0.5;pointer-events:none;"><span class="ug-opp">···</span></div>
    </div>
  </div>

  <div class="scoreboard">
    <div>
      <div class="matchup-title" id="pageTitle">Select <span class="vs">a Matchup</span></div>
      <div class="game-meta" id="gameMeta" style="color:var(--text3);font-size:12px;font-family:'DM Mono',monospace;margin-top:4px;"></div>
    </div>
  </div>

  <div class="selector-bar">
    <select id="teamASelect" class="so-team-select"></select>
    <span class="vs-label">vs</span>
    <select id="teamBSelect" class="so-team-select"></select>
  </div>

  <div class="legend">
    <span style="color:var(--hot)">&#9679;</span> &ge;40% career shooting
  </div>

  <div class="panels" id="panels"></div>
  <div class="goalie-row" id="goalieRow"></div>

  <div class="print-notes" style="display:none;" id="printNotes">
    <div class="print-notes-label">Notes</div>
    <div class="print-notes-line"></div>
    <div class="print-notes-line"></div>
    <div class="print-notes-line"></div>
  </div>

  <details class="section-toggle" id="soOrderToggle">
    <summary>Shootout Order — Season History</summary>
    <div class="section-body">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
        <select id="soOrderSeason" class="so-team-select" style="min-width:130px;font-size:13px;padding:8px 12px;"></select>
      </div>
      <div id="soOrderBody" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:20px;"></div>
    </div>
  </details>

  <details class="section-toggle">
    <summary>Junior / AHL shootout log (manually tracked)</summary>
    <div class="section-body"><table id="minorTable"></table></div>
    <div class="note">Not available from NHL.com — this stays a manually logged table fed from your own tracking/Instat.</div>
  </details>

  <details class="section-toggle">
    <summary>All-time NHL shootout history</summary>
    <div class="section-body" id="allTimeBody">
      <p class="note" style="padding:0 0 10px;">Loading\\u2026</p>
    </div>
  </details>

</div>

`;
  let SO_API_BASE = '', SO_API_AUTH = '', SO_TEAM_B = '';

  function soFatal(msg) {
    const root = document.getElementById('so-root');
    if (root) root.innerHTML = '<div style="padding:2rem;color:var(--text2);' +
      'font-family:Rubik,sans-serif;">' + msg + '</div>';
  }


const TEAMS = [
  ["ANA","Anaheim Ducks"],["BOS","Boston Bruins"],["BUF","Buffalo Sabres"],["CGY","Calgary Flames"],
  ["CAR","Carolina Hurricanes"],["CHI","Chicago Blackhawks"],["COL","Colorado Avalanche"],["CBJ","Columbus Blue Jackets"],
  ["DAL","Dallas Stars"],["DET","Detroit Red Wings"],["EDM","Edmonton Oilers"],["FLA","Florida Panthers"],
  ["LAK","Los Angeles Kings"],["MIN","Minnesota Wild"],["MTL","Montreal Canadiens"],["NSH","Nashville Predators"],
  ["NJD","New Jersey Devils"],["NYI","New York Islanders"],["NYR","New York Rangers"],["OTT","Ottawa Senators"],
  ["PHI","Philadelphia Flyers"],["PIT","Pittsburgh Penguins"],["SJS","San Jose Sharks"],["SEA","Seattle Kraken"],
  ["STL","St. Louis Blues"],["TBL","Tampa Bay Lightning"],["TOR","Toronto Maple Leafs"],["UTA","Utah Mammoth"],
  ["VAN","Vancouver Canucks"],["VGK","Vegas Golden Knights"],["WSH","Washington Capitals"],["WPG","Winnipeg Jets"]
];

// ---- Fallback sample data (from your GM22 template) — used only if data/*.json isn't found yet ----
const SAMPLE_PLAYERS = [
  {name:"Ryan Nugent-Hopkins", team:"EDM", active:true, career:[15,45], seasons:{"20222023":[2,4],"20232024":[2,3],"20242025":[0,1],"20252026":[0,2]}, vs_goalie:{"Charlie Lindgren":[0,1]}},
  {name:"Connor McDavid",      team:"EDM", active:true, career:[15,35], seasons:{"20222023":[1,4],"20232024":[2,3],"20242025":[0,1],"20252026":[0,2]}, vs_goalie:{}},
  {name:"Leon Draisaitl",      team:"EDM", active:true, career:[12,32], seasons:{"20222023":[0,4],"20232024":[1,2],"20242025":[0,0],"20252026":[1,6]}, vs_goalie:{"Charlie Lindgren":[2,2]}},
  {name:"Adam Henrique",       team:"EDM", active:true, career:[4,23],  seasons:{"20222023":[1,2],"20232024":[0,0],"20242025":[0,0],"20252026":[1,2]}, vs_goalie:{}},
  {name:"Kasperi Kapanen",     team:"EDM", active:true, career:[0,6],   seasons:{}, vs_goalie:{"Charlie Lindgren":[0,1]}},
  {name:"Andrew Mangiapane",   team:"EDM", active:true, career:[0,4],   seasons:{}, vs_goalie:{}},
  {name:"Jack Roslovic",       team:"EDM", active:true, career:[0,3],   seasons:{}, vs_goalie:{}},
  {name:"Mattias Janmark",     team:"EDM", active:true, career:[0,2],   seasons:{}, vs_goalie:{}},
  {name:"Trent Frederic",      team:"EDM", active:true, career:[0,2],   seasons:{"20252026":[0,1]}, vs_goalie:{}},
  {name:"Zach Hyman",          team:"EDM", active:true, career:[0,1],   seasons:{"20252026":[0,1]}, vs_goalie:{}},
  {name:"Vasily Podkolzin",    team:"EDM", active:true, career:[0,1],   seasons:{}, vs_goalie:{}},
  {name:"Evan Bouchard",       team:"EDM", active:true, career:[0,1],   seasons:{}, vs_goalie:{"Charlie Lindgren":[0,1]}},
  {name:"Mattias Ekholm",      team:"EDM", active:true, career:[0,1],   seasons:{}, vs_goalie:{}},
  {name:"Alex Ovechkin",       team:"WSH", active:true, career:[37,127], seasons:{"20222023":[0,3],"20232024":[0,7],"20242025":[0,1],"20252026":[0,11]}, vs_goalie:{"Stuart Skinner":[0,2]}},
  {name:"Anthony Beauvillier", team:"WSH", active:true, career:[7,24],   seasons:{"20222023":[0,2],"20232024":[0,0],"20242025":[1,1],"20252026":[1,3]}, vs_goalie:{"Stuart Skinner":[0,2]}},
  {name:"Pierre-Luc Dubois",   team:"WSH", active:true, career:[10,23],  seasons:{"20222023":[1,1],"20232024":[2,4],"20242025":[2,5],"20252026":[5,10]}, vs_goalie:{}},
  {name:"Dylan Strome",        team:"WSH", active:true, career:[4,18],   seasons:{"20222023":[0,2],"20232024":[2,6],"20242025":[1,5],"20252026":[3,13]}, vs_goalie:{"Stuart Skinner":[1,2]}},
  {name:"John Carlson",        team:"WSH", active:true, career:[4,15],   seasons:{"20222023":[0,1],"20232024":[1,3],"20242025":[0,3],"20252026":[1,7]}, vs_goalie:{}},
  {name:"Sonny Milano",        team:"WSH", active:true, career:[1,7],    seasons:{"20232024":[1,3],"20242025":[0,0],"20252026":[1,3]}, vs_goalie:{}},
  {name:"Connor McMichael",    team:"WSH", active:true, career:[0,5],    seasons:{"20232024":[0,3],"20252026":[0,3]}, vs_goalie:{"Stuart Skinner":[0,2]}},
  {name:"Jakob Chychrun",      team:"WSH", active:true, career:[1,4],    seasons:{"20222023":[0,1],"20242025":[0,1],"20252026":[0,2]}, vs_goalie:{}},
  {name:"Nic Dowd",            team:"WSH", active:true, career:[0,2],    seasons:{}, vs_goalie:{}},
  {name:"Trevor van Riemsdyk", team:"WSH", active:true, career:[0,2],    seasons:{}, vs_goalie:{}},
  {name:"Aliaksei Protas",     team:"WSH", active:true, career:[0,1],    seasons:{"20242025":[0,1],"20252026":[0,1]}, vs_goalie:{}},
  {name:"Tom Wilson",          team:"WSH", active:true, career:[0,1],    seasons:{}, vs_goalie:{}},
  {name:"Rasmus Sandin",       team:"WSH", active:true, career:[0,1],    seasons:{"20252026":[0,1]}, vs_goalie:{}},
];
const SAMPLE_GOALIES = [
  {name:"Stuart Skinner", team:"EDM", number:74, active:true, stopped:16, faced:29, record:"3 W \u2013 6 L in career shootouts"},
  {name:"Calvin Pickard", team:"EDM", number:30, active:true, stopped:19, faced:25, record:"6 W \u2013 2 L in career shootouts"},
  {name:"Charlie Lindgren", team:"WSH", number:79, active:true, stopped:37, faced:54, record:"5 W \u2013 9 L in career shootouts"},
  {name:"Logan Thompson",   team:"WSH", number:36, active:true, stopped:39, faced:52, record:"5 W \u2013 8 L in career shootouts"},
];
const SAMPLE_MINOR = [
  {name:"D. Tomasek", team:"AHL", career:[8,19], cur:[8,18]},
  {name:"I. Howard",  team:"AHL", career:[5,6],  cur:[5,6]},
  {name:"M. Savoie",  team:"AHL", career:[3,8],  cur:[3,8]},
  {name:"A. Regula",  team:"AHL", career:[0,2],  cur:[0,2]},
];

let PLAYERS = SAMPLE_PLAYERS, GOALIES = SAMPLE_GOALIES, MINOR = SAMPLE_MINOR;
let ALLTIME = null;
let SO_ORDER = null;
let usingLive = false;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

async function loadUpcomingGames(){
  const teamA = document.getElementById('teamASelect').value || 'EDM';
  const label = document.getElementById('upcomingLabel');
  const container = document.getElementById('upcomingGames');
  if(label) label.textContent = `${teamA} — Next 10 Games`;
  if(!container) return;

  // Try current season first, then next
  const trySeasons = ['20262027','20252026'];
  let upcoming = [];
  for(const season of trySeasons){
    try{
      const resp = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${teamA}/${season}`);
      if(!resp.ok) continue;
      const data = await resp.json();
      const now = new Date();
      now.setHours(0,0,0,0);
      upcoming = (data.games || [])
        .filter(g => g.gameType === 2 && new Date(g.gameDate) >= now)
        .slice(0, 10);
      if(upcoming.length) break;
    }catch(e){}
  }

  if(!upcoming.length){
    container.innerHTML = '<div class="upcoming-game" style="opacity:0.5;pointer-events:none;"><span class="ug-date">Off-season</span></div>';
    return;
  }

  const selectedB = document.getElementById('teamBSelect').value;
  container.innerHTML = upcoming.map(g => {
    const d = new Date(g.gameDate + 'T12:00:00');
    const dateStr = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
    const isHome = g.homeTeam?.abbrev === teamA;
    const opp = isHome ? g.awayTeam?.abbrev : g.homeTeam?.abbrev;
    const loc = isHome ? 'HOME' : 'AWAY';
    const sel = opp === selectedB ? ' selected' : '';
    return `<div class="upcoming-game${sel}" onclick="selectMatchup('${teamA}','${opp}',this)">
      <span class="ug-date">${dateStr}</span>
      <span class="ug-opp">${opp}</span>
      <span class="ug-loc">${loc}</span>
    </div>`;
  }).join('');
}

function selectMatchup(teamA, teamB, el){
  document.getElementById('teamASelect').value = teamA;
  document.getElementById('teamBSelect').value = teamB;
  document.querySelectorAll('.upcoming-game').forEach(e => e.classList.remove('selected'));
  if(el) el.classList.add('selected');
  renderAll();
  renderSoOrder();
}

async function loadData(){
  // Self-sufficient path: Coaches Station's own API now owns the NHL-API
  // refresh logic (see /api/shootout/* in api.py) — nobody has to run
  // Erik's old pipeline by hand anymore. There is no offline fallback:
  // the embedded snapshot was removed when this became a native tab.
  const apiBase = SO_API_BASE;
  const apiAuth = SO_API_AUTH;
  let liveOk = false;
  if (apiBase) {
    try {
      const headers = apiAuth ? { 'Authorization': apiAuth } : {};
      const [pRes, gRes, aRes, oRes] = await Promise.all([
        fetch(`${apiBase}/api/shootout/players`, { headers }),
        fetch(`${apiBase}/api/shootout/goalies`, { headers }),
        fetch(`${apiBase}/api/shootout/alltime`, { headers }),
        fetch(`${apiBase}/api/shootout/so-order`, { headers }),
      ]);
      if (pRes.ok && gRes.ok) {
        PLAYERS = await pRes.json();
        GOALIES = await gRes.json();
        if (aRes.ok) ALLTIME = await aRes.json();
        if (oRes.ok) SO_ORDER = await oRes.json();
        usingLive = true;
        const lastMod = pRes.headers.get('x-shootout-last-refresh');
        window._lastUpdated = lastMod ? `Live — last refreshed ${lastMod}` : 'Live from Coaches Station API';
        liveOk = true;
      }
    } catch(e) { /* API unreachable — fall back below */ }
  }
  if (!liveOk) {
    // The embedded snapshot this used to fall back to has been removed:
    // /api/shootout/* owns the data now, and an offline copy is no use
    // when the rest of Coaches Station needs the network regardless.
    soFatal('Could not load shootout data from Coaches Station. '
          + 'The /api/shootout/* endpoints may be unreachable.');
    return;
  }
  updateBanner();
  populateTeamSelects();
  CURRENT_SEASON = detectCurrentSeason(PLAYERS);
  renderAll();
  renderAllTime();
  renderSoOrder();
  loadUpcomingGames();
  document.getElementById('teamASelect').addEventListener('change', loadUpcomingGames);
}

function updateBanner(){
  const el = document.getElementById('statusBanner');
  if(usingLive){
    el.className = 'status-banner live';
    const ts = window._lastUpdated ? ` — Last updated: ${window._lastUpdated}` : '';
    el.textContent = `Live data${ts}`;
  } else {
    el.className = 'status-banner sample';
    el.textContent = '\u26A0 No live data found yet \u2014 showing sample data. Run the pipeline export to populate data/*.json.';
  }
}

function populateTeamSelects(){
  const teamsWithData = new Set(PLAYERS.map(p => p.team).concat(GOALIES.map(g => g.team)));
  const aSel = document.getElementById('teamASelect');
  const bSel = document.getElementById('teamBSelect');
  const blankOpt = `<option value="">— Select Team —</option>`;
  const opts = TEAMS.map(([abbr,name]) => {
    const has = teamsWithData.has(abbr);
    return `<option value="${abbr}">${abbr} – ${name}${has ? '' : ' (no data yet)'}</option>`;
  }).join('');
  aSel.innerHTML = blankOpt + opts;
  bSel.innerHTML = blankOpt + opts;
  aSel.value = teamsWithData.has('EDM') ? 'EDM' : '';
  bSel.value = teamsWithData.has(SO_TEAM_B) ? SO_TEAM_B : '';
  aSel.addEventListener('change', renderAll);
  bSel.addEventListener('change', renderAll);
  // Also update SO order when teams change
  aSel.addEventListener('change', () => { renderSoOrder(); });
  bSel.addEventListener('change', () => { renderSoOrder(); });
}

function pct(pair){
  if(!pair) return null;
  const [g,a] = pair;
  return a>0 ? g/a : 0;
}
function fmtPct(pair){
  const p = pct(pair);
  if(p===null) return '<span class="so-no-data">\u2014</span>';
  const cls = p>=0.40 ? 'hot' : (p===0 ? 'cold' : '');
  return `<span class="pct ${cls}">${(p*100).toFixed(0)}%</span>`;
}
function fmtGA(pair){
  if(!pair || pair[1]===0) return '<span class="so-no-data">\u2014</span>';
  return `${pair[0]}/${pair[1]}`;
}
function last3(seasons){
  const keys = Object.keys(seasons || {}).sort().reverse().slice(0,3);
  if(!keys.length) return null;
  let g=0,a=0;
  keys.forEach(k => { g += seasons[k][0]; a += seasons[k][1]; });
  return [g,a];
}
function currentSeason(seasons){
  const keys = Object.keys(seasons || {}).sort().reverse();
  return keys.length ? seasons[keys[0]] : null;
}
// Determine the most recent season that actually has data across all loaded players
function detectCurrentSeason(players){
  const counts = {};
  players.forEach(p => {
    Object.keys(p.seasons || {}).forEach(k => {
      const att = (p.seasons[k] || [0,0])[1];
      if(att > 0) counts[k] = (counts[k] || 0) + att;
    });
  });
  const keys = Object.keys(counts).sort().reverse();
  if(!keys.length) return null;
  const best = keys[0];
  // Format nicely: "20242025" -> "2024-25"
  return { key: best, label: best.slice(0,4) + '\u2013' + best.slice(6) };
}
let CURRENT_SEASON = null;

// Sort state per panel: key = teamAbbrev, value = {col, dir}
const SORT_STATE = {};

function sortPlayers(players, col, dir, oppGoalies){
  const mult = dir === 'asc' ? 1 : -1;
  return [...players].sort((a, b) => {
    // Always push zero-career-attempt players to the bottom
    if(a.career[1] === 0 && b.career[1] > 0) return 1;
    if(b.career[1] === 0 && a.career[1] > 0) return -1;
    let av, bv;
    if(col === 'career')    { av = a.career[1]; bv = b.career[1]; }
    else if(col === 'pct')  { av = a.career[1]>0 ? a.career[0]/a.career[1] : -1; bv = b.career[1]>0 ? b.career[0]/b.career[1] : -1; }
    else if(col === 'l3')   { const al=last3(a.seasons), bl=last3(b.seasons); av=al?al[1]:-1; bv=bl?bl[1]:-1; }
    else if(col === 'cur')  { const ak=CURRENT_SEASON?.key, ac=ak?(a.seasons[ak]||null):currentSeason(a.seasons), bc=ak?(b.seasons[ak]||null):currentSeason(b.seasons); av=ac?ac[1]:-1; bv=bc?bc[1]:-1; }
    else if(col.startsWith('vsg:')){
      const gname = col.slice(4);
      const as = a.vs_goalie?.[gname]; const bs = b.vs_goalie?.[gname];
      av = as ? as[1] : -1; bv = bs ? bs[1] : -1;
    }
    else { av = 0; bv = 0; }
    // desc = highest first (bv > av means b comes first, so return positive)
    // asc  = lowest first (av > bv means a comes first, so return negative)
    return mult * (av - bv);
  });
}

function renderPanels(teamA, teamB){
  const panelsEl = document.getElementById('panels');
  const pairs = [[teamA, teamB], [teamB, teamA]];
  panelsEl.innerHTML = pairs.map(([team, opp]) => {
    if(!team || !opp) return '';
    const sort = SORT_STATE[team] || {col:'career', dir:'desc'};
    let players = PLAYERS.filter(p => p.team === team && p.active);
    const oppGoalies = GOALIES.filter(g => g.team === opp && g.active);
    const curLabel = CURRENT_SEASON ? CURRENT_SEASON.label : 'Current';
    const curKey   = CURRENT_SEASON ? CURRENT_SEASON.key   : null;

    players = sortPlayers(players, sort.col, sort.dir, oppGoalies);

    if(!players.length){
      return `<div class="team-panel">
        <div class="team-header"><span>${team} SHOOTERS</span></div>
        <div class="empty-panel">No shootout data loaded for ${team} yet.</div>
      </div>`;
    }

    const oppLabel = oppGoalies.length
      ? oppGoalies.map(g => `${g.number ? '#'+g.number+' ' : ''}${g.name.split(' ').pop()}`).join(' / ')
      : opp;

    const thClass = (col) => {
      if(sort.col !== col) return '';
      return sort.dir === 'desc' ? 'sort-desc' : 'sort-asc';
    };

    const goalieHeaders = oppGoalies.length
      ? oppGoalies.map(g => {
          const col = 'vsg:' + g.name;
          const label = g.number ? `#${g.number}` : g.name.split(' ').pop();
          return `<th class="vsg-col ${thClass(col)}" data-team="${team}" data-col="${col}">${label}</th>`;
        }).join('')
      : `<th class="vsg-col">vs ${opp}</th>`;

    return `<div class="team-panel">
      <div class="team-header">
        <span>${team} SHOOTERS</span>
        <span class="opp-goalie">vs ${oppLabel}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th class="${thClass('career')}" data-team="${team}" data-col="career">Career</th>
            <th class="${thClass('pct')}" data-team="${team}" data-col="pct">Pct</th>
            <th class="${thClass('l3')}" data-team="${team}" data-col="l3">L3 Szn</th>
            <th class="${thClass('cur')}" data-team="${team}" data-col="cur">${curLabel}</th>
            ${goalieHeaders}
          </tr>
        </thead>
        <tbody>
          ${players.map(p => {
            const curSzn = curKey ? (p.seasons[curKey] || null) : currentSeason(p.seasons);
            const goalieCells = oppGoalies.length
              ? oppGoalies.map(g => {
                  const split = (p.vs_goalie && p.vs_goalie[g.name]) ? p.vs_goalie[g.name] : null;
                  return `<td class="vsg-col">${fmtGA(split)}</td>`;
                }).join('')
              : `<td class="vsg-col"><span class="so-no-data">\u2014</span></td>`;
            const numLabel = p.number ? `<span class="player-num">#${p.number}</span> ` : '';
            const noAttempts = p.career[1] === 0 ? 'no-attempts' : '';
            const isOpen = openDetails.has(`player-${p.id}-${team}`);
            return `<tr class="${noAttempts}">
              <td><span class="player-name${isOpen?' open':''}" data-playerid="${p.id}" data-team="${team}" onclick="togglePlayerDetail(this, event)">${numLabel}${p.name}</span></td>
              <td>${fmtGA(p.career)}</td>
              <td>${fmtPct(p.career)}</td>
              <td>${fmtGA(last3(p.seasons))}</td>
              <td>${fmtGA(curSzn)}</td>
              ${goalieCells}
            </tr>
            ${isOpen ? `<tr class="detail-row"><td colspan="${5 + oppGoalies.length}">${buildDetailPanel(p, oppGoalies)}</td></tr>` : ''}`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }).join('');

  // Wire up header clicks after render
  panelsEl.querySelectorAll('thead th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const team = th.dataset.team;
      const col  = th.dataset.col;
      const cur  = SORT_STATE[team] || {col:'career', dir:'desc'};
      SORT_STATE[team] = {
        col,
        dir: cur.col === col && cur.dir === 'desc' ? 'asc' : 'desc'
      };
      renderPanels(teamA, teamB);
    });
  });
}

function renderGoalies(teamA, teamB){
  const el = document.getElementById('goalieRow');
  const render = (team) => {
    const goalies = GOALIES.filter(g => g.team === team && g.active);
    if(!goalies.length) return `<div class="goalie-col"><div class="empty-panel" style="font-size:12px;">No goalie data for ${team}</div></div>`;
    return `<div class="goalie-col">
      ${goalies.map(g => {
        const svPct = g.faced ? ((g.stopped/g.faced)*100).toFixed(1) : '\u2014';
        const numLabel = g.number ? `<span style="color:var(--text3);font-family:'DM Mono',monospace;font-size:11px;">#${g.number}</span> ` : '';
        const isOpen = openDetails.has(`goalie-${g.id}`);
        return `<div class="goalie-card" style="flex-direction:column;align-items:stretch;padding:0;cursor:pointer;" data-goalieid="${g.id}" onclick="toggleGoalieDetail(this, event)">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;">
            <div><h3>${numLabel}${g.name}</h3><div class="record">${g.record || ''}</div></div>
            <div class="goalie-stat">
              <div class="big">${svPct}%</div>
              <div class="lbl">${g.stopped} of ${g.faced} SO shots stopped</div>
            </div>
          </div>
          ${isOpen ? buildGoalieDetailPanel(g) : ''}
        </div>`;
      }).join('')}
    </div>`;
  };
  el.innerHTML = render(teamA) + render(teamB);
}

function renderMinor(){
  const el = document.getElementById('minorTable');
  el.innerHTML = `<thead><tr><th>Player</th><th>League</th><th>Career</th><th>Career Pct</th><th>Current</th></tr></thead>
    <tbody>${MINOR.map(m => `<tr>
      <td>${m.name}</td><td style="text-align:right">${m.team}</td>
      <td>${fmtGA(m.career)}</td><td>${fmtPct(m.career)}</td><td>${fmtGA(m.cur)}</td>
    </tr>`).join('')}</tbody>`;
}

function leaderboardTable(title, rows, cols){
  if(!rows || !rows.length){
    return `<div><h4 style="font-family:'Rift','Rubik',sans-serif;font-size:13px;letter-spacing:0.4px;margin:0 0 8px;color:var(--text2);">${title}</h4>
      <div class="so-no-data">No qualifying data yet.</div></div>`;
  }
  return `<div>
    <h4 style="font-family:'Rift','Rubik',sans-serif;font-size:13px;letter-spacing:0.4px;margin:0 0 8px;color:var(--text2);">${title}</h4>
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Team</th>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map((r,i) => `<tr>
          <td style="text-align:right">${i+1}</td>
          <td>${r.name}</td>
          <td style="text-align:right">${r.team}</td>
          ${cols.map(c => `<td>${c.fmt(r)}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function renderAllTime(){
  const el = document.getElementById('allTimeBody');
  if(!ALLTIME){
    el.innerHTML = `<p class="note" style="padding:0;">No backfill data loaded yet \u2014 run the historical backfill workflow, then re-export.</p>`;
    return;
  }
  const minAtt = ALLTIME.min_attempts_threshold, minFaced = ALLTIME.min_faced_threshold;
  el.innerHTML = `
    <div class="alltime-grid">      ${leaderboardTable('Most Career Shootout Goals', ALLTIME.top_goals, [
        {label:'G/Att', fmt:r => `${r.goals}/${r.att}`},
        {label:'Pct', fmt:r => fmtPct([r.goals, r.att])},
      ])}
      ${leaderboardTable(`Best Career Shooting Pct (min ${minAtt} att)`, ALLTIME.top_shooting_pct, [
        {label:'G/Att', fmt:r => `${r.goals}/${r.att}`},
        {label:'Pct', fmt:r => fmtPct([r.goals, r.att])},
      ])}
      ${leaderboardTable(`Best Career Save Pct (min ${minFaced} faced)`, ALLTIME.top_goalie_save_pct, [
        {label:'Sv/Faced', fmt:r => `${r.stopped}/${r.faced}`},
        {label:'Pct', fmt:r => fmtPct([r.stopped, r.faced])},
      ])}
      ${leaderboardTable('Most Career Shots Faced', ALLTIME.most_shots_faced, [
        {label:'Sv/Faced', fmt:r => `${r.stopped}/${r.faced}`},
        {label:'Pct', fmt:r => fmtPct([r.stopped, r.faced])},
      ])}
    </div>
    <p class="note" style="padding:12px 0 0;">Spans every season loaded via the backfill workflow so far \u2014 not limited to the two teams selected above.</p>
  `;
}

function fmtShotType(st){ return st ? st.charAt(0).toUpperCase()+st.slice(1) : 'Unknown'; }
function fmtMissReason(r){ return r ? r.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : r; }

function buildDetailPanel(p, oppGoalies){
  const maxAtt = Math.max(1, ...Object.values(p.shot_types||{}).map(v=>v[1]));

  // Hot/cold streak from last attempts
  const streak = getStreak(p);
  const streakHtml = streak
    ? `<span class="streak-${streak.type}" style="margin-left:8px;">${streak.type==='hot'?'🔥':'❄️'} ${streak.label}</span>`
    : '';

  // Shot type breakdown
  const shotRows = Object.entries(p.shot_types||{})
    .sort((a,b)=>b[1][1]-a[1][1])
    .map(([st,[g,a]])=>{
      const pct = a>0 ? Math.round(g/a*100) : 0;
      const barW = Math.round(a/maxAtt*80);
      const label = st==='unknown' ? 'Not Recorded' : fmtShotType(st);
      return `<tr>
        <td>${label}</td>
        <td>${g}/${a} <span class="shot-bar" style="width:${barW}px;opacity:0.6;"></span></td>
        <td>${pct}%</td>
      </tr>`;
    }).join('');

  // Round performance
  const roundRows = Object.entries(p.by_round||{})
    .filter(([r])=>r!=='?')
    .sort((a,b)=>+a[0]-+b[0])
    .map(([r,[g,a]])=>{
      const pct = a>0 ? Math.round(g/a*100) : 0;
      return `<tr><td>Round ${r}</td><td>${g}/${a}</td><td>${pct}%</td></tr>`;
    }).join('');

  // Miss reasons
  const missRows = Object.entries(p.miss_reasons||{})
    .sort((a,b)=>b[1]-a[1])
    .map(([r,n])=>`<tr><td>${fmtMissReason(r)}</td><td colspan="2">${n}x</td></tr>`)
    .join('');

  // vs matchup goalies — skip 0/0, add actual shot type breakdown vs that goalie
  const vsRows = oppGoalies.map(g=>{
    const split = p.vs_goalie?.[g.name];
    if(!split || split[1]===0) return ''; // skip goalies with no attempts

    const pct = Math.round(split[0]/split[1]*100);
    const goalieLabel = `${g.number?'#'+g.number+' ':''}${g.name.split(' ').pop()}`;

    // Actual shot types used vs this specific goalie
    const vsShots = p.vs_goalie_shots?.[g.name] || {};
    const shotBreakdown = Object.entries(vsShots)
      .sort((a,b)=>b[1][1]-a[1][1])
      .map(([st,[sg,sa]])=>{
        const label = st==='unknown'?'Not Recorded':fmtShotType(st);
        return `${label} ${sg}/${sa}`;
      }).join(' · ');

    return `<tr style="border-top:1px solid var(--border);">
      <td><strong>${goalieLabel}</strong>${shotBreakdown?`<br><span style="color:var(--text3);font-size:10px;">${shotBreakdown}</span>`:''}</td>
      <td>${split[0]}/${split[1]}</td>
      <td>${pct}%</td>
    </tr>`;
  }).filter(Boolean).join('');

  return `<div class="detail-panel">
    <div>
      <div class="detail-section">
        <h4>Shot Type ${streakHtml}</h4>
        <table class="detail-table">
          <tr style="color:var(--text3);font-size:10px;"><td>Type</td><td>G/Att</td><td>Pct</td></tr>
          ${shotRows || '<tr><td colspan="3" style="color:var(--text3)">No data</td></tr>'}
        </table>
      </div>
      <div class="detail-section" style="margin-top:12px;">
        <h4>Miss Reasons</h4>
        <table class="detail-table">
          ${missRows || '<tr><td colspan="3" style="color:var(--text3)">None recorded</td></tr>'}
        </table>
      </div>
    </div>
    <div>
      <div class="detail-section">
        <h4>By Round</h4>
        <table class="detail-table">
          <tr style="color:var(--text3);font-size:10px;"><td>Round</td><td>G/Att</td><td>Pct</td></tr>
          ${roundRows || '<tr><td colspan="3" style="color:var(--text3)">No data</td></tr>'}
        </table>
      </div>
      <div class="detail-section" style="margin-top:12px;">
        <h4>vs This Matchup</h4>
        <table class="detail-table">
          <tr style="color:var(--text3);font-size:10px;"><td>Goalie</td><td>G/Att</td><td>Pct</td></tr>
          ${vsRows || '<tr><td colspan="3" style="color:var(--text3)">No attempts vs these goalies</td></tr>'}
        </table>
      </div>
    </div>
  </div>`;
}

function buildGoalieDetailPanel(g){
  const maxFaced = Math.max(1, ...Object.values(g.shots_by_type||{}).map(v=>v[1]));

  const shotRows = Object.entries(g.shots_by_type||{})
    .sort((a,b)=>b[1][1]-a[1][1])
    .map(([st,[sv,faced]])=>{
      const pct = faced>0 ? Math.round(sv/faced*100) : 0;
      const barW = Math.round(faced/maxFaced*80);
      const label = st==='unknown' ? 'Not Recorded' : fmtShotType(st);
      return `<tr>
        <td>${label}</td>
        <td>${sv}/${faced} <span class="shot-bar" style="width:${barW}px;opacity:0.6;"></span></td>
        <td>${pct}%</td>
      </tr>`;
    }).join('');

  const roundRows = Object.entries(g.by_round||{})
    .filter(([r])=>r!=='?')
    .sort((a,b)=>+a[0]-+b[0])
    .map(([r,[sv,faced]])=>{
      const pct = faced>0 ? Math.round(sv/faced*100) : 0;
      return `<tr><td>Round ${r}</td><td>${sv}/${faced}</td><td>${pct}%</td></tr>`;
    }).join('');

  const missRows = Object.entries(g.miss_reasons||{})
    .sort((a,b)=>b[1]-a[1])
    .map(([r,n])=>`<tr><td>${fmtMissReason(r)}</td><td colspan="2">${n}x (missed net)</td></tr>`)
    .join('');

  return `<div class="detail-panel">
    <div>
      <div class="detail-section">
        <h4>Save % by Shot Type</h4>
        <table class="detail-table">
          <tr style="color:var(--text3);font-size:10px;"><td>Type</td><td>Sv/Faced</td><td>Sv%</td></tr>
          ${shotRows || '<tr><td colspan="3" style="color:var(--text3)">No data</td></tr>'}
        </table>
      </div>
    </div>
    <div>
      <div class="detail-section">
        <h4>Save % by Round</h4>
        <table class="detail-table">
          <tr style="color:var(--text3);font-size:10px;"><td>Round</td><td>Sv/Faced</td><td>Sv%</td></tr>
          ${roundRows || '<tr><td colspan="3" style="color:var(--text3)">No data</td></tr>'}
        </table>
      </div>
      <div class="detail-section" style="margin-top:12px;">
        <h4>Missed Net Against</h4>
        <table class="detail-table">
          ${missRows || '<tr><td colspan="3" style="color:var(--text3)">None recorded</td></tr>'}
        </table>
      </div>
    </div>
  </div>`;
}

const openDetails = new Set(); // track which player/goalie IDs have open detail rows

function togglePlayerDetail(el, event){
  event.stopPropagation();
  const pid = el.dataset.playerid;
  const team = el.dataset.team;
  const key = `player-${pid}-${team}`;
  if(openDetails.has(key)) openDetails.delete(key);
  else openDetails.add(key);
  const teamA = document.getElementById('teamASelect').value;
  const teamB = document.getElementById('teamBSelect').value;
  renderPanels(teamA, teamB);
}

function toggleGoalieDetail(el, event){
  event.stopPropagation();
  const gid = el.dataset.goalieid;
  const key = `goalie-${gid}`;
  if(openDetails.has(key)) openDetails.delete(key);
  else openDetails.add(key);
  const teamA = document.getElementById('teamASelect').value;
  const teamB = document.getElementById('teamBSelect').value;
  renderGoalies(teamA, teamB);
}

function buildSearchIndex(){
  const idx = PLAYERS.map(p => ({name:p.name, team:p.team, pct:pct(p.career)}));
  GOALIES.forEach(g => idx.push({name:g.name, team:g.team, pct:null, goalie:true}));
  return idx;
}

function renderAll(){
  const teamA = document.getElementById('teamASelect').value;
  const teamB = document.getElementById('teamBSelect').value;
  if(!teamA || !teamB){
    document.getElementById('panels').innerHTML = '<div class="empty-panel" style="grid-column:1/-1;padding:30px;text-align:center;color:var(--text2);">Select an opponent above to load shootout data.</div>';
    document.getElementById('goalieRow').innerHTML = '';
    document.getElementById('gameMeta').textContent = '';
    document.getElementById('pageTitle').innerHTML = 'Edmonton Oilers <span class="vs">Shootout Scout</span>';
    /* document.title left alone — this is a tab inside Coaches Station */
    renderMinor();
    window._searchIndex = buildSearchIndex();
    return;
  }
  // Update title with matchup
  const teamAName = TEAMS.find(t => t[0] === teamA)?.[1] || teamA;
  const teamBName = TEAMS.find(t => t[0] === teamB)?.[1] || teamB;
  document.getElementById('pageTitle').innerHTML = `${teamA} <span class="vs">vs</span> ${teamB} <span class="vs" style="font-size:14px;">— Shootout Scout</span>`;
  document.getElementById('gameMeta').textContent = `${teamAName} vs ${teamBName}`;
  /* document.title left alone — this is a tab inside Coaches Station */
  renderPanels(teamA, teamB);
  renderGoalies(teamA, teamB);
  renderMinor();
  window._searchIndex = buildSearchIndex();
}

function getStreak(p){
  // Get last 10 attempts in chronological order
  const attempts = [];
  Object.entries(p.by_round || {}).forEach(([r, [g, a]]) => {
    for(let i=0;i<a;i++) attempts.push(i<g?1:0);
  });
  if(attempts.length < 3) return null;
  const last5 = attempts.slice(-5);
  const goals = last5.filter(x=>x).length;
  if(goals === 0 && last5.length >= 3) return {type:'cold', label:`${goals}/${last5.length} last ${last5.length}`};
  if(goals >= 3) return {type:'hot', label:`${goals}/${last5.length} last ${last5.length}`};
  return null;
}

function renderSoOrder(){
  const seasonSel = document.getElementById('soOrderSeason');
  if(!seasonSel) return;

  // Populate season from both selected teams
  const teamA = document.getElementById('teamASelect').value;
  const teamB = document.getElementById('teamBSelect').value;
  const teams = [teamA, teamB].filter(Boolean);
  const allSeasons = new Set();
  teams.forEach(t => {
    if(SO_ORDER?.[t]) Object.keys(SO_ORDER[t]).forEach(s => allSeasons.add(s));
  });
  const seasons = [...allSeasons].sort().reverse();

  const curSeason = seasonSel.value;
  seasonSel.innerHTML = seasons.map(s => `<option value="${s}">${s.slice(0,4)}-${s.slice(6)}</option>`).join('');
  if(curSeason && seasons.includes(curSeason)) seasonSel.value = curSeason;

  if(seasonSel._bound !== true){
    seasonSel.addEventListener('change', renderSoOrderTable);
    seasonSel._bound = true;
  }
  renderSoOrderTable();
}

function renderTeamSoOrder(team, season){
  if(!SO_ORDER?.[team]?.[season]) return `<div class="so-no-data" style="padding:8px 0;">No data for ${team} this season.</div>`;
  const games = [...SO_ORDER[team][season]].reverse(); // most recent first
  if(!games.length) return `<div class="so-no-data" style="padding:8px 0;">No shootout games found.</div>`;

  const gameCards = games.map((g, gi) => {
    const attempts = [...g.attempts].sort((a,b)=>(a.round||99)-(b.round||99));
    const opp = g.opponent || '?';
    const outcome = g.outcome || '?';
    const outcomeColor = outcome==='W' ? 'var(--accent)' : outcome==='L' ? 'var(--goal)' : 'var(--text3)';
    const gid = String(g.game_id);
    let dateLabel;
    if(g.date){
      // Format 2025-10-08 -> Oct 8 2025
      const parts = g.date.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateLabel = `${months[parseInt(parts[1])-1]} ${parseInt(parts[2])}, ${parts[0]}`;
    } else if(gid.length >= 10){
      // Derive approximate date context from game_id (YYYYSSGGGG format)
      const gameNum = parseInt(gid.slice(6));
      dateLabel = `Game ${gameNum}`;
    } else {
      dateLabel = `Game ${games.length - gi}`;
    }

    const chips = attempts.map(att => {
      const cls = att.result==='goal'?'goal':att.result==='save'?'save':'miss';
      const shot = att.shot_type && att.shot_type!=='unknown' ? ` · ${att.shot_type.charAt(0).toUpperCase()}` : '';
      const num = att.number ? `#${att.number} ` : '';
      const last = att.shooter.split(' ').pop();
      const resultLabel = att.result==='goal' ? 'SCORED' : att.result==='save' ? 'SAVED' : 'MISSED';
      return `<div style="margin:2px 0;display:flex;align-items:center;gap:6px;">
        <span class="attempt-chip ${cls}" style="font-size:11px;">${num}${last}${shot}</span>
        <span style="font-size:9px;color:var(--text3);font-family:'DM Mono',monospace;">${resultLabel}</span>
      </div>`;
    }).join('');

    return `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);">${dateLabel} vs ${opp}</span>
        <span style="font-family:'DM Mono',monospace;font-size:10px;font-weight:700;color:${outcomeColor};">${outcome === '?' ? '' : outcome}</span>
      </div>
      ${chips}
    </div>`;
  }).join('');

  return gameCards;
}

function renderSoOrderTable(){
  const el = document.getElementById('soOrderBody');
  if(!el) return;
  const season = document.getElementById('soOrderSeason')?.value;
  const teamA = document.getElementById('teamASelect').value;
  const teamB = document.getElementById('teamBSelect').value;

  if(!SO_ORDER || !season){
    el.innerHTML = `<div style="grid-column:1/-1;" class="so-no-data">No shootout order data — run the Build vs-Goalie Splits workflow first.</div>`;
    return;
  }

  const renderPanel = (team) => {
    if(!team) return '<div></div>';
    const games = SO_ORDER?.[team]?.[season] || [];
    const count = games.length;
    return `<div>
      <div style="font-family:'Rift','Rubik',sans-serif;font-size:13px;letter-spacing:0.5px;color:var(--text2);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">
        ${team} SHOOTOUT ORDER <span style="font-size:11px;font-family:'DM Mono',monospace;font-weight:400;">(${count} game${count!==1?'s':''})</span>
      </div>
      ${renderTeamSoOrder(team, season)}
    </div>`;
  };

  el.innerHTML = renderPanel(teamA) + renderPanel(teamB);
}

function initSearchBox() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if(!q){ results.classList.remove('show'); return; }
    const matches = (window._searchIndex || []).filter(x => x.name.toLowerCase().includes(q)).slice(0,8);
    results.innerHTML = matches.length
      ? matches.map(m => `<div class="search-result-row" data-name="${m.name}" data-team="${m.team}" data-goalie="${m.goalie||false}">
          <span>${m.name}${m.goalie ? ' (G)' : ''}</span>
          <span class="team-tag">${m.team}${m.pct!==null ? ' \u00b7 '+(m.pct*100).toFixed(0)+'%' : ''}</span>
        </div>`).join('')
      : `<div class="search-result-row"><span class="so-no-data">No matches loaded</span></div>`;
    results.classList.add('show');

    // Wire up click — show stats in modal
    results.querySelectorAll('.search-result-row[data-name]').forEach(row => {
      row.addEventListener('click', () => {
        const name = row.dataset.name;
        const isGoalie = row.dataset.goalie === 'true';
        results.classList.remove('show');
        input.value = '';
        if(isGoalie){
          const g = GOALIES.find(g => g.name === name);
          if(g) showSearchModal(null, g);
        } else {
          const p = PLAYERS.find(p => p.name === name);
          if(p) showSearchModal(p, null);
        }
      });
    });
  });
  document.addEventListener('click', (e) => { if(!e.target.closest('.search-box') && !e.target.closest('#searchModal')) results.classList.remove('show'); });
}

function showSearchModal(p, g){
  let existing = document.getElementById('searchModal');
  if(existing) existing.remove();

  let content, title;
  if(g){
    const svPct = g.faced ? ((g.stopped/g.faced)*100).toFixed(1) : '—';
    const numLabel = g.number ? `#${g.number} ` : '';
    title = `${numLabel}${g.name} (G) — ${g.team}`;
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">
        <div>
          <div style="font-size:13px;color:var(--text2);">${g.record||''}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'DM Mono',monospace;font-size:28px;font-weight:700;color:var(--accent);">${svPct}%</div>
          <div style="font-size:11px;color:var(--text3);">${g.stopped} of ${g.faced} stopped</div>
        </div>
      </div>
      ${buildGoalieDetailPanel(g)}`;
  } else {
    const numLabel = p.number ? `#${p.number} ` : '';
    title = `${numLabel}${p.name} — ${p.team||'Retired/UFA'}`;
    // Show career summary + full detail panel (no opp goalies context)
    const pctVal = p.career[1]>0 ? ((p.career[0]/p.career[1])*100).toFixed(0)+'%' : '—';
    const pctColor = p.career[1]>0 && p.career[0]/p.career[1]>=0.40 ? 'var(--hot)' : 'var(--text)';
    content = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">
        <div style="font-size:13px;color:var(--text2);">Career: ${p.career[0]}/${p.career[1]} attempts</div>
        <div style="font-family:'DM Mono',monospace;font-size:28px;font-weight:700;color:${pctColor};">${pctVal}</div>
      </div>
      ${buildDetailPanel(p, [])}`;
  }

  const modal = document.createElement('div');
  modal.id = 'searchModal';
  modal.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000;
    background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px;`;
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;
      width:100%;max-width:700px;max-height:90vh;overflow-y:auto;padding:24px;position:relative;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div style="font-family:'Rift','Rubik',sans-serif;font-size:20px;font-weight:600;letter-spacing:0.5px;">${title}</div>
        <button onclick="document.getElementById('searchModal').remove()"
          style="background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:0 4px;line-height:1;">&times;</button>
      </div>
      ${content}
    </div>`;
  modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

loadData();


  function ensureStyles() {
    if (document.getElementById('so-styles')) return;
    const st = document.createElement('style');
    st.id = 'so-styles';
    st.textContent = SO_CSS;
    document.head.appendChild(st);
  }

  /* opts: { teamB, apiBase, auth } */
  function mount(container, opts) {
    ensureStyles();
    opts = opts || {};
    SO_API_BASE = opts.apiBase || '';
    SO_API_AUTH = opts.auth || '';
    SO_TEAM_B = opts.teamB || '';
    container.innerHTML = '<div id="so-root">' + SO_HTML + '</div>';
    initSearchBox();
    loadData();
  }

  return { mount: mount };
})();
