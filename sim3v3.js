// 3v3 Team Battle Simulator — with switching AI
'use strict';

function d(n) { return Math.floor(Math.random() * n) + 1; }
function rollDice(c, s) { let t = 0; for (let i = 0; i < c; i++) t += d(s); return t; }

const SN = ['atk', 'def', 'con', 'int', 'cha', 'spd'];
function gs(w) {
  const s = {}; SN.forEach(n => s[n] = 5); let p = 42;
  const tw = SN.reduce((a, n) => a + (w[n] || 1), 0);
  while (p > 0) {
    let r = Math.random() * tw;
    for (const n of SN) { r -= (w[n] || 1); if (r <= 0) { if (s[n] < 20) { s[n]++; p--; } break; } }
  }
  return s;
}

function chaBonus(aCha, dCha) { return Math.max(0, (aCha - dCha)) * 0.02; }

// ── Abilities ──
const AB = {
  lichBlast:       { n:'Lich Blast',    t:'m', s:'int', f:7,  dc:[2,6], u:14, fc:0.2 },
  glaciate:        { n:'Glaciate',      t:'m', s:'int', f:5,  dc:[1,4], u:16, fc:0.6 },
  lichLifeDrain:   { n:'Life Drain',    t:'s', s:'int', f:6,  dc:[1,8], u:10, dr:0.5 },
  shatter:         { n:'Shatter',       t:'s', s:'int', f:18, dc:[2,6], u:6,  rqF:1 },
  tumpUp:          { n:'Tump Up',       t:'p', s:'atk', f:5,  dc:[1,6], u:16, dh:1 },
  counterThrow:    { n:'Counter Throw', t:'p', s:'atk', f:7,  dc:[1,6], u:10, cm:1, cb:0.75 },
  subdue:          { n:'Subdue',        t:'p', s:'atk', f:12, dc:[1,6], u:12, sl:1 },
  deathLust:       { n:'Death Lust',    t:'p', s:'atk', f:6,  dc:[1,4], u:4,  gdl:1 },
  radialStrike:    { n:'Radial Strike', t:'p', s:'atk', f:9,  dc:[1,6], u:16, bc:0.4 },
  makeWay:         { n:'Make Way',      t:'p', s:'atk', f:5,  dc:[1,4], u:6,  mw:1 },
  heavenlyBlow:    { n:'Heavenly Blow', t:'p', s:'atk', f:8,  dc:[1,8], u:10, sd:1 },
  healingPrayer:   { n:'Healing Prayer',t:'h', s:'cha', f:0,  dc:[1,1], u:4,  hp:1, hl:1 },
  battlerang:      { n:'Battlerang',    t:'p', s:'atk', f:8,  dc:[1,6], u:14, bm:1, fl:0.25 },
  emberang:        { n:'Emberang',      t:'p', s:'atk', f:5,  dc:[1,6], u:12, bm:1, bn:0.35 },
  whittle:         { n:'Whittle',       t:'p', s:'atk', f:4,  dc:[1,4], u:4,  gw:1 },
  swerve:          { n:'Swerve',        t:'p', s:'atk', f:0,  dc:[1,1], u:10, sw:1 },
  poisonDart:      { n:'Poison Dart',   t:'p', s:'atk', f:8,  dc:[1,6], u:14, pc:0.60, pst:3 },
  goblinGas:       { n:'Goblin Gas',    t:'p', s:'atk', f:0,  dc:[1,1], u:4,  gg:1 },
  remedialOintment:{ n:'Remedial Ointment', t:'h', s:'cha', f:0, dc:[1,1], u:6, ro:1, hl:1 },
  violentExtraction:{ n:'Violent Extraction', t:'s', s:'atk', f:0, dc:[1,1], u:6, ve:1 },
};

