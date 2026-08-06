// ===========================================================================
// Segall's tab (role: video-coach) — Pre-Scout Prep.
//
// Extracted verbatim from the `if (role==='video-coach')` branch of
// renderH2H(). Body is unchanged; it now receives what it used to read from
// renderH2H's scope as explicit arguments instead:
//   container : the #h2h-content element
//   ctx       : the object returned by buildH2HContext() -- this tab uses
//               36 of its values
//   opts      : {teamB}
//
// Verified to render byte-identical HTML to the inline version.
// ===========================================================================
const SegallTab = (function () {
  function mount(container, ctx, opts) {
    const content = container;
    const {teamB} = opts;
    const {fmtTeamHeader, h2hGameRowsHtml, l5RankDumpInPct, l5RankDumpInPctA, l5RankLprPct, l5RankOmr, l5RankOmrA, l5RankOzPoss, l5RankOzPossA, l5RankScreened, l5RankScreenedA, l5RankShotAtt, l5RankShotAttA, l5RowsHtml, l5gp, l5v, nameA, nameB, ovRowsHtml, sv, vcChancePanel, vcL5ChanceRows, vcRnk, vcRow, vcSRankDumpInPct, vcSRankDumpInPctA, vcSRankLprPct, vcSRankOMR, vcSRankOMRA, vcSRankOzPoss, vcSRankOzPossA, vcSRankScreened, vcSRankScreenedA, vcSRankShotAtt, vcSRankShotAttA, vcSeasonChanceRows} = ctx;

    content.innerHTML=`
      <style>
        .vc-layout { display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap:1rem; align-items:flex-start; }
        .vc-stat-col { display:flex; flex-direction:column; gap:0; min-width:0; }
      </style>
      <div class="vc-layout">
        <div class="vc-stat-col">
          <div class="h2h-overview">
            <div class="h2h-overview-title title-season">FULL SEASON</div>
            <div class="h2h-overview-grid">
              <div class="h2h-ov-header">Stat</div>
              <div class="h2h-ov-header team-a">${fmtTeamHeader(nameA)}</div>
              <div class="h2h-ov-header team-b">${fmtTeamHeader(nameB)}</div>
              ${ovRowsHtml}
            </div>
          </div>
          ${vcChancePanel(`SCORING CHANCES &amp; RUSHES &#8212; ${nameB.toUpperCase()} (SEASON)`, vcSeasonChanceRows())}
          ${(()=>{
            const fmtOz = s => { const m=Math.floor(s/60), sec=String(Math.round(s%60)).padStart(2,'0'); return `${m}:${sec}`; };
            const rows = [
              vcRow('ES LPR%',            sv?(sv.esLprPct).toFixed(1)+'%':'—',    vcRnk(vcSRankLprPct,teamB),    sv?(100-sv.esLprPct).toFixed(1)+'%':'—', vcRnk(vcSRankLprPct,teamB)),
              vcRow('ES OMR/GP',          sv?sv.esOmr.toFixed(2):'—',              vcRnk(vcSRankOMR,teamB),       sv?sv.esOmrA.toFixed(2):'—', vcRnk(vcSRankOMRA,teamB)),
              vcRow('ES OZ Poss/GP',      sv?fmtOz(sv.esOzPoss):'—',              vcRnk(vcSRankOzPoss,teamB),    sv?fmtOz(sv.esOzPossA):'—', vcRnk(vcSRankOzPossA,teamB)),
              vcRow('AS Shot Attempts/GP',sv?sv.asShotAtt.toFixed(1):'—',         vcRnk(vcSRankShotAtt,teamB),   sv?sv.asShotAttA.toFixed(1):'—', vcRnk(vcSRankShotAttA,teamB)),
              vcRow('ES Screened SOG/GP', sv?sv.esScreened.toFixed(1):'—',        vcRnk(vcSRankScreened,teamB),  sv?sv.esScreenedA.toFixed(1):'—', vcRnk(vcSRankScreenedA,teamB)),
              vcRow('ES Dump-in Rec%',       sv?(sv.esDumpInPct).toFixed(1)+'%':'—', vcRnk(vcSRankDumpInPct,teamB), sv?(sv.esDumpInPctA).toFixed(1)+'%':'—', vcRnk(vcSRankDumpInPctA,teamB), true),
            ].join('');
            return `<div class="h2h-overview" style="margin-top:0.75rem;">
              <div class="h2h-overview-title title-season">TEAM STATS &#8212; ${nameB.toUpperCase()} (SEASON)</div>
              <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) 110px 110px 110px;">
                <div class="h2h-ov-header">Stat</div>
                <div class="h2h-ov-header team-b">For</div>
                <div class="h2h-ov-header"></div>
                <div class="h2h-ov-header team-b">Against</div>
                ${rows}
              </div>
            </div>`;
          })()}
        </div>
        <div class="vc-stat-col">
          <div class="h2h-overview">
            <div class="h2h-overview-title title-last5">LAST 5 GAMES</div>
            <div class="h2h-overview-grid">
              <div class="h2h-ov-header">Stat</div>
              <div class="h2h-ov-header team-a">${fmtTeamHeader(nameA)}</div>
              <div class="h2h-ov-header team-b">${fmtTeamHeader(nameB)}</div>
              ${l5RowsHtml}
            </div>
          </div>
          ${vcChancePanel(`SCORING CHANCES &amp; RUSHES &#8212; ${nameB.toUpperCase()} (LAST 5)`, vcL5ChanceRows())}
          ${(()=>{
            const fmtOz = s => { const m=Math.floor(s/60), sec=String(Math.round(s%60)).padStart(2,'0'); return `${m}:${sec}`; };
            const rows = [
              vcRow('ES LPR%',            l5v?(l5v.esLprPct).toFixed(1)+'%':'—',             vcRnk(l5RankLprPct,teamB),    l5v?(100-l5v.esLprPct).toFixed(1)+'%':'—', vcRnk(l5RankLprPct,teamB)),
              vcRow('ES OMR/GP',          l5v?(l5v.esOmr/l5gp).toFixed(2):'—',               vcRnk(l5RankOmr,teamB),       l5v?(l5v.esOmrA/l5gp).toFixed(2):'—', vcRnk(l5RankOmrA,teamB)),
              vcRow('ES OZ Poss/GP',      l5v?fmtOz(l5v.esOzPoss/l5gp):'—',                 vcRnk(l5RankOzPoss,teamB),    l5v?fmtOz(l5v.esOzPossA/l5gp):'—', vcRnk(l5RankOzPossA,teamB)),
              vcRow('AS Shot Attempts/GP',l5v?(l5v.asShotAtt/l5gp).toFixed(1):'—',           vcRnk(l5RankShotAtt,teamB),   l5v?(l5v.asShotAttA/l5gp).toFixed(1):'—', vcRnk(l5RankShotAttA,teamB)),
              vcRow('ES Screened SOG/GP', l5v?(l5v.esScreened/l5gp).toFixed(1):'—',          vcRnk(l5RankScreened,teamB),  l5v?(l5v.esScreenedA/l5gp).toFixed(1):'—', vcRnk(l5RankScreenedA,teamB)),
              vcRow('ES Dump-in Rec%',       l5v?(l5v.esDumpInPct).toFixed(1)+'%':'—',          vcRnk(l5RankDumpInPct,teamB), l5v?(l5v.esDumpInPctA).toFixed(1)+'%':'—', vcRnk(l5RankDumpInPctA,teamB), true),
            ].join('');
            return `<div class="h2h-overview" style="margin-top:0.75rem;">
              <div class="h2h-overview-title title-last5">TEAM STATS &#8212; ${nameB.toUpperCase()} (LAST 5)</div>
              <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) 110px 110px 110px;">
                <div class="h2h-ov-header">Stat</div>
                <div class="h2h-ov-header team-b">For</div>
                <div class="h2h-ov-header"></div>
                <div class="h2h-ov-header team-b">Against</div>
                ${rows}
              </div>
            </div>`;
          })()}
        </div>
      </div>
      <div id="h2h-top-scorers-panel" style="margin-top:0.75rem;"></div>
      <div style="margin-top:1rem;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
        <div class="sched-header-row" style="border-radius:0;position:static;">
          <span>LAST 5 GAMES</span><span>Opponent</span><span style="text-align:center">Result</span><span style="text-align:center">Score</span>
          <span style="text-align:center">ES xG&#916;</span><span style="text-align:center">ES xGF</span><span style="text-align:center">ES xGA</span>
          <span style="text-align:center">AS xG&#916;</span><span style="text-align:center">AS xGF</span><span style="text-align:center">AS xGA</span>
        </div>
        <div id="h2h-game-log">${h2hGameRowsHtml}</div>
      </div>`;
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
