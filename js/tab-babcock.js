// ===========================================================================
// Babcock's tab (role: head-coach -- the default fallthrough) -- Pre-Scout Prep.
//
// This was renderH2H()'s fallthrough tail -- it had no `if (role===...)`
// guard at all, it simply ran when no other branch matched. It is now an
// explicit default in the dispatch, which is the same behavior stated
// plainly instead of implied by position.
// Extracted verbatim from renderH2H(). The body is unchanged; what it used to
// read from renderH2H's scope now arrives as arguments:
//   container : the #h2h-content element
//   ctx       : buildH2HContext() output -- this tab uses 17 of its values
//   opts      : {teamA, teamB}
//
// Verified to render byte-identical HTML to the inline version.
// ===========================================================================
const BabcockTab = (function () {
  function mount(container, ctx, opts) {
    const content = container;
    const {teamA, teamB} = opts;
    const {colorDelta, colorPkAxg, fmtTeamHeader, h2hGameRowsHtml, l5RowsHtml, nameA, nameB, ovRowsHtml, sA, sB, vcChancePanelB, vcL5ChanceRowsB, vcL5TeamStatsRowsB, vcSeasonChanceRowsB, vcSeasonTeamStatsRowsB, vcTeamStatsPanelB, vsGameRowsHtml} = ctx;



  content.innerHTML=`
    <!-- Season Overview + Last 5 side by side — TOP ROW -->
    <div class="h2h-overview-wrapper">
      <div class="h2h-overview">
        <div class="h2h-overview-title title-season">FULL SEASON</div>
        <div class="h2h-overview-grid">
          <div class="h2h-ov-header">Stat</div>
          <div class="h2h-ov-header team-a">${fmtTeamHeader(nameA)}</div>
          <div class="h2h-ov-header team-b">${fmtTeamHeader(nameB)}</div>
          ${ovRowsHtml}
        </div>
      </div>
      <div class="h2h-overview">
        <div class="h2h-overview-title title-last5">LAST 5 GAMES</div>
        <div class="h2h-overview-grid">
          <div class="h2h-ov-header">Stat</div>
          <div class="h2h-ov-header team-a">${fmtTeamHeader(nameA)}</div>
          <div class="h2h-ov-header team-b">${fmtTeamHeader(nameB)}</div>
          ${l5RowsHtml}
        </div>
      </div>
    </div>

    <div id="h2h-top-scorers-panel" style="margin-top:0.75rem;"></div>

    <!-- General + Special Teams + Goaltending — MIDDLE ROW -->
    <div class="h2h-summary">
      <!-- Box 1: GENERAL vs opponent -->
      <div class="h2h-stat-block team-a">
        <div class="h2h-team-name">GENERAL vs ${nameB}</div>
        <div class="h2h-row"><span>Record vs ${teamB}</span><span class="h2h-val">${sA.w}-${sA.l}-${sA.otl}</span></div>
        <div class="h2h-row"><span>GF-GA</span><span class="h2h-val">${sA.gf}-${sA.ga}</span></div>
        <div class="h2h-row"><span>AS xGF</span><span class="h2h-val">${sA.axgf.toFixed(2)}</span></div>
        <div class="h2h-row"><span>AS xGA</span><span class="h2h-val">${sA.axga.toFixed(2)}</span></div>
        <div class="h2h-row"><span>ES xGF</span><span class="h2h-val">${sA.xgf.toFixed(2)}</span></div>
        <div class="h2h-row"><span>ES xGA</span><span class="h2h-val">${sA.xga.toFixed(2)}</span></div>
        <div class="h2h-row"><span>ES xGF/60</span><span class="h2h-val">${sA.xgf60.toFixed(2)}</span></div>
        <div class="h2h-row"><span>ES xGA/60</span><span class="h2h-val">${sA.xga60.toFixed(2)}</span></div>
        <div class="h2h-row"><span>ES xG Delta</span><span class="h2h-val">${colorDelta(sA.delta)}</span></div>
        <div class="h2h-row"><span>ES xGF%</span><span class="h2h-val">${sA.xgfPct.toFixed(1)}%</span></div>
      </div>
      <!-- Box 2: SPECIAL TEAMS vs opponent -->
      <div class="h2h-stat-block team-b">
        <div class="h2h-team-name">SPECIAL TEAMS vs ${nameB}</div>
        <div class="h2h-st-col-header" style="margin-top:0;">Power Play</div>
        <div class="h2h-row"><span>PP</span><span class="h2h-val">${sA.ppGf}/${sA.ppDrawn}</span></div>
        <div class="h2h-row"><span>PP xGF</span><span class="h2h-val">${sA.ppXgf.toFixed(2)}</span></div>
        <div class="h2h-row"><span>PP Actual to Expected GF</span><span class="h2h-val">${colorDelta(sA.ppAxgf)}</span></div>
        <div class="h2h-st-col-header" style="margin-top:0.6rem;">Penalty Kill</div>
        <div class="h2h-row"><span>PK</span><span class="h2h-val">${sA.pkGa}/${sA.pkTaken}</span></div>
        <div class="h2h-row"><span>PK xGA</span><span class="h2h-val">${sA.pkXga.toFixed(2)}</span></div>
        <div class="h2h-row"><span>PK Actual to Expected GA</span><span class="h2h-val">${colorPkAxg(sA.pkAxga)}</span></div>
      </div>
      <!-- Box 3: GOALTENDING vs opponent -->
      <div class="h2h-stat-block neutral">
        <div class="h2h-team-name">GOALTENDING vs ${nameB}</div>
        <div class="h2h-goalie-subtitle">All Strengths Saves Above Expected</div>
        <div class="h2h-row"><span>${nameA}</span><span class="h2h-val" style="color:${sA.gsax>=0?'#296bbe':'#ba0c0c'}">${sA.gsax>=0?'+':''}${sA.gsax.toFixed(2)}</span></div>
        <div class="h2h-row"><span>${nameB}</span><span class="h2h-val" style="color:${sB.gsax>=0?'#296bbe':'#ba0c0c'}">${sB.gsax>=0?'+':''}${sB.gsax.toFixed(2)}</span></div>
        ${(()=>{const esSaxA=sA.xga-sA.esga; const esSaxB=sB.xga-sB.esga; return `
        <div class="h2h-goalie-subtitle" style="margin-top:0.5rem;">ES Saves Above Expected</div>
        <div class="h2h-row"><span>${nameA}</span><span class="h2h-val" style="color:${esSaxA>=0?'#296bbe':'#ba0c0c'}">${esSaxA>=0?'+':''}${esSaxA.toFixed(2)}</span></div>
        <div class="h2h-row"><span>${nameB}</span><span class="h2h-val" style="color:${esSaxB>=0?'#296bbe':'#ba0c0c'}">${esSaxB>=0?'+':''}${esSaxB.toFixed(2)}</span></div>`;})()}
        <div class="h2h-goalie-subtitle" style="margin-top:0.5rem;">PK Saves Above Expected</div>
        ${(()=>{const pkSaxA=sA.pkXga-sA.pkGa; const pkSaxB=sB.pkXga-sB.pkGa; return `
        <div class="h2h-row"><span>${nameA}</span><span class="h2h-val" style="color:${pkSaxA>=0?'#296bbe':'#ba0c0c'}">${pkSaxA>=0?'+':''}${pkSaxA.toFixed(2)}</span></div>
        <div class="h2h-row"><span>${nameB}</span><span class="h2h-val" style="color:${pkSaxB>=0?'#296bbe':'#ba0c0c'}">${pkSaxB>=0?'+':''}${pkSaxB.toFixed(2)}</span></div>`;})()}
      </div>
    </div>

    <!-- Scoring Chances + Team Stats vs opponent (Season / Last 5) — NEW ROW -->
    <div class="vc-layout" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1rem;align-items:flex-start;margin-top:0.75rem;">
      <div class="vc-stat-col" style="display:flex;flex-direction:column;gap:0;min-width:0;">
        ${vcChancePanelB(`SCORING CHANCES &amp; RUSHES &#8212; ${nameB.toUpperCase()} (SEASON)`, vcSeasonChanceRowsB())}
        ${vcTeamStatsPanelB(`TEAM STATS &#8212; ${nameB.toUpperCase()} (SEASON)`, vcSeasonTeamStatsRowsB())}
      </div>
      <div class="vc-stat-col" style="display:flex;flex-direction:column;gap:0;min-width:0;">
        ${vcChancePanelB(`SCORING CHANCES &amp; RUSHES &#8212; ${nameB.toUpperCase()} (LAST 5)`, vcL5ChanceRowsB())}
        ${vcTeamStatsPanelB(`TEAM STATS &#8212; ${nameB.toUpperCase()} (LAST 5)`, vcL5TeamStatsRowsB())}
      </div>
    </div>

    <!-- Games vs opponent — schedule-style -->
    <div style="margin-top:1rem;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
      <div class="sched-header-row" style="border-radius:0;position:static;">
        <span>Date</span><span>Opponent</span><span style="text-align:center">Result</span><span style="text-align:center">Score</span>
        <span style="text-align:center">ES xG&#916;</span><span style="text-align:center">ES xGF</span><span style="text-align:center">ES xGA</span>
        <span style="text-align:center">AS xG&#916;</span><span style="text-align:center">AS xGF</span><span style="text-align:center">AS xGA</span>
      </div>
      <div id="h2h-vs-log">${vsGameRowsHtml || '<div style="padding:0.75rem 1rem;color:var(--text3);font-size:0.82rem;">No games found.</div>'}</div>
    </div>
    <div style="margin-top:1rem;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
      <div class="sched-header-row" style="border-radius:0;position:static;">
        <span>LAST 5 GAMES</span><span>Opponent</span><span style="text-align:center">Result</span><span style="text-align:center">Score</span>
        <span style="text-align:center">ES xG&#916;</span><span style="text-align:center">ES xGF</span><span style="text-align:center">ES xGA</span>
        <span style="text-align:center">AS xG&#916;</span><span style="text-align:center">AS xGF</span><span style="text-align:center">AS xGA</span>
      </div>
      <div id="h2h-game-log">${h2hGameRowsHtml}</div>
    </div>`;

  // Wire vs log clicks (teamA perspective)
  content.querySelectorAll('#h2h-vs-log .sched-game-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.gamekey;
      const existing = document.getElementById('sched-detail-' + key);
      if (existing) { existing.remove(); row.classList.remove('expanded'); return; }
      content.querySelectorAll('#h2h-vs-log .sched-detail-row').forEach(d => d.remove());
      content.querySelectorAll('#h2h-vs-log .sched-game-row.expanded').forEach(r => r.classList.remove('expanded'));
      row.classList.add('expanded');
      const gameDate = row.dataset.date;
      const homeT    = row.dataset.home;
      const awayT    = row.dataset.away;
      const gameRow  = allData.find(r => r.team === teamA && r.date === gameDate && r.homeTeam === homeT && r.awayTeam === awayT);
      if (!gameRow) return;
      const oppRow   = getOpponentRow(gameRow);
      const isPo     = gameDate >= '2026-04-17';
      row.insertAdjacentHTML('afterend', renderScheduleDetail(gameRow, oppRow, teamA, isPo));
    });
  });

  // Wire game row clicks for recaps
  content.querySelectorAll('#h2h-game-log .sched-game-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.gamekey;
      const existing = document.getElementById('sched-detail-' + key);
      if (existing) {
        existing.remove();
        row.classList.remove('expanded');
        return;
      }
      content.querySelectorAll('#h2h-game-log .sched-detail-row').forEach(d => d.remove());
      content.querySelectorAll('#h2h-game-log .sched-game-row.expanded').forEach(r => r.classList.remove('expanded'));
      row.classList.add('expanded');
      const gameDate = row.dataset.date;
      const homeT    = row.dataset.home;
      const awayT    = row.dataset.away;
      const gameRow  = allData.find(r => r.team === teamB && r.date === gameDate && r.homeTeam === homeT && r.awayTeam === awayT);
      if (!gameRow) return;
      const oppRow   = getOpponentRow(gameRow);
      const isPo     = gameDate >= '2026-04-17';
      const detailHtml = renderScheduleDetail(gameRow, oppRow, teamB, isPo);
      row.insertAdjacentHTML('afterend', detailHtml);
    });
  });
  renderTopScorersPanel();
    renderPkReportPanel();
    renderPkVisualsPanel();


  }

  return { mount: mount };
})();