// ── Classes ──
const CLS = [
  { id:'paladin',   l:'Paladin',   sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},   ab:['radialStrike','makeWay','heavenlyBlow','healingPrayer'], st:[{sb:{cha:2},p:'blindPerTurn'},{sb:{def:2},p:'flashyBlind'}] },
  { id:'berserker', l:'Berserker', sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},   ab:['tumpUp','counterThrow','subdue','deathLust'], st:[{sb:{con:2},p:'stunOnHit'},{sb:{def:2},p:'regenTick'}] },
  { id:'mage',      l:'Mage',      sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3}, ab:['lichBlast','glaciate','lichLifeDrain','shatter'], st:[{sb:{con:2,cha:2},p:'freezeAll'},{sb:{int:3},p:'attackLifesteal'}] },
  { id:'ranger',    l:'Ranger',    sw:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},    ab:['battlerang','emberang','whittle','swerve'], st:[{sb:{atk:2},p:'boomerangBonus'},{sb:{spd:2},p:'guerillaSwitchOut'}] },
  { id:'rogue',     l:'Rogue',     sw:{atk:3,spd:4,con:3,int:0.5,def:2,cha:1.5},    ab:['poisonDart','goblinGas','remedialOintment','violentExtraction'], st:[{sb:{cha:2},p:'rapidTransmission'},{sb:{spd:2},p:'neurotoxin'}] },
];

let terrain = null;

// ── Create battler ──
function createBattler(cls) {
  const stats = gs(cls.sw);
  const hp = 20 + stats.con * 4;
  return {
    cls, nm: cls.l, stats, origStats: { ...stats },
    mhp: hp, chp: hp,
    ab: cls.ab.map(id => { const a = AB[id]; return { ...a, id, cu: a.u }; }),
    st: cls.st, stn: null,
    status: null, dlt: 0, dtt: false, bs: 0, brn: 0, bh: [], sa: false, slt: false,
    wb: 0, fl: false, ps: 0, swl: false,
    fainted: false
  };
}

function applyStance(b, s) {
  b.stn = s;
  if (s.sb) for (const [k, v] of Object.entries(s.sb)) b.stats[k] += v;
}

function removeStance(b) {
  if (b.stn?.sb) for (const [k, v] of Object.entries(b.stn.sb)) b.stats[k] -= v;
  b.stn = null;
}

// Clear effects on switch-out (keep status)
function clearEffects(b) {
  b.dlt = 0; b.wb = 0; b.sa = false; b.slt = false; b.fl = false; b.swl = false; b.dtt = false;
  // Restore ATK from whittle stacks
  b.stats.atk = b.origStats.atk + (b.stn?.sb?.atk || 0);
  removeStance(b);
}

function getInit(c) {
  const b = rollDice(2, 8) + c.stats.spd;
  if (c.status === 'frozen') return Math.floor(b * 0.4);
  if (c.status === 'stun') return Math.floor(b * 0.5);
  return b;
}

function calcDmg(ab, a, d2) {
  const raw = ab.f + rollDice(ab.dc[0], ab.dc[1]);
  if (ab.t === 's') return raw;
  if (ab.hl) return 0;
  if (ab.sd) {
    return Math.max(1, Math.round(raw / 2 * (0.5 + 0.5 * (rollDice(2, 6) + a.stats.atk) / (rollDice(2, 6) + d2.stats.def)) +
      raw / 2 * (0.5 + 0.5 * (rollDice(2, 6) + a.stats.int) / (rollDice(2, 6) + d2.stats.int))));
  }
  const at = a.stats[ab.s] || a.stats.atk;
  const ds = ab.t === 'p' ? d2.stats.def : d2.stats.int;
  return Math.max(1, Math.round(raw * (0.5 + 0.5 * (rollDice(2, 6) + at) / (rollDice(2, 6) + ds))));
}

function randStance(b) { return b.st[Math.floor(Math.random() * b.st.length)]; }

function applyPoison(t, st, src) {
  if (src.stn?.p === 'rapidTransmission' && Math.random() < 0.30 + chaBonus(src.stats.cha, t.stats.cha)) st += 1;
  t.ps += st;
}

