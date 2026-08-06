// ===========================================================================
// McFarland's tab (role: mcfarland) -- Pre-Scout Prep.
//
// Extracted verbatim from renderH2H(). The body is unchanged; what it used to
// read from renderH2H's scope now arrives as arguments:
//   container : the #h2h-content element
//   ctx       : buildH2HContext() output -- this tab uses 14 of its values
//   opts      : {teamA, teamB, bMatchups}
//
// Verified to render byte-identical HTML to the inline version.
// ===========================================================================
const McFarlandTab = (function () {
  function mount(container, ctx, opts) {
    const content = container;
    const {teamA, teamB, bMatchups} = opts;
    const {filtered, fmtTeamHeader, h2hGameRowsHtml, l5MapAll, l5RowsHtml, nameA, nameB, ovRowsHtml, rankL5, rnk, sB, stMap, stRanks, vsGameRowsHtml} = ctx;


    // McFarland: offensive play + our PP. Needs the OPPONENT's defense and penalty kill.
    // Top two panels reuse the exact same shared SEASON OVERVIEW / LAST 5 GAMES rows
    // (ovRowsHtml/l5RowsHtml) that Babcock and Segall's views already use — same data,
    // same blue/red rank shading, same two-team layout.
    const mfSeasonMap = {};
    const mfL5Map = {};
    for (const t of teams) {
      const rows = filtered.filter(r=>r.team===t);
      if (!rows.length) continue;
      const gp = rows.length;
      const pkToi = rows.reduce((s,r)=>s+r.pkToi,0);
      mfSeasonMap[t] = {
        esRebXga: rows.reduce((s,r)=>s+r.esReboundXga,0)/gp,
        esOzpXga: rows.reduce((s,r)=>s+r.esOzPlayXga,0)/gp,
        pkRushXga:    pkToi>0 ? rows.reduce((s,r)=>s+r.pkRushXga,0)/pkToi*60 : 0,
        pkCycleXga:   pkToi>0 ? rows.reduce((s,r)=>s+r.pkCycleXga,0)/pkToi*60 : 0,
        pkFcXga:      pkToi>0 ? rows.reduce((s,r)=>s+r.pkFcXga,0)/pkToi*60 : 0,
        pkReboundXga: pkToi>0 ? rows.reduce((s,r)=>s+r.pkReboundXga,0)/pkToi*60 : 0,
        pkOzPlayXga:  pkToi>0 ? rows.reduce((s,r)=>s+r.pkOzPlayXga,0)/pkToi*60 : 0,
        pkShGf:       rows.reduce((s,r)=>s+r.pkShGf,0),
      };
      const l5rows = rows.slice(-5);
      const l5gp = l5rows.length;
      if (l5gp) {
        const l5PkToi = l5rows.reduce((s,r)=>s+r.pkToi,0);
        mfL5Map[t] = {
          esRebXga: l5rows.reduce((s,r)=>s+r.esReboundXga,0)/l5gp,
          esOzpXga: l5rows.reduce((s,r)=>s+r.esOzPlayXga,0)/l5gp,
          pkRushXga:    l5PkToi>0 ? l5rows.reduce((s,r)=>s+r.pkRushXga,0)/l5PkToi*60 : 0,
          pkCycleXga:   l5PkToi>0 ? l5rows.reduce((s,r)=>s+r.pkCycleXga,0)/l5PkToi*60 : 0,
          pkFcXga:      l5PkToi>0 ? l5rows.reduce((s,r)=>s+r.pkFcXga,0)/l5PkToi*60 : 0,
          pkReboundXga: l5PkToi>0 ? l5rows.reduce((s,r)=>s+r.pkReboundXga,0)/l5PkToi*60 : 0,
          pkOzPlayXga:  l5PkToi>0 ? l5rows.reduce((s,r)=>s+r.pkOzPlayXga,0)/l5PkToi*60 : 0,
          pkShGf:       l5rows.reduce((s,r)=>s+r.pkShGf,0),
        };
      }
    }
    function mfRank(map, key, higherBetter=false){
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
    const mfRkRebA    = mfRank(mfSeasonMap, 'esRebXga');
    const mfRkOzpA    = mfRank(mfSeasonMap, 'esOzpXga');
    const mfRkRebAL5  = mfRank(mfL5Map, 'esRebXga');
    const mfRkPkRush    = mfRank(mfSeasonMap, 'pkRushXga');
    const mfRkPkCycle   = mfRank(mfSeasonMap, 'pkCycleXga');
    const mfRkPkFc      = mfRank(mfSeasonMap, 'pkFcXga');
    const mfRkPkRebound = mfRank(mfSeasonMap, 'pkReboundXga');
    const mfRkPkOzp     = mfRank(mfSeasonMap, 'pkOzPlayXga');
    const mfRkPkShGf    = mfRank(mfSeasonMap, 'pkShGf', true);
    const mfRkPkRushL5    = mfRank(mfL5Map, 'pkRushXga');
    const mfRkPkCycleL5   = mfRank(mfL5Map, 'pkCycleXga');
    const mfRkPkFcL5      = mfRank(mfL5Map, 'pkFcXga');
    const mfRkPkReboundL5 = mfRank(mfL5Map, 'pkReboundXga');
    const mfRkPkOzpL5     = mfRank(mfL5Map, 'pkOzPlayXga');
    const mfRkPkShGfL5    = mfRank(mfL5Map, 'pkShGf', true);
    const mfRkOzpAL5  = mfRank(mfL5Map, 'esOzpXga');

    function mfFmt(v, dec=2){ return (v==null||isNaN(v)) ? '—' : v.toFixed(dec); }
    const l5B_mf = l5MapAll[teamB]||{};
    const l5RkB  = (key,higherBetter=true)=>rankL5(key,higherBetter)[teamB];
    const mfSB   = mfSeasonMap[teamB]||{}, mfLB = mfL5Map[teamB]||{};

    // Build the chance-against panel rows (season | L5), five categories
    function mfChanceRow(label, vsVal, vsRank, seasonVal, seasonRank, l5Val, l5Rank, isLast=false){
      const border = isLast ? 'border-bottom:none;' : '';
      return `<div class="h2h-ov-label" style="${border}">${label}</div>
              <div class="h2h-ov-cell" style="${border}">${vsVal} ${vsRank}</div>
              <div class="h2h-ov-cell" style="${border}">${seasonVal} ${seasonRank}</div>
              <div class="h2h-ov-cell" style="${border}">${l5Val} ${l5Rank}</div>`;
    }
    const seasonGpB    = filtered.filter(r=>r.team===teamB).length || 1;
    const rushRkSeason  = mfRank(Object.fromEntries(teams.map(t=>{ const rws=filtered.filter(r=>r.team===t); return [t,{v: rws.reduce((s,r)=>s+r.esRushXga,0)/(rws.length||1)}]; })), 'v');
    const cycleRkSeason = mfRank(Object.fromEntries(teams.map(t=>{ const rws=filtered.filter(r=>r.team===t); return [t,{v: rws.reduce((s,r)=>s+r.esCycleXga,0)/(rws.length||1)}]; })), 'v');
    const fcRkSeason    = mfRank(Object.fromEntries(teams.map(t=>{ const rws=filtered.filter(r=>r.team===t); return [t,{v: rws.reduce((s,r)=>s+r.esFcXga,0)/(rws.length||1)}]; })), 'v');
    const rushSeasonB  = filtered.filter(r=>r.team===teamB).reduce((s,r)=>s+r.esRushXga,0)/seasonGpB;
    const cycleSeasonB = filtered.filter(r=>r.team===teamB).reduce((s,r)=>s+r.esCycleXga,0)/seasonGpB;
    const fcSeasonB    = filtered.filter(r=>r.team===teamB).reduce((s,r)=>s+r.esFcXga,0)/seasonGpB;

    // Head-to-head (VS) this season — teamB's own numbers specifically in games vs teamA
    const bMatchGp = bMatchups.length;
    const bMatchPkToi = bMatchups.reduce((s,r)=>s+r.pkToi,0);
    const vsB = bMatchGp ? {
      esRushXga:    bMatchups.reduce((s,r)=>s+r.esRushXga,0)/bMatchGp,
      esCycleXga:   bMatchups.reduce((s,r)=>s+r.esCycleXga,0)/bMatchGp,
      esFcXga:      bMatchups.reduce((s,r)=>s+r.esFcXga,0)/bMatchGp,
      esRebXga:     bMatchups.reduce((s,r)=>s+r.esReboundXga,0)/bMatchGp,
      esOzpXga:     bMatchups.reduce((s,r)=>s+r.esOzPlayXga,0)/bMatchGp,
      pkRushXga:    bMatchPkToi>0 ? bMatchups.reduce((s,r)=>s+r.pkRushXga,0)/bMatchPkToi*60 : 0,
      pkCycleXga:   bMatchPkToi>0 ? bMatchups.reduce((s,r)=>s+r.pkCycleXga,0)/bMatchPkToi*60 : 0,
      pkFcXga:      bMatchPkToi>0 ? bMatchups.reduce((s,r)=>s+r.pkFcXga,0)/bMatchPkToi*60 : 0,
      pkReboundXga: bMatchPkToi>0 ? bMatchups.reduce((s,r)=>s+r.pkReboundXga,0)/bMatchPkToi*60 : 0,
      pkOzPlayXga:  bMatchPkToi>0 ? bMatchups.reduce((s,r)=>s+r.pkOzPlayXga,0)/bMatchPkToi*60 : 0,
      pkShGf:       bMatchups.reduce((s,r)=>s+r.pkShGf,0),
    } : null;
    const vsFmt = (v,dec=2) => vsB && v!=null && !isNaN(v) ? v.toFixed(dec) : '—';

    // Rank teamA among ALL of teamB's opponents this season, based on each opponent's own
    // average value (per meeting) in the given stat category against teamB — i.e. "of every
    // team that has played them, where does our result in this category rank."
    const teamBGamesByOpp = {};
    filtered.filter(r=>r.team===teamB).forEach(r => {
      const gid = r.date+'_'+r.homeTeam+'_'+r.awayTeam;
      const pair = window._gamePairs[gid]||{};
      const opp = Object.keys(pair).find(t=>t!==teamB);
      if (!opp) return;
      if (!teamBGamesByOpp[opp]) teamBGamesByOpp[opp] = [];
      teamBGamesByOpp[opp].push(r);
    });
    function vsFieldRank(fieldKey, higherBetter=true){
      const avgs = {};
      Object.entries(teamBGamesByOpp).forEach(([opp, rows]) => {
        avgs[opp] = rows.reduce((s,r)=>s+r[fieldKey],0)/rows.length;
      });
      if (avgs[teamA]==null) return null;
      const entries = Object.entries(avgs).sort((a,b)=>higherBetter ? b[1]-a[1] : a[1]-b[1]);
      const val = avgs[teamA];
      const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
      const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
      return tied>1 ? `T-${rank}/${entries.length}` : `${rank}/${entries.length}`;
    }
    function vsPkFieldRank(fieldKey, higherBetter=true){
      const rates = {};
      Object.entries(teamBGamesByOpp).forEach(([opp, rows]) => {
        const toi = rows.reduce((s,r)=>s+r.pkToi,0);
        rates[opp] = toi>0 ? rows.reduce((s,r)=>s+r[fieldKey],0)/toi*60 : null;
      });
      if (rates[teamA]==null) return null;
      const entries = Object.entries(rates).filter(([,v])=>v!=null).sort((a,b)=>higherBetter ? b[1]-a[1] : a[1]-b[1]);
      const val = rates[teamA];
      const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
      const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
      return tied>1 ? `T-${rank}/${entries.length}` : `${rank}/${entries.length}`;
    }
    function vsPkXgaPer60Rank(){ return vsPkFieldRank('pkXga', true); }

    const mfChancePanelRows = [
      mfChanceRow('Rush xGA/GP',       vsFmt(vsB?.esRushXga),  rnk(vsFieldRank('esRushXga')),  mfFmt(rushSeasonB),  rnk(rushRkSeason[teamB]),  mfFmt(l5B_mf.esRushXga),  rnk(l5RkB('esRushXga',false))),
      mfChanceRow('DZ xGA/GP',    vsFmt(vsB?.esOzpXga), rnk(vsFieldRank('esOzPlayXga')), mfFmt(mfSB.esOzpXga), rnk(mfRkOzpA[teamB]), mfFmt(mfLB.esOzpXga), rnk(mfRkOzpAL5[teamB])),
      mfChanceRow('Cycle xGA/GP',      vsFmt(vsB?.esCycleXga), rnk(vsFieldRank('esCycleXga')), mfFmt(cycleSeasonB), rnk(cycleRkSeason[teamB]), mfFmt(l5B_mf.esCycleXga), rnk(l5RkB('esCycleXga',false))),
      mfChanceRow('Forecheck xGA/GP',  vsFmt(vsB?.esFcXga),    rnk(vsFieldRank('esFcXga')),    mfFmt(fcSeasonB),    rnk(fcRkSeason[teamB]),    mfFmt(l5B_mf.esFcXga),    rnk(l5RkB('esFcXga',false))),
      mfChanceRow('2nd Chance (Rebound) xGA/GP', vsFmt(vsB?.esRebXga), rnk(vsFieldRank('esReboundXga')), mfFmt(mfSB.esRebXga), rnk(mfRkRebA[teamB]), mfFmt(mfLB.esRebXga), rnk(mfRkRebAL5[teamB]), true),
    ].join('');

    // Dedicated PK panel — opponent's kill, chance-type breakdown while shorthanded
    const stB_mf = stMap[teamB]||{}, stRkB_mf = stRanks[teamB]||{};
    const mfPkRows = [
      mfChanceRow('PK xGA/60', bMatchGp?mfFmt(sB.pkXgaPer60):'—', rnk(vsPkXgaPer60Rank()), mfFmt(stB_mf.pkXgaPer60), rnk(stRkB_mf.xga), mfFmt(l5B_mf.pkXgaPer60), rnk(l5RkB('pkXgaPer60',false))),
      mfChanceRow('PK Rush xGA/60',      vsFmt(vsB?.pkRushXga),    rnk(vsPkFieldRank('pkRushXga')),    mfFmt(mfSB.pkRushXga),    rnk(mfRkPkRush[teamB]),    mfFmt(mfLB.pkRushXga),    rnk(mfRkPkRushL5[teamB])),
      mfChanceRow('PK Cycle xGA/60',     vsFmt(vsB?.pkCycleXga),   rnk(vsPkFieldRank('pkCycleXga')),   mfFmt(mfSB.pkCycleXga),   rnk(mfRkPkCycle[teamB]),   mfFmt(mfLB.pkCycleXga),   rnk(mfRkPkCycleL5[teamB])),
      mfChanceRow('PK Forecheck xGA/60', vsFmt(vsB?.pkFcXga),      rnk(vsPkFieldRank('pkFcXga')),      mfFmt(mfSB.pkFcXga),      rnk(mfRkPkFc[teamB]),      mfFmt(mfLB.pkFcXga),      rnk(mfRkPkFcL5[teamB])),
      mfChanceRow('PK 2nd Chance xGA/60',vsFmt(vsB?.pkReboundXga), rnk(vsPkFieldRank('pkReboundXga')), mfFmt(mfSB.pkReboundXga), rnk(mfRkPkRebound[teamB]), mfFmt(mfLB.pkReboundXga), rnk(mfRkPkReboundL5[teamB])),
      mfChanceRow('PK DZ xGA/60',        vsFmt(vsB?.pkOzPlayXga),  rnk(vsPkFieldRank('pkOzPlayXga')),  mfFmt(mfSB.pkOzPlayXga),  rnk(mfRkPkOzp[teamB]),     mfFmt(mfLB.pkOzPlayXga),  rnk(mfRkPkOzpL5[teamB])),
      mfChanceRow('Shorthanded Goals For', bMatchGp?Math.round(vsB.pkShGf)+'':'—', rnk(vsFieldRank('pkShGf', false)), Math.round(mfSB.pkShGf||0)+'', rnk(mfRkPkShGf[teamB]), Math.round(mfLB.pkShGf||0)+'', rnk(mfRkPkShGfL5[teamB]), true),
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

      <div id="h2h-pk-report-panel" style="margin-top:0.75rem;"></div>

      <div id="h2h-pk-visuals-panel" style="margin-top:0.75rem;"></div>

      <!-- Dedicated scoring-chance-against panel (compact) + PK panel side by side -->
      <div class="h2h-overview-wrapper" style="margin-top:0.75rem;">
        <div class="h2h-overview">
          <div class="h2h-overview-title">${nameB.toUpperCase()} — CHANCES ALLOWED (ES, xG/GP)</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) minmax(60px,1fr) minmax(60px,1fr) minmax(60px,1fr);">
            <div class="h2h-ov-header">Category</div>
            <div class="h2h-ov-header team-b" style="font-size:0.6rem;">${teamA} vs ${teamB} (${teamA} Rank)</div>
            <div class="h2h-ov-header team-b">Season</div>
            <div class="h2h-ov-header team-b">Last 5</div>
            ${mfChancePanelRows}
          </div>
        </div>
        <div class="h2h-overview">
          <div class="h2h-overview-title">${nameB.toUpperCase()} — PENALTY KILL</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) minmax(60px,1fr) minmax(60px,1fr) minmax(60px,1fr);">
            <div class="h2h-ov-header">Category</div>
            <div class="h2h-ov-header team-b" style="font-size:0.6rem;">${teamA} vs ${teamB} (${teamA} Rank)</div>
            <div class="h2h-ov-header team-b">Season</div>
            <div class="h2h-ov-header team-b">Last 5</div>
            ${mfPkRows}
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
        const isPo     = gameDate >= '2026-04-17';
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
        const isPo     = gameDate >= '2026-04-17';
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
