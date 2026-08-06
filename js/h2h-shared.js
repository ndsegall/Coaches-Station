// ===========================================================================
// H2H shared context — team records, xG rankings, matchup history, and the
// render helpers (vcRow, vcChancePanel, bVsCell, teamRecord, ...) that every
// Pre-Scout Prep coach tab (Babcock/Smith/McFarland/Segall/Elenz) reads from.
//
// Extracted verbatim from inside renderH2H() -- this is the exact code that
// used to sit inline before any tab's `if (role === ...)` check, unchanged
// except for becoming a real function with a return statement. Verified
// behavior-identical against the original inline version: same 146 values,
// same closure source text, same output when the closures are invoked.
//
// teamA/teamB/matchups/bMatchups are the only genuine inputs from outside --
// everything else this reads (TEAM_NAMES, allData, computeTeamStats, etc.)
// is already global in the app script.
// ===========================================================================
function buildH2HContext(teamA, teamB, matchups, bMatchups) {


  // ── H2H aggregate stats ────────────────────────────────────
  function sumH2H(rows) {
    const toi     = rows.reduce((s,r)=>s+r.toi,0);
    const ppToi   = rows.reduce((s,r)=>s+r.ppToi,0);
    const pkToi   = rows.reduce((s,r)=>s+r.pkToi,0);
    const xgf     = rows.reduce((s,r)=>s+r.xgf,0);
    const xga     = rows.reduce((s,r)=>s+r.xga,0);
    const axgf    = rows.reduce((s,r)=>s+r.axgf,0);
    const axga    = rows.reduce((s,r)=>s+r.axga,0);
    const gf      = rows.reduce((s,r)=>s+r.gf,0);
    const ga      = rows.reduce((s,r)=>s+r.ga,0);
    const w       = rows.reduce((s,r)=>s+r.w,0);
    const otl     = rows.reduce((s,r)=>s+r.otl,0);
    const l       = rows.reduce((s,r)=>s+r.l,0);
    const ppXgf   = rows.reduce((s,r)=>s+r.ppXgf,0);
    const ppGf    = rows.reduce((s,r)=>s+r.ppGf,0);
    const ppDrawn = rows.reduce((s,r)=>s+r.ppOpp,0);
    const pkXga   = rows.reduce((s,r)=>s+r.pkXga,0);
    const pkGa    = rows.reduce((s,r)=>s+r.pkGa,0);
    const pkTaken = rows.reduce((s,r)=>s+r.pkOpp,0);
    const esgf    = rows.reduce((s,r)=>s+r.esgf,0);
    const esga    = rows.reduce((s,r)=>s+r.esga,0);
    // GSAx: AS saves above expected; uses gsax field from sheet, falls back to axga-ga
    const gsax    = rows.reduce((s,r)=>{
      if(!isNaN(r.gsax) && r.gsax!==0) return s+r.gsax;
      return s+(r.axga-r.ga);
    },0);
    const gp = rows.length;
    return {
      gp, w, l, otl, gf, ga, esgf, esga, toi, xgf, xga, axgf, axga,
      xgf60: toi>0?xgf/toi*60:0,
      xga60: toi>0?xga/toi*60:0,
      delta: toi>0?(xgf-xga)/toi*60:0,
      xgfPct: xgf+xga>0?xgf/(xgf+xga)*100:50,
      esAxgf: gp>0?(esgf-xgf)/gp:0,
      esAxga: gp>0?(esga-xga)/gp:0,
      ppXgf, ppGf, ppDrawn,
      ppXgfPer60: ppToi>0?ppXgf/ppToi*60:0,
      ppAxgf: ppToi>0?(ppGf-ppXgf)/ppToi*60:0,
      ppPct: ppDrawn>0?ppGf/ppDrawn*100:0,
      pkXga, pkGa, pkTaken,
      pkXgaPer60: pkToi>0?pkXga/pkToi*60:0,
      pkAxga: pkToi>0?(pkGa-pkXga)/pkToi*60:0,
      pkPct: pkTaken>0?(1-pkGa/pkTaken)*100:100,
      gsax,
      ppPlusPk: (ppDrawn>0?ppGf/ppDrawn*100:0) + (pkTaken>0?(1-pkGa/pkTaken)*100:100),
    };
  }
  const sA=sumH2H(matchups), sB=sumH2H(bMatchups);

  const nameA = TEAM_NAMES[teamA]||teamA;
  const nameB = TEAM_NAMES[teamB]||teamB;

  function fmtTeamHeader(fullName) {
    const { city, mascot } = splitTeamName(fullName);
    return `<span style="display:block;line-height:1.2;">${city}</span><span style="display:block;line-height:1.2;">${mascot}</span>`;
  }

  function sgn(v,pos,neg){return v>0?`<span style="color:${pos}">${v>=0?'+':''}${v.toFixed(2)}</span>`:`<span style="color:${neg}">${v.toFixed(2)}</span>`;}
  function colorDelta(v){return sgn(v,'#296bbe','#ba0c0c');}
  function colorPkAxg(v){return v<=0?`<span style="color:#296bbe">${v.toFixed(2)}</span>`:`<span style="color:#ba0c0c">+${v.toFixed(2)}</span>`;}

  // ── GENERAL OVERVIEW: regular season data only ───────────────────
  const filtered = allData.filter(r => r.date >= minDate && r.date <= RS_END);

  // "VS" column helpers — teamB's own value in games specifically against teamA, plus a
  // rank of teamA among every team that has actually played teamB this season (not the
  // full league — comparing against teams that haven't played them wouldn't mean much).
  const bGamesByOpp = {};
  filtered.filter(r=>r.team===teamB).forEach(r => {
    const gid = r.date+'_'+r.homeTeam+'_'+r.awayTeam;
    const pair = window._gamePairs[gid]||{};
    const opp = Object.keys(pair).find(t=>t!==teamB);
    if (!opp) return;
    if (!bGamesByOpp[opp]) bGamesByOpp[opp] = [];
    bGamesByOpp[opp].push(r);
  });
  function bVsFieldVal(fieldKey, dec=2){
    const rows = bGamesByOpp[teamA];
    if (!rows || !rows.length) return '—';
    return (rows.reduce((s,r)=>s+r[fieldKey],0)/rows.length).toFixed(dec);
  }
  function bVsFieldRank(fieldKey, higherBetter=true){
    const avgs = {};
    Object.entries(bGamesByOpp).forEach(([opp, rows]) => {
      avgs[opp] = rows.reduce((s,r)=>s+r[fieldKey],0)/rows.length;
    });
    if (avgs[teamA]==null) return null;
    const entries = Object.entries(avgs).sort((a,b)=>higherBetter ? b[1]-a[1] : a[1]-b[1]);
    const val = avgs[teamA];
    const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
    const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
    return tied>1 ? `T-${rank}/${entries.length}` : `${rank}/${entries.length}`;
  }
  function bVsCell(fieldKey, higherBetter=true, dec=2){
    return `${bVsFieldVal(fieldKey,dec)} ${rnk(bVsFieldRank(fieldKey,higherBetter))}`;
  }
  // Same idea, but for "against" stats that aren't stored directly on the row (they're only
  // ever computed via an opponent-row lookup) — e.g. Screened SOG Against, Dump-in Against.
  // teamB's value of fieldKey "against" in a given game == the opponent's own fieldKey "for".
  function bVsOpponentAvgs(fieldKey){
    const avgs = {};
    Object.entries(bGamesByOpp).forEach(([opp, rows]) => {
      const vals = rows.map(r=>{
        const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
        const pair=window._gamePairs[gid]||{};
        const oppRow=pair[opp];
        return oppRow ? oppRow[fieldKey] : 0;
      });
      avgs[opp] = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    });
    return avgs;
  }
  function bVsOpponentCell(fieldKey, higherBetter=true, dec=2){
    const avgs = bVsOpponentAvgs(fieldKey);
    if (avgs[teamA]==null) return `— `;
    const entries = Object.entries(avgs).sort((a,b)=>higherBetter?b[1]-a[1]:a[1]-b[1]);
    const val = avgs[teamA];
    const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
    const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
    const rankStr = tied>1?`T-${rank}/${entries.length}`:`${rank}/${entries.length}`;
    return `${val.toFixed(dec)} ${rnk(rankStr)}`;
  }
  // Percentage-style VS stats (ES LPR%, Dump-in Rec%) need a true ratio, not a plain average
  // of a raw count — mode 'sum' = num/(num+den)*100 (e.g. LPR% of for+against), mode
  // 'direct' = num/den*100 (e.g. recoveries/attempts).
  function bVsRatioCell(numKey, denKey, mode='sum', higherBetter=true){
    const avgs = {};
    Object.entries(bGamesByOpp).forEach(([opp, rows]) => {
      const n = rows.reduce((s,r)=>s+r[numKey],0);
      const d = rows.reduce((s,r)=>s+r[denKey],0);
      avgs[opp] = mode==='sum' ? ((n+d)>0 ? n/(n+d)*100 : 50) : (d>0 ? n/d*100 : 0);
    });
    if (avgs[teamA]==null) return '—';
    const entries = Object.entries(avgs).sort((a,b)=>higherBetter?b[1]-a[1]:a[1]-b[1]);
    const val = avgs[teamA];
    const tied = entries.filter(([,v])=>Math.abs(v-val)<0.0001).length;
    const rank = entries.findIndex(([,v])=>Math.abs(v-val)<0.0001)+1;
    const rankStr = tied>1?`T-${rank}/${entries.length}`:`${rank}/${entries.length}`;
    return `${val.toFixed(1)}% ${rnk(rankStr)}`;
  }

  // Overall records
  function teamRecord(team) {
    const rows = filtered.filter(r=>r.team===team);
    const w = rows.reduce((s,r)=>s+r.w,0);
    const otl = rows.reduce((s,r)=>s+r.otl,0);
    const l = rows.reduce((s,r)=>s+r.l,0);
    return {w,l,otl,gp:rows.length};
  }
  const recA = teamRecord(teamA), recB = teamRecord(teamB);
  function fmtRecord(r){return `${r.w}-${r.l}-${r.otl}`;}

  // ES stats + ranks for all teams
  const teamMap={};
  for(const t of teams){
    const rows=filtered.filter(r=>r.team===t);
    const s=computeTeamStats(rows);
    if(s) teamMap[t]=s;
  }
  const esRanks=computeRanks(teamMap);

  // ST stats + ranks for all teams
  const stMap={};
  for(const t of teams){
    const rows=filtered.filter(r=>r.team===t);
    const s=computeSTTeamStats(rows);
    if(s) stMap[t]=s;
  }
  const stRanks=computeSTRanks(stMap);

  // GSAx ranks across all teams
  function computeGsaxMap(){
    const m={};
    for(const t of teams){
      const rows=filtered.filter(r=>r.team===t);
      const total=rows.reduce((s,r)=>{
        if(!isNaN(r.gsax)) return s+r.gsax;
        return s+(r.xga-r.ga);
      },0);
      m[t]=total;
    }
    return m;
  }
  const gsaxMap=computeGsaxMap();
  function rankGsax(){
    const entries=Object.entries(gsaxMap).sort((a,b)=>b[1]-a[1]);
    const m={};
    entries.forEach(([team],i)=>{
      const val=gsaxMap[team];
      const tied=entries.filter(([t])=>Math.abs(gsaxMap[t]-val)<0.001).length;
      const r=entries.findIndex(([t])=>Math.abs(gsaxMap[t]-val)<0.001)+1;
      m[team]=tied>1?`T-${r}`:`${r}`;
    });
    return m;
  }
  const gsaxRanks=rankGsax();

  function rnk(v){return v?`<span class="h2h-ov-rank${rankBadgeClass(v)}">(#${v})</span>`:'';}
  function fmt2(v){return (typeof v==='number'&&!isNaN(v))?v.toFixed(2):'—';}

  // Overview row data — full season (all teams), with league ranks.
  // Reuses teamMap/esRanks (ES splits), stMap/stRanks (special teams),
  // gsaxMap/gsaxRanks, and recA/recB (full-season records) computed above.
  const tmA = teamMap[teamA], tmB = teamMap[teamB];
  const stmA = stMap[teamA], stmB = stMap[teamB];
  const erA = esRanks[teamA]||{}, erB = esRanks[teamB]||{};
  const srA = stRanks[teamA]||{}, srB = stRanks[teamB]||{};
  const ovRows=[
    {
      label: 'Record',
      a: fmtRecord(recA), aRank:'',
      b: fmtRecord(recB), bRank:'',
    },
    {
      label: 'ES xGF/60',
      a: tmA?fmt2(tmA.xgfPer60):'—',  aRank: erA.xgf,
      b: tmB?fmt2(tmB.xgfPer60):'—',  bRank: erB.xgf,
    },
    {
      label: 'ES Actual to Expected GF',
      a: tmA?(tmA.esAxgf >= 0 ? '+' : '') + tmA.esAxgf.toFixed(2):'—', aRank: erA.esAxgf,
      b: tmB?(tmB.esAxgf >= 0 ? '+' : '') + tmB.esAxgf.toFixed(2):'—', bRank: erB.esAxgf,
    },
    {
      label: 'ES xGA/60',
      a: tmA?fmt2(tmA.xgaPer60):'—',  aRank: erA.xga,
      b: tmB?fmt2(tmB.xgaPer60):'—',  bRank: erB.xga,
    },
    {
      label: 'ES Actual to Expected GA',
      a: tmA?(tmA.esAxga >= 0 ? '+' : '') + tmA.esAxga.toFixed(2):'—', aRank: erA.esAxga,
      b: tmB?(tmB.esAxga >= 0 ? '+' : '') + tmB.esAxga.toFixed(2):'—', bRank: erB.esAxga,
    },
    {
      label: 'ES xGF%',
      a: tmA?tmA.pct.toFixed(1)+'%':'—', aRank: erA.pct,
      b: tmB?tmB.pct.toFixed(1)+'%':'—', bRank: erB.pct,
    },
    {
      label: 'PP xGF/2',
      a: stmA?(stmA.ppXgfPer60/30).toFixed(2):'—', aRank: srA.xgf,
      b: stmB?(stmB.ppXgfPer60/30).toFixed(2):'—', bRank: srB.xgf,
    },
    {
      label: 'PK xGA/2',
      a: stmA?(stmA.pkXgaPer60/30).toFixed(2):'—', aRank: srA.xga,
      b: stmB?(stmB.pkXgaPer60/30).toFixed(2):'—', bRank: srB.xga,
    },
    {
      label: 'Saves Above Expected',
      a: fmt2(gsaxMap[teamA]), aRank: gsaxRanks[teamA],
      b: fmt2(gsaxMap[teamB]), bRank: gsaxRanks[teamB],
    },
    {
      label: 'PP + PK',
      a: stmA?stmA.ppPlusPk.toFixed(1)+'%':'—', aRank: srA.ppPlusPk,
      b: stmB?stmB.ppPlusPk.toFixed(1)+'%':'—', bRank: srB.ppPlusPk,
    },
  ];

  const ovRowsHtml = ovRows.map((row,i) => {
    const isLast = i===ovRows.length-1;
    const borderStyle = isLast ? 'border-bottom:none;' : '';
    return `
      <div class="h2h-ov-label" style="${borderStyle}">${row.label}</div>
      <div class="h2h-ov-cell" style="${borderStyle}">${row.a} ${rnk(row.aRank)}</div>
      <div class="h2h-ov-cell" style="${borderStyle}">${row.b} ${rnk(row.bRank)}</div>`;
  }).join('');

  // ── Last 5 games for each team ────────────────────────────
  function last5Stats(team) {
    const rows = filtered.filter(r=>r.team===team).slice(-5);
    if(!rows.length) return null;
    const toi   = rows.reduce((s,r)=>s+r.toi,0);
    const ppToi = rows.reduce((s,r)=>s+r.ppToi,0);
    const pkToi = rows.reduce((s,r)=>s+r.pkToi,0);
    const w     = rows.reduce((s,r)=>s+r.w,0);
    const l     = rows.reduce((s,r)=>s+r.l,0);
    const otl   = rows.reduce((s,r)=>s+r.otl,0);
    const xgf   = rows.reduce((s,r)=>s+r.xgf,0);
    const xga   = rows.reduce((s,r)=>s+r.xga,0);
    const esgf  = rows.reduce((s,r)=>s+r.esgf,0);
    const esga  = rows.reduce((s,r)=>s+r.esga,0);
    const ppXgf = rows.reduce((s,r)=>s+r.ppXgf,0);
    const pkXga = rows.reduce((s,r)=>s+r.pkXga,0);
    const ppGf  = rows.reduce((s,r)=>s+(+r.ppGf||0),0);
    const pkGa  = rows.reduce((s,r)=>s+(+r.pkGa||0),0);
    const ppOpp = rows.reduce((s,r)=>s+(+r.ppOpp||0),0);
    const pkOpp = rows.reduce((s,r)=>s+(+r.pkOpp||0),0);
    const gsax  = rows.reduce((s,r)=>{
      if(!isNaN(r.gsax)) return s+r.gsax;
      return s+(r.xga-r.ga);
    },0);
    // Chance grades (ES)
    const esGradeA  = rows.reduce((s,r)=>s+r.esGradeA,0);
    const esGradeAA = rows.reduce((s,r)=>s+r.esGradeAA,0);
    const esGradeB  = rows.reduce((s,r)=>s+r.esGradeB,0);
    const esGradeBA = rows.reduce((s,r)=>s+r.esGradeBA,0);
    const esGradeC  = rows.reduce((s,r)=>s+r.esGradeC,0);
    const esGradeCA = rows.reduce((s,r)=>s+r.esGradeCA,0);
    // OMR (ES)
    const esOmr  = rows.reduce((s,r)=>s+r.esOmr,0);
    const esOmrA = rows.reduce((s,r)=>s+r.esOmrA,0);
    // New stats
    const esLpr     = rows.reduce((s,r)=>s+r.esLpr,0);
    const esLprA    = rows.reduce((s,r)=>s+r.esLprA,0);
    const esOzPoss  = rows.reduce((s,r)=>s+r.esOzPoss,0);
    const esOzPossA = rows.reduce((s,r)=>s+r.esOzPossA,0);
    const esScreened  = rows.reduce((s,r)=>s+r.esScreened,0);
    const esScreenedA = rows.reduce((s,r)=>{
      const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
      const pair=window._gamePairs[gid]||{};
      const oppTeam=Object.keys(pair).find(t=>t!==r.team);
      const oppRow=oppTeam?pair[oppTeam]:null;
      return s+(oppRow?oppRow.esScreened:0);
    },0);
    const esDumpIn    = rows.reduce((s,r)=>s+r.esDumpIn,0);
    const esDumpInRec = rows.reduce((s,r)=>s+r.esDumpInRec,0);
    const esDumpInA   = rows.reduce((s,r)=>{
      const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
      const pair=window._gamePairs[gid]||{};
      const oppTeam=Object.keys(pair).find(t=>t!==r.team);
      const oppRow=oppTeam?pair[oppTeam]:null;
      return s+(oppRow?oppRow.esDumpIn:0);
    },0);
    const esDumpInRecA = rows.reduce((s,r)=>{
      const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
      const pair=window._gamePairs[gid]||{};
      const oppTeam=Object.keys(pair).find(t=>t!==r.team);
      const oppRow=oppTeam?pair[oppTeam]:null;
      return s+(oppRow?oppRow.esDumpInRec:0);
    },0);
    // Rush/Cycle/Forecheck xG (ES)
    const esRushXgf  = rows.reduce((s,r)=>s+r.esRushXgf,0);
    const esRushXga  = rows.reduce((s,r)=>s+r.esRushXga,0);
    const esCycleXgf = rows.reduce((s,r)=>s+r.esCycleXgf,0);
    const esCycleXga = rows.reduce((s,r)=>s+r.esCycleXga,0);
    const esFcXgf    = rows.reduce((s,r)=>s+r.esFcXgf,0);
    const esFcXga    = rows.reduce((s,r)=>s+r.esFcXga,0);
    const esOzPlayXgf = rows.reduce((s,r)=>s+r.esOzPlayXgf,0);
    const esOzPlayXga = rows.reduce((s,r)=>s+r.esOzPlayXga,0);
    const asShotAtt  = rows.reduce((s,r)=>s+r.asShotAtt,0);
    const asShotAttA = rows.reduce((s,r)=>{
      const gid = r.date+'_'+r.homeTeam+'_'+r.awayTeam;
      const pair = window._gamePairs[gid]||{};
      const oppTeam = Object.keys(pair).find(t=>t!==r.team);
      const oppRow = oppTeam ? pair[oppTeam] : null;
      return s + (oppRow ? oppRow.asShotAtt : 0);
    },0);
    const gp = rows.length;
    return {
      record: `${w}-${l}-${otl}`,
      xgf60: toi>0?xgf/toi*60:0,
      xga60: toi>0?xga/toi*60:0,
      xgfPct: xgf+xga>0?xgf/(xgf+xga)*100:50,
      ppXgfPer60: ppToi>0?ppXgf/ppToi*60:0,
      pkXgaPer60: pkToi>0?pkXga/pkToi*60:0,
      gsax,
      esAxgf: gp>0?(esgf-xgf)/gp:0,
      esAxga: gp>0?(esga-xga)/gp:0,
      esGradeA, esGradeAA, esGradeB, esGradeBA, esGradeC, esGradeCA,
      esOmr, esOmrA,
      esLpr, esLprA, esLprPct: esLpr+esLprA>0?esLpr/(esLpr+esLprA)*100:50,
      esOzPoss, esOzPossA,
      esScreened, esScreenedA, esDumpIn, esDumpInRec,
      esDumpInPct: esDumpIn>0?esDumpInRec/esDumpIn*100:0,
      esDumpInA, esDumpInRecA,
      esDumpInPctA: esDumpInA>0?esDumpInRecA/esDumpInA*100:0,
      esRushXgf, esRushXga, esCycleXgf, esCycleXga, esFcXgf, esFcXga,
      esOzPlayXgf, esOzPlayXga,
      esRushXgfPct:  esRushXgf+esRushXga>0  ? esRushXgf/(esRushXgf+esRushXga)*100   : 50,
      esCycleXgfPct: esCycleXgf+esCycleXga>0? esCycleXgf/(esCycleXgf+esCycleXga)*100: 50,
      esFcXgfPct:    esFcXgf+esFcXga>0      ? esFcXgf/(esFcXgf+esFcXga)*100         : 50,
      esOzPlayXgfPct: esOzPlayXgf+esOzPlayXga>0 ? esOzPlayXgf/(esOzPlayXgf+esOzPlayXga)*100 : 50,
      asShotAtt, asShotAttA, gp,
      ppPct: ppOpp>0?ppGf/ppOpp*100:0,
      pkPct: pkOpp>0?(1-pkGa/pkOpp)*100:100,
      ppPlusPk: (ppOpp>0?ppGf/ppOpp*100:0) + (pkOpp>0?(1-pkGa/pkOpp)*100:100),
    };
  }
  const l5A = last5Stats(teamA), l5B = last5Stats(teamB);

  // Build last-5 maps for all teams to compute league ranks
  const l5MapAll = {};
  for (const t of teams) {
    const s = last5Stats(t);
    if (s) l5MapAll[t] = s;
  }
  function rankL5(key, higherBetter=true) {
    const entries = Object.entries(l5MapAll)
      .filter(([,v])=>v[key]!=null)
      .sort((a,b)=>higherBetter ? b[1][key]-a[1][key] : a[1][key]-b[1][key]);
    const m = {};
    entries.forEach(([team],i)=>{
      const val = l5MapAll[team][key];
      const tied = entries.filter(([t])=>Math.abs(l5MapAll[t][key]-val)<0.0001).length;
      const r = entries.findIndex(([t])=>Math.abs(l5MapAll[t][key]-val)<0.0001)+1;
      m[team] = tied>1?`T-${r}`:`${r}`;
    });
    return m;
  }
  const l5RankXgf60   = rankL5('xgf60',   true);
  const l5RankXga60   = rankL5('xga60',   false);
  const l5RankXgfPct  = rankL5('xgfPct',  true);
  const l5RankPpXgf   = rankL5('ppXgfPer60', true);
  const l5RankPkXga   = rankL5('pkXgaPer60', false);
  const l5RankPpPk    = rankL5('ppPlusPk',   true);
  const l5RankGsax    = rankL5('gsax',    true);
  const l5RankEsAxgf  = rankL5('esAxgf',  true);
  const l5RankEsAxga  = rankL5('esAxga',  false);
  const l5RankGradeA   = rankL5('esGradeA',      true);
  const l5RankGradeAA  = rankL5('esGradeAA',     false);
  const l5RankGradeB   = rankL5('esGradeB',      true);
  const l5RankGradeBA  = rankL5('esGradeBA',     false);
  const l5RankGradeC   = rankL5('esGradeC',      true);
  const l5RankGradeCA  = rankL5('esGradeCA',     false);
  const l5RankOmr      = rankL5('esOmr',         true);
  const l5RankOmrA     = rankL5('esOmrA',        false);
  const l5RankRushF    = rankL5('esRushXgf',     true);
  const l5RankRushA    = rankL5('esRushXga',     false);
  const l5RankCycleF   = rankL5('esCycleXgf',    true);
  const l5RankCycleA   = rankL5('esCycleXga',    false);
  const l5RankFcF      = rankL5('esFcXgf',       true);
  const l5RankFcA      = rankL5('esFcXga',       false);
  const l5RankRushPct  = rankL5('esRushXgfPct',  true);
  const l5RankCyclPct  = rankL5('esCycleXgfPct', true);
  const l5RankFcPct    = rankL5('esFcXgfPct',    true);
  const l5RankOzpF     = rankL5('esOzPlayXgf',    true);
  const l5RankOzpA     = rankL5('esOzPlayXga',    false);
  const l5RankOzpPct   = rankL5('esOzPlayXgfPct', true);
  const l5RankShotAtt  = rankL5('asShotAtt',     true);
  const l5RankShotAttA = rankL5('asShotAttA',    false);
  const l5RankLprPct   = rankL5('esLprPct',      true);
  const l5RankOzPoss   = rankL5('esOzPoss',      true);
  const l5RankOzPossA  = rankL5('esOzPossA',     false);
  const l5RankScreened = rankL5('esScreened',    true);
  const l5RankScreenedA= rankL5('esScreenedA',   false);
  const l5RankDumpInPct= rankL5('esDumpInPct',   true);
  const l5RankDumpInPctA=rankL5('esDumpInPctA',  false);

  const l5Rows = [
    { label:'Record',                    a: l5A?.record??'—',                                                            aRank:'',                    b: l5B?.record??'—',                                                            bRank:'' },
    { label:'ES xGF/60',                 a: l5A?l5A.xgf60.toFixed(2):'—',                                               aRank: l5RankXgf60[teamA],   b: l5B?l5B.xgf60.toFixed(2):'—',                                               bRank: l5RankXgf60[teamB] },
    { label:'ES Actual to Expected GF',  a: l5A?(l5A.esAxgf>=0?'+':'')+l5A.esAxgf.toFixed(2):'—',                       aRank: l5RankEsAxgf[teamA],  b: l5B?(l5B.esAxgf>=0?'+':'')+l5B.esAxgf.toFixed(2):'—',                       bRank: l5RankEsAxgf[teamB] },
    { label:'ES xGA/60',                 a: l5A?l5A.xga60.toFixed(2):'—',                                               aRank: l5RankXga60[teamA],   b: l5B?l5B.xga60.toFixed(2):'—',                                               bRank: l5RankXga60[teamB] },
    { label:'ES Actual to Expected GA',  a: l5A?(l5A.esAxga>=0?'+':'')+l5A.esAxga.toFixed(2):'—',                       aRank: l5RankEsAxga[teamA],  b: l5B?(l5B.esAxga>=0?'+':'')+l5B.esAxga.toFixed(2):'—',                       bRank: l5RankEsAxga[teamB] },
    { label:'ES xGF%',                   a: l5A?l5A.xgfPct.toFixed(1)+'%':'—',                                          aRank: l5RankXgfPct[teamA],  b: l5B?l5B.xgfPct.toFixed(1)+'%':'—',                                          bRank: l5RankXgfPct[teamB] },
    { label:'PP xGF/2',                  a: l5A?(l5A.ppXgfPer60/30).toFixed(2):'—',                                     aRank: l5RankPpXgf[teamA],   b: l5B?(l5B.ppXgfPer60/30).toFixed(2):'—',                                     bRank: l5RankPpXgf[teamB] },
    { label:'PK xGA/2',                  a: l5A?(l5A.pkXgaPer60/30).toFixed(2):'—',                                     aRank: l5RankPkXga[teamA],   b: l5B?(l5B.pkXgaPer60/30).toFixed(2):'—',                                     bRank: l5RankPkXga[teamB] },
    { label:'Saves Above Expected',      a: l5A?l5A.gsax.toFixed(2):'—',                                                 aRank: l5RankGsax[teamA],    b: l5B?l5B.gsax.toFixed(2):'—',                                                 bRank: l5RankGsax[teamB] },
    { label:'PP + PK',
      a: l5A?l5A.ppPlusPk.toFixed(1)+'%':'—', aRank: l5RankPpPk[teamA],
      b: l5B?l5B.ppPlusPk.toFixed(1)+'%':'—', bRank: l5RankPpPk[teamB] },
  ];

  const l5RowsHtml = l5Rows.map((row,i) => {
    const isLast = i===l5Rows.length-1;
    const borderStyle = isLast ? 'border-bottom:none;' : '';
    return `
      <div class="h2h-ov-label" style="${borderStyle}">${row.label}</div>
      <div class="h2h-ov-cell" style="${borderStyle}">${row.a} ${rnk(row.aRank)}</div>
      <div class="h2h-ov-cell" style="${borderStyle}">${row.b} ${rnk(row.bRank)}</div>`;
  }).join('');

  // Opponent's last 5 regular season games
  const oppLast5 = allData.filter(r => r.team === teamB && r.date <= RS_END)
    .slice(-5);

  const h2hMaxEvDelta = Math.max(1, ...oppLast5.map(g => Math.abs(g.xgf - g.xga)));
  const h2hMaxAsDelta = Math.max(1, ...oppLast5.map(g => Math.abs(g.axgf - g.axga)));

  const h2hGameRowsHtml = oppLast5.map(g => {
    const opp = g.team === g.homeTeam ? g.awayTeam : g.homeTeam;
    const isHome = g.team === g.homeTeam;
    const oppRow = getOpponentRow(g);
    const { result, isSow, isSol, isOtw, dispGf, dispGa } = getGameResult(g, oppRow);
    const resultCls = (isSow || isOtw || g.w === 1) ? 'sched-result-w' : (isSol || g.otl === 1) ? 'sched-result-o' : 'sched-result-l';
    const evDelta = g.xgf - g.xga;
    const asDelta = g.axgf - g.axga;
    const evDeltaStyle = deltaCellStyle(evDelta, h2hMaxEvDelta);
    const asDeltaStyle = deltaCellStyle(asDelta, h2hMaxAsDelta);
    const evDeltaStr = (evDelta >= 0 ? '+' : '') + evDelta.toFixed(2);
    const asDeltaStr = (asDelta >= 0 ? '+' : '') + asDelta.toFixed(2);
    const isPo = g.date >= PO_START;
    const key = `${g.date}_${g.homeTeam}_${g.awayTeam}`;
    const rowCls = isPo ? 'sched-game-row po-row' : 'sched-game-row';
    return `<div class="${rowCls}" data-gamekey="${key}" data-date="${g.date}" data-home="${g.homeTeam}" data-away="${g.awayTeam}">
      <span class="sched-date-col">${g.date}</span>
      <span class="sched-opp-col"><span class="sched-ha-badge">${isHome ? 'vs' : '@'}</span>${TEAM_NAMES[opp] || opp}</span>
      <span class="${resultCls}">${result}</span>
      <span class="sched-score-col">${dispGf}&#8211;${dispGa}</span>
      <span class="sched-xg-col" style="${evDeltaStyle}padding:0 4px;border-radius:3px;text-align:center;">${evDeltaStr}</span>
      <span class="sched-xg-col">${g.xgf.toFixed(2)}</span>
      <span class="sched-xg-col">${g.xga.toFixed(2)}</span>
      <span class="sched-xg-col" style="${asDeltaStyle}padding:0 4px;border-radius:3px;text-align:center;">${asDeltaStr}</span>
      <span class="sched-xg-col">${g.axgf.toFixed(2)}</span>
      <span class="sched-xg-col">${g.axga.toFixed(2)} <span class="sched-chevron">&#9662;</span></span>
    </div>`;
  }).join('');

  // Build teamA vs teamB matchup game rows
  const vsMaxEvDelta = matchups.length ? Math.max(1, ...matchups.map(g => Math.abs(g.xgf - g.xga))) : 1;
  const vsMaxAsDelta = matchups.length ? Math.max(1, ...matchups.map(g => Math.abs(g.axgf - g.axga))) : 1;
  const vsGameRowsHtml = matchups.map(g => {
    const opp = g.team === g.homeTeam ? g.awayTeam : g.homeTeam;
    const isHome = g.team === g.homeTeam;
    const oppRow = getOpponentRow(g);
    const { result, isSow, isSol, isOtw, dispGf, dispGa } = getGameResult(g, oppRow);
    const resultCls = (isSow || isOtw || g.w === 1) ? 'sched-result-w' : (isSol || g.otl === 1) ? 'sched-result-o' : 'sched-result-l';
    const evDelta = g.xgf - g.xga;
    const asDelta = g.axgf - g.axga;
    const evDeltaStyle = deltaCellStyle(evDelta, vsMaxEvDelta);
    const asDeltaStyle = deltaCellStyle(asDelta, vsMaxAsDelta);
    const evDeltaStr = (evDelta >= 0 ? '+' : '') + evDelta.toFixed(2);
    const asDeltaStr = (asDelta >= 0 ? '+' : '') + asDelta.toFixed(2);
    const isPo = g.date >= PO_START;
    const key = `${g.date}_${g.homeTeam}_${g.awayTeam}`;
    const rowCls = isPo ? 'sched-game-row po-row' : 'sched-game-row';
    return `<div class="${rowCls}" data-gamekey="${key}" data-date="${g.date}" data-home="${g.homeTeam}" data-away="${g.awayTeam}">
      <span class="sched-date-col">${g.date}</span>
      <span class="sched-opp-col"><span class="sched-ha-badge">${isHome ? 'vs' : '@'}</span>${TEAM_NAMES[opp] || opp}</span>
      <span class="${resultCls}">${result}</span>
      <span class="sched-score-col">${dispGf}&#8211;${dispGa}</span>
      <span class="sched-xg-col" style="${evDeltaStyle}padding:0 4px;border-radius:3px;text-align:center;">${evDeltaStr}</span>
      <span class="sched-xg-col">${g.xgf.toFixed(2)}</span>
      <span class="sched-xg-col">${g.xga.toFixed(2)}</span>
      <span class="sched-xg-col" style="${asDeltaStyle}padding:0 4px;border-radius:3px;text-align:center;">${asDeltaStr}</span>
      <span class="sched-xg-col">${g.axgf.toFixed(2)}</span>
      <span class="sched-xg-col">${g.axga.toFixed(2)} <span class="sched-chevron">&#9662;</span></span>
    </div>`;
  }).join('');
  // Shared: season-level chance/OMR stats for all teams (for ranks) — used by
  // Segall (video-coach), Babcock, and McFarland views
    // Season-level chance/OMR stats for all teams (for ranks)
    const vcSeasonMap = {};
    for(const t of teams){
      const rows = filtered.filter(r=>r.team===t);
      if(!rows.length) continue;
      const gp = rows.length;
      const esRushXgf  = rows.reduce((s,r)=>s+r.esRushXgf,0);
      const esRushXga  = rows.reduce((s,r)=>s+r.esRushXga,0);
      const esCycleXgf = rows.reduce((s,r)=>s+r.esCycleXgf,0);
      const esCycleXga = rows.reduce((s,r)=>s+r.esCycleXga,0);
      const esFcXgf    = rows.reduce((s,r)=>s+r.esFcXgf,0);
      const esFcXga    = rows.reduce((s,r)=>s+r.esFcXga,0);
      const esOzPlayXgf = rows.reduce((s,r)=>s+r.esOzPlayXgf,0);
      const esOzPlayXga = rows.reduce((s,r)=>s+r.esOzPlayXga,0);
      vcSeasonMap[t] = {
        esGradeA:  rows.reduce((s,r)=>s+r.esGradeA,0)/gp,
        esGradeAA: rows.reduce((s,r)=>s+r.esGradeAA,0)/gp,
        esGradeB:  rows.reduce((s,r)=>s+r.esGradeB,0)/gp,
        esGradeBA: rows.reduce((s,r)=>s+r.esGradeBA,0)/gp,
        esGradeC:  rows.reduce((s,r)=>s+r.esGradeC,0)/gp,
        esGradeCA: rows.reduce((s,r)=>s+r.esGradeCA,0)/gp,
        esOmr:     rows.reduce((s,r)=>s+r.esOmr,0)/gp,
        esOmrA:    rows.reduce((s,r)=>s+r.esOmrA,0)/gp,
        esLpr:     rows.reduce((s,r)=>s+r.esLpr,0)/gp,
        esLprA:    rows.reduce((s,r)=>s+r.esLprA,0)/gp,
        esLprPct:  (()=>{ const f=rows.reduce((s,r)=>s+r.esLpr,0), a=rows.reduce((s,r)=>s+r.esLprA,0); return f+a>0?f/(f+a)*100:50; })(),
        esOzPoss:  rows.reduce((s,r)=>s+r.esOzPoss,0)/gp,
        esOzPossA: rows.reduce((s,r)=>s+r.esOzPossA,0)/gp,
        esScreened:  rows.reduce((s,r)=>s+r.esScreened,0)/gp,
        esScreenedA: rows.reduce((s,r)=>{
          const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
          const pair=window._gamePairs[gid]||{};
          const oppTeam=Object.keys(pair).find(t=>t!==r.team);
          const oppRow=oppTeam?pair[oppTeam]:null;
          return s+(oppRow?oppRow.esScreened:0);
        },0)/gp,
        esDumpIn:    rows.reduce((s,r)=>s+r.esDumpIn,0)/gp,
        esDumpInRec: rows.reduce((s,r)=>s+r.esDumpInRec,0)/gp,
        esDumpInPct: (()=>{ const di=rows.reduce((s,r)=>s+r.esDumpIn,0), rec=rows.reduce((s,r)=>s+r.esDumpInRec,0); return di>0?rec/di*100:0; })(),
        esDumpInA:    rows.reduce((s,r)=>{
          const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
          const pair=window._gamePairs[gid]||{};
          const oppTeam=Object.keys(pair).find(t=>t!==r.team);
          const oppRow=oppTeam?pair[oppTeam]:null;
          return s+(oppRow?oppRow.esDumpIn:0);
        },0)/gp,
        esDumpInRecA: rows.reduce((s,r)=>{
          const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
          const pair=window._gamePairs[gid]||{};
          const oppTeam=Object.keys(pair).find(t=>t!==r.team);
          const oppRow=oppTeam?pair[oppTeam]:null;
          return s+(oppRow?oppRow.esDumpInRec:0);
        },0)/gp,
        esDumpInPctA: (()=>{
          const diA=rows.reduce((s,r)=>{
            const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
            const pair=window._gamePairs[gid]||{};
            const oppTeam=Object.keys(pair).find(t=>t!==r.team);
            const oppRow=oppTeam?pair[oppTeam]:null;
            return s+(oppRow?oppRow.esDumpIn:0);
          },0);
          const recA=rows.reduce((s,r)=>{
            const gid=r.date+'_'+r.homeTeam+'_'+r.awayTeam;
            const pair=window._gamePairs[gid]||{};
            const oppTeam=Object.keys(pair).find(t=>t!==r.team);
            const oppRow=oppTeam?pair[oppTeam]:null;
            return s+(oppRow?oppRow.esDumpInRec:0);
          },0);
          return diA>0?recA/diA*100:0;
        })(),
        esRushXgf:  esRushXgf/gp,  esRushXga:  esRushXga/gp,
        esCycleXgf: esCycleXgf/gp, esCycleXga: esCycleXga/gp,
        esFcXgf:    esFcXgf/gp,    esFcXga:    esFcXga/gp,
        esOzPlayXgf: esOzPlayXgf/gp, esOzPlayXga: esOzPlayXga/gp,
        esRushXgfPct:  esRushXgf+esRushXga>0  ? esRushXgf/(esRushXgf+esRushXga)*100   : 50,
        esCycleXgfPct: esCycleXgf+esCycleXga>0? esCycleXgf/(esCycleXgf+esCycleXga)*100: 50,
        esFcXgfPct:    esFcXgf+esFcXga>0      ? esFcXgf/(esFcXgf+esFcXga)*100         : 50,
        esOzPlayXgfPct: esOzPlayXgf+esOzPlayXga>0 ? esOzPlayXgf/(esOzPlayXgf+esOzPlayXga)*100 : 50,
        asShotAtt: rows.reduce((s,r)=>s+r.asShotAtt,0)/gp,
        asShotAttA: rows.reduce((s,r)=>{
          const gid = r.date+'_'+r.homeTeam+'_'+r.awayTeam;
          const pair = window._gamePairs[gid]||{};
          const oppTeam = Object.keys(pair).find(t=>t!==r.team);
          const oppRow = oppTeam ? pair[oppTeam] : null;
          return s + (oppRow ? oppRow.asShotAtt : 0);
        },0)/gp,
      };
    }
    function vcSeasonRank(key, higherBetter=true) {
      const entries = Object.entries(vcSeasonMap)
        .filter(([,v])=>v[key]!=null)
        .sort((a,b)=>higherBetter ? b[1][key]-a[1][key] : a[1][key]-b[1][key]);
      const m = {};
      entries.forEach(([team],i)=>{
        const val = vcSeasonMap[team][key];
        const tied = entries.filter(([t])=>Math.abs(vcSeasonMap[t][key]-val)<0.0001).length;
        const r = entries.findIndex(([t])=>Math.abs(vcSeasonMap[t][key]-val)<0.0001)+1;
        m[team] = tied>1?`T-${r}`:`${r}`;
      });
      return m;
    }
    const vcSRankGA      = vcSeasonRank('esGradeA',      true);
    const vcSRankGAA     = vcSeasonRank('esGradeAA',     false);
    const vcSRankGB      = vcSeasonRank('esGradeB',      true);
    const vcSRankGBA     = vcSeasonRank('esGradeBA',     false);
    const vcSRankGC      = vcSeasonRank('esGradeC',      true);
    const vcSRankGCA     = vcSeasonRank('esGradeCA',     false);
    const vcSRankOMR     = vcSeasonRank('esOmr',         true);
    const vcSRankOMRA    = vcSeasonRank('esOmrA',        false);
    const vcSRankRushF   = vcSeasonRank('esRushXgf',     true);
    const vcSRankRushA   = vcSeasonRank('esRushXga',     false);
    const vcSRankCycleF  = vcSeasonRank('esCycleXgf',    true);
    const vcSRankCycleA  = vcSeasonRank('esCycleXga',    false);
    const vcSRankFcF     = vcSeasonRank('esFcXgf',       true);
    const vcSRankFcA     = vcSeasonRank('esFcXga',       false);
    const vcSRankRushPct = vcSeasonRank('esRushXgfPct',  true);
    const vcSRankCyclPct = vcSeasonRank('esCycleXgfPct', true);
    const vcSRankFcPct   = vcSeasonRank('esFcXgfPct',    true);
    const vcSRankOzpF    = vcSeasonRank('esOzPlayXgf',    true);
    const vcSRankOzpA    = vcSeasonRank('esOzPlayXga',    false);
    const vcSRankOzpPct  = vcSeasonRank('esOzPlayXgfPct', true);
    const vcSRankShotAtt  = vcSeasonRank('asShotAtt',      true);
    const vcSRankShotAttA = vcSeasonRank('asShotAttA',     false);
    const vcSRankLprPct   = vcSeasonRank('esLprPct',       true);
    const vcSRankOzPoss   = vcSeasonRank('esOzPoss',       true);
    const vcSRankOzPossA  = vcSeasonRank('esOzPossA',      false);
    const vcSRankScreened = vcSeasonRank('esScreened',     true);
    const vcSRankScreenedA= vcSeasonRank('esScreenedA',    false);
    const vcSRankDumpInPct= vcSeasonRank('esDumpInPct',    true);
    const vcSRankDumpInPctA=vcSeasonRank('esDumpInPctA',   false);

    function vcRnk(rankMap, team) {
      const v = rankMap[team];
      return v ? `<span class="h2h-ov-rank${rankBadgeClass(v)}">(#${v})</span>` : '';
    }
    function pctBg(pct) {
      if (pct === null) return '';
      const delta = pct - 50;
      const intensity = Math.min(Math.abs(delta) / 10, 1);
      if (delta >= 0) {
        const b = Math.round(180 + intensity * 45);
        const a = (0.12 + intensity * 0.25).toFixed(2);
        return 'background:rgba(10,90,' + b + ',' + a + ');';
      } else {
        const r = Math.round(180 + intensity * 32);
        const a = (0.12 + intensity * 0.25).toFixed(2);
        return 'background:rgba(' + r + ',57,43,' + a + ');';
      }
    }
    // Mini row for compact stacked display (same 4-col grid, smaller font)
    function vcMiniRow(label, forVal, forRank, agaVal, agaRank, isLast=false) {
      const border = isLast ? 'border-bottom:none;' : '';
      const style = 'font-size:0.75rem;padding:0.18rem 0.5rem;color:var(--text2);';
      return '<div class="h2h-ov-label" style="' + border + style + '">' + label + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '">' + forVal + ' ' + forRank + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '"></div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '">' + agaVal + ' ' + agaRank + '</div>';
    }
    // Subheader spanning all 4 columns
    function vcSubheader(label) {
      return '<div style="grid-column:1/5;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);padding:0.35rem 0.5rem 0.1rem;border-top:1px solid var(--border);">' + label + '</div>';
    }
    // Standard row (label / for / against)
    function vcRow(label, forVal, forRank, agaVal, agaRank, isLast=false) {
      const border = isLast ? 'border-bottom:none;' : '';
      return '<div class="h2h-ov-label" style="' + border + '">' + label + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + '">' + forVal + ' ' + forRank + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + '"></div>'
           + '<div class="h2h-ov-cell" style="' + border + '">' + agaVal + ' ' + agaRank + '</div>';
    }
    // Chance row: label / for value | xGF% centred with shading | against value
    // Uses a 5-column sub-layout inside a span-3 cell
    function vcChanceRow(label, forVal, forRank, pct, pctRankMap, agaVal, agaRank, isLast=false) {
      const border = isLast ? 'border-bottom:none;' : '';
      const bg = pctBg(pct);
      const pctDisplay = pct !== null ? pct.toFixed(1) + '%' : '—';
      const pctRnk = pct !== null ? vcRnk(pctRankMap, teamB) : '';
      return '<div class="h2h-ov-label" style="' + border + '">' + label + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + 'text-align:right;">' + forVal + ' ' + forRank + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + bg + 'text-align:center;font-weight:600;">' + pctDisplay + ' ' + pctRnk + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + 'text-align:left;">' + agaVal + ' ' + agaRank + '</div>';
    }
    const sv = vcSeasonMap[teamB];
    const l5v = l5B;

    // Helper to format per-game from season totals (already per-game in vcSeasonMap)
    // l5 totals are raw 5-game sums, divide by gp (actual games played, may be <5 early season)
    const l5gp = l5v ? (l5v.gp || 5) : 5;

    function vcSeasonChanceRows() {
      const rows = [
        vcChanceRow('ES Rush xGF/GP',      sv?sv.esRushXgf.toFixed(3):'—',  vcRnk(vcSRankRushF,teamB),  sv?sv.esRushXgfPct:null,  vcSRankRushPct,  sv?sv.esRushXga.toFixed(3):'—',  vcRnk(vcSRankRushA,teamB)),
        vcChanceRow('ES OZ xGF/GP',        sv?sv.esOzPlayXgf.toFixed(3):'—', vcRnk(vcSRankOzpF,teamB),   sv?sv.esOzPlayXgfPct:null, vcSRankOzpPct,   sv?sv.esOzPlayXga.toFixed(3):'—', vcRnk(vcSRankOzpA,teamB)),
        vcChanceRow('ES Cycle xGF/GP',     sv?sv.esCycleXgf.toFixed(3):'—', vcRnk(vcSRankCycleF,teamB), sv?sv.esCycleXgfPct:null, vcSRankCyclPct,  sv?sv.esCycleXga.toFixed(3):'—', vcRnk(vcSRankCycleA,teamB)),
        vcChanceRow('ES Forecheck xGF/GP', sv?sv.esFcXgf.toFixed(3):'—',    vcRnk(vcSRankFcF,teamB),    sv?sv.esFcXgfPct:null,    vcSRankFcPct,    sv?sv.esFcXga.toFixed(3):'—',    vcRnk(vcSRankFcA,teamB)),
        vcSubheader('Chance Grades'),
        vcMiniRow('ES A Chances/GP', sv?sv.esGradeA.toFixed(2):'—',  vcRnk(vcSRankGA,teamB),  sv?sv.esGradeAA.toFixed(2):'—', vcRnk(vcSRankGAA,teamB)),
        vcMiniRow('ES B Chances/GP', sv?sv.esGradeB.toFixed(2):'—',  vcRnk(vcSRankGB,teamB),  sv?sv.esGradeBA.toFixed(2):'—', vcRnk(vcSRankGBA,teamB)),
        vcMiniRow('ES C Chances/GP', sv?sv.esGradeC.toFixed(2):'—',  vcRnk(vcSRankGC,teamB),  sv?sv.esGradeCA.toFixed(2):'—', vcRnk(vcSRankGCA,teamB), true),
      ];
      return rows.join('');
    }

    function vcL5ChanceRows() {
      const rows = [
        vcChanceRow('ES Rush xGF/GP',      l5v?(l5v.esRushXgf/l5gp).toFixed(3):'—',  vcRnk(l5RankRushF,teamB),  l5v?l5v.esRushXgfPct:null,  l5RankRushPct,  l5v?(l5v.esRushXga/l5gp).toFixed(3):'—',  vcRnk(l5RankRushA,teamB)),
        vcChanceRow('ES OZ xGF/GP',        l5v?(l5v.esOzPlayXgf/l5gp).toFixed(3):'—', vcRnk(l5RankOzpF,teamB),   l5v?l5v.esOzPlayXgfPct:null, l5RankOzpPct,   l5v?(l5v.esOzPlayXga/l5gp).toFixed(3):'—', vcRnk(l5RankOzpA,teamB)),
        vcChanceRow('ES Cycle xGF/GP',     l5v?(l5v.esCycleXgf/l5gp).toFixed(3):'—', vcRnk(l5RankCycleF,teamB), l5v?l5v.esCycleXgfPct:null, l5RankCyclPct,  l5v?(l5v.esCycleXga/l5gp).toFixed(3):'—', vcRnk(l5RankCycleA,teamB)),
        vcChanceRow('ES Forecheck xGF/GP', l5v?(l5v.esFcXgf/l5gp).toFixed(3):'—',    vcRnk(l5RankFcF,teamB),    l5v?l5v.esFcXgfPct:null,    l5RankFcPct,    l5v?(l5v.esFcXga/l5gp).toFixed(3):'—',    vcRnk(l5RankFcA,teamB)),
        vcSubheader('Chance Grades'),
        vcMiniRow('ES A Chances/GP', l5v?(l5v.esGradeA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeA,teamB),  l5v?(l5v.esGradeAA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeAA,teamB)),
        vcMiniRow('ES B Chances/GP', l5v?(l5v.esGradeB/l5gp).toFixed(2):'—', vcRnk(l5RankGradeB,teamB),  l5v?(l5v.esGradeBA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeBA,teamB)),
        vcMiniRow('ES C Chances/GP', l5v?(l5v.esGradeC/l5gp).toFixed(2):'—', vcRnk(l5RankGradeC,teamB),  l5v?(l5v.esGradeCA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeCA,teamB), true),
      ];
      return rows.join('');
    }

    // Subheader for the 5-column Babcock variants (VS column added)
    function vcSubheaderB(label) {
      return '<div style="grid-column:1/6;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3);padding:0.35rem 0.5rem 0.1rem;border-top:1px solid var(--border);">' + label + '</div>';
    }
    function vcSeasonChanceRowsB() {
      const rows = [
        vcChanceRowB('ES Rush xGF/GP',      bVsCell('esRushXga',true),  sv?sv.esRushXgf.toFixed(3):'—',  vcRnk(vcSRankRushF,teamB),  sv?sv.esRushXgfPct:null,  vcSRankRushPct,  sv?sv.esRushXga.toFixed(3):'—',  vcRnk(vcSRankRushA,teamB)),
        vcChanceRowB('ES OZ xGF/GP',        bVsCell('esOzPlayXga',true), sv?sv.esOzPlayXgf.toFixed(3):'—', vcRnk(vcSRankOzpF,teamB),   sv?sv.esOzPlayXgfPct:null, vcSRankOzpPct,   sv?sv.esOzPlayXga.toFixed(3):'—', vcRnk(vcSRankOzpA,teamB)),
        vcChanceRowB('ES Cycle xGF/GP',     bVsCell('esCycleXga',true), sv?sv.esCycleXgf.toFixed(3):'—', vcRnk(vcSRankCycleF,teamB), sv?sv.esCycleXgfPct:null, vcSRankCyclPct,  sv?sv.esCycleXga.toFixed(3):'—', vcRnk(vcSRankCycleA,teamB)),
        vcChanceRowB('ES Forecheck xGF/GP', bVsCell('esFcXga',true),    sv?sv.esFcXgf.toFixed(3):'—',    vcRnk(vcSRankFcF,teamB),    sv?sv.esFcXgfPct:null,    vcSRankFcPct,    sv?sv.esFcXga.toFixed(3):'—',    vcRnk(vcSRankFcA,teamB)),
        vcSubheaderB('Chance Grades'),
        vcMiniRowB('ES A Chances/GP', bVsCell('esGradeAA',true), sv?sv.esGradeA.toFixed(2):'—',  vcRnk(vcSRankGA,teamB),  sv?sv.esGradeAA.toFixed(2):'—', vcRnk(vcSRankGAA,teamB)),
        vcMiniRowB('ES B Chances/GP', bVsCell('esGradeBA',true), sv?sv.esGradeB.toFixed(2):'—',  vcRnk(vcSRankGB,teamB),  sv?sv.esGradeBA.toFixed(2):'—', vcRnk(vcSRankGBA,teamB)),
        vcMiniRowB('ES C Chances/GP', bVsCell('esGradeCA',true), sv?sv.esGradeC.toFixed(2):'—',  vcRnk(vcSRankGC,teamB),  sv?sv.esGradeCA.toFixed(2):'—', vcRnk(vcSRankGCA,teamB), true),
      ];
      return rows.join('');
    }
    function vcL5ChanceRowsB() {
      const rows = [
        vcChanceRowB('ES Rush xGF/GP',      bVsCell('esRushXga',true),  l5v?(l5v.esRushXgf/l5gp).toFixed(3):'—',  vcRnk(l5RankRushF,teamB),  l5v?l5v.esRushXgfPct:null,  l5RankRushPct,  l5v?(l5v.esRushXga/l5gp).toFixed(3):'—',  vcRnk(l5RankRushA,teamB)),
        vcChanceRowB('ES OZ xGF/GP',        bVsCell('esOzPlayXga',true), l5v?(l5v.esOzPlayXgf/l5gp).toFixed(3):'—', vcRnk(l5RankOzpF,teamB),   l5v?l5v.esOzPlayXgfPct:null, l5RankOzpPct,   l5v?(l5v.esOzPlayXga/l5gp).toFixed(3):'—', vcRnk(l5RankOzpA,teamB)),
        vcChanceRowB('ES Cycle xGF/GP',     bVsCell('esCycleXga',true), l5v?(l5v.esCycleXgf/l5gp).toFixed(3):'—', vcRnk(l5RankCycleF,teamB), l5v?l5v.esCycleXgfPct:null, l5RankCyclPct,  l5v?(l5v.esCycleXga/l5gp).toFixed(3):'—', vcRnk(l5RankCycleA,teamB)),
        vcChanceRowB('ES Forecheck xGF/GP', bVsCell('esFcXga',true),    l5v?(l5v.esFcXgf/l5gp).toFixed(3):'—',    vcRnk(l5RankFcF,teamB),    l5v?l5v.esFcXgfPct:null,    l5RankFcPct,    l5v?(l5v.esFcXga/l5gp).toFixed(3):'—',    vcRnk(l5RankFcA,teamB)),
        vcSubheaderB('Chance Grades'),
        vcMiniRowB('ES A Chances/GP', bVsCell('esGradeAA',true), l5v?(l5v.esGradeA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeA,teamB),  l5v?(l5v.esGradeAA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeAA,teamB)),
        vcMiniRowB('ES B Chances/GP', bVsCell('esGradeBA',true), l5v?(l5v.esGradeB/l5gp).toFixed(2):'—', vcRnk(l5RankGradeB,teamB),  l5v?(l5v.esGradeBA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeBA,teamB)),
        vcMiniRowB('ES C Chances/GP', bVsCell('esGradeCA',true), l5v?(l5v.esGradeC/l5gp).toFixed(2):'—', vcRnk(l5RankGradeC,teamB),  l5v?(l5v.esGradeCA/l5gp).toFixed(2):'—', vcRnk(l5RankGradeCA,teamB), true),
      ];
      return rows.join('');
    }
    function vcSeasonTeamStatsRowsB() {
      const fmtOz = s => { const m=Math.floor(s/60), sec=String(Math.round(s%60)).padStart(2,'0'); return `${m}:${sec}`; };
      const rows = [
        vcRowB('ES LPR%',            bVsRatioCell('esLpr','esLprA','sum',true), sv?(sv.esLprPct).toFixed(1)+'%':'—',    vcRnk(vcSRankLprPct,teamB),    sv?(100-sv.esLprPct).toFixed(1)+'%':'—', vcRnk(vcSRankLprPct,teamB)),
        vcRowB('ES OMR/GP',          bVsCell('esOmrA',true),  sv?sv.esOmr.toFixed(2):'—',              vcRnk(vcSRankOMR,teamB),       sv?sv.esOmrA.toFixed(2):'—', vcRnk(vcSRankOMRA,teamB)),
        vcRowB('ES OZ Poss/GP',      fmtOz(Number(bVsFieldVal('esOzPossA')))+' '+rnk(bVsFieldRank('esOzPossA')), sv?fmtOz(sv.esOzPoss):'—',              vcRnk(vcSRankOzPoss,teamB),    sv?fmtOz(sv.esOzPossA):'—', vcRnk(vcSRankOzPossA,teamB)),
        vcRowB('AS Shot Attempts/GP',bVsOpponentCell('asShotAtt',true,1), sv?sv.asShotAtt.toFixed(1):'—',         vcRnk(vcSRankShotAtt,teamB),   sv?sv.asShotAttA.toFixed(1):'—', vcRnk(vcSRankShotAttA,teamB)),
        vcRowB('ES Screened SOG/GP', bVsOpponentCell('esScreened',true,1), sv?sv.esScreened.toFixed(1):'—',        vcRnk(vcSRankScreened,teamB),  sv?sv.esScreenedA.toFixed(1):'—', vcRnk(vcSRankScreenedA,teamB)),
        vcRowB('ES Dump-in Rec%',    bVsRatioCell('esDumpInRec','esDumpIn','direct',true), sv?(sv.esDumpInPct).toFixed(1)+'%':'—', vcRnk(vcSRankDumpInPct,teamB), sv?(sv.esDumpInPctA).toFixed(1)+'%':'—', vcRnk(vcSRankDumpInPctA,teamB), true),
      ];
      return rows.join('');
    }
    function vcL5TeamStatsRowsB() {
      const fmtOz = s => { const m=Math.floor(s/60), sec=String(Math.round(s%60)).padStart(2,'0'); return `${m}:${sec}`; };
      const rows = [
        vcRowB('ES LPR%',            bVsRatioCell('esLpr','esLprA','sum',true), l5v?(l5v.esLprPct).toFixed(1)+'%':'—',             vcRnk(l5RankLprPct,teamB),    l5v?(100-l5v.esLprPct).toFixed(1)+'%':'—', vcRnk(l5RankLprPct,teamB)),
        vcRowB('ES OMR/GP',          bVsCell('esOmrA',true), l5v?(l5v.esOmr/l5gp).toFixed(2):'—',               vcRnk(l5RankOmr,teamB),       l5v?(l5v.esOmrA/l5gp).toFixed(2):'—', vcRnk(l5RankOmrA,teamB)),
        vcRowB('ES OZ Poss/GP',      fmtOz(Number(bVsFieldVal('esOzPossA')))+' '+rnk(bVsFieldRank('esOzPossA')), l5v?fmtOz(l5v.esOzPoss/l5gp):'—',                 vcRnk(l5RankOzPoss,teamB),    l5v?fmtOz(l5v.esOzPossA/l5gp):'—', vcRnk(l5RankOzPossA,teamB)),
        vcRowB('AS Shot Attempts/GP',bVsOpponentCell('asShotAtt',true,1), l5v?(l5v.asShotAtt/l5gp).toFixed(1):'—',           vcRnk(l5RankShotAtt,teamB),   l5v?(l5v.asShotAttA/l5gp).toFixed(1):'—', vcRnk(l5RankShotAttA,teamB)),
        vcRowB('ES Screened SOG/GP', bVsOpponentCell('esScreened',true,1), l5v?(l5v.esScreened/l5gp).toFixed(1):'—',          vcRnk(l5RankScreened,teamB),  l5v?(l5v.esScreenedA/l5gp).toFixed(1):'—', vcRnk(l5RankScreenedA,teamB)),
        vcRowB('ES Dump-in Rec%',    bVsRatioCell('esDumpInRec','esDumpIn','direct',true), l5v?(l5v.esDumpInPct).toFixed(1)+'%':'—',          vcRnk(l5RankDumpInPct,teamB), l5v?(l5v.esDumpInPctA).toFixed(1)+'%':'—', vcRnk(l5RankDumpInPctA,teamB), true),
      ];
      return rows.join('');
    }

    function vcChancePanel(title, rowsHtml) {
      return `
        <div class="h2h-overview" style="margin-top:0.75rem;">
          <div class="h2h-overview-title ${h2hTitleClass(title)}">${title}</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) 110px 110px 110px;">
            <div class="h2h-ov-header">Stat</div>
            <div class="h2h-ov-header team-b">For</div>
            <div class="h2h-ov-header team-b">xGF%</div>
            <div class="h2h-ov-header team-b">Against</div>
            ${rowsHtml}
          </div>
        </div>`;
    }

    // Babcock-specific variants: same rows, plus a leading "VS" column (teamA vs teamB,
    // teamA's rank among every team that's played teamB) — against-side only, since that's
    // the side directly comparable to a head-to-head "how did we do against them" framing.
    function vcChanceRowB(label, vsInner, forVal, forRank, pct, pctRankMap, agaVal, agaRank, isLast=false) {
      const border = isLast ? 'border-bottom:none;' : '';
      const bg = pctBg(pct);
      const pctDisplay = pct !== null ? pct.toFixed(1) + '%' : '—';
      const pctRnk = pct !== null ? vcRnk(pctRankMap, teamB) : '';
      return '<div class="h2h-ov-label" style="' + border + '">' + label + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + '">' + vsInner + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + 'text-align:right;">' + forVal + ' ' + forRank + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + bg + 'text-align:center;font-weight:600;">' + pctDisplay + ' ' + pctRnk + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + 'text-align:left;">' + agaVal + ' ' + agaRank + '</div>';
    }
    function vcMiniRowB(label, vsInner, forVal, forRank, agaVal, agaRank, isLast=false) {
      const border = isLast ? 'border-bottom:none;' : '';
      const style = 'color:var(--text2);font-size:0.72rem;';
      return '<div class="h2h-ov-label" style="' + border + style + '">' + label + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '">' + vsInner + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '">' + forVal + ' ' + forRank + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '"></div>'
           + '<div class="h2h-ov-cell" style="' + border + style + '">' + agaVal + ' ' + agaRank + '</div>';
    }
    function vcRowB(label, vsInner, forVal, forRank, agaVal, agaRank, isLast=false) {
      const border = isLast ? 'border-bottom:none;' : '';
      return '<div class="h2h-ov-label" style="' + border + '">' + label + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + '">' + vsInner + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + '">' + forVal + ' ' + forRank + '</div>'
           + '<div class="h2h-ov-cell" style="' + border + '"></div>'
           + '<div class="h2h-ov-cell" style="' + border + '">' + agaVal + ' ' + agaRank + '</div>';
    }
    function vcChancePanelB(title, rowsHtml) {
      return `
        <div class="h2h-overview" style="margin-top:0.75rem;">
          <div class="h2h-overview-title ${h2hTitleClass(title)}">${title}</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) minmax(130px,1.3fr) minmax(75px,1fr) minmax(75px,1fr) minmax(75px,1fr);">
            <div class="h2h-ov-header">Stat</div>
            <div class="h2h-ov-header team-b" style="font-size:0.64rem;white-space:nowrap;">${teamA} vs ${teamB} (${teamA} Rank)</div>
            <div class="h2h-ov-header team-b">For</div>
            <div class="h2h-ov-header team-b">xGF%</div>
            <div class="h2h-ov-header team-b">Against</div>
            ${rowsHtml}
          </div>
        </div>`;
    }
    function vcTeamStatsPanelB(title, rowsHtml) {
      return `
        <div class="h2h-overview" style="margin-top:0.75rem;">
          <div class="h2h-overview-title ${h2hTitleClass(title)}">${title}</div>
          <div class="h2h-overview-grid" style="grid-template-columns:minmax(0,1fr) minmax(170px,1.6fr) minmax(70px,1fr) 14px minmax(70px,1fr);">
            <div class="h2h-ov-header">Stat</div>
            <div class="h2h-ov-header team-b" style="font-size:0.64rem;white-space:nowrap;">${teamA} vs ${teamB} (${teamA} Rank)</div>
            <div class="h2h-ov-header team-b">For</div>
            <div class="h2h-ov-header"></div>
            <div class="h2h-ov-header team-b">Against</div>
            ${rowsHtml}
          </div>
        </div>`;
    }

  
  return {bGamesByOpp, bVsCell, bVsFieldRank, bVsFieldVal, bVsOpponentAvgs, bVsOpponentCell, bVsRatioCell, colorDelta, colorPkAxg, computeGsaxMap, erA, erB, esRanks, filtered, fmt2, fmtRecord, fmtTeamHeader, gsaxMap, gsaxRanks, h2hGameRowsHtml, h2hMaxAsDelta, h2hMaxEvDelta, l5A, l5B, l5MapAll, l5RankCyclPct, l5RankCycleA, l5RankCycleF, l5RankDumpInPct, l5RankDumpInPctA, l5RankEsAxga, l5RankEsAxgf, l5RankFcA, l5RankFcF, l5RankFcPct, l5RankGradeA, l5RankGradeAA, l5RankGradeB, l5RankGradeBA, l5RankGradeC, l5RankGradeCA, l5RankGsax, l5RankLprPct, l5RankOmr, l5RankOmrA, l5RankOzPoss, l5RankOzPossA, l5RankOzpA, l5RankOzpF, l5RankOzpPct, l5RankPkXga, l5RankPpPk, l5RankPpXgf, l5RankRushA, l5RankRushF, l5RankRushPct, l5RankScreened, l5RankScreenedA, l5RankShotAtt, l5RankShotAttA, l5RankXga60, l5RankXgf60, l5RankXgfPct, l5Rows, l5RowsHtml, l5gp, l5v, last5Stats, nameA, nameB, oppLast5, ovRows, ovRowsHtml, pctBg, rankGsax, rankL5, recA, recB, rnk, sA, sB, sgn, srA, srB, stMap, stRanks, stmA, stmB, sumH2H, sv, teamMap, teamRecord, tmA, tmB, vcChancePanel, vcChancePanelB, vcChanceRow, vcChanceRowB, vcL5ChanceRows, vcL5ChanceRowsB, vcL5TeamStatsRowsB, vcMiniRow, vcMiniRowB, vcRnk, vcRow, vcRowB, vcSRankCyclPct, vcSRankCycleA, vcSRankCycleF, vcSRankDumpInPct, vcSRankDumpInPctA, vcSRankFcA, vcSRankFcF, vcSRankFcPct, vcSRankGA, vcSRankGAA, vcSRankGB, vcSRankGBA, vcSRankGC, vcSRankGCA, vcSRankLprPct, vcSRankOMR, vcSRankOMRA, vcSRankOzPoss, vcSRankOzPossA, vcSRankOzpA, vcSRankOzpF, vcSRankOzpPct, vcSRankRushA, vcSRankRushF, vcSRankRushPct, vcSRankScreened, vcSRankScreenedA, vcSRankShotAtt, vcSRankShotAttA, vcSeasonChanceRows, vcSeasonChanceRowsB, vcSeasonMap, vcSeasonRank, vcSeasonTeamStatsRowsB, vcSubheader, vcSubheaderB, vcTeamStatsPanelB, vsGameRowsHtml, vsMaxAsDelta, vsMaxEvDelta};
}