// ── Matchup heuristic: how well does 'me' do vs 'them'? Higher = better ──
function matchupScore(me, them) {
  let score = 0;
  // Physical attacker vs low DEF
  if (me.cls.sw.atk >= 3 && them.stats.def < 10) score += 15;
  // Magical attacker vs low INT
  if (me.cls.sw.int >= 3 && them.stats.int < 10) score += 15;
  // Paladin vs Rogue (hard counter)
  if (me.cls.id === 'paladin' && them.cls.id === 'rogue') score += 20;
  // Mage vs Paladin
  if (me.cls.id === 'mage' && them.cls.id === 'paladin') score += 15;
  // Rogue vs Mage (slight edge with poison)
  if (me.cls.id === 'rogue' && them.cls.id === 'mage') score += 5;
  // Ranger vs Mage
  if (me.cls.id === 'ranger' && them.cls.id === 'mage') score += 10;
  // HP advantage
  score += (me.chp / me.mhp - them.chp / them.mhp) * 20;
  return score;
}

// ── AI: choose move or switch ──
function aiDecision(active, bench, enemy, team) {
  // Can't switch if switch-locked
  if (active.swl) return { action: 'fight' };
  // Can't switch if no bench alive
  const aliveBench = bench.filter(b => !b.fainted && b !== active);
  if (aliveBench.length === 0) return { action: 'fight' };

  // Consider switching if:
  // 1. Low HP (< 25%) and bench has healthier options
  // 2. Bad matchup and bench has better counter
  // 3. Make Way / Swerve dodge triggers switch
  
  const currentScore = matchupScore(active, enemy);
  let bestSwitch = null, bestSwitchScore = currentScore;
  
  for (const b of aliveBench) {
    const s = matchupScore(b, enemy) + (b.chp / b.mhp) * 10;
    if (s > bestSwitchScore) { bestSwitchScore = s; bestSwitch = b; }
  }

  // Switch if HP low and better option exists
  if (active.chp < active.mhp * 0.25 && bestSwitch && bestSwitchScore > currentScore + 10) {
    return { action: 'switch', target: bestSwitch };
  }
  
  // Switch if significantly better matchup available
  if (bestSwitch && bestSwitchScore > currentScore + 25) {
    return { action: 'switch', target: bestSwitch };
  }

  return { action: 'fight' };
}

// ── AI: choose move ──
function aiMove(a, d2) {
  if (a.chp < a.mhp * 0.3) {
    const hi = a.ab.findIndex(x => x.hl && x.cu > 0);
    if (hi >= 0) return a.ab[hi];
  }
  if (a.ps >= 2 && a.chp < a.mhp * 0.6) {
    const ri = a.ab.findIndex(x => x.ro && x.cu > 0);
    if (ri >= 0) return a.ab[ri];
  }
  const av = a.ab.filter(x => {
    if (x.cu <= 0) return false;
    if (x.rqF && d2.status !== 'frozen') return false;
    if (x.gw && a.wb >= 8) return false;
    if (x.ro) return false;
    return true;
  });
  if (!av.length) return null;
  const w = av.map(x => {
    if (x.hl) return a.chp < a.mhp * 0.5 ? 30 : 5;
    if (x.gdl) return a.dlt > 0 ? 0 : 15;
    if (x.sw) return a.slt ? 5 : 18;
    if (x.gw) return a.wb === 0 ? 22 : 12;
    if (x.gg) return !terrain ? 25 : 3;
    if (x.ve) return d2.ps >= 4 ? d2.ps * 8 : 2;
    if (x.mw) return 15; // Make Way used for switching
    let avg = x.f + x.dc[0] * (x.dc[1] + 1) / 2;
    if (x.dh) avg *= 1.8; if (x.cb && a.dtt) avg *= 1.75;
    if (x.rqF) avg *= 1.3; if (x.bm) avg *= 1.4;
    return avg;
  });
  const t = w.reduce((s, v) => s + v, 0);
  let r = Math.random() * t;
  for (let i = 0; i < av.length; i++) { r -= w[i]; if (r <= 0) return av[i]; }
  return av[av.length - 1];
}

