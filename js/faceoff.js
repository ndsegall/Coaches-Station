// ===========================================================================
// Faceoffs tab — Erik's faceoff pre-scout, converted from an iframe embed to a
// native module. Everything lives inside this IIFE, so nothing it declares can
// reach Coaches Station's globals (fmtPct and MONTHS both exist out there).
//
// Styling is deliberately NOT self-contained: the @font-face and :root blocks
// were dropped so this inherits Coaches Station's fonts and design tokens and
// looks like the rest of the app rather than merely similar to it.
// ===========================================================================
const FaceoffTab = (function () {
  const FO_CSS = `
#fo-root * { box-sizing: border-box; }
#fo-root, #fo-root { margin:0; padding:0; }
#fo-root {
  font-family: 'Rubik', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
#fo-root a { color: var(--accent); }
#fo-root ::selection { background: var(--accent-light); color: var(--navy); }
#fo-root header {
  padding: 1.25rem 2rem;
  background: var(--navy);
  border-bottom: 4px solid var(--oilers-orange);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 20;
}
#fo-root header .brand {
  display:flex;
  align-items:center;
  gap:0.6rem;
}
#fo-root header .brand img {
  height:40px;
  width:40px;
  object-fit:contain;
}
#fo-root header .brand-text {
  display:flex;
  flex-direction:column;
  line-height:1.25;
}
#fo-root header h1 {
  margin:0;
  font-size: 1.1rem;
  font-weight: 700;
  font-style: italic;
  font-family: 'Rift', 'Rubik', sans-serif;
  letter-spacing: 0.01em;
  color: var(--header-text);
  text-transform: uppercase;
}
#fo-root header .subtitle {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.8);
  font-family: 'Rubik', sans-serif;
}
#fo-root .fo-header-btn {
  background: none;
  border: 1px solid var(--header-border);
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-family: 'Rubik', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--header-text-dim);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
#fo-root .fo-header-btn:hover { border-color: var(--oilers-orange); color: #fff; }
#fo-root .fo-header-btn.active { background: var(--oilers-orange); border-color: var(--oilers-orange); color: #fff; }
#fo-root .fo-header-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
#fo-root .wrap {
  width: 100%;
  margin: 0;
  padding: 24px 32px 72px;
}
#fo-root .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: 18px; }
#fo-root .grid-3 { display:grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
@media (max-width: 900px) {
#fo-root .grid-2, #fo-root .grid-3 { grid-template-columns: 1fr; } 
}
#fo-root .panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.1rem 1.25rem;
}
#fo-root .panel-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text3);
  padding-bottom: 0.4rem;
  margin-bottom: 0.7rem;
  border-bottom: 1px solid var(--border);
}
#fo-root .panel-sub {
  font-size: 0.72rem;
  color: var(--text2);
  margin: -0.5rem 0 0.9rem;
}
#fo-root .fo-stat-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.8rem 1rem;
}
#fo-root .fo-stat-card .st-label {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text3);
  margin-bottom: 0.35rem;
}
#fo-root .fo-stat-card .st-value {
  font-family: 'Rubik', sans-serif;
  font-weight: 700;
  font-size: 1.55rem;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
#fo-root .fo-stat-card .st-sub {
  font-size: 0.68rem;
  color: var(--text2);
  margin-top: 0.3rem;
}
#fo-root .fo-stat-card .tm-meta {
  display:flex;
  align-items:center;
  gap:6px;
  margin-top: 0.4rem;
  font-size: 0.68rem;
  color: var(--text2);
}
#fo-root .fo-stat-card .tm-avg { font-variant-numeric: tabular-nums; }
#fo-root .stat-row { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
#fo-root .rank-chip {
  font-size: 0.68rem;
  font-weight: 400;
  color: var(--text3);
  font-family: 'Rubik', sans-serif;
}
#fo-root .rank-chip.rank-good {
  background: var(--good-bg);
  color: var(--good-text);
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 8px;
}
#fo-root .rank-chip.rank-bad {
  background: var(--bad-bg);
  color: var(--bad-text);
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 8px;
}
#fo-root .rank-chip-lg {
  font-size: 1.2rem;
  font-weight: 600;
  font-family: 'DM Mono', monospace;
  letter-spacing: -0.02em;
  color: var(--text3);
}
#fo-root .rank-chip-lg.rank-good {
  background: var(--good-bg);
  color: var(--good-text);
  padding: 1px 8px;
  border-radius: 8px;
}
#fo-root .rank-chip-lg.rank-bad {
  background: var(--bad-bg);
  color: var(--bad-text);
  padding: 1px 8px;
  border-radius: 8px;
}
#fo-root table { width:100%; border-collapse: collapse; font-size:0.82rem; }
#fo-root thead th {
  text-align:left;
  color: var(--text3);
  font-weight:700;
  font-size: 0.66rem;
  letter-spacing:0.06em;
  text-transform:uppercase;
  padding: 8px 10px;
  border-bottom: 2px solid var(--border);
  cursor:pointer;
  white-space:nowrap;
}
#fo-root thead th:hover { color: var(--accent); }
#fo-root tbody td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}
#fo-root tbody tr:hover { background: var(--highlight-bg); }
#fo-root .mono-num { font-variant-numeric: tabular-nums; font-family:'DM Mono', monospace; }
#fo-root tr.highlight-row { border-left: 3px solid var(--oilers-orange); font-weight:600; }
#fo-root tr.highlight-row td.team-name { color: var(--oilers-orange); }
#fo-root tr.highlight-row td.tint-cell { background: rgba(209,69,32,0.08); }
#fo-root .schedule-scroll { max-height: 420px; overflow-y:auto; border: 1px solid var(--border); border-radius:8px; }
#fo-root .schedule-scroll.no-cap { max-height: none; overflow-y: visible; }
#fo-root .schedule-scroll table { font-size:0.78rem; }
#fo-root .schedule-scroll thead th { position: sticky; top:0; background: var(--surface2); z-index:1; }
#fo-root .schedule-scroll.no-cap thead th { position: static; }
#fo-root .tag-pill {
  display:inline-block;
  font-size: 0.62rem;
  letter-spacing:0.02em;
  padding: 2px 7px;
  border-radius: 3px;
  background: #ece6f5;
  color: var(--event);
  border: 1px solid #d9cbef;
}
#fo-root .note-card {
  background: var(--surface2);
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.78rem;
  color: var(--text2);
  margin-top: 6px;
}
#fo-root .note-card strong { color: var(--bad-text); }
#fo-root .key-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
@media (max-width: 900px) {
#fo-root .key-grid { grid-template-columns: 1fr; } 
}
#fo-root .key-item { margin-bottom: 14px; }
#fo-root .key-item:last-child { margin-bottom: 0; }
#fo-root .key-term { font-weight: 700; color: var(--text); font-size: 0.86rem; margin-bottom: 2px; }
#fo-root .key-term .key-symbol { font-family:'DM Mono', monospace; font-weight:600; color: var(--oilers-orange); margin-right:6px; }
#fo-root .key-desc { font-size: 0.78rem; color: var(--text2); line-height: 1.5; }
#fo-root .key-desc code { font-family: 'DM Mono', monospace; font-size: 0.74rem; background: var(--surface2); padding: 1px 5px; border-radius: 3px; }
#fo-root .key-legend-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:0.78rem; color:var(--text2); }
#fo-root select {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-family: 'Rubik', sans-serif;
  font-size: 13px;
  min-width: 220px;
  cursor:pointer;
}
#fo-root select:focus { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
#fo-root * { animation: none !important; transition: none !important; }

}
#fo-root .controls-row { display:flex; align-items:flex-end; gap:1.1rem; flex-wrap:wrap; }
#fo-root .ctl-group { display:flex; flex-direction:column; gap:0.3rem; }
#fo-root .ctl-label {
  font-size:0.66rem; font-weight:700; text-transform:uppercase;
  letter-spacing:0.06em; color:var(--text3);
}
#fo-root .seg { display:flex; }
#fo-root .seg button {
  font-family:'Rubik',sans-serif; font-size:0.78rem; font-weight:500;
  padding:0.45rem 0.9rem; background:var(--surface); color:var(--text2);
  border:1px solid var(--border); cursor:pointer; transition:all .15s;
}
#fo-root .seg button:first-child { border-radius:6px 0 0 6px; }
#fo-root .seg button:last-child { border-radius:0 6px 6px 0; border-left:none; }
#fo-root .seg button.active { background:var(--navy); border-color:var(--navy); color:#fff; font-weight:600; }
#fo-root .seg button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
#fo-root .legend { display:flex; align-items:center; gap:1.4rem; flex-wrap:wrap; margin-bottom:0.9rem; }
#fo-root .legend-block { display:flex; align-items:center; gap:0.5rem; }
#fo-root .legend-title {
  font-size:0.66rem; font-weight:700; text-transform:uppercase;
  letter-spacing:0.06em; color:var(--text3);
}
#fo-root .legend-items { display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap; }
#fo-root .fo-legend-item { display:flex; align-items:center; gap:0.3rem; font-size:0.72rem; color:var(--text2); }
#fo-root .sw { width:14px; height:14px; border-radius:3px; border:1px solid rgba(0,0,0,0.12); display:inline-block; }
#fo-root .rink-holder { width:100%; overflow-x:auto; }
#fo-root svg.rink { width:100%; min-width:900px; height:auto; display:block; }
#fo-root image.rink-bg { image-rendering:auto; }
#fo-root .wedge { cursor:pointer; transition:opacity .12s; }
#fo-root .wedge:hover { opacity:.72; }
#fo-root .dot-hit { cursor:pointer; fill:transparent; }
#fo-root .dot-hit:hover { stroke:var(--oilers-orange); stroke-width:2.5; }
#fo-root text.dot-name {
  font-family:'Rubik',sans-serif; font-size:22px; font-weight:500;
  fill:var(--text3); text-transform:uppercase; letter-spacing:0.06em;
}
#fo-root text.zone-name {
  font-family:'Rift','Rubik',sans-serif; font-style:italic; font-weight:700;
  font-size:46px; fill:#9aa5b7; text-transform:uppercase; letter-spacing:0.04em;
}
#fo-root text.pctlabel {
  font-family:'DM Mono',monospace; font-size:27px; font-weight:600;
  font-variant-numeric:tabular-nums;
}
#fo-root text.nodraws { font-family:'Rubik',sans-serif; font-size:22px; fill:var(--text3); }
#fo-root .detail-head { display:flex; justify-content:space-between; align-items:baseline; gap:1rem; }
#fo-root .detail-close {
  background:none; border:none; color:var(--text3); cursor:pointer;
  font-family:'Rubik',sans-serif; font-size:0.74rem; padding:2px 4px;
}
#fo-root .detail-close:hover { color:var(--oilers-orange); }
#fo-root .evt-scroll { max-height:340px; overflow-y:auto; border:1px solid var(--border); border-radius:8px; margin-top:0.6rem; }
#fo-root .evt-scroll thead th { position:sticky; top:0; background:var(--surface2); z-index:1; cursor:default; }
#fo-root .evt-scroll thead th:hover { color:var(--text3); }
#fo-root .pill { display:inline-block; font-size:0.62rem; font-weight:600; letter-spacing:0.02em;
  padding:2px 7px; border-radius:3px; white-space:nowrap; }
#fo-root .pill-win { background:var(--good-bg); color:var(--good-text); }
#fo-root .pill-loss { background:var(--bad-bg); color:var(--bad-text); }
#fo-root .pill-unres { background:var(--surface2); color:var(--text2); border:1px solid var(--border); }
#fo-root .tabpage { display:none; }
#fo-root .tabpage.active { display:block; }
#fo-root tr.clickable { cursor:pointer; }
#fo-root .mx-table { font-size:0.78rem; }
#fo-root .mx-table th.mx-rot { white-space:nowrap; font-size:0.62rem; }
#fo-root .mx-cell { font-family:'DM Mono',monospace; font-variant-numeric:tabular-nums; }
#fo-root .mx-est { color:var(--text3); font-style:italic; }
#fo-root .mx-name { font-weight:600; }
#fo-root .rec-card {
  background:var(--surface2); border:1px solid var(--border); border-radius:8px;
  padding:10px 14px; margin-bottom:10px;
}
#fo-root .rec-head { display:flex; align-items:baseline; gap:0.5rem; margin-bottom:6px; }
#fo-root .rec-opp { font-weight:700; font-size:0.9rem; }
#fo-root .rec-line { font-size:0.78rem; color:var(--text2); margin:2px 0; }
#fo-root .rec-line strong { color:var(--text); }
#fo-root .rec-basis {
  font-size:0.6rem; text-transform:uppercase; letter-spacing:0.05em;
  padding:1px 5px; border-radius:3px; background:#ece6f5; color:var(--event);
  border:1px solid #d9cbef;
}
@media print {
@page { size: landscape; margin: 10mm; }
#fo-root { background:#fff; }
#fo-root header { position:static; padding:0.6rem 0; border-bottom-width:3px; }
#fo-root .fo-header-btn { display:none !important; }
#fo-root .wrap { padding:10px 0 0; }
#fo-root .tabpage { display:none !important; }
#fo-root .tabpage.active { display:block !important; }
#fo-root .panel, #fo-root .fo-stat-card, #fo-root .rec-card { break-inside:avoid; }
#fo-root .schedule-scroll, #fo-root .evt-scroll { max-height:none !important; overflow:visible !important; border:none; }
#fo-root .controls-row, #fo-root .detail-close { display:none !important; }
#fo-root svg.rink { min-width:0; }

}
#fo-root .hand-badge {
  font-family:'DM Mono',monospace; font-weight:600; font-size:0.74rem;
  padding:1px 6px; border-radius:3px; background:var(--surface2);
  color:var(--text2); border:1px solid var(--border);
}


/* ---- Coaches Station native fit -------------------------------------
   Appended after scoping. Two jobs: stop the wide matchup grid pushing the
   whole tab past the modal edge, and drop the standalone-site chrome so this
   reads like Babcock/Smith/McFarland rather than a page inside a page. */
#fo-root { max-width:100%; overflow-x:hidden; background:none; }
#fo-root .wrap { padding:0 0 1.25rem; }
/* .schedule-scroll only scrolled vertically, so a 17-column grid had nowhere
   to go and forced the container wider than the modal. */
#fo-root .schedule-scroll { overflow-x:auto; }
#fo-root .rink-holder { max-width:100%; }
#fo-root .stat-row, #fo-root .key-grid { min-width:0; }
#fo-root .stat-row > *, #fo-root .key-grid > * { min-width:0; }
/* header: no navy bar, no wordmark — just the tab row */
#fo-root header {
  background:none; border-bottom:1px solid var(--border);
  padding:0 0 0.85rem; margin:0 0 1.1rem; gap:0.4rem;
}
#fo-root .fo-header-btn {
  background:none; border:1px solid var(--header-border, var(--border));
  border-radius:6px; padding:0.35rem 0.85rem;
  font-family:'Rubik',sans-serif; font-size:0.8rem; font-weight:600;
  color:var(--text2); cursor:pointer; transition:all 0.15s;
}
#fo-root .fo-header-btn:hover { border-color:var(--oilers-orange); color:var(--text); }
#fo-root .fo-header-btn.active {
  background:var(--oilers-orange); border-color:var(--oilers-orange); color:#fff;
}
`;
  const FO_HTML = `

<header>
  
  <button class="fo-header-btn active" data-tab="matchup">Matchups</button>
  <button class="fo-header-btn" data-tab="prescout">Their Centers</button>
  <button class="fo-header-btn" data-tab="map">Player Map</button>
  <button class="fo-header-btn" data-tab="key">Key</button>
</header>

<div class="wrap">

  <!-- ========================== PRE-SCOUT ========================== -->
  <section class="tabpage" id="tab-prescout">
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-label">Opponent</div>
      <div class="controls-row">
        <div class="ctl-group">
          <span class="ctl-label">Team</span>
          <select id="scoutTeam"></select>
        </div>
        <div class="ctl-group">
          <span class="ctl-label">Minimum draws</span>
          <select id="scoutMin">
            <option value="0">All players</option>
            <option value="15">15+</option>
            <option value="25" selected>25+</option>
            <option value="50">50+</option>
          </select>
        </div>
        <div class="ctl-group" style="margin-left:auto;">
          <span class="ctl-label">Sample</span>
          <span id="scoutSample" style="font-size:0.78rem;color:var(--text2);"></span>
        </div>
      </div>
      <div id="coverageNote"></div>
    </div>

    <div class="stat-row" id="scoutStats"></div>

    <div class="panel">
      <div class="panel-label">Centers — Faceoff Profile</div>
      <div class="panel-sub">Click any row to open that player's win-direction map. Win-rate cells shade
      blue when better than this group's average, red when worse. Hand is the player's shooting hand;
      <strong>vs L</strong> and <strong>vs R</strong> are win rates against left- and right-handed opposing centers.</div>
      <div class="schedule-scroll no-cap">
        <table id="scoutTable"></table>
      </div>
    </div>
  </section>


  <!-- ========================== MATCHUPS ========================== -->
  <section class="tabpage active" id="tab-matchup">
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-label">Matchup</div>
      <div class="controls-row">
        <div class="ctl-group">
          <span class="ctl-label">Our team</span>
          <select id="mxUs"></select>
        </div>
        <div class="ctl-group">
          <span class="ctl-label">Opponent</span>
          <select id="mxThem"></select>
        </div>
        <div class="ctl-group">
          <span class="ctl-label">Situation</span>
          <div class="seg" id="mxSitSeg">
            <button class="active" data-msit="ES">Even Strength</button>
            <button data-msit="PP">PP</button>
            <button data-msit="PK">PK</button>
            <button data-msit="ALL">All</button>
          </div>
        </div>
        <div class="ctl-group">
          <span class="ctl-label">Minimum draws</span>
          <select id="mxMin">
            <option value="0">All players</option>
            <option value="15" selected>15+</option>
            <option value="25">25+</option>
            <option value="50">50+</option>
          </select>
        </div>
      </div>
      <div id="mxNote"></div>
    </div>

    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-label">Head-to-Head Grid</div>
      <div class="panel-sub">Our centres down the side, theirs across the top. Each cell is our centre's
      record in draws they have actually taken against each other, shaded blue where we win more than this
      grid's average. Cells in <span class="mx-est">grey italics</span> have no shared history — those are a
      hand-matchup estimate, not a record.</div>
      <div class="schedule-scroll no-cap">
        <table class="mx-table" id="mxTable"></table>
      </div>
    </div>

    <div class="panel">
      <div class="panel-label">Deployment Notes</div>
      <div class="panel-sub">For each of their centres, our best options. Every line states the basis and the
      sample behind it — a recommendation resting on eight draws is labelled as such, and nothing here is a
      prediction.</div>
      <div id="mxRecs"></div>
    </div>
  </section>

  <!-- ============================ MAP ============================ -->
  <section class="tabpage" id="tab-map">
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-label">Selection</div>
      <div class="controls-row">
        <div class="ctl-group">
          <span class="ctl-label">Player</span>
          <select id="playerSelect"></select>
        </div>
        <div class="ctl-group">
          <span class="ctl-label">Situation</span>
          <div class="seg" id="sitSeg">
            <button class="active" data-sit="ES">Even Strength</button>
            <button data-sit="PP">PP</button>
            <button data-sit="PK">PK</button>
            <button data-sit="ALL">All</button>
          </div>
        </div>
        <div class="ctl-group" style="margin-left:auto;">
          <span class="ctl-label">Dataset</span>
          <span id="datasetLine" style="font-size:0.78rem;color:var(--text2);"></span>
        </div>
      </div>
    </div>

    <div class="stat-row" id="statRow"></div>

    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-label">Win Directions by Faceoff Dot</div>
      <div class="panel-sub" id="rinkSub"></div>
      <div class="legend" id="legend"></div>
      <div class="rink-holder">
        <svg class="rink" id="rink" viewBox="0 0 1920 823" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
    </div>

    
  </section>

  <!-- ========================= LEADERBOARD ========================= -->
  <section class="tabpage" id="tab-board">
    <div class="panel">
      <div class="panel-label">League Faceoff Leaderboard</div>
      <div class="panel-sub">Every player in the loaded sample. Coverage varies by team — see the Pre-Scout
      tab for which teams have full-season exports.</div>
      <div class="controls-row" style="margin-bottom:1rem;">
        <div class="ctl-group">
          <span class="ctl-label">Situation</span>
          <div class="seg" id="boardSitSeg">
            <button class="active" data-bsit="ES">Even Strength</button>
            <button data-bsit="ST">Special Teams</button>
          </div>
        </div>
        <div class="ctl-group">
          <span class="ctl-label">Minimum draws</span>
          <select id="minDraws">
            <option value="25">25+</option>
            <option value="50" selected>50+</option>
            <option value="100">100+</option>
            <option value="200">200+</option>
          </select>
        </div>
      </div>
      <div class="schedule-scroll no-cap"><table id="boardTable"></table></div>
    </div>
  </section>

  <!-- ============================= KEY ============================= -->
  <section class="tabpage" id="tab-key">
    <div class="key-grid">

      <div class="panel">
        <div class="panel-label">Reading the map</div>
        <div class="key-item">
          <div class="key-term">The nine faceoff dots</div>
          <div class="key-desc">The rink is drawn from the player's own perspective:
          <strong>own end (DZ) on the left, attacking end (OZ) on the right</strong>. Each dot shows that
          player's win total, win rate, and the directions the puck went on wins.</div>
        </div>
        <div class="key-item">
          <div class="key-term">Win total and win rate</div>
          <div class="key-desc">Each box reads <code>wins (win rate)</code>, shaded on the judgment scale:
          blue above 51%, red below 49%, neutral in between.</div>
        </div>
        <div class="key-item">
          <div class="key-term">Wedges</div>
          <div class="key-desc">Each wedge points the way the puck travelled on wins. <strong>Length and
          shade</strong> both encode how often that direction happened.</div>
        </div>
        <div class="key-item">
          <div class="key-term">Shade breakpoints</div>
          <div class="key-desc">Banded strictly under each threshold: <code>&lt;10%</code>,
          <code>&lt;20%</code>, <code>&lt;30%</code>, <code>&ge;30%</code>. A share landing exactly on 10%
          is drawn in the 10–20% band.</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-label">Direction methodology</div>
        <div class="key-item">
          <div class="key-desc">This follows <strong>Sportlogiq's own documented logic</strong>, supplied
          directly rather than inferred, and validated draw-by-draw against Erik's reference
          build: win, loss and win-rate counts match <strong>exactly</strong>, and shooting hand
          matches for <strong>all 329 players</strong> in that sample. Wedge direction agrees on
          roughly <strong>99% of individual draws</strong>.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">1</span>Find the recovery</div>
          <div class="key-desc">From a successful faceoff, the recovery is the <strong>first
          successful <code>lpr</code></strong> that follows. Any <code>lpr</code> type counts:
          restricting to the faceoff-tagged ones resolves only 83% of wins, against 99.8%
          this way.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">2</span>Pick the endpoint</div>
          <div class="key-desc">The endpoint is <strong>always the <code>lpr</code> location</strong>, with one
          exception: if the faceoff winner is also tagged with the successful <code>lpr</code> <em>and</em>
          then passes to a teammate, use the <strong>reception</strong> location. A winner who
          recovers but does not pass still uses his own <code>lpr</code>.
          <br><br><strong>The pass must fall inside the same possession as the recovery.</strong>
          Without that bound the search runs past the end of the play and picks up receptions
          150&nbsp;feet away &mdash; longer than the rink. This is the one place this build
          deliberately differs from Erik's original, which had no possession bound, and it is
          why a small number of wedges differ between the two tools.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">3</span>Draw the line</div>
          <div class="key-desc">Faceoff dot to that endpoint, binned into eight 45° wedges.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">4</span>Forward directions are hidden</div>
          <div class="key-desc">Per Sportlogiq, forward win directions are <strong>not displayed</strong>
          (smaller samples, added noise). They still count in the denominator, so visible wedges can sum to
          less than 100%. Hidden draws remain visible when you click a dot.</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-label">Pre-scout fields</div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">Hand</span>shooting hand</div>
          <div class="key-desc">Taken from the NHL API when the roster fetch runs. Otherwise
          <strong>derived from the data itself</strong>: every faceoff row carries a flag describing the
          <em>opposing</em> centre's hand, so the paired row reveals each player's own hand. Resolved by
          majority vote across all their draws — validated against eight known players at 8/8.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">vs L / vs R</span>hand matchup splits</div>
          <div class="key-desc">Win rate against left- and right-handed opposing centres. The most
          actionable single number here — a centre can be twenty points better against one hand.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">PP / PK</span>manpower splits</div>
          <div class="key-desc">Powerplay and penalty-kill faceoff rates, taken from the raw manpower tag
          rather than inferred from zone, so they are exact.</div>
        </div>
        <div class="key-item">
          <div class="key-term"><span class="key-symbol">Best / Worst</span>dot extremes</div>
          <div class="key-desc">Strongest and weakest dot with at least 15 draws, so a single lucky draw
          can't create a 100% dot.</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-label">Data pipeline and coverage</div>
        <div class="key-item">
          <div class="key-term">Current sample</div>
          <div class="key-desc" id="keyDataset"></div>
        </div>
        <div class="key-item">
          <div class="key-term">Direction resolution</div>
          <div class="key-desc" id="keyResolution"></div>
        </div>
        <div class="key-item">
          <div class="key-term">Roster join</div>
          <div class="key-desc">Sportlogiq's <code>playerReferenceId</code> <strong>is the NHL player
          ID</strong>, so the NHL API roster join is an exact integer match — no name matching, no trouble
          with accents or suffixes. Team abbreviations are solved from the export filenames, so the build
          works with no network at all; the API only adds sweater numbers, positions, official handedness and
          full rosters including players who took no draws.</div>
        </div>
        <div class="key-item">
          <div class="key-term">Coverage is the real limit</div>
          <div class="key-desc" id="keyCoverage"></div>
        </div>
        <div class="key-item">
          <div class="key-term">Build self-checks</div>
          <div class="key-desc" id="keyValidation"></div>
        </div>
        <div class="key-item">
          <div class="key-term">Known open question</div>
          <div class="key-desc">Whether Sportlogiq computes wedge percentages over all wins at the dot
          (as here) or over displayed-only wins after removing forward directions. If displayed-only, every
          visible share shifts up slightly; wedge ordering and shape do not change.</div>
        </div>
      </div>

    </div>
  </section>

</div>

`;


/* No embedded data: this reads live from Coaches Station's
   /api/faceoffs/matchup/{us}/{them} endpoint. */
const RINK_IMG = 'data:image/webp;base64,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N2bYRSaLhChcNuwC4xOi0qq4W1WBqFYAL7vFiWoT8FIhI17rn+AlSowEayPwolVJwvIEvIinSFLPycsJSWFV5F2o0KLQW0W87NCLOXyFvdSEWJ6yV1kVJ+jFPFXcRi9iibUUvcBz1g29iO+VHHvZzoKxl7JLYm+plj32EoUWfCk/FHszy+BLFAL44uiXSR++gHnwRSh9cSuEr6Aq+o7wi789/PKf+ev/RDe3g8vbySU2sL2Ta0e3tYFNYy5TrONGHnMhrmNmzBWQ1vFLPnMF5XW8isdcAVi/AF3/97///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv/+qGn7xd4hfCX55+PXM//77L4Dh1wy/Uvzy8OuZ//3333///ffff//9999///3333///fe/WdyAGXOJDUyhi69nm4IuXMcNHXNtNDfmCkjr+GXoUmBdr+rt4MKdXPJ6KgQ7uP5H3Pfpa0c34pd45i/EL4m+0HDwZZUF38I2+JLAwZdgGXxxlsOXpRl82foEvri2AV+sNjT2MjVNEF9QtWkvQ5SIrwZQXzVZFaQX6nKDk16gdpVt0stu9FY00kuv7ao3SS/W6G3SXrYWqBaQ8jIqkp6yKS+1CXaZk14IvGRTXsXdYKctwste7QUsMMLLqnUDFKuEl1ENAJQyhJeeAwAjj3SXoQKAnWZ0VxkBwEjQXViUAYBnLLor3wsAmFDJLj0tAwAUamSXVoL/bqaQ6tKLa+gxQXWphTXMJCO6MB9cg4UNoktEe9eAlE50GfmutbJ5okvPSmtVQoLmqudhbWOZkVyYE+uwqEFyQXJgHRFRSS4zoawDiSLJ1czC+tU4UlzaRvRpi+DCVW0DxrROcIml4AYgWie4tLiykXQM6a1GCjbanBfkFpZqG9KndXILIn0b4jNVcssIBTYEkQxSW7UkbLwRIbfqq5vQpyxiC5NiE/ZEldhic/ImYCmKtFZtETZbmeKkFuZzm9ImNVILQoOb4lM1UstYDmwKwjGktCorsPnaKCe0MFHZAmvUILTEQmALIJRBOqsRlrciNcrJLMxEYCubj3U6Kxzc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';
let RAW = {meta:{teams:{}}, players:{}};   /* filled from the API at boot */
let META = RAW.meta;
let DATA = RAW.players;            /* keyed by NHL player id */

/* ==========================================================================
   SHARED HELPERS — one implementation each, reused by every view
   ========================================================================== */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(iso){
  if(!iso) return '—';
  const [y,m,d] = iso.split('-').map(Number);
  return MONTHS[m-1] + ' ' + d + ', ' + y;
}
function fmtClock(period, gameTime){
  const p = parseInt(period,10), t = parseFloat(gameTime);
  if(!isFinite(p) || !isFinite(t)) return '—';
  let s = t - (p-1)*1200; if(s < 0) s = 0;
  return 'P'+p+' '+Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
}
function fmtPct(x){ return x === null || x === undefined ? '—' : (x*100).toFixed(1)+'%'; }
function fmtRec(t){ return (t && t[1]) ? t[0]+'/'+t[1]+' ('+Math.round(100*t[0]/t[1])+'%)' : '—'; }
function pctOf(t){ return (t && t[1]) ? t[0]/t[1] : null; }

function winRateStyle(pct){
  if(pct > 0.51) return {bg:'var(--good-bg)', fg:'var(--good-text)'};
  if(pct < 0.49) return {bg:'var(--bad-bg)',  fg:'var(--bad-text)'};
  return {bg:'var(--surface2)', fg:'var(--text2)'};
}
function deltaBg(value, allValues, lowerIsBetter){
  if(!allValues.length) return '';
  const mean = allValues.reduce((a,b)=>a+b,0)/allValues.length;
  const maxDev = Math.max(...allValues.map(v=>Math.abs(v-mean))) || 1;
  const dev = value - mean;
  if(Math.abs(dev) < maxDev*0.03) return '';
  const intensity = Math.min(Math.abs(dev)/maxDev, 1);
  const alpha = (0.08 + intensity*0.28).toFixed(3);
  const isGood = lowerIsBetter ? dev < 0 : dev > 0;
  return isGood ? 'background:rgba(10,90,180,'+alpha+');'
                : 'background:rgba(192,57,43,'+alpha+');';
}
function rankChip(value, allValues, lowerIsBetter){
  const sorted = [...allValues].sort((a,b)=> lowerIsBetter ? a-b : b-a);
  const rank = sorted.indexOf(value)+1, n = sorted.length;
  const band = Math.max(1, Math.round(n*0.19));
  let cls = '';
  if(rank <= band) cls = 'rank-good';
  else if(rank > n-band) cls = 'rank-bad';
  return '<span class="rank-chip '+cls+'">'+rank+' / '+n+'</span>';
}

/* ==========================================================================
   DOT LAYOUT + DIRECTIONS
   Vertical placement follows the data's own coordinates: negative yAdjCoord
   sits at the top of the rink as drawn, positive at the bottom.
   ========================================================================== */
/* Dot centres are the ACTUAL pixel positions of the nine faceoff dots in the rink
   image, found by blob-detecting the red/blue dots rather than eyeballed:
     end-zone x = 307.5 / 1611.0, neutral x = 773.2 / 1145.6, centre x = 959.1
     top y = 200.3, centre y = 410.4, bottom y = 620.6
   Cross-checked against NHL geometry — the image scales at 9.6 px/ft, faceoff
   circles measure 143.5px (15 ft) and the dots sit 210px (22 ft) off centre ice.
   Vertical placement follows the data: negative yAdjCoord is the top of the rink.
   `wr` is the wedge radius; `co` is how far the win-rate chip sits from the dot;
   `row` decides whether that chip goes above (top) or below (bottom). */
const DOTS = {
  'dz-east':     {cx:307.5,  cy:200.3, r:112, co:150, row:'top', label:'DZ'},
  'dz-west':     {cx:307.5,  cy:620.6, r:112, co:150, row:'bot', label:'DZ'},
  'nz-def-west': {cx:773.2,  cy:200.2, r:92,  co:128, row:'top', label:'NZ own end'},
  'nz-def-east': {cx:773.2,  cy:620.6, r:92,  co:128, row:'bot', label:'NZ own end'},
  'nz-center':   {cx:959.1,  cy:410.4, r:112, co:172, row:'top', label:'Centre'},
  'nz-off-west': {cx:1145.6, cy:200.2, r:92,  co:128, row:'top', label:'NZ attack end'},
  'nz-off-east': {cx:1145.6, cy:620.7, r:92,  co:128, row:'bot', label:'NZ attack end'},
  'oz-west':     {cx:1611.0, cy:200.2, r:112, co:150, row:'top', label:'OZ'},
  'oz-east':     {cx:1611.0, cy:620.7, r:112, co:150, row:'bot', label:'OZ'}
};
const DOT_ORDER = Object.keys(DOTS);
const SECTOR_NAME = ['Fwd','Fwd-Bot','Bot','Back-Bot','Back','Back-Top','Top','Fwd-Top'];

/* Sportlogiq breakpoints are strict-under: <10, <20, <30, >=30. A share of
   exactly 10% belongs in the 10-20% band, hence `<` and never `<=`. */
const WEDGE_TIERS = [
  {max:0.10,     fill:'#dfe4ee', label:'0–10%'},
  {max:0.20,     fill:'#a8b7d2', label:'10–20%'},
  {max:0.30,     fill:'#5c78a8', label:'20–30%'},
  {max:Infinity, fill:'#00205B', label:'30%+'}
];
function wedgeFill(share){
  for(const t of WEDGE_TIERS) if(share < t.max) return t.fill;
  return '#00205B';
}

/* ==========================================================================
   AGGREGATION
   ========================================================================== */
function dotsOf(pid, sit){
  const p = DATA[pid];
  return (p && p[sit] && p[sit].dots) ? p[sit].dots : {};
}
function playerAgg(pid, sit){
  const dots = dotsOf(pid, sit);
  let draws=0, wins=0, resolved=0, hiddenFwd=0;
  const byZone = {dz:[0,0], nz:[0,0], oz:[0,0]};
  for(const k of DOT_ORDER){
    const e = dots[k]; if(!e) continue;
    draws += e.total; wins += e.wins;
    const z = k.split('-')[0];
    byZone[z][0] += e.wins; byZone[z][1] += e.total;
    e.dirs.forEach(d => { resolved += d.count; if(d.forward) hiddenFwd += d.count; });
  }
  return {draws, wins, resolved, hiddenFwd, byZone, dots,
          winPct: draws ? wins/draws : 0};
}
/* strongest / weakest dot with enough volume to mean something */
function dotExtremes(pid, sit, minDraws){
  const dots = dotsOf(pid, sit);
  let best=null, worst=null;
  for(const k of DOT_ORDER){
    const e = dots[k];
    if(!e || e.total < minDraws) continue;
    if(!best  || e.winPct > best.pct)  best  = {pct:e.winPct, label:DOTS[k].label, key:k, n:e.total};
    if(!worst || e.winPct < worst.pct) worst = {pct:e.winPct, label:DOTS[k].label, key:k, n:e.total};
  }
  return {best, worst};
}
function topDirection(pid, sit){
  const dots = dotsOf(pid, sit);
  const tally = {};
  for(const k of DOT_ORDER){
    const e = dots[k]; if(!e) continue;
    e.dirs.forEach(d => { if(!d.forward) tally[d.sector] = (tally[d.sector]||0)+d.count; });
  }
  let dom = null;
  for(const s in tally) if(dom === null || tally[s] > tally[dom]) dom = s;
  return dom === null ? '—' : SECTOR_NAME[dom];
}
function playersOfTeam(ab){
  return Object.keys(DATA).filter(pid => DATA[pid].team === ab);
}

/* ==========================================================================
   RINK RENDERING
   ========================================================================== */
const SVGNS = 'http://www.w3.org/2000/svg';
function el(tag, attrs){
  const n = document.createElementNS(SVGNS, tag);
  for(const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
function sectorPath(cx, cy, rIn, rOut, sector){
  const a0 = (sector*45-22.5)*Math.PI/180, a1 = (sector*45+22.5)*Math.PI/180;
  const p = (r,a)=>[cx+r*Math.cos(a), cy+r*Math.sin(a)];
  const [x0,y0]=p(rOut,a0), [x1,y1]=p(rOut,a1);
  const [ix0,iy0]=p(rIn,a0), [ix1,iy1]=p(rIn,a1);
  return `M ${ix0} ${iy0} L ${x0} ${y0} A ${rOut} ${rOut} 0 0 1 ${x1} ${y1} L ${ix1} ${iy1} A ${rIn} ${rIn} 0 0 0 ${ix0} ${iy0} Z`;
}
function drawRinkBase(svg){
  svg.innerHTML = '';
  const g = el('g', {});
  const img = el('image', {x:0, y:0, width:1920, height:823, class:'rink-bg',
                           preserveAspectRatio:'xMidYMid meet'});
  /* href + xlink:href so it renders in every SVG consumer, including print */
  img.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', RINK_IMG);
  img.setAttribute('href', RINK_IMG);
  g.appendChild(img);
  /* orientation captions sit in the clear gap between each end's two circles */
  const dz = el('text',{x:250, y:428, 'text-anchor':'middle', class:'zone-name'});
  dz.textContent = 'DZ'; g.appendChild(dz);
  const oz = el('text',{x:1670, y:428, 'text-anchor':'middle', class:'zone-name'});
  oz.textContent = 'OZ'; g.appendChild(oz);
  svg.appendChild(g);
  return g;
}

function drawDot(g, key, entry){
  const L = DOTS[key], {cx, cy, r, co, row} = L;
  const above = row === 'top';

  if(!entry || entry.total === 0){
    const t = el('text',{x:cx, y:cy + (above ? -co : co), 'text-anchor':'middle', class:'nodraws'});
    t.textContent = L.label + ' — no draws';
    g.appendChild(t);
    return;
  }

  /* forward directions are not displayed; shares stay over all wins at the dot */
  const shown = entry.dirs.filter(d => !d.forward);
  const maxShare = Math.max(...shown.map(d => d.shareOfWins), 0.0001);
  const rIn = r*0.14, rMax = r, rMin = r*0.34;
  shown.forEach(d => {
    const rOut = rMin + (d.shareOfWins/maxShare)*(rMax - rMin);
    const p = el('path',{d:sectorPath(cx, cy, rIn, rOut, d.sector),
                          fill:wedgeFill(d.shareOfWins),
                          stroke:'#ffffff','stroke-width':2, 'stroke-opacity':0.85,
                          class:'wedge'});
    const tip = el('title');
    tip.textContent = L.label+' · '+SECTOR_NAME[d.sector]+' · '+d.count+
                      ' wins ('+(d.shareOfWins*100).toFixed(1)+'%)';
    p.appendChild(tip);
    g.appendChild(p);
  });

  /* hit target over the whole dot, for "show every draw here" */
  const hit = el('circle',{cx, cy, r:r, class:'dot-hit'});
  const htip = el('title');
  htip.textContent = L.label+' · '+entry.wins+' of '+entry.total+' ('+
                     Math.round(entry.winPct*100)+'%)';
  hit.appendChild(htip);
  g.appendChild(hit);

  /* win / win-rate chip, pushed toward the near boards so the middle stays clear */
  const st = winRateStyle(entry.winPct);
  const txt = entry.wins + ' (' + Math.round(entry.winPct*100) + '%)';
  const w = txt.length*16.5 + 26, h = 46;
  const cyChip = cy + (above ? -co : co);
  g.appendChild(el('rect',{x:cx-w/2, y:cyChip-h/2, width:w, height:h, rx:8,
                            fill:st.bg, stroke:'rgba(0,0,0,0.14)','stroke-width':1.5}));
  const lt = el('text',{x:cx, y:cyChip+10, 'text-anchor':'middle', class:'pctlabel', fill:st.fg});
  lt.textContent = txt;
  g.appendChild(lt);
}

/* ==========================================================================
   MAP VIEW
   ========================================================================== */
function curSit(){ return document.querySelector('#sitSeg button.active').dataset.sit; }
function curPid(){ return document.getElementById('playerSelect').value; }

function buildLegend(){
  const wedges = WEDGE_TIERS.map(t=>'<span class="fo-legend-item"><span class="sw" style="background:'+t.fill+'"></span>'+t.label+'</span>').join('');
  const rates = [['var(--good-bg)','51%+'],['var(--surface2)','49–51%'],['var(--bad-bg)','under 49%']]
    .map(([c,l])=>'<span class="fo-legend-item"><span class="sw" style="background:'+c+'"></span>'+l+'</span>').join('');
  document.getElementById('legend').innerHTML =
    '<span class="legend-block"><span class="legend-title">Win direction share</span><span class="legend-items">'+wedges+'</span></span>'+
    '<span class="legend-block"><span class="legend-title">Win rate</span><span class="legend-items">'+rates+'</span></span>';
}

function renderStats(){
  const pid = curPid(), sit = curSit(), p = DATA[pid];
  const a = playerAgg(pid, sit);
  const field = Object.keys(DATA).map(x=>playerAgg(x,sit)).filter(x=>x.draws>=100).map(x=>x.winPct);
  const chip = (a.draws>=100 && field.length>1) ? rankChip(a.winPct, field, false)
                                                : '<span class="rank-chip">not qualified</span>';
  const ex = dotExtremes(pid, sit, 15);
  const cards = [
    {l:'Draws', v:a.draws, s:(sit==='ES'?'even strength':'special teams')+' · '+p.team},
    {l:'Wins', v:a.wins, s:a.draws?fmtPct(a.winPct)+' win rate':'—'},
    {l:'Win Rate', v:a.draws?fmtPct(a.winPct):'—', s:'rank among 100+ draw players', chip:chip},
    {l:'vs L / vs R', v:(pctOf(p[sit].vsL)!==null?Math.round(100*pctOf(p[sit].vsL))+'%':'—')+' / '+
                        (pctOf(p[sit].vsR)!==null?Math.round(100*pctOf(p[sit].vsR))+'%':'—'),
     s:'opposing centre hand'},
    {l:'Strongest Dot', v:ex.best?Math.round(ex.best.pct*100)+'%':'—', s:ex.best?ex.best.label+' · '+ex.best.n+' draws':'needs 15+ draws'},
    {l:'Direction Resolved', v:a.wins?Math.round(100*a.resolved/a.wins)+'%':'—',
     s:a.hiddenFwd?a.hiddenFwd+' forward wins hidden':'no forward wins'}
  ];
  document.getElementById('statRow').innerHTML = cards.map(c=>
    '<div class="fo-stat-card"><div class="st-label">'+c.l+'</div><div class="st-value">'+c.v+'</div>'+
    '<div class="st-sub">'+c.s+(c.chip?' &nbsp;'+c.chip:'')+'</div></div>').join('');
}

function renderMap(){
  const pid = curPid(), sit = curSit(), p = DATA[pid];
  const a = playerAgg(pid, sit);
  renderStats();
  const g = drawRinkBase(document.getElementById('rink'));
  DOT_ORDER.forEach(k => drawDot(g, k, a.dots[k]));
  document.getElementById('rinkSub').textContent =
    p.name + ' (' + (p.hand||'?') + ') · ' + p.teamName + ' · ' +
    ({ES:'Even strength',PP:'Power play',PK:'Penalty kill',ALL:'All situations'}[sit]||sit) + ' · ' + a.draws + ' draws · ' +
    (a.draws?fmtPct(a.winPct):'—') + ' win rate · forward directions not displayed';
}


/* ==========================================================================
   PRE-SCOUT VIEW
   ========================================================================== */
const SCOUT_COLS = [
  {k:'num',    t:'#',        num:true},
  {k:'name',   t:'Player',   num:false},
  {k:'hand',   t:'Hand',     num:false},
  {k:'draws',  t:'Draws',    num:true},
  {k:'winPct', t:'Win %',    num:true, pct:true, shade:true, chip:true},
  {k:'vsL',    t:'vs L',     num:true, pct:true, shade:true},
  {k:'vsR',    t:'vs R',     num:true, pct:true, shade:true},
  {k:'dz',     t:'DZ Win %', num:true, pct:true, shade:true},
  {k:'oz',     t:'OZ Win %', num:true, pct:true, shade:true},
  {k:'pp',     t:'PP',       num:false},
  {k:'pk',     t:'PK',       num:false},
  {k:'best',   t:'Best Dot', num:false},
  {k:'worst',  t:'Worst Dot',num:false},
  {k:'dom',    t:'Top Direction', num:false}
];
let scoutSort = {col:'draws', dir:-1};

function scoutRows(){
  const ab = document.getElementById('scoutTeam').value;
  const min = parseInt(document.getElementById('scoutMin').value,10) || 0;
  const out = [];
  for(const pid of playersOfTeam(ab)){
    const p = DATA[pid];
    const a = playerAgg(pid,'ES');
    if(a.draws < min) continue;
    const ex = dotExtremes(pid,'ES',15);
    out.push({
      pid, num:p.number ?? null, name:p.name, hand:p.hand || '?',
      draws:a.draws, winPct:a.draws?a.winPct:null,
      vsL:pctOf(p.ES.vsL), vsR:pctOf(p.ES.vsR),
      dz:pctOf(a.byZone.dz), oz:pctOf(a.byZone.oz),
      pp:fmtRec(p.rec.PP), pk:fmtRec(p.rec.SH),
      best: ex.best ? ex.best.label+' '+Math.round(ex.best.pct*100)+'%' : '—',
      worst: ex.worst ? ex.worst.label+' '+Math.round(ex.worst.pct*100)+'%' : '—',
      dom: topDirection(pid,'ES'),
      thin: a.draws < 25
    });
  }
  return out;
}

function renderScout(){
  const ab = document.getElementById('scoutTeam').value;
  const t = META.teams[ab] || {};
  const rows = scoutRows();

  /* ---- coverage banner: be explicit when a team is only an opponent sliver ---- */
  const all = playersOfTeam(ab).map(pid=>playerAgg(pid,'ES').draws);
  const n25 = all.filter(v=>v>=25).length, n100 = all.filter(v=>v>=100).length;
  document.getElementById('scoutSample').textContent =
    (t.games||0)+' games · '+(t.draws||0)+' draws · '+n25+' players with 25+';
  const note = document.getElementById('coverageNote');
  if(t.fullSeason){
    note.innerHTML = '<div class="note-card">Full-season coverage: '+t.games+' games, '+t.draws+
      ' draws, '+n100+' players with 100+ draws. Dot-level maps are well populated.</div>';
  } else {
    note.innerHTML = '<div class="note-card"><strong>Partial coverage — treat dot-level detail as '+
      'indicative only.</strong> This sample holds just '+t.games+' game'+(t.games===1?'':'s')+
      ' against '+t.draws+' draws, because these exports are for another team; '+ab+
      ' appears only in games against them. '+n25+' player'+(n25===1?'':'s')+' clear 25 draws and '+
      n100+' clear 100. For a real pre-scout, load '+ab+'&rsquo;s own season exports and rebuild.</div>';
  }

  /* ---- team-level stat cards ---- */
  const agg = (sit) => {
    let w=0,d=0; playersOfTeam(ab).forEach(pid=>{ const a=playerAgg(pid,sit); w+=a.wins; d+=a.draws; });
    return d ? w/d : null;
  };
  const zone = (z) => {
    let w=0,d=0; playersOfTeam(ab).forEach(pid=>{ const a=playerAgg(pid,'ES'); w+=a.byZone[z][0]; d+=a.byZone[z][1]; });
    return d ? w/d : null;
  };
  const mp = (key) => {
    let w=0,d=0; playersOfTeam(ab).forEach(pid=>{ const v=DATA[pid][key]; if(v){w+=v[0]; d+=v[1];} });
    return d ? w/d : null;
  };
  const cards = [
    {l:'Games in Sample', v:t.games||0, s:t.fullSeason?'full season':'partial — opponent games only'},
    {l:'Team ES Win %', v:fmtPct(agg('ES')), s:'all centres combined'},
    {l:'Own-End (DZ)', v:fmtPct(zone('dz')), s:'even strength'},
    {l:'Attack-End (OZ)', v:fmtPct(zone('oz')), s:'even strength'},
    {l:'Powerplay', v:fmtPct(mp('PP')), s:'faceoffs on the PP'},
    {l:'Penalty Kill', v:fmtPct(mp('SH')), s:'faceoffs on the PK'}
  ];
  document.getElementById('scoutStats').innerHTML = cards.map(c=>
    '<div class="fo-stat-card"><div class="st-label">'+c.l+'</div><div class="st-value">'+c.v+'</div>'+
    '<div class="st-sub">'+c.s+'</div></div>').join('');

  /* ---- roster table ---- */
  const col = SCOUT_COLS.find(c=>c.k===scoutSort.col) || SCOUT_COLS[3];
  rows.sort((a,b)=>{
    let va=a[col.k], vb=b[col.k];
    if(va===null||va===undefined) va = col.num ? -Infinity : '';
    if(vb===null||vb===undefined) vb = col.num ? -Infinity : '';
    if(col.num) return (va-vb)*scoutSort.dir;
    return String(va).localeCompare(String(vb))*scoutSort.dir;
  });
  const fields = {};
  SCOUT_COLS.filter(c=>c.shade).forEach(c=>{
    fields[c.k] = rows.map(r=>r[c.k]).filter(v=>v!==null&&v!==undefined);
  });
  /* rank chips only make sense with a real field behind them */
  const chipOk = rows.filter(r=>r.draws>=25).length >= 5;

  const head = '<thead><tr>'+SCOUT_COLS.map(c=>{
    const arrow = scoutSort.col===c.k ? (scoutSort.dir===1?' ▲':' ▼') : '';
    return '<th data-col="'+c.k+'">'+c.t+arrow+'</th>';
  }).join('')+'</tr></thead>';

  const body = rows.map(r=>{
    const cells = SCOUT_COLS.map(c=>{
      const v = r[c.k];
      if(c.k==='name'){
        return '<td class="team-name">'+v+(r.thin?' <span class="tag-pill">thin sample</span>':'')+'</td>';
      }
      if(c.k==='hand'){
        return '<td><span class="hand-badge">'+v+'</span></td>';
      }
      let txt = (v===null||v===undefined) ? '—' : (c.pct ? fmtPct(v) : v);
      let style = (c.shade && v!==null && v!==undefined) ? deltaBg(v, fields[c.k], false) : '';
      let chip = (c.chip && chipOk && v!==null && fields[c.k].length>1)
                 ? ' '+rankChip(v, fields[c.k], false) : '';
      return '<td class="'+(c.num?'mono-num':'')+'" style="'+style+'">'+txt+chip+'</td>';
    }).join('');
    return '<tr class="clickable" data-pid="'+r.pid+'">'+cells+'</tr>';
  }).join('');

  const tbl = document.getElementById('scoutTable');
  tbl.innerHTML = head+'<tbody>'+
    (body || '<tr><td colspan="'+SCOUT_COLS.length+'" style="color:var(--text3)">No players meet this minimum.</td></tr>')+'</tbody>';
  tbl.querySelectorAll('th').forEach(th=>th.addEventListener('click',()=>{
    const c = th.dataset.col;
    if(scoutSort.col===c) scoutSort.dir *= -1; else scoutSort = {col:c, dir:1};
    renderScout();
  }));
  tbl.querySelectorAll('tr.clickable').forEach(tr=>tr.addEventListener('click',()=>{
    document.getElementById('playerSelect').value = tr.dataset.pid;
    showTab('map');
    renderMap();
  }));
  tbl.querySelectorAll('th:not(:first-child):not(:nth-child(2)), td:not(:first-child):not(:nth-child(2))')
     .forEach(n=>n.style.textAlign='center');
}


/* ==========================================================================
   MATCHUPS — real head-to-head first, hand-matchup estimate only as fallback
   ========================================================================== */
function mxSit(){ return document.querySelector('#mxSitSeg button.active').dataset.msit; }

/* Blend of the two hand-split views of the same matchup:
   our win rate against their hand, and the complement of their win rate
   against our hand. Averaged when both exist. An ESTIMATE, never a record. */
function handEst(ourPid, theirPid, sit){
  const our = DATA[ourPid][sit], their = DATA[theirPid][sit];
  const theirHand = DATA[theirPid].hand, ourHand = DATA[ourPid].hand;
  const ourVs   = theirHand==='L' ? pctOf(our.vsL)   : theirHand==='R' ? pctOf(our.vsR)   : null;
  const theirVs = ourHand==='L'   ? pctOf(their.vsL) : ourHand==='R'   ? pctOf(their.vsR) : null;
  const parts = [], n = [];
  if(ourVs !== null){ parts.push(ourVs); n.push(theirHand==='L'?our.vsL[1]:our.vsR[1]); }
  if(theirVs !== null){ parts.push(1-theirVs); n.push(ourHand==='L'?their.vsL[1]:their.vsR[1]); }
  if(!parts.length) return null;
  return {pct: parts.reduce((a,b)=>a+b,0)/parts.length, n: Math.min(...n)};
}
function h2hOf(ourPid, theirPid, sit){
  const h = ((DATA[ourPid]||{})[sit]||{}).h2h || {};
  const rec = h[theirPid];
  return rec ? {wins:rec[0], draws:rec[1], pct:rec[1]?rec[0]/rec[1]:null} : null;
}
function centresOf(ab, sit, min){
  return playersOfTeam(ab)
    .filter(pid => playerAgg(pid, sit).draws >= min)
    .sort((a,b) => playerAgg(b,sit).draws - playerAgg(a,sit).draws);
}

const H2H_TRUST = 8;   /* draws needed before a head-to-head record leads the recommendation */

function renderMatchup(){
  const us = document.getElementById('mxUs').value;
  const them = document.getElementById('mxThem').value;
  const sit = mxSit();
  const min = parseInt(document.getElementById('mxMin').value,10) || 0;
  const ours = centresOf(us, sit, min), theirs = centresOf(them, sit, min);

  /* coverage warning built from both teams */
  const tu = META.teams[us]||{}, tt = META.teams[them]||{};
  const weak = [];
  if(!tu.fullSeason) weak.push(us+' ('+(tu.games||0)+' games)');
  if(!tt.fullSeason) weak.push(them+' ('+(tt.games||0)+' games)');
  const note = document.getElementById('mxNote');
  if(us === them){
    note.innerHTML = '<div class="note-card"><strong>Same team selected on both sides.</strong> '+
      'Pick a different opponent to build a matchup grid.</div>';
  } else if(weak.length){
    note.innerHTML = '<div class="note-card"><strong>Partial coverage: '+weak.join(' and ')+'.</strong> '+
      'Head-to-head cells only cover draws inside this sample, so most pairings will fall back to the '+
      'hand estimate. Load full-season exports for both teams before leaning on this.</div>';
  } else {
    note.innerHTML = '<div class="note-card">Full-season coverage on both sides.</div>';
  }

  /* ---- grid ---- */
  const tbl = document.getElementById('mxTable');
  if(us === them || !ours.length || !theirs.length){
    tbl.innerHTML = '<tbody><tr><td style="color:var(--text3)">Not enough qualifying centres to build a grid '+
                    'at this minimum.</td></tr></tbody>';
    document.getElementById('mxRecs').innerHTML =
      '<div style="color:var(--text3);font-size:0.8rem;">No matchups to show.</div>';
    return;
  }
  const realPcts = [];
  ours.forEach(o => theirs.forEach(x => {
    const h = h2hOf(o, x, sit);
    if(h && h.draws > 0) realPcts.push(h.pct);
  }));

  let head = '<thead><tr><th>Our centre</th>';
  theirs.forEach(x => {
    const p = DATA[x];
    head += '<th class="mx-rot">'+p.name.split(' ').slice(-1)[0]+' ('+(p.hand||'?')+')</th>';
  });
  head += '<th>Total vs '+them+'</th></tr></thead>';

  const body = ours.map(o => {
    const op = DATA[o];
    let tw=0, tn=0;
    let cells = theirs.map(x => {
      const h = h2hOf(o, x, sit);
      if(h && h.draws > 0){
        tw += h.wins; tn += h.draws;
        const style = deltaBg(h.pct, realPcts, false);
        return '<td class="mx-cell" style="'+style+'" title="'+op.name+' vs '+DATA[x].name+
               ': '+h.wins+' of '+h.draws+'">'+h.wins+'/'+h.draws+'</td>';
      }
      const est = handEst(o, x, sit);
      return '<td class="mx-cell mx-est" title="No shared draws in this sample — hand-matchup estimate">'+
             (est ? '~'+Math.round(est.pct*100)+'%' : '—')+'</td>';
    }).join('');
    const tot = tn ? tw+'/'+tn+' ('+Math.round(100*tw/tn)+'%)' : '—';
    return '<tr><td class="mx-name">'+op.name+' <span class="hand-badge">'+(op.hand||'?')+
           '</span></td>'+cells+'<td class="mx-cell">'+tot+'</td></tr>';
  }).join('');
  tbl.innerHTML = head+'<tbody>'+body+'</tbody>';
  tbl.querySelectorAll('th:not(:first-child), td:not(:first-child)').forEach(n=>n.style.textAlign='center');

  /* ---- deployment notes ---- */
  const recs = theirs.map(x => {
    const xp = DATA[x];
    const opts = ours.map(o => {
      const h = h2hOf(o, x, sit);
      const est = handEst(o, x, sit);
      if(h && h.draws >= H2H_TRUST){
        return {pid:o, pct:h.pct, basis:'head-to-head', detail:h.wins+' of '+h.draws+' draws'};
      }
      if(est){
        const extra = (h && h.draws>0) ? ' · only '+h.draws+' shared draw'+(h.draws===1?'':'s') : '';
        return {pid:o, pct:est.pct, basis:'hand estimate',
                detail:'vs '+(xp.hand||'?')+'-handed centres, '+est.n+' draws'+extra};
      }
      return null;
    }).filter(Boolean).sort((a,b)=>b.pct-a.pct);
    if(!opts.length) return '';
    const xa = playerAgg(x, sit);
    let html = '<div class="rec-card"><div class="rec-head">'+
      '<span class="rec-opp">'+xp.name+' <span class="hand-badge">'+(xp.hand||'?')+'</span></span>'+
      '<span style="font-size:0.74rem;color:var(--text2);">'+xa.draws+' draws · '+
      fmtPct(xa.winPct)+' win rate in this sample</span></div>';
    opts.slice(0,3).forEach((o,i) => {
      const st = winRateStyle(o.pct);
      html += '<div class="rec-line">'+(i===0?'<strong>Best: </strong>':'')+
        '<strong>'+DATA[o.pid].name+'</strong> '+
        '<span style="background:'+st.bg+';color:'+st.fg+';padding:1px 6px;border-radius:3px;'+
        'font-family:\'DM Mono\',monospace;font-weight:600;">'+Math.round(o.pct*100)+'%</span> '+
        '<span class="rec-basis">'+o.basis+'</span> '+o.detail+'</div>';
    });
    /* their strongest dot is where we most need the right centre on the ice */
    const ex = dotExtremes(x, sit, 15);
    if(ex.best) html += '<div class="rec-line" style="margin-top:5px;">Strongest dot: <strong>'+
      ex.best.label+'</strong> at '+Math.round(ex.best.pct*100)+'% over '+ex.best.n+' draws'+
      (ex.worst && ex.worst.key!==ex.best.key ? ' · weakest <strong>'+ex.worst.label+'</strong> at '+
       Math.round(ex.worst.pct*100)+'%' : '')+'.</div>';
    return html+'</div>';
  }).join('');
  document.getElementById('mxRecs').innerHTML = recs ||
    '<div style="color:var(--text3);font-size:0.8rem;">No qualifying opposing centres.</div>';
}

/* ==========================================================================
   LEADERBOARD
   ========================================================================== */
const BOARD_COLS = [
  {k:'name',   t:'Player', num:false},
  {k:'team',   t:'Team',   num:false},
  {k:'hand',   t:'Hand',   num:false},
  {k:'draws',  t:'Draws',  num:true},
  {k:'wins',   t:'Wins',   num:true},
  {k:'winPct', t:'Win %',  num:true, pct:true, shade:true, chip:true},
  {k:'dz',     t:'DZ Win %', num:true, pct:true, shade:true},
  {k:'oz',     t:'OZ Win %', num:true, pct:true, shade:true},
  {k:'dom',    t:'Top Direction', num:false}
];
let boardSort = {col:'draws', dir:-1};
function boardSit(){ return document.querySelector('#boardSitSeg button.active').dataset.bsit; }

function renderBoard(){
  const sit = boardSit();
  const min = parseInt(document.getElementById('minDraws').value,10) || 0;
  let rows = [];
  for(const pid of Object.keys(DATA)){
    const p = DATA[pid], a = playerAgg(pid, sit);
    if(a.draws < min) continue;
    rows.push({pid, name:p.name, team:p.team, hand:p.hand||'?', draws:a.draws, wins:a.wins,
               winPct:a.winPct, dz:pctOf(a.byZone.dz), oz:pctOf(a.byZone.oz),
               dom:topDirection(pid, sit)});
  }
  const col = BOARD_COLS.find(c=>c.k===boardSort.col) || BOARD_COLS[3];
  rows.sort((a,b)=>{
    let va=a[col.k], vb=b[col.k];
    if(va===null||va===undefined) va = col.num ? -Infinity : '';
    if(vb===null||vb===undefined) vb = col.num ? -Infinity : '';
    if(col.num) return (va-vb)*boardSort.dir;
    return String(va).localeCompare(String(vb))*boardSort.dir;
  });
  const fields = {};
  BOARD_COLS.filter(c=>c.shade).forEach(c=>{
    fields[c.k] = rows.map(r=>r[c.k]).filter(v=>v!==null&&v!==undefined);
  });
  const selected = curPid();
  const head = '<thead><tr>'+BOARD_COLS.map(c=>{
    const arrow = boardSort.col===c.k ? (boardSort.dir===1?' ▲':' ▼') : '';
    return '<th data-col="'+c.k+'">'+c.t+arrow+'</th>';
  }).join('')+'</tr></thead>';
  const body = rows.map(r=>{
    const cells = BOARD_COLS.map(c=>{
      const v = r[c.k];
      if(c.k==='name') return '<td class="team-name">'+v+'</td>';
      let txt = (v===null||v===undefined)?'—':(c.pct?fmtPct(v):v);
      let style = (c.shade && v!==null&&v!==undefined) ? deltaBg(v, fields[c.k], false) : '';
      let chip = (c.chip && v!==null && fields[c.k].length>1) ? ' '+rankChip(v, fields[c.k], false) : '';
      const tint = (!style && r.pid===selected) ? ' tint-cell' : '';
      return '<td class="'+(c.num?'mono-num':'')+tint+'" style="'+style+'">'+txt+chip+'</td>';
    }).join('');
    return '<tr class="clickable'+(r.pid===selected?' highlight-row':'')+'" data-pid="'+r.pid+'">'+cells+'</tr>';
  }).join('');
  const tbl = document.getElementById('boardTable');
  tbl.innerHTML = head+'<tbody>'+
    (body || '<tr><td colspan="'+BOARD_COLS.length+'" style="color:var(--text3)">No players meet this minimum.</td></tr>')+'</tbody>';
  tbl.querySelectorAll('th').forEach(th=>th.addEventListener('click',()=>{
    const c = th.dataset.col;
    if(boardSort.col===c) boardSort.dir *= -1; else boardSort = {col:c, dir:1};
    renderBoard();
  }));
  tbl.querySelectorAll('tr.clickable').forEach(tr=>tr.addEventListener('click',()=>{
    document.getElementById('playerSelect').value = tr.dataset.pid;
    showTab('map'); renderMap();
  }));
  tbl.querySelectorAll('th:not(:first-child), td:not(:first-child)').forEach(n=>n.style.textAlign='center');
}

/* ==========================================================================
   TABS + INIT
   ========================================================================== */
/* Regular Season / Playoffs / Both. Rendered only when playoff games actually
   exist for this season — which is false until the playoffs begin, and stays
   false for a team that missed them, so an empty view is impossible. */
function buildSegmentSelector(){
  const host = document.querySelector('#mxSitSeg').closest('.controls-row');
  if(!host || !META.hasPlayoffs) return;
  const wrap = document.createElement('div');
  wrap.className = 'ctl-group';
  wrap.innerHTML = '<span class="ctl-label">Games</span>'+
    '<div class="seg" id="segSeg">'+
      '<button data-seg="rs">Regular Season</button>'+
      '<button data-seg="po">Playoffs</button>'+
      '<button data-seg="both">Both</button>'+
    '</div>';
  host.appendChild(wrap);
  wrap.querySelectorAll('#segSeg button').forEach(function(b){
    b.classList.toggle('active', b.dataset.seg === SEGMENT);
    b.addEventListener('click', async function(){
      if(b.dataset.seg === SEGMENT) return;
      SEGMENT = b.dataset.seg;
      wrap.querySelectorAll('#segSeg button').forEach(function(x){
        x.classList.toggle('active', x.dataset.seg === SEGMENT);
      });
      try{
        const j = await loadFaceoffs(SEGMENT);
        RAW = j; META = j.meta; DATA = j.players;
        renderScout(); renderMatchup(); renderMap();
      }catch(err){
        foFatal('Could not switch to '+SEGMENT+' ('+err.message+').');
      }
    });
  });
}

function showTab(name){
  document.querySelectorAll('.fo-header-btn').forEach(b=>
    b.classList.toggle('active', b.dataset.tab===name));
  document.querySelectorAll('.tabpage').forEach(p=>
    p.classList.toggle('active', p.id==='tab-'+name));
}

function init(){
  buildLegend();

  /* dataset lines */
  const teamsSorted = Object.keys(META.teams).sort((a,b)=>{
    const A=META.teams[a], B=META.teams[b];
    return (B.fullSeason?1:0)-(A.fullSeason?1:0) || B.draws-A.draws;
  });
  const full = teamsSorted.filter(ab=>META.teams[ab].fullSeason);
  const datasetTxt = META.season+' · '+META.games+' games · '+
        fmtDate(META.firstGame)+' – '+fmtDate(META.lastGame);
  document.getElementById('datasetLine').textContent = datasetTxt;
  document.getElementById('keyDataset').textContent =
    datasetTxt+'. '+META.players+' players across '+teamsSorted.length+' teams. '+
    'Full-season coverage: '+(full.length?full.join(', '):'none')+'. Built '+fmtDate(META.generated)+
    (META.apiUsed?' with NHL API roster enrichment.':' without the NHL API (rosters derived from the exports).');
  const r = META.resolution || {};
  document.getElementById('keyResolution').textContent =
    META.resolvedPct+'% of '+META.totalWins+' wins resolve to a direction ('+
    (r.self_pass_reception||0)+' via the winner\u2019s own pass to a reception, '+
    (r.teammate_lpr||0)+' via a teammate\u2019s recovery, '+
    ((r.self_no_pass_lpr||0)+(r.self_pass_no_reception_lpr||0))+' via the winner\u2019s own recovery with no pass). '+
    'The remainder had no usable line and count in win totals but in no wedge.';
  const val = META.validation || {};
  const valKeys = Object.keys(val);
  document.getElementById('keyValidation').textContent = valKeys.length
    ? (valKeys.every(k=>val[k]===0)
        ? 'All '+valKeys.length+' build checks passed: dot keys recognised, win/loss/total reconciled, '+
          'direction accounting balanced, head-to-head records symmetric across every player pair, and every '+
          'player resolved to a shooting hand.'
        : valKeys.filter(k=>val[k]!==0).map(k=>k+': '+val[k]).join('; '))
    : 'No validation block in this data file.';
  document.getElementById('keyCoverage').textContent =
    'These are single-team play-sequence exports, so an opposing team appears only in games against the '+
    'export team. That makes most teams here opponent slivers — a median of roughly 130 draws spread across '+
    'a whole forward group, which is far too thin for nine-dot maps. To pre-scout a team properly, drop that '+
    'team\u2019s own season exports into the CSV directory and rebuild; the Pre-Scout tab flags coverage on '+
    'every team so thin samples are never mistaken for real signal.';

  /* Pre-Scout Prep is always EDM vs the precomputed next opponent, so both
     team pickers are locked rather than removed — the render functions below
     still read them by id. */
  const ts = document.getElementById('scoutTeam');
  [META.them].forEach(ab=>{
    const t = META.teams[ab] || {name:ab, games:0};
    const o = document.createElement('option');
    o.value = ab;
    o.textContent = t.name+' — '+t.games+(t.games===1?' game':' games');
    ts.appendChild(o);
  });
  ts.value = META.them;
  ts.disabled = true;
  document.getElementById('scoutMin').addEventListener('change', renderScout);

  /* matchup selects: default us = a full-season team, them = busiest other team */
  const mxUs = document.getElementById('mxUs'), mxThem = document.getElementById('mxThem');
  [[mxUs, META.us], [mxThem, META.them]].forEach(function(pair){
    const selEl = pair[0], ab = pair[1];
    const t2 = META.teams[ab] || {name:ab};
    const o = document.createElement('option');
    o.value = ab; o.textContent = t2.name;
    selEl.appendChild(o);
    selEl.value = ab;
    selEl.disabled = true;
  });
  /* segment selector suppressed — regular season only for now */
  document.getElementById('mxMin').addEventListener('change', renderMatchup);
  document.querySelectorAll('#mxSitSeg button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('#mxSitSeg button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); renderMatchup();
  }));

  /* player select, grouped by team, busiest player first inside each group */
  const sel = document.getElementById('playerSelect');
  teamsSorted.forEach(ab=>{
    const pids = playersOfTeam(ab).sort((a,b)=>
      playerAgg(b,'ALL').draws -
      playerAgg(a,'ALL').draws);
    if(!pids.length) return;
    const grp = document.createElement('optgroup');
    grp.label = META.teams[ab].name + (META.teams[ab].fullSeason ? '' : ' (partial sample)');
    pids.forEach(pid=>{
      const p = DATA[pid];
      const o = document.createElement('option');
      o.value = pid;
      o.textContent = p.name+' ('+(p.hand||'?')+') — '+playerAgg(pid,'ALL').draws+' draws';
      grp.appendChild(o);
    });
    sel.appendChild(grp);
  });
  sel.addEventListener('change', ()=>{ renderMap(); });

  document.querySelectorAll('#sitSeg button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('#sitSeg button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); renderMap();
  }));
  document.querySelectorAll('.fo-header-btn').forEach(b=>
    b.addEventListener('click', ()=>showTab(b.dataset.tab)));

  renderScout();
  renderMatchup();
  renderMap();
}

