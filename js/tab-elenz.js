// ===========================================================================
// Elenz's tab (role: elenz) -- Pre-Scout Prep.
//
// Extracted verbatim from renderH2H(). The body is unchanged; what it used to
// read from renderH2H's scope now arrives as arguments:
//   container : the #h2h-content element
//   ctx       : buildH2HContext() output -- this tab uses 4 of its values
//   opts      : {teamA, teamB}
//
// Verified to render byte-identical HTML to the inline version.
// ===========================================================================
const ElenzTab = (function () {
  function mount(container, ctx, opts) {
    const content = container;
    const {teamA, teamB} = opts;
    const {filtered, fmtTeamHeader, nameA, nameB} = ctx;



    // ── Build season aggregates for all teams (for league ranks) ──
    const ezSeasonMap = {};
    for(const t of teams){
      const rows = filtered.filter(r=>r.team===t);
      if(!rows.length) continue;
      const gp = rows.length;
      const sum = (key) => rows.reduce((s,r)=>s+(isNaN(r[key])?0:r[key]),0);
      const avg = (key) => sum(key)/gp;

      // ES rebound
      const esRebXgfTot = sum('esReboundXgf'); const esRebXgaTot = sum('esReboundXga');
      // AS rebound
      const asRebXgfTot = sum('asReboundXgf'); const asRebXgaTot = sum('asReboundXga');
      // OMR
      const omrTot = sum('esOmr'); const omrATot = sum('esOmrA');

      ezSeasonMap[t] = {
        gp,
        esRebXgfPG:  esRebXgfTot/gp,   esRebXgaPG:   esRebXgaTot/gp,
        asRebXgfPG:  asRebXgfTot/gp,   asRebXgaPG:   asRebXgaTot/gp,
        omrPG: omrTot/gp,  omrAPG: omrATot/gp,
        asTrueSh: avg('asTrueSh'), esTrueSh: avg('esTrueSh'),
        asShPct:  avg('asShPct'),  esShPct:  avg('esShPct'),
        esGradeA: avg('esGradeA'), esGradeAA: avg('esGradeAA'),
        esGradeB: avg('esGradeB'), esGradeBA: avg('esGradeBA'),
        esGradeC: avg('esGradeC'), esGradeCA: avg('esGradeCA'),
        asGradeA: avg('asGradeA'), asGradeAA: avg('asGradeAA'),
        asGradeB: avg('asGradeB'), asGradeBA: avg('asGradeBA'),
        asGradeC: avg('asGradeC'), asGradeCA: avg('asGradeCA'),
        esShotAttPG: avg('esShotAtt'), esShotsOnNetPG: avg('esShotsOnNet'),
        asShotAttPG: avg('asShotAtt'), asShotsOnNetPG: avg('asShotsOnNet'),
      };
    }

    // ── Rank helper ──
    function ezRank(key, higherBetter=true){
      const entries = Object.entries(ezSeasonMap)
        .filter(([,v])=>v[key]!=null && !isNaN(v[key]))
        .sort((a,b)=>higherBetter ? b[1][key]-a[1][key] : a[1][key]-b[1][key]);
      const m={};
      entries.forEach(([team],i)=>{
        const val=ezSeasonMap[team][key];
        const tied=entries.filter(([t])=>Math.abs(ezSeasonMap[t][key]-val)<0.0001).length;
        const rk=entries.findIndex(([t])=>Math.abs(ezSeasonMap[t][key]-val)<0.0001)+1;
        m[team]=tied>1?`T-${rk}`:`${rk}`;
      });
      return m;
    }

    // Pre-compute all rank maps
    const ezRkEsRebXgf   = ezRank('esRebXgfPG',  true);
    const ezRkEsRebXga   = ezRank('esRebXgaPG',  false);
    const ezRkAsRebXgf   = ezRank('asRebXgfPG',  true);
    const ezRkAsRebXga   = ezRank('asRebXgaPG',  false);
    const ezRkOmr        = ezRank('omrPG',        true);
    const ezRkOmrA       = ezRank('omrAPG',       false);
    const ezRkAsTrueSh   = ezRank('asTrueSh',     true);
    const ezRkEsTrueSh   = ezRank('esTrueSh',     true);
    const ezRkAsShPct    = ezRank('asShPct',      true);
    const ezRkEsShPct    = ezRank('esShPct',      true);
    const ezRkEsGradeA   = ezRank('esGradeA',     true);
    const ezRkEsGradeAA  = ezRank('esGradeAA',    false);
    const ezRkEsGradeB   = ezRank('esGradeB',     true);
    const ezRkEsGradeBA  = ezRank('esGradeBA',    false);
    const ezRkEsGradeC   = ezRank('esGradeC',     true);
    const ezRkEsGradeCA  = ezRank('esGradeCA',    false);
    const ezRkAsGradeA   = ezRank('asGradeA',     true);
    const ezRkAsGradeAA  = ezRank('asGradeAA',    false);
    const ezRkAsGradeB   = ezRank('asGradeB',     true);
    const ezRkAsGradeBA  = ezRank('asGradeBA',    false);
    const ezRkAsGradeC   = ezRank('asGradeC',     true);
    const ezRkAsGradeCA  = ezRank('asGradeCA',    false);
    const ezRkEsShotAtt  = ezRank('esShotAttPG',  true);
    const ezRkAsShotAtt  = ezRank('asShotAttPG',  true);

    function ezR(rankMap, team){ const v=rankMap[team]; return v?`<span style="font-size:0.68rem;color:var(--text3);font-family:'DM Mono',monospace;">#${v}</span>`:''; }
    function ezFmt(v, dec=3){ return (v==null||isNaN(v)) ? '—' : v.toFixed(dec); }
    function ezPct(v){ return (v==null||isNaN(v)||v===0) ? '—' : (v*100).toFixed(1)+'%'; }

    const sv = ezSeasonMap[teamB]; // opponent season stats
    const svA = ezSeasonMap[teamA]; // your team season stats

    // ── L5 aggregates for opponent ──
    const filteredB = filtered.filter(r=>r.team===teamB).slice(-5);
    const l5gp = filteredB.length || 5;

    // ── Row builder helpers ──
    function ezSectionHeader(label){
      return `<div style="grid-column:1/-1;padding:0.4rem 0.75rem 0.15rem;font-size:0.63rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);border-top:1px solid var(--border);margin-top:0.1rem;">${label}</div>`;
    }
    function ezRow(label, valA, rankA, valB, rankB, isLast=false){
      const border = isLast ? 'border-bottom:none;' : '';
      return `<div class="h2h-ov-label" style="${border}">${label}</div>
              <div class="h2h-ov-cell" style="${border}">${valA} ${rankA}</div>
              <div class="h2h-ov-cell" style="${border}">${valB} ${rankB}</div>`;
    }
    function ezRowOpp(label, val, rank, isLast=false){
      const border = isLast ? 'border-bottom:none;' : '';
      return `<div class="h2h-ov-label" style="${border}">${label}</div>
              <div class="h2h-ov-cell" style="grid-column:2/4;${border}">${val} ${rank}</div>`;
    }

    // ── Panel builder ──
    function ezPanel(title, headerA, headerB, rowsHtml, cols='180px 1fr 1fr'){
      return `<div class="h2h-overview" style="margin-bottom:0.75rem;">
        <div class="h2h-overview-title ${h2hTitleClass(title)}">${title}</div>
        <div class="h2h-overview-grid" style="grid-template-columns:${cols};">
          <div class="h2h-ov-header">Stat</div>
          <div class="h2h-ov-header team-a">${headerA}</div>
          <div class="h2h-ov-header team-b">${headerB}</div>
          ${rowsHtml}
        </div>
      </div>`;
    }

    // ── Chance Quality panels (Grade A/B/C — full picture vs Segall's A-only) ──
    const gradeRowsES = [
      ezSectionHeader('Grade A (per GP)'),
      ezRow('For',     ezFmt(svA?.esGradeA,2),  ezR(ezRkEsGradeA,teamA),  ezFmt(sv?.esGradeA,2),  ezR(ezRkEsGradeA,teamB)),
      ezRow('Against', ezFmt(svA?.esGradeAA,2), ezR(ezRkEsGradeAA,teamA), ezFmt(sv?.esGradeAA,2), ezR(ezRkEsGradeAA,teamB)),
      ezSectionHeader('Grade B (per GP)'),
      ezRow('For',     ezFmt(svA?.esGradeB,2),  ezR(ezRkEsGradeB,teamA),  ezFmt(sv?.esGradeB,2),  ezR(ezRkEsGradeB,teamB)),
      ezRow('Against', ezFmt(svA?.esGradeBA,2), ezR(ezRkEsGradeBA,teamA), ezFmt(sv?.esGradeBA,2), ezR(ezRkEsGradeBA,teamB)),
      ezSectionHeader('Grade C (per GP)'),
      ezRow('For',     ezFmt(svA?.esGradeC,2),  ezR(ezRkEsGradeC,teamA),  ezFmt(sv?.esGradeC,2),  ezR(ezRkEsGradeC,teamB)),
      ezRow('Against', ezFmt(svA?.esGradeCA,2), ezR(ezRkEsGradeCA,teamA), ezFmt(sv?.esGradeCA,2), ezR(ezRkEsGradeCA,teamB), true),
    ].join('');

    const gradeRowsAS = [
      ezSectionHeader('Grade A (per GP)'),
      ezRow('For',     ezFmt(svA?.asGradeA,2),  ezR(ezRkAsGradeA,teamA),  ezFmt(sv?.asGradeA,2),  ezR(ezRkAsGradeA,teamB)),
      ezRow('Against', ezFmt(svA?.asGradeAA,2), ezR(ezRkAsGradeAA,teamA), ezFmt(sv?.asGradeAA,2), ezR(ezRkAsGradeAA,teamB)),
      ezSectionHeader('Grade B (per GP)'),
      ezRow('For',     ezFmt(svA?.asGradeB,2),  ezR(ezRkAsGradeB,teamA),  ezFmt(sv?.asGradeB,2),  ezR(ezRkAsGradeB,teamB)),
      ezRow('Against', ezFmt(svA?.asGradeBA,2), ezR(ezRkAsGradeBA,teamA), ezFmt(sv?.asGradeBA,2), ezR(ezRkAsGradeBA,teamB)),
      ezSectionHeader('Grade C (per GP)'),
      ezRow('For',     ezFmt(svA?.asGradeC,2),  ezR(ezRkAsGradeC,teamA),  ezFmt(sv?.asGradeC,2),  ezR(ezRkAsGradeC,teamB)),
      ezRow('Against', ezFmt(svA?.asGradeCA,2), ezR(ezRkAsGradeCA,teamA), ezFmt(sv?.asGradeCA,2), ezR(ezRkAsGradeCA,teamB), true),
    ].join('');


    // ── Rebound & OMR panel ──
    const rebOmrRows = [
      ezSectionHeader('ES Rebound Chances (xG/GP)'),
      ezRow('Rebound xGF',    ezFmt(svA?.esRebXgfPG), ezR(ezRkEsRebXgf,teamA), ezFmt(sv?.esRebXgfPG), ezR(ezRkEsRebXgf,teamB)),
      ezRow('Rebound xGA',    ezFmt(svA?.esRebXgaPG), ezR(ezRkEsRebXga,teamA), ezFmt(sv?.esRebXgaPG), ezR(ezRkEsRebXga,teamB)),
      ezSectionHeader('AS Rebound Chances (xG/GP)'),
      ezRow('Rebound xGF',    ezFmt(svA?.asRebXgfPG), ezR(ezRkAsRebXgf,teamA), ezFmt(sv?.asRebXgfPG), ezR(ezRkAsRebXgf,teamB)),
      ezRow('Rebound xGA',    ezFmt(svA?.asRebXgaPG), ezR(ezRkAsRebXga,teamA), ezFmt(sv?.asRebXgaPG), ezR(ezRkAsRebXga,teamB)),
      ezSectionHeader('Odd Man Rushes (ES, per GP)'),
      ezRow('OMR For',        ezFmt(svA?.omrPG,2),  ezR(ezRkOmr,teamA),  ezFmt(sv?.omrPG,2),  ezR(ezRkOmr,teamB)),
      ezRow('OMR Against',    ezFmt(svA?.omrAPG,2), ezR(ezRkOmrA,teamA), ezFmt(sv?.omrAPG,2), ezR(ezRkOmrA,teamB), true),
    ].join('');

    // ── Shooting & Volume panel ──
    const shRows = [
      ezSectionHeader('True Shooting % vs Raw Sh%'),
      ezRow('AS True Sh%',    ezPct(svA?.asTrueSh/100), ezR(ezRkAsTrueSh,teamA), ezPct(sv?.asTrueSh/100), ezR(ezRkAsTrueSh,teamB)),
      ezRow('AS Sh%',         ezPct(svA?.asShPct/100),  ezR(ezRkAsShPct,teamA),  ezPct(sv?.asShPct/100),  ezR(ezRkAsShPct,teamB)),
      ezRow('ES True Sh%',    ezPct(svA?.esTrueSh/100), ezR(ezRkEsTrueSh,teamA), ezPct(sv?.esTrueSh/100), ezR(ezRkEsTrueSh,teamB)),
      ezRow('ES Sh%',         ezPct(svA?.esShPct/100),  ezR(ezRkEsShPct,teamA),  ezPct(sv?.esShPct/100),  ezR(ezRkEsShPct,teamB)),
      ezSectionHeader('Shot Volume (per GP)'),
      ezRow('ES Shot Attempts',  ezFmt(svA?.esShotAttPG,1), ezR(ezRkEsShotAtt,teamA), ezFmt(sv?.esShotAttPG,1), ezR(ezRkEsShotAtt,teamB)),
      ezRow('AS Shot Attempts',  ezFmt(svA?.asShotAttPG,1), ezR(ezRkAsShotAtt,teamA), ezFmt(sv?.asShotAttPG,1), ezR(ezRkAsShotAtt,teamB), true),
    ].join('');

    // ── L5 summary for opponent ──
    const l5esRebF  = filteredB.reduce((s,r)=>s+r.esReboundXgf,0)/l5gp;
    const l5esRebA  = filteredB.reduce((s,r)=>s+r.esReboundXga,0)/l5gp;
    const l5asRebF  = filteredB.reduce((s,r)=>s+r.asReboundXgf,0)/l5gp;
    const l5asRebA  = filteredB.reduce((s,r)=>s+r.asReboundXga,0)/l5gp;
    const l5omr     = filteredB.reduce((s,r)=>s+r.esOmr,0)/l5gp;
    const l5omrA    = filteredB.reduce((s,r)=>s+r.esOmrA,0)/l5gp;
    const l5esGrA   = filteredB.reduce((s,r)=>s+r.esGradeA,0)/l5gp;
    const l5esGrAA  = filteredB.reduce((s,r)=>s+r.esGradeAA,0)/l5gp;
    const l5esGrB   = filteredB.reduce((s,r)=>s+r.esGradeB,0)/l5gp;
    const l5esGrBA  = filteredB.reduce((s,r)=>s+r.esGradeBA,0)/l5gp;
    const l5esGrC   = filteredB.reduce((s,r)=>s+r.esGradeC,0)/l5gp;
    const l5esGrCA  = filteredB.reduce((s,r)=>s+r.esGradeCA,0)/l5gp;
    const l5esTrueSh = filteredB.reduce((s,r)=>s+r.esTrueSh,0)/l5gp;
    const l5esShPct  = filteredB.reduce((s,r)=>s+r.esShPct,0)/l5gp;
    const l5gsax    = filteredB.reduce((s,r)=>s+(isNaN(r.gsax)?(r.xga-r.ga):r.gsax),0);

    const l5Rows = [
      ezSectionHeader('ES Grade A/B/C (Last 5, per GP)'),
      ezRowOpp('Grade A For/Against',   `${ezFmt(l5esGrA,2)} / ${ezFmt(l5esGrAA,2)}`, ''),
      ezRowOpp('Grade B For/Against',   `${ezFmt(l5esGrB,2)} / ${ezFmt(l5esGrBA,2)}`, ''),
      ezRowOpp('Grade C For/Against',   `${ezFmt(l5esGrC,2)} / ${ezFmt(l5esGrCA,2)}`, ''),
      ezSectionHeader('Rebounds & OMR (Last 5, per GP)'),
      ezRowOpp('ES Rebound xGF/xGA',  `${ezFmt(l5esRebF)} / ${ezFmt(l5esRebA)}`, ''),
      ezRowOpp('AS Rebound xGF/xGA',  `${ezFmt(l5asRebF)} / ${ezFmt(l5asRebA)}`, ''),
      ezRowOpp('OMR For/Against',     `${ezFmt(l5omr,2)} / ${ezFmt(l5omrA,2)}`, ''),
      ezSectionHeader('Shooting & Goaltending (Last 5)'),
      ezRowOpp('ES True Sh% / Sh%',   `${ezPct(l5esTrueSh/100)} / ${ezPct(l5esShPct/100)}`, ''),
      ezRowOpp('GSAx (ES, total)',    ezFmt(l5gsax,1), '', true),
    ].join('');

    // ── Goals breakdown: L5 / L10 / Season ──
    function goalsBreakdown(team) {
      const allRows = filtered.filter(r=>r.team===team);
      const season  = allRows;
      const l10     = allRows.slice(-10);
      const l5      = allRows.slice(-5);
      function totals(rows) {
        if(!rows.length) return null;
        const gp = rows.length;
        const s = k => rows.reduce((a,r)=>a+(isNaN(r[k])?0:r[k]),0);
        return {
          gp,
          gf:   s('gf')/gp,   ga:   s('ga')/gp,
          esgf: s('esgf')/gp, esga: s('esga')/gp,
          ppgf: s('ppGf')/gp, ppga: s('ppGa')/gp,
          pkgf: s('pkGf')/gp, pkga: s('pkGa')/gp,
        };
      }
      return { l5: totals(l5), l10: totals(l10), season: totals(season) };
    }

    const gbA = goalsBreakdown(teamA);
    const gbB = goalsBreakdown(teamB);

    // ── Build inline SVG grouped bar chart ──
    function svgBars(labelsAndValues, colorF, colorA) {
      // labelsAndValues: [{label, vF, vA}]
      const W=420, H=130, padL=56, padR=10, padT=12, padB=24;
      const chartW = W-padL-padR;
      const chartH = H-padT-padB;
      const maxVal = Math.max(...labelsAndValues.flatMap(d=>[d.vF,d.vA]), 0.5);
      const n = labelsAndValues.length;
      const grpW = chartW/n;
      const barW = Math.min(grpW*0.35, 18);
      const gap  = 3;

      const scaleY = v => chartH - (v/maxVal)*chartH;
      const barH   = v => (v/maxVal)*chartH;

      // y-axis gridlines (3 lines)
      let gridLines='', yLabels='';
      [0.5, 1.0].forEach(frac=>{
        const yv = maxVal*frac;
        const yp = padT + scaleY(yv);
        gridLines+=`<line x1="${padL}" y1="${yp}" x2="${W-padR}" y2="${yp}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3,3"/>`;
        yLabels+=`<text x="${padL-3}" y="${yp+3.5}" text-anchor="end" font-size="8" fill="var(--text3)">${yv.toFixed(1)}</text>`;
      });

      let bars='', xLabels='';
      labelsAndValues.forEach((d,i)=>{
        const cx = padL + grpW*i + grpW/2;
        const xF = cx - barW - gap/2;
        const xA = cx + gap/2;
        const hF = barH(d.vF), hA = barH(d.vA);
        bars+=`<rect x="${xF.toFixed(1)}" y="${(padT+scaleY(d.vF)).toFixed(1)}" width="${barW}" height="${hF.toFixed(1)}" rx="2" fill="${colorF}" opacity="0.85"/>`;
        bars+=`<rect x="${xA.toFixed(1)}" y="${(padT+scaleY(d.vA)).toFixed(1)}" width="${barW}" height="${hA.toFixed(1)}" rx="2" fill="${colorA}" opacity="0.85"/>`;
        xLabels+=`<text x="${cx.toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="8.5" fill="var(--text3)">${d.label}</text>`;
      });

      return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;">
        ${gridLines}${yLabels}
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT+chartH}" stroke="var(--border)" stroke-width="0.5"/>
        <line x1="${padL}" y1="${padT+chartH}" x2="${W-padR}" y2="${padT+chartH}" stroke="var(--border)" stroke-width="0.5"/>
        ${bars}${xLabels}
      </svg>`;
    }

    // ── Goals table rows for one team ──
    function gbRows(gb) {
      if(!gb.l5 || !gb.l10 || !gb.season) return '<div style="color:var(--text3);padding:0.5rem;">Not enough data</div>';
      const f = v => (v==null||isNaN(v)) ? '—' : v.toFixed(2);
      const row = (label, keyF, keyA, isLast=false) => {
        const border = isLast ? 'border-bottom:none;' : '';
        return `<div class="h2h-ov-label" style="${border}">${label}</div>
                <div class="h2h-ov-cell" style="${border}">${f(gb.l5[keyF])} / ${f(gb.l5[keyA])}</div>
                <div class="h2h-ov-cell" style="${border}">${f(gb.l10[keyF])} / ${f(gb.l10[keyA])}</div>
                <div class="h2h-ov-cell" style="${border}">${f(gb.season[keyF])} / ${f(gb.season[keyA])}</div>`;
      };
      return `
        <div class="h2h-ov-header">Strength</div>
        <div class="h2h-ov-header">Last 5 GF/GA</div>
        <div class="h2h-ov-header">Last 10 GF/GA</div>
        <div class="h2h-ov-header">Season GF/GA</div>
        ${row('Total',  'gf',   'ga')}
        ${row('ES',     'esgf', 'esga')}
        ${row('PP/PK',  'ppgf', 'ppga')}
        ${row('PK/PP',  'pkgf', 'pkga', true)}`;
    }

    // ── Chart data builders ──
    function gbChartData(gb) {
      if(!gb.l5||!gb.l10||!gb.season) return [];
      return [
        { label:'Total L5',  vF: gb.l5.gf,    vA: gb.l5.ga    },
        { label:'ES L5',     vF: gb.l5.esgf,  vA: gb.l5.esga  },
        { label:'Total L10', vF: gb.l10.gf,   vA: gb.l10.ga   },
        { label:'ES L10',    vF: gb.l10.esgf, vA: gb.l10.esga },
        { label:'Total S',   vF: gb.season.gf,   vA: gb.season.ga   },
        { label:'ES S',      vF: gb.season.esgf, vA: gb.season.esga },
      ];
    }

    // colours for GF (green) / GA (red)
    const clrGF='#067a3f', clrGA='#c0392b';

    // ── Render ──
    content.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:1rem;padding:0.25rem 0;">

        <!-- Goals For / Against Breakdown -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">

          <div class="h2h-overview">
            <div class="h2h-overview-title">${nameA.toUpperCase()} — GF / GA BY STRENGTH</div>
            <div style="display:flex;gap:0.5rem;align-items:center;padding:0.3rem 0.75rem 0;font-size:0.68rem;color:var(--text3);">
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${clrGF};opacity:0.85;"></span>GF &nbsp;
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${clrGA};opacity:0.85;"></span>GA
            </div>
            <div style="padding:0.25rem 0.5rem 0;">${svgBars(gbChartData(gbA), clrGF, clrGA)}</div>
            <div class="h2h-overview-grid" style="grid-template-columns:80px 1fr 1fr 1fr;">
              ${gbRows(gbA)}
            </div>
          </div>

          <div class="h2h-overview">
            <div class="h2h-overview-title">${nameB.toUpperCase()} — GF / GA BY STRENGTH</div>
            <div style="display:flex;gap:0.5rem;align-items:center;padding:0.3rem 0.75rem 0;font-size:0.68rem;color:var(--text3);">
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${clrGF};opacity:0.85;"></span>GF &nbsp;
              <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${clrGA};opacity:0.85;"></span>GA
            </div>
            <div style="padding:0.25rem 0.5rem 0;">${svgBars(gbChartData(gbB), clrGF, clrGA)}</div>
            <div class="h2h-overview-grid" style="grid-template-columns:80px 1fr 1fr 1fr;">
              ${gbRows(gbB)}
            </div>
          </div>

        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          ${ezPanel(`ES CHANCE QUALITY — SEASON`, fmtTeamHeader(nameA), fmtTeamHeader(nameB), gradeRowsES)}
          ${ezPanel(`AS CHANCE QUALITY — SEASON`, fmtTeamHeader(nameA), fmtTeamHeader(nameB), gradeRowsAS)}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;align-items:start;">

          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${ezPanel(`REBOUNDS &amp; ODD MAN RUSHES`, fmtTeamHeader(nameA), fmtTeamHeader(nameB), rebOmrRows)}
          </div>

          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${ezPanel(`SHOOTING &amp; VOLUME`, fmtTeamHeader(nameA), fmtTeamHeader(nameB), shRows)}
          </div>

          <div style="display:flex;flex-direction:column;gap:1rem;">
            <div class="h2h-overview">
              <div class="h2h-overview-title title-last5">LAST 5 GAMES</div>
              <div class="h2h-overview-grid" style="grid-template-columns:180px 1fr 1fr;">
                <div class="h2h-ov-header">Stat</div>
                <div class="h2h-ov-header team-b" style="grid-column:2/4;">Value</div>
                ${l5Rows}
              </div>
            </div>
            <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">
              <div class="sched-header-row" style="border-radius:0;position:static;grid-template-columns:80px 1fr 60px 60px 70px 70px 70px;">
                <span>Date</span><span>Opp</span><span style="text-align:center">Res</span><span style="text-align:center">Score</span>
                <span style="text-align:center">ES xG&#916;</span><span style="text-align:center">ES TrSh%</span><span style="text-align:center">GSAx</span>
              </div>
              <div id="ez-game-log">${(()=>{
                const bGames = filtered.filter(r=>r.team===teamB).slice(-8).reverse();
                return bGames.map(g=>{
                  const win=g.w>0; const loss=g.l>0; const otl=g.otl>0;
                  const res=win?'W':loss?'L':'OT';
                  const rc=win?'#067a3f':loss?'#c0392b':'#856404';
                  const esDelta=(g.xgf-g.xga).toFixed(2);
                  const esdStyle=parseFloat(esDelta)>=0?'color:#296bbe':'color:#ba0c0c';
                  return `<div class="sched-game-row" style="grid-template-columns:80px 1fr 60px 60px 70px 70px 70px;cursor:default;">
                    <span>${g.date.slice(5)}</span>
                    <span>${g.homeTeam===g.team?g.awayTeam:'@ '+g.homeTeam}</span>
                    <span style="text-align:center;color:${rc};font-weight:700;">${res}</span>
                    <span style="text-align:center;">${g.gf}-${g.ga}</span>
                    <span style="text-align:center;${esdStyle};">${parseFloat(esDelta)>=0?'+':''}${esDelta}</span>
                    <span style="text-align:center;">${ezPct(g.esTrueSh/100)}</span>
                    <span style="text-align:center;">${(g.xga-g.ga).toFixed(2)}</span>
                  </div>`;
                }).join('');
              })()}</div>
            </div>
          </div>

        </div>

      </div>`;
    return;
  
  }

  return { mount: mount };
})();