// ── Execute ability ──
function execAbility(a, d2, ab) {
  if (!ab || a.chp <= 0 || a.fainted || d2.chp <= 0 || d2.fainted) return;

  // Stun: halve stats temporarily
  let stunDebuff = null;
  if (a.status === 'stun') {
    stunDebuff = {};
    for (const s of ['spd', 'atk', 'int', 'cha']) {
      const r = Math.floor(a.stats[s] / 2); a.stats[s] -= r; stunDebuff[s] = r;
    }
  }
  const restoreStun = () => { if (stunDebuff) for (const [s, v] of Object.entries(stunDebuff)) a.stats[s] += v; };

  // Frozen inaction (except Healing Prayer)
  if (a.status === 'frozen' && !ab.hp && Math.random() < 0.66) { restoreStun(); return; }
  // Blind miss
  if (a.bs > 0 && Math.random() < a.bs * 0.15) { a.bs--; restoreStun(); return; }
  // Shatter requires frozen
  if (ab.rqF && d2.status !== 'frozen') { restoreStun(); return; }

  // Non-damage abilities
  if (ab.gw) { a.wb += 4; a.stats.atk += 4; ab.cu--; restoreStun(); return; }
  if (ab.sw) { ab.cu--; restoreStun(); return; }
  if (ab.hl && ab.hp) {
    a.chp = Math.min(a.mhp, a.chp + Math.max(5, Math.round(a.mhp * 0.25)));
    a.status = null; a.bs = 0; a.brn = 0; a.ps = 0; ab.cu--; restoreStun(); return;
  }
  if (ab.gdl) { a.dlt = 2; ab.cu--; restoreStun(); return; }
  if (ab.gg) { terrain = { tl: 5, e: 'pb' }; ab.cu--; restoreStun(); return; }
  if (ab.ro) {
    const st = a.ps; if (st > 0) { a.ps = 0; a.chp = Math.min(a.mhp, a.chp + st * 7); }
    ab.cu--; restoreStun(); return;
  }
  if (ab.ve) {
    const st = d2.ps; if (st > 0) { d2.ps = 0; d2.chp -= st * 10; d2.dtt = true; }
    ab.cu--; restoreStun(); return;
  }

  ab.cu--;
  for (let h = 0; h < (ab.dh ? 2 : 1); h++) {
    if (d2.chp <= 0) break;
    if (h > 0 && ab.dh && Math.random() < 0.3) continue; // 30% miss on 2nd hit
    if (d2.sa && Math.random() < (d2.sa === 'high' ? 1 : 0.2)) continue; // Swerve dodge

    let dmg = calcDmg(ab, a, d2);
    if (h > 0 && ab.dh) dmg = Math.round(dmg * 1.5);
    if (ab.cb && a.dtt) dmg = Math.round(dmg * (1 + ab.cb));
    if (a.dlt > 0 && !ab.hl && !ab.gdl) dmg += 5;
    d2.chp -= dmg; d2.dtt = true;

    // Lifesteal stance
    if (a.stn?.p === 'attackLifesteal' && dmg > 0) a.chp = Math.min(a.mhp, a.chp + Math.max(1, Math.floor(dmg * 0.15)));
    // Thaw on damage
    if (d2.status === 'frozen' && !ab.rqF) { d2.status = null; }
    if (ab.rqF && d2.status === 'frozen') { d2.status = null; }
    // Life Drain
    if (ab.dr) a.chp = Math.min(a.mhp, a.chp + Math.round(dmg * ab.dr));
    // Switch lock
    if (ab.sl) d2.swl = true;

    // Status applications
    const chaDiff = a.stats.cha - d2.stats.cha;
    if (a.stn?.p === 'stunOnHit' && !d2.status && d2.chp > 0 && Math.random() < 0.3 + chaBonus(a.stats.cha, d2.stats.cha)) d2.status = 'stun';
    if (!d2.status && d2.chp > 0) {
      let fc = ab.fc || 0;
      if (a.stn?.p === 'freezeAll') fc += 0.1;
      fc += chaBonus(a.stats.cha, d2.stats.cha);
      if (fc > 0 && Math.random() < fc) d2.status = 'frozen';
    }
    if (ab.bc && d2.chp > 0 && Math.random() < ab.bc + chaBonus(a.stats.cha, d2.stats.cha)) d2.bs++;
    if (a.stn?.p === 'blindPerTurn' && d2.chp > 0 && Math.random() < 0.25 + chaBonus(a.stats.cha, d2.stats.cha)) d2.bs++;
    if (ab.bn && d2.chp > 0 && Math.random() < ab.bn + chaBonus(a.stats.cha, d2.stats.cha)) d2.brn++;
    if (ab.pc && d2.chp > 0 && Math.random() < ab.pc + chaBonus(a.stats.cha, d2.stats.cha)) applyPoison(d2, ab.pst || 1, a);
    if (ab.bm && d2.chp > 0) d2.bh.push({ dm: Math.round(dmg * (a.stn?.p === 'boomerangBonus' ? 1.3 : 1.0)) });
    if (h === 0 && ab.fl && d2.chp > 0 && !d2.fl && Math.random() < ab.fl + chaBonus(a.stats.cha, d2.stats.cha)) d2.fl = true;
  }
  restoreStun();
}