let SEGMENT = 'rs';

/* Coaches Station injects these before this document runs (same pattern the
   Shootout tab uses) — the iframe is its own document and cannot see the
   parent's variables. */
let FO_API_BASE = '', FO_API_AUTH = '';
function csApiBase(){ return FO_API_BASE; }
function csApiAuth(){ return FO_API_AUTH; }

let FO_US   = 'EDM';
let FO_THEM = '';
let FO_SEASON = '20252026';

async function loadFaceoffs(segment){
  const url = csApiBase()+'/api/faceoffs/matchup/'+FO_US+'/'+FO_THEM+
              '?season='+encodeURIComponent(FO_SEASON)+'&segment='+segment;
  const headers = {};
  const auth = csApiAuth();
  if(auth) headers['Authorization'] = auth;
  const resp = await fetch(url, {headers:headers, cache:'no-store'});
  if(!resp.ok) throw new Error('HTTP '+resp.status);
  const j = await resp.json();
  if(!j || !j.players || !j.meta) throw new Error('unexpected shape');
  return j;
}

function foFatal(msg){
  const w = document.querySelector('.wrap');
  if(w) w.innerHTML = '<div class="panel"><div class="panel-label">Faceoff data unavailable</div>'+
    '<div class="panel-sub">'+msg+'</div></div>';
}

async function bootstrap(){
  try{
    const j = await loadFaceoffs(SEGMENT);
    RAW = j; META = j.meta; DATA = j.players;
  }catch(err){
    foFatal('Could not load faceoff data from Coaches Station ('+err.message+'). '+
            'The PSF-derived draws may not have been built for this season yet.');
    return;
  }
  init();
}



  function ensureStyles() {
    if (document.getElementById('fo-styles')) return;
    const st = document.createElement('style');
    st.id = 'fo-styles';
    st.textContent = FO_CSS;
    document.head.appendChild(st);
  }

  /* container: the element to render into (h2h-content)
     opts: { them, season, apiBase, auth } — us is always EDM */
  function mount(container, opts) {
    ensureStyles();
    opts = opts || {};
    FO_API_BASE = opts.apiBase || '';
    FO_API_AUTH = opts.auth || '';
    FO_THEM = opts.them || '';
    FO_SEASON = opts.season || '20252026';
    SEGMENT = 'rs';
    container.innerHTML = '<div id="fo-root">' + FO_HTML + '</div>';
    bootstrap();
  }

  return { mount: mount };
})();
