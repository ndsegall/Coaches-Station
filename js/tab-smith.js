// ===========================================================================
// Smith's tab (role: smith) -- Pre-Scout Prep.
//
// Extracted verbatim from renderH2H(). The body is unchanged; what it used to
// read from renderH2H's scope now arrives as arguments:
//   container : the #h2h-content element
//   ctx       : buildH2HContext() output -- this tab uses 14 of its values
//   opts      : {teamA, teamB, bMatchups}
//
// Verified to render byte-identical HTML to the inline version.
// ===========================================================================
const SmithTab = (function () {
  function mount(container, ctx, opts) {
    const content = container;
    const {teamA, teamB, bMatchups} = opts;
    const {filtered, fmtTeamHeader, h2hGameRowsHtml, l5MapAll, l5RowsHtml, nameA, nameB, ovRowsHtml, rankL5, rnk, sB, stMap, stRanks, vsGameRowsHtml} = ctx;


    // Smith: defensive play + our PK. Needs the OPPONENT's offense and power play — the
    // mirror image of McFarland's box. Top two panels reuse the same shared SEASON
    // OVERVIEW / LAST 5 GAMES rows as every other view.
    const smSeasonMap = {};
    const smL5Map = {};
    for (const t of teams) {
      const rows = filtered.filter(r=>r.team===t);
      if (!rows.length) continue;
      const gp = rows.length;
      const ppToi = rows.reduce((s,r)=>s+r.ppToi,0);
      smSeasonMap[t] = {
        esRebXgf: rows.reduce((s,r)=>s+r.esReboundXgf,0)/gp,
        esOzpXgf: rows.reduce((s,r)=>s+r.esOzPlayXgf,0)/gp,
        ppRushXgf:    ppToi>0 ? rows.reduce((s,r)=>s+r.ppRushXgf,0)/ppToi*60 : 0,
        ppCycleXgf:   ppToi>0 ? rows.reduce((s,r)=>s+r.ppCycleXgf,0)/ppToi*60 : 0,
        ppFcXgf:      ppToi>0 ? rows.reduce((s,r)=>s+r.ppFcXgf,0)/ppToi*60 : 0,
        ppReboundXgf: ppToi>0 ? rows.reduce((s,r)=>s+r.ppReboundXgf,0)/ppToi*60 : 0,
        ppOzPlayXgf:  ppToi>0 ? rows.reduce((s,r)=>s+r.ppOzPlayXgf,0)/ppToi*60 : 0,
        ppShGa:       rows.reduce((s,r)=>s+r.ppShGa,0),
      };
      const l5rows = rows.slice(-5);
      const l5gp = l5rows.length;
      if (l5gp) {
        const l5PpToi = l5rows.reduce((s,r)=>s+r.ppToi,0);
        smL5Map[t] = {
          esRebXgf: l5rows.reduce((s,r)=>s+r.esReboundXgf,0)/l5gp,
          esOzpXgf: l5rows.reduce((s,r)=>s+r.esOzPlayXgf,0)/l5gp,
          ppRushXgf:    l5PpToi>0 ? l5rows.reduce((s,r)=>s+r.ppRushXgf,0)/l5PpToi*60 : 0,
          ppCycleXgf:   l5PpToi>0 ? l5rows.reduce((s,r)=>s+r.ppCycleXgf,0)/l5PpToi*60 : 0,
          ppFcXgf:      l5PpToi>0 ? l5rows.reduce((s,r)=>s+r.ppFcXgf,0)/l5PpToi*60 : 0,
          ppReboundXgf: l5PpToi>0 ? l5rows.reduce((s,r)=>s+r.ppReboundXgf,0)/l5PpToi*60 : 0,
          ppOzPlayXgf:  l5PpToi>0 ? l5rows.reduce((s,r)=>s+r.ppOzPlayXgf,0)/l5PpToi*60 : 0,
          ppShGa:       l5rows.reduce((s,r)=>s+r.ppShGa,0),
        };
      }
    }
    function smRank(map, key, higherBetter=true){
      const entries = Object.entries(map).filter(([,v])=>v[key]!=null && !isNaN(v[key]))
        .sort((a,b)=>higherBetter ? b[1][key]-a[1][key] : a[1][key]-b[1][key]);
      const m = {};
      entries.forEach(([team])=>{
        const val = map[team][key];
        const tied = entries.filter(([t])=>Math.abs(map[t][key]-val)<0.0001).length;
        const r = entries.findIndex(([t])=>Math.abs(map[t][key]-val)<0.0001)+1;
        m[team] = tied>1?`T-${r}`:`${r}`;
      });
      return m;
    }
    // Season/Last 5 columns describe the opponent's OWN offensive process objectively —
    // more offense generated is a "better" attacking process for them, so higherBetter=true
    // throughout (same convention Segall/Babcock use for their FOR-side columns).
    const smRkRebF    = smRank(smSeasonMap, 'esRebXgf');
    const smRkOzpF    = smRank(smSeasonMap, 'esOzpXgf');
    const smRkRebFL5  = smRank(smL5Map, 'esRebXgf');
    const smRkPpRush    = smRank(smSeasonMap, 'ppRushXgf');
    const smRkPpCycle   = smRank(smSeasonMap, 'ppCycleXgf');
    const smRkPpFc       = smRank(smSeasonMap, 'ppFcXgf');
    const smRkPpRebound  = smRank(smSeasonMap, 'ppReboundXgf');
    const smRkPpOzp       = smRank(smSeasonMap, 'ppOzPlayXgf');
    const smRkPpShGa      = smRank(smSeasonMap, 'ppShGa', false);
    const smRkPpRushL5    = smRank(smL5Map, 'ppRushXgf');
    const smRkPpCycleL5   = smRank(smL5Map, 'ppCycleXgf');
    const smRkPpFcL5      = smRank(smL5Map, 'ppFcXgf');
    const smRkPpReboundL5 = smRank(smL5Map, 'ppReboundXgf');
    const smRkPpOzpL5     = smRank(smL5Map, 'ppOzPlayXgf');
    const smRkPpShGaL5    = smRank(smL5Map, 'ppShGa', false);
    const smRkOzpFL5  = smRank(smL5Map, 'esOzpXgf');

    function smFmt(v, dec=2){ return (v==null||isNaN(v)) ? '—' : v.toFixed(dec); }
    const l5B_sm = l5MapAll[teamB]||{};
    const l5RkB_sm  = (key,higherBetter=true)=>rankL5(key,higherBetter)[teamB];
    const smSB   = smSeasonMap[teamB]||{}, smLB = smL5Map[teamB]||{};

    // Build the chance-for panel rows (VS | season | L5), five categories
    function smChanceRow(label, vsVal, vsRank, seasonVal, seasonRank, l5Val, l5Rank, isLast=false){
      const border = isLast ? 'border-bottom:none;' : '';
      return `<div class="h2h-ov-label" style="${border}">${label}</div>
              <div class="h2h-ov-cell" style="${border}">${vsVal} ${vsRank}</div>
              <div class="h2h-ov-cell" style="${border}">${seasonVal} ${seasonRank}</div>
              <div class="h2h-ov-cell" style="${border}">${l5Val} ${l5Rank}</div>`;
    }
    const seasonGpB_sm  = filtered.filter(r=>r.team===teamB).length || 1;
    const rushRkSeasonF  = smRank(Object.fromEntries(teams.map(t=>{ const rws=filtered.filter(r=>r.team===t); return [t,{v: rws.reduce((s,r)=>s+r.esRushXgf,0)/(rws.length||1)}]; })), 'v');
    const cycleRkSeasonF = smRank(Object.fromEntries(teams.map(t=>{ const rws=filtered.filter(r=>r.team===t); return [t,{v: rws.reduce((s,r)=>s+r.esCycleXgf,0)/(rws.length||1)}]; })), 'v');
    const fcRkSeasonF    = smRank(Object.fromEntries(teams.map(t=>{ const rws=filtered.filter(r=>r.team===t); return [t,{v: rws.reduce((s,r)=>s+r.esFcXgf,0)/(rws.length||1)}]; })), 'v');
    const rushSeasonF_B  = filtered.filter(r=>r.team===teamB).reduce((s,r)=>s+r.esRushXgf,0)/seasonGpB_sm;
    const cycleSeasonF_B = filtered.filter(r=>r.team===teamB).reduce((s,r)=>s+r.esCycleXgf,0)/seasonGpB_sm;
    const fcSeasonF_B    = filtered.filter(r=>r.team===teamB).reduce((s,r)=>s+r.esFcXgf,0)/seasonGpB_sm;

    // Head-to-head (VS) this season — teamB's own numbers specifically in games vs teamA
    const bMatchGp_sm = bMatchups.length;
    const bMatchPpToi = bMatchups.reduce((s,r)=>s+r.ppToi,0);
    const vsB_sm = bMatchGp_sm ? {
      esRushXgf:    bMatchups.reduce((s,r)=>s+r.esRushXgf,0)/bMatchGp_sm,
      esCycleXgf:   bMatchups.reduce((s,r)=>s+r.esCycleXgf,0)/bMatchGp_sm,
      esFcXgf:      bMatchups.reduce((s,r)=>s+r.esFcXgf,0)/bMatchGp_sm,
      esRebXgf:     bMatchups.reduce((s,r)=>s+r.esReboundXgf,0)/bMatchGp_sm,
      esOzpXgf:     bMatchups.reduce((s,r)=>s+r.esOzPlayXgf,0)/bMatchGp_sm,
      ppRushXgf:    bMatchPpToi>0 ? bMatchups.reduce((s,r)=>s+r.ppRushXgf,0)/bMatchPpToi*60 : 0,
      ppCycleXgf:   bMatchPpToi>0 ? bMatchups.reduce((s,r)=>s+r.ppCycleXgf,0)/bMatchPpToi*60 : 0,
      ppFcXgf:      bMatchPpToi>0 ? bMatchups.reduce((s,r)=>s+r.ppFcXgf,0)/bMatchPpToi*60 : 0,
      ppReboundXgf: bMatchPpToi>0 ? bMatchups.reduce((s,r)=>s+r.ppReboundXgf,0)/bMatchPpToi*60 : 0,
      ppOzPlayXgf:  bMatchPpToi>0 ? bMatchups.reduce((s,r)=>s+r.ppOzPlayXgf,0)/bMatchPpToi*60 : 0,
      ppShGa:       bMatchups.reduce((s,r)=>s+r.ppShGa,0),
    } : null;
    const vsFmt_sm = (v,dec=2) => vsB_sm && v!=null && !isNaN(v) ? v.toFixed(dec) : '—';

    // Rank teamA among ALL of teamB's opponents this season. Unlike McFarland's box, LOWER
    // is better here by default — these fields are the opponent's own offensive output
    // specifically against teamA, so allowing less of it is good defense/PK by teamA.
    const teamBGamesByOpp_sm = {};
    filtered.filter(r=>r.team===teamB).forEach(r => {
      const gid = r.date+'_'+r.homeTeam+'_'+r.awayTeam;
      const pair = window._gamePairs[gid]||{};
      const opp = Object.keys(pair).find(t=>t!==teamB);
      if (!opp) return;
      if (!teamBGamesByOpp_sm[opp]) teamBGamesByOpp_sm[opp] = [];
      teamBGamesByOpp_sm[opp].push(r);
    });
    function smVsFieldRank(fieldKey, higherBetter=false){
      const avgs = {};
      Object.entries(teamBGamesByOpp_sm).forEach(([opp, rows]) => {
        avgs[opp] = rows.reduce((s,r)=>s+r[fieldKey],0)/rows.length;
      });
      if (avgs[teamA]==null) return null;
      const entries = Object.entries(avgs).sort((a,b)=>higherBetter ? b[1]-a[1] : a[1]-b[1]);
      const val = avgs[teamA];
      const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
      const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
      return tied>1 ? `T-${rank}/${entries.length}` : `${rank}/${entries.length}`;
    }
    function smVsPpFieldRank(fieldKey, higherBetter=false){
      const rates = {};
      Object.entries(teamBGamesByOpp_sm).forEach(([opp, rows]) => {
        const toi = rows.reduce((s,r)=>s+r.ppToi,0);
        rates[opp] = toi>0 ? rows.reduce((s,r)=>s+r[fieldKey],0)/toi*60 : null;
      });
      if (rates[teamA]==null) return null;
      const entries = Object.entries(rates).filter(([,v])=>v!=null).sort((a,b)=>higherBetter ? b[1]-a[1] : a[1]-b[1]);
      const val = rates[teamA];
      const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
      const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
      return tied>1 ? `T-${rank}/${entries.length}` : `${rank}/${entries.length}`;
    }
    function smVsPpXgfPer60Rank(){ return smVsPpFieldRank('ppXgf', false); }

    const smChancePanelRows = [
      smChanceRow('Rush xGF/GP',       vsFmt_sm(vsB_sm?.esRushXgf),  rnk(smVsFieldRank('esRushXgf')),  smFmt(rushSeasonF_B),  rnk(rushRkSeasonF[teamB]),  smFmt(l5B_sm.esRushXgf),  rnk(l5RkB_sm('esRushXgf'))),
      smChanceRow('OZ Play xGF/GP',    vsFmt_sm(vsB_sm?.esOzpXgf), rnk(smVsFieldRank('esOzPlayXgf')), smFmt(smSB.esOzpXgf), rnk(smRkOzpF[teamB]), smFmt(smLB.esOzpXgf), rnk(smRkOzpFL5[teamB])),
      smChanceRow('Cycle xGF/GP',      vsFmt_sm(vsB_sm?.esCycleXgf), rnk(smVsFieldRank('esCycleXgf')), smFmt(cycleSeasonF_B), rnk(cycleRkSeasonF[teamB]), smFmt(l5B_sm.esCycleXgf), rnk(l5RkB_sm('esCycleXgf'))),
      smChanceRow('Forecheck xGF/GP',  vsFmt_sm(vsB_sm?.esFcXgf),    rnk(smVsFieldRank('esFcXgf')),    smFmt(fcSeasonF_B),    rnk(fcRkSeasonF[teamB]),    smFmt(l5B_sm.esFcXgf),    rnk(l5RkB_sm('esFcXgf'))),
      smChanceRow('2nd Chance (Rebound) xGF/GP', vsFmt_sm(vsB_sm?.esRebXgf), rnk(smVsFieldRank('esReboundXgf')), smFmt(smSB.esRebXgf), rnk(smRkRebF[teamB]), smFmt(smLB.esRebXgf), rnk(smRkRebFL5[teamB]), true),
    ].join('');

    // Dedicated PP panel — opponent's power play, chance-type breakdown while on the man advantage
    const stB_sm = stMap[teamB]||{}, stRkB_sm = stRanks[teamB]||{};
    const smPpRows = [
      smChanceRow('PP xGF/60', bMatchGp_sm?smFmt(sB.ppXgfPer60):'—', rnk(smVsPpXgfPer60Rank()), smFmt(stB_sm.ppXgfPer60), rnk(stRkB_sm.xgf), smFmt(l5B_sm.ppXgfPer60), rnk(l5RkB_sm('ppXgfPer60'))),
      smChanceRow('PP Rush xGF/60',      vsFmt_sm(vsB_sm?.ppRushXgf),    rnk(smVsPpFieldRank('ppRushXgf')),    smFmt(smSB.ppRushXgf),    rnk(smRkPpRush[teamB]),    smFmt(smLB.ppRushXgf),    rnk(smRkPpRushL5[teamB])),
      smChanceRow('PP Cycle xGF/60',     vsFmt_sm(vsB_sm?.ppCycleXgf),   rnk(smVsPpFieldRank('ppCycleXgf')),   smFmt(smSB.ppCycleXgf),   rnk(smRkPpCycle[teamB]),   smFmt(smLB.ppCycleXgf),   rnk(smRkPpCycleL5[teamB])),
      smChanceRow('PP Forecheck xGF/60', vsFmt_sm(vsB_sm?.ppFcXgf),      rnk(smVsPpFieldRank('ppFcXgf')),      smFmt(smSB.ppFcXgf),      rnk(smRkPpFc[teamB]),      smFmt(smLB.ppFcXgf),      rnk(smRkPpFcL5[teamB])),
      smChanceRow('PP 2nd Chance xGF/60',vsFmt_sm(vsB_sm?.ppReboundXgf), rnk(smVsPpFieldRank('ppReboundXgf')), smFmt(smSB.ppReboundXgf), rnk(smRkPpRebound[teamB]), smFmt(smLB.ppReboundXgf), rnk(smRkPpReboundL5[teamB])),
      smChanceRow('PP OZ Play xGF/60',   vsFmt_sm(vsB_sm?.ppOzPlayXgf),  rnk(smVsPpFieldRank('ppOzPlayXgf')),  smFmt(smSB.ppOzPlayXgf),  rnk(smRkPpOzp[teamB]),     smFmt(smLB.ppOzPlayXgf),  rnk(smRkPpOzpL5[teamB])),
      smChanceRow('Shorthanded Goals Against', bMatchGp_sm?Math.round(vsB_sm.ppShGa)+'':'—', rnk(smVsFieldRank('ppShGa', true)), Math.round(smSB.ppShGa||0)+'', rnk(smRkPpShGa[teamB]), Math.round(smLB.ppShGa||0)+'', rnk(smRkPpShGaL5[teamB]), true),
    ].join('');

    content.innerHTML=`
      <!-- Season Overview + Last 5 side by side — TOP ROW (same shared panels as Babcock/Segall) -->
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

      <div id="h2h-pp-report-panel" style="margin-top:0.75rem;"></div>

      <div id="h2h-pp-visuals-panel" style="margin-top:0.75rem;"></div>

      <!-- Dedicated scoring-chance-for panel (compact) + PP panel side by side -->
      <div class="h2h-overview-wrapper" style="margin-top:0.75rem;">
        <div class="h2h-overview">
          <div class="h2h-overview-title">${nameB.toUpperCase()} — SCORING CHANCES (ES, xG/GP)</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) minmax(60px,1fr) minmax(60px,1fr) minmax(60px,1fr);">
            <div class="h2h-ov-header">Category</div>
            <div class="h2h-ov-header team-b" style="font-size:0.6rem;">${teamA} vs ${teamB} (${teamA} Rank)</div>
            <div class="h2h-ov-header team-b">Season</div>
            <div class="h2h-ov-header team-b">Last 5</div>
            ${smChancePanelRows}
          </div>
        </div>
        <div class="h2h-overview">
          <div class="h2h-overview-title">${nameB.toUpperCase()} — POWER PLAY</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) minmax(60px,1fr) minmax(60px,1fr) minmax(60px,1fr);">
            <div class="h2h-ov-header">Category</div>
            <div class="h2h-ov-header team-b" style="font-size:0.6rem;">${teamA} vs ${teamB} (${teamA} Rank)</div>
            <div class="h2h-ov-header team-b">Season</div>
            <div class="h2h-ov-header team-b">Last 5</div>
            ${smPpRows}
          </div>
        </div>
      </div>

      <!-- Season series vs opponent — schedule-style -->
      <div style="margin-top:1rem;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
        <div class="sched-header-row" style="border-radius:0;position:static;">
          <span>Date</span><span>Opponent</span><span style="text-align:center">Result</span><span style="text-align:center">Score</span>
          <span style="text-align:center">ES xG&#916;</span><span style="text-align:center">ES xGF</span><span style="text-align:center">ES xGA</span>
          <span style="text-align:center">AS xG&#916;</span><span style="text-align:center">AS xGF</span><span style="text-align:center">AS xGA</span>
        </div>
        <div id="h2h-vs-log">${vsGameRowsHtml || '<div style="padding:0.75rem 1rem;color:var(--text3);font-size:0.82rem;">No games found.</div>'}</div>
      </div>

      <!-- Opponent's last 5 games overall — schedule-style -->
      <div style="margin-top:1rem;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
        <div class="sched-header-row" style="border-radius:0;position:static;">
          <span>LAST 5 GAMES</span><span>Opponent</span><span style="text-align:center">Result</span><span style="text-align:center">Score</span>
          <span style="text-align:center">ES xG&#916;</span><span style="text-align:center">ES xGF</span><span style="text-align:center">ES xGA</span>
          <span style="text-align:center">AS xG&#916;</span><span style="text-align:center">AS xGF</span><span style="text-align:center">AS xGA</span>
        </div>
        <div id="h2h-game-log">${h2hGameRowsHtml}</div>
      </div>`;

    // Wire season-series log clicks (teamA perspective, same as Babcock)
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
        const isPo     = gameDate >= PO_START;
        row.insertAdjacentHTML('afterend', renderScheduleDetail(gameRow, oppRow, teamA, isPo));
      });
    });

    // Wire game row clicks for recaps (opponent's own last 5)
    content.querySelectorAll('#h2h-game-log .sched-game-row').forEach(row => {
      row.addEventListener('click', () => {
        const key = row.dataset.gamekey;
        const existing = document.getElementById('sched-detail-' + key);
        if (existing) { existing.remove(); row.classList.remove('expanded'); return; }
        content.querySelectorAll('#h2h-game-log .sched-detail-row').forEach(d => d.remove());
        content.querySelectorAll('#h2h-game-log .sched-game-row.expanded').forEach(r => r.classList.remove('expanded'));
        row.classList.add('expanded');
        const gameDate = row.dataset.date;
        const homeT    = row.dataset.home;
        const awayT    = row.dataset.away;
        const gameRow  = allData.find(r => r.team === teamB && r.date === gameDate && r.homeTeam === homeT && r.awayTeam === awayT);
        if (!gameRow) return;
        const oppRow   = getOpponentRow(gameRow);
        const isPo     = gameDate >= PO_START;
        row.insertAdjacentHTML('afterend', renderScheduleDetail(gameRow, oppRow, teamB, isPo));
      });
    });
    renderTopScorersPanel();
    renderPkReportPanel();
    renderPkVisualsPanel();
    renderPpReportPanel();
    renderPpVisualsPanel();

    return;
  
  }

  return { mount: mount };
})();