function tickStatus(b) {
  if (b.stn?.p === 'regenTick' && b.chp > 0 && b.chp < b.mhp) b.chp = Math.min(b.mhp, b.chp + Math.max(1, Math.floor(b.mhp * 0.05)));
  if (b.dlt > 0) b.dlt--;
  b.swl = false; b.slt = !!b.sa; b.sa = false; b.fl = false;
  if (b.brn > 0 && b.chp > 0) { b.chp = Math.max(0, b.chp - Math.max(1, Math.floor(b.mhp * 0.04 * b.brn))); if (Math.random() < 0.5) b.brn--; }
  if (b.ps > 0 && b.chp > 0) b.chp = Math.max(0, b.chp - b.ps * 2);
  if (b.bh.length > 0 && b.chp > 0) { for (const h of b.bh.splice(0)) { b.chp = Math.max(0, b.chp - h.dm); if (b.chp <= 0) break; } }
  if (b.status === 'stun') b.status = null;
  if (b.chp <= 0) b.fainted = true;
}

// ── Switch: clear effects, pick new active, assign stance ──
function switchIn(team, newActive) {
  const old = team.active;
  if (old && !old.fainted) clearEffects(old);
  team.active = newActive;
  applyStance(newActive, randStance(newActive));
  // Flashy Arrival: blind enemy on switch-in
  if (newActive.stn?.p === 'flashyBlind') {
    const enemy = null; // handled in main loop
    return true; // signal flashy blind
  }
  return false;
}

// ── Build team: pick 3 random from 5 classes (with 1 possible repeat) ──
function buildTeam() {
  const pool = [...CLS];
  const team = [];
  // Pick 3, allowing 1 repeat
  for (let i = 0; i < 3; i++) {
    const cls = pool[Math.floor(Math.random() * pool.length)];
    team.push(createBattler(cls));
  }
  return { members: team, active: null };
}

// ── Main 3v3 sim ──
function sim3v3() {
  terrain = null;
  const t1 = buildTeam(), t2 = buildTeam();

  // Lead with first member
  t1.active = t1.members[0]; t2.active = t2.members[0];
  applyStance(t1.active, randStance(t1.active));
  applyStance(t2.active, randStance(t2.active));

  // Flashy Arrival on lead
  if (t1.active.stn?.p === 'flashyBlind') t2.active.bs += 2;
  if (t2.active.stn?.p === 'flashyBlind') t1.active.bs += 2;

  for (let turn = 0; turn < 150; turn++) {
    const a = t1.active, b = t2.active;
    if (!a || !b) break;

    a.dtt = false; b.dtt = false;

    // AI decisions: fight or switch?
    const d1 = aiDecision(a, t1.members, b, t2);
    const d2 = aiDecision(b, t2.members, a, t1);

    let am1 = null, am2 = null;
    let switched1 = false, switched2 = false;

    if (d1.action === 'switch') {
      clearEffects(a);
      t1.active = d1.target;
      applyStance(t1.active, randStance(t1.active));
      if (t1.active.stn?.p === 'flashyBlind') b.bs += 2;
      switched1 = true;
    } else {
      am1 = aiMove(a, b);
    }

    if (d2.action === 'switch') {
      clearEffects(b);
      t2.active = d2.target;
      applyStance(t2.active, randStance(t2.active));
      if (t2.active.stn?.p === 'flashyBlind') t1.active.bs += 2;
      switched2 = true;
    } else {
      am2 = aiMove(b, a);
    }

    const fa = t1.active, fb = t2.active;

    // If both switched, skip to next turn
    if (switched1 && switched2) {
      tickStatus(fa); tickStatus(fb);
      if (fa.chp <= 0) fa.fainted = true;
      if (fb.chp <= 0) fb.fainted = true;
    } else if (switched1) {
      // Only team 2 attacks
      execAbility(fb, fa, am2);
      if (terrain?.tl > 0) {
        terrain.tl--;
        if (terrain.e === 'pb') {
          if (fa.chp > 0) applyPoison(fa, 1, fb);
          if (fb.chp > 0) applyPoison(fb, 1, fa);
        }
        if (terrain.tl <= 0) terrain = null;
      }
      tickStatus(fa); tickStatus(fb);
      if (fa.chp <= 0) fa.fainted = true;
      if (fb.chp <= 0) fb.fainted = true;
    } else if (switched2) {
      execAbility(fa, fb, am1);
      if (terrain?.tl > 0) {
        terrain.tl--;
        if (terrain.e === 'pb') {
          if (fa.chp > 0) applyPoison(fa, 1, fb);
          if (fb.chp > 0) applyPoison(fb, 1, fa);
        }
        if (terrain.tl <= 0) terrain = null;
      }
      tickStatus(fa); tickStatus(fb);
      if (fa.chp <= 0) fa.fainted = true;
      if (fb.chp <= 0) fb.fainted = true;
    } else {
      // Normal turn: initiative
      if (!am1 && !am2) break;
      let ai = getInit(fa), bi = getInit(fb);
      if (am1?.cm) ai = Math.floor(ai * 0.5);
      if (am2?.cm) bi = Math.floor(bi * 0.5);
      if (am1?.sw) { ai = Math.floor(ai * 1.5); fa.sa = !fa.slt ? 'high' : 'low'; }
      if (am2?.sw) { bi = Math.floor(bi * 1.5); fb.sa = !fb.slt ? 'high' : 'low'; }

      const [first, second, fm, sm] = ai >= bi ? [fa, fb, am1, am2] : [fb, fa, am2, am1];
      execAbility(first, second, fm);
      if (second.chp > 0 && !second.fl) execAbility(second, first, sm);
      first.fl = false; second.fl = false;

      if (terrain?.tl > 0) {
        terrain.tl--;
        if (terrain.e === 'pb') {
          if (fa.chp > 0) applyPoison(fa, 1, fb);
          if (fb.chp > 0) applyPoison(fb, 1, fa);
        }
        if (terrain.tl <= 0) terrain = null;
      }
      tickStatus(fa); tickStatus(fb);
      if (fa.chp <= 0) fa.fainted = true;
      if (fb.chp <= 0) fb.fainted = true;

      // Make Way: forced switch after dealing damage
      if (am1?.mw && !switched1 && fa.chp > 0) {
        const bench1 = t1.members.filter(m => !m.fainted && m !== fa);
        if (bench1.length > 0) {
          // Pick best matchup from bench
          let best = bench1[0], bestS = -999;
          for (const b2 of bench1) { const s = matchupScore(b2, fb); if (s > bestS) { bestS = s; best = b2; } }
          clearEffects(fa);
          t1.active = best;
          applyStance(t1.active, randStance(t1.active));
          if (t1.active.stn?.p === 'flashyBlind') fb.bs += 2;
        }
      }
      if (am2?.mw && !switched2 && fb.chp > 0) {
        const bench2 = t2.members.filter(m => !m.fainted && m !== fb);
        if (bench2.length > 0) {
          let best = bench2[0], bestS = -999;
          for (const b2 of bench2) { const s = matchupScore(b2, t1.active); if (s > bestS) { bestS = s; best = b2; } }
          clearEffects(fb);
          t2.active = best;
          applyStance(t2.active, randStance(t2.active));
          if (t2.active.stn?.p === 'flashyBlind') t1.active.bs += 2;
        }
      }

      // Swerve dodge → switch (Guerilla Fighter)
      if (fa.stn?.p === 'guerillaSwitchOut' && fa.sa && fa.chp > 0) {
        const bench1 = t1.members.filter(m => !m.fainted && m !== fa);
        if (bench1.length > 0) {
          let best = bench1[0], bestS = -999;
          for (const b2 of bench1) { const s = matchupScore(b2, t2.active); if (s > bestS) { bestS = s; best = b2; } }
          clearEffects(fa); t1.active = best;
          applyStance(t1.active, randStance(t1.active));
          if (t1.active.stn?.p === 'flashyBlind') t2.active.bs += 2;
        }
      }
      if (fb.stn?.p === 'guerillaSwitchOut' && fb.sa && fb.chp > 0) {
        const bench2 = t2.members.filter(m => !m.fainted && m !== fb);
        if (bench2.length > 0) {
          let best = bench2[0], bestS = -999;
          for (const b2 of bench2) { const s = matchupScore(b2, t1.active); if (s > bestS) { bestS = s; best = b2; } }
          clearEffects(fb); t2.active = best;
          applyStance(t2.active, randStance(t2.active));
          if (t2.active.stn?.p === 'flashyBlind') t1.active.bs += 2;
        }
      }
    }

    // Check for faints → bring in replacement
    if (t1.active.fainted) {
      const alive1 = t1.members.filter(m => !m.fainted);
      if (alive1.length === 0) return { winner: 2, t1: t1.members.map(m => m.cls.l), t2: t2.members.map(m => m.cls.l) };
      // Pick best counter to enemy
      let best = alive1[0], bestS = -999;
      for (const b2 of alive1) { const s = matchupScore(b2, t2.active); if (s > bestS) { bestS = s; best = b2; } }
      t1.active = best;
      applyStance(t1.active, randStance(t1.active));
      if (t1.active.stn?.p === 'flashyBlind') t2.active.bs += 2;
    }
    if (t2.active.fainted) {
      const alive2 = t2.members.filter(m => !m.fainted);
      if (alive2.length === 0) return { winner: 1, t1: t1.members.map(m => m.cls.l), t2: t2.members.map(m => m.cls.l) };
      let best = alive2[0], bestS = -999;
      for (const b2 of alive2) { const s = matchupScore(b2, t1.active); if (s > bestS) { bestS = s; best = b2; } }
      t2.active = best;
      applyStance(t2.active, randStance(t2.active));
      if (t2.active.stn?.p === 'flashyBlind') t1.active.bs += 2;
    }
  }
  return { winner: 0, t1: t1.members.map(m => m.cls.l), t2: t2.members.map(m => m.cls.l) }; // draw
}

// ── Run sims ──
const N = 3000;
const classWins = {}, classPicks = {}, switchCount = { total: 0, games: 0 };
const teamWins = {};

for (const cls of CLS) { classWins[cls.l] = 0; classPicks[cls.l] = 0; }

let draws = 0;
for (let i = 0; i < N; i++) {
  const result = sim3v3();
  if (result.winner === 0) { draws++; continue; }
  const winners = result.winner === 1 ? result.t1 : result.t2;
  const losers = result.winner === 1 ? result.t2 : result.t1;
  for (const l of winners) classWins[l]++;
  for (const l of [...result.t1, ...result.t2]) classPicks[l]++;
  
  // Track team comps
  const wKey = [...winners].sort().join('+');
  teamWins[wKey] = (teamWins[wKey] || 0) + 1;
}

console.log(`\n=== 3v3 TEAM BATTLE RESULTS (${N} games, ${draws} draws) ===\n`);
console.log('Class Win Rates (when picked):');
for (const cls of CLS) {
  const wr = classPicks[cls.l] > 0 ? (classWins[cls.l] / classPicks[cls.l] * 100).toFixed(1) : '0';
  console.log(`  ${cls.l.padEnd(10)} ${wr}% (${classWins[cls.l]}W / ${classPicks[cls.l]} picks)`);
}

console.log('\nTop 10 Winning Team Comps:');
const sorted = Object.entries(teamWins).sort((a, b) => b[1] - a[1]).slice(0, 10);
for (const [comp, wins] of sorted) {
  console.log(`  ${comp.padEnd(35)} ${wins} wins`);
}
