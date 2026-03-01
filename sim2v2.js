// 2v2 Team Battle Simulator for Realm Wars
function d(n) { return Math.floor(Math.random() * n) + 1; }
function rollDice(count, sides) { let t = 0; for (let i = 0; i < count; i++) t += d(sides); return t; }

const STAT_BUDGET = 72, STAT_FLOOR = 5, STAT_CAP = 20;
const STAT_NAMES = ['atk','def','con','int','cha','spd'];

function generateStats(cls) {
  if (cls.stats) return {...cls.stats};
  const w = cls.statWeights;
  const stats = {}; STAT_NAMES.forEach(s => stats[s] = STAT_FLOOR);
  let pool = STAT_BUDGET - 30;
  const tw = STAT_NAMES.reduce((a, s) => a + (w[s] || 1), 0);
  while (pool > 0) {
    let r = Math.random() * tw;
    for (const s of STAT_NAMES) { r -= (w[s] || 1); if (r <= 0) { if (stats[s] < STAT_CAP) { stats[s]++; pool--; } break; } }
  }
  return stats;
}

const ABILITIES = {
  lichBlast:    { name:'Lich Blast',      dmgType:'magical',  stat:'int', fixed:8,  dice:[2,6],  uses:14, freezeChance:0.2 },
  glaciate:     { name:'Glaciate',        dmgType:'magical',  stat:'int', fixed:5,  dice:[1,4],  uses:16, freezeChance:0.6 },
  lichLifeDrain:{ name:'Life Drain',      dmgType:'soul',     stat:'int', fixed:7,  dice:[1,8],  uses:10, drain:0.5 },
  shatter:{name:'Shatter',dmgType:'soul',stat:'int',fixed:6,dice:[1,4],uses:6,requiresFrozen:true,currentHpPct:0.4},
  tumpUp:       { name:'Tump Up',         dmgType:'physical', stat:'atk', fixed:5,  dice:[1,6],  uses:16, doubleHit:true },
  counterThrow: { name:'Counter Throw',   dmgType:'physical', stat:'atk', fixed:7,  dice:[1,6],  uses:10, counterMove:true, counterBonus:0.75 },
  subdue:       { name:'Subdue',          dmgType:'physical', stat:'atk', fixed:12, dice:[1,6],  uses:12, switchLock:true },
  deathLust:    { name:'Death Lust',      dmgType:'physical', stat:'atk', fixed:6,  dice:[1,4],  uses:4,  grantDeathLust:true },
  radialStrike: { name:'Radial Strike',   dmgType:'physical', stat:'atk', fixed:9,  dice:[1,6],  uses:16, blindChance:0.4 },
  makeWay:      { name:'Make Way',        dmgType:'physical', stat:'atk', fixed:5,  dice:[1,4],  uses:6,  makeWay:true },
  heavenlyBlow: { name:'Heavenly Blow',   dmgType:'physical', stat:'atk', fixed:8,  dice:[1,8],  uses:10, splitDamage:true },
  healingPrayer:{ name:'Healing Prayer',  dmgType:'heal',     stat:'cha', fixed:0,  dice:[1,1],  uses:4,  healingPrayer:true, heal:true },
  battlerang:   { name:'Battlerang',      dmgType:'physical', stat:'atk', fixed:8,  dice:[1,6],  uses:14, boomerang:true },
  emberang:     { name:'Emberang',        dmgType:'physical', stat:'atk', fixed:5,  dice:[1,6],  uses:12, boomerang:true, burnChance:0.35 },
  whittle:      { name:'Whittle',         dmgType:'physical', stat:'atk', fixed:4,  dice:[1,4],  uses:4,  grantWhittle:true },
  swerve:       { name:'Swerve',          dmgType:'physical', stat:'atk', fixed:0,  dice:[1,1],  uses:10, swerve:true },
};

const CLASSES = [
  { id:'sirShining', label:'Paladin', statWeights:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},
    abilities:['radialStrike','makeWay','heavenlyBlow','healingPrayer'],
    stances: [{ id:'battlefieldStar', statBoosts:{cha:2}, passive:'blindPerTurn' }, { id:'flashyArrival', statBoosts:{def:2}, passive:'flashyBlind' }]},
  { id:'pitDweller', label:'Berserker', statWeights:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},
    abilities:['tumpUp','counterThrow','subdue','deathLust'],
    stances: [{ id:'dirtyBoxing', statBoosts:{con:2}, passive:'stunOnHit' }, { id:'pitVeteran', statBoosts:{def:2}, passive:'regenTick' }]},
  { id:'lich', label:'Mage', statWeights:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},
    abilities:['lichBlast','glaciate','lichLifeDrain','shatter'],
    stances: [{ id:'arcticAura', statBoosts:{con:2,cha:2}, passive:'freezeAll' }, { id:'soulSnatcher', statBoosts:{int:3}, passive:'killHeal' }]},
  { id:'rexRang', label:'Ranger', statWeights:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},
    abilities:['battlerang','emberang','whittle','swerve'],
    stances: [{ id:'patientKiller', statBoosts:{atk:2}, passive:'boomerangBonus' }, { id:'guerillaFighter', statBoosts:{spd:2}, passive:'guerillaSwitchOut' }]},
];

const level = 8;

function createCombatant(cls) {
  const stats = generateStats(cls);
  const hp = 20 + stats.con * level * 0.5;
  return {
    cls, name: cls.label, stats, baseStats: {...stats},
    maxHp: hp, currentHp: hp, level,
    abilities: cls.abilities.map(id => ({...ABILITIES[id], id, currentUses: ABILITIES[id].uses})),
    stances: cls.stances, stance: null,
    status: null, statusTurns: 0, fainted: false,
    switchLocked: false, deathLustTurns: 0, damagedThisTurn: false,
    blindStacks: 0, healingPrayerPending: false, makeWaySwitch: false, defBonusThisTurn: 0,
    boomerangHits: [], burnStacks: 0, swerveActive: false, swerveLastTurn: false, whittleBoost: 0,
  };
}

function applyStance(b, stance) {
  b.stance = stance;
  if (stance.statBoosts) for (const [s, v] of Object.entries(stance.statBoosts)) b.stats[s] += v;
}

function removeStance(b) {
  if (b.stance?.statBoosts) for (const [s, v] of Object.entries(b.stance.statBoosts)) b.stats[s] -= v;
  b.stance = null;
}

function switchOut(b) {
  b.deathLustTurns = 0;
  if (b.whittleBoost) { b.stats.atk -= b.whittleBoost; b.whittleBoost = 0; }
  b.swerveActive = false; b.swerveLastTurn = false;
  removeStance(b);
}

function getInit(c) {
  const base = rollDice(2, 8) + c.stats.spd;
  if (c.status === 'frozen') return Math.floor(base * 0.4);
  if (c.status === 'stun') return Math.floor(base * 0.5);
  return base;
}

function calcDmg(ab, atk, def) {
  const raw = ab.fixed + rollDice(ab.dice[0], ab.dice[1]);
  if (ab.dmgType === 'soul') return raw;
  if (ab.heal) return 0;
  if (ab.splitDamage) {
    const pm = 0.5 + 0.5 * (rollDice(2,6) + atk.stats.atk) / (rollDice(2,6) + def.stats.def);
    const mm = 0.5 + 0.5 * (rollDice(2,6) + atk.stats.int) / (rollDice(2,6) + def.stats.int);
    return Math.max(1, Math.round(raw/2 * pm + raw/2 * mm));
  }
  const as = atk.stats[ab.stat] || (ab.dmgType === 'physical' ? atk.stats.atk : atk.stats.int);
  const ds = ab.dmgType === 'physical' ? def.stats.def : def.stats.int;
  return Math.max(1, Math.round(raw * (0.5 + 0.5 * (rollDice(2,6) + as) / (rollDice(2,6) + ds))));
}

function aiPickStance(b) { return b.stances[Math.floor(Math.random() * b.stances.length)]; }

function aiPickMove(atk, def) {
  const avail = atk.abilities.filter(a => {
    if (a.currentUses <= 0) return false;
    if (a.requiresFrozen && def.status !== 'frozen') return false;
    if (a.makeWay) return false; // handled separately for switching
    if (a.grantWhittle && atk.whittleBoost >= 8) return false;
    return true;
  });
  if (avail.length === 0) return { name:'Struggle', dmgType:'physical', stat:'atk', fixed:3, dice:[1,4], uses:999, currentUses:999 };
  const weights = avail.map(a => {
    if (a.heal) return atk.currentHp < atk.maxHp * 0.5 ? 30 : 5;
    if (a.grantDeathLust) return atk.deathLustTurns > 0 ? 0 : 15;
    if (a.swerve) return atk.swerveLastTurn ? 5 : 18;
    if (a.grantWhittle) return atk.whittleBoost === 0 ? 22 : 12;
    let avg = a.fixed + a.dice[0] * (a.dice[1] + 1) / 2;
    if (a.doubleHit) avg *= 1.8;
    if (a.counterBonus && atk.damagedThisTurn) avg *= 1.75;
    if (a.requiresFrozen) avg *= 1.3;
    if (a.boomerang) avg *= 1.4;
    return avg;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < avail.length; i++) { r -= weights[i]; if (r <= 0) return avail[i]; }
  return avail[avail.length - 1];
}

// Should AI switch? Simple heuristic
function shouldSwitch(active, bench, opponent) {
  if (!bench || bench.fainted || active.switchLocked) return false;
  // Switch if very low HP and bench is healthy
  if (active.currentHp < active.maxHp * 0.25 && bench.currentHp > bench.maxHp * 0.5) return true;
  // Switch if frozen and bench is fine
  if (active.status === 'frozen' && bench.currentHp > bench.maxHp * 0.4) return Math.random() < 0.4;
  return false;
}

function doSwitch(team, activeIdx) {
  const old = team[activeIdx];
  switchOut(old);
  const newIdx = activeIdx === 0 ? 1 : 0;
  const next = team[newIdx];
  if (!next.stance) applyStance(next, aiPickStance(next));
  return newIdx;
}

function executeHit(attacker, defender, ability) {
  if (!ability || attacker.currentHp <= 0 || defender.currentHp <= 0) return;

  let stunDebuffs = null;
  if (attacker.status === 'stun') {
    stunDebuffs = {};
    for (const s of ['spd','atk','int','cha']) { const r = Math.floor(attacker.stats[s] / 2); attacker.stats[s] -= r; stunDebuffs[s] = r; }
  }
  const restore = () => { if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v; };

  if (attacker.status === 'frozen' && Math.random() < 0.66) { restore(); return; }
  if (attacker.blindStacks > 0 && Math.random() < attacker.blindStacks * 0.15) { attacker.blindStacks--; restore(); return; }
  if (ability.requiresFrozen && defender.status !== 'frozen') { restore(); return; }

  if (ability.grantWhittle) { attacker.whittleBoost += 4; attacker.stats.atk += 4; ability.currentUses--; restore(); return; }
  if (ability.swerve) { ability.currentUses--; restore(); return; }
  if (ability.heal && ability.healingPrayer) { attacker.healingPrayerPending = true; ability.currentUses--; restore(); return; }
  if (ability.grantDeathLust) { attacker.deathLustTurns = 2; ability.currentUses--; restore(); return; }

  ability.currentUses--;
  const hits = ability.doubleHit ? 2 : 1;

  for (let h = 0; h < hits; h++) {
    if (defender.currentHp <= 0) break;
    if (h > 0 && ability.doubleHit && Math.random() < 0.3) continue;
    if (defender.swerveActive && !ability.heal && !ability.swerve && !ability.grantWhittle) {
      const dc = defender.swerveActive === 'high' ? 1.0 : 0.2;
      if (Math.random() < dc) {
        // Guerilla Fighter: mark for switch
        if (defender.stance?.passive === 'guerillaSwitchOut') defender.makeWaySwitch = true;
        continue;
      }
    }

    let dmg = calcDmg(ability, attacker, defender);
    if (h > 0 && ability.doubleHit) dmg = Math.round(dmg * 1.5);
    if (ability.counterBonus && attacker.damagedThisTurn) dmg = Math.round(dmg * (1 + ability.counterBonus));
    if (attacker.deathLustTurns > 0 && !ability.heal && !ability.grantDeathLust) dmg += 5;
    if (ability.currentHpPct && defender.currentHp > 0) dmg += Math.floor(defender.currentHp * ability.currentHpPct);
    if (defender.status === 'frozen') dmg = Math.round(dmg * 0.8);

    defender.currentHp -= dmg;
    defender.damagedThisTurn = true;

    if (defender.status === 'frozen' && !ability.requiresFrozen) { defender.status = null; defender.statusTurns = 0; }
    if (ability.requiresFrozen && defender.status === 'frozen') { defender.status = null; defender.statusTurns = 0; }
    if (ability.drain) attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + Math.round(dmg * ability.drain));
    if (ability.switchLock) defender.switchLocked = true;

    if (attacker.stance?.passive === 'stunOnHit' && !defender.status && defender.currentHp > 0) {
      if (Math.random() < 0.2 + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) { defender.status = 'stun'; defender.statusTurns = 1; }
    }
    if (!defender.status && defender.currentHp > 0) {
      let fc = ability.freezeChance || 0;
      if (attacker.stance?.passive === 'freezeAll') fc += 0.1;
      fc += Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02;
      if (fc > 0 && Math.random() < fc) { defender.status = 'frozen'; defender.statusTurns = 99; }
    }
    if (ability.blindChance && defender.currentHp > 0) { if (Math.random() < ability.blindChance + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) defender.blindStacks++; }
    if (attacker.stance?.passive === 'blindPerTurn' && defender.currentHp > 0) { if (Math.random() < 0.15 + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) defender.blindStacks++; }
    if (ability.burnChance && defender.currentHp > 0) { if (Math.random() < ability.burnChance + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) defender.burnStacks++; }
    if (ability.boomerang && defender.currentHp > 0) {
      const bm = attacker.stance?.passive === 'boomerangBonus' ? 1.3 : 1.0;
      defender.boomerangHits.push({ damage: Math.round(dmg * 1.0 * bm) });
    }

    // Kill heal
    if (defender.currentHp <= 0 && attacker.stance?.passive === 'killHeal') {
      attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + Math.round(attacker.maxHp * 0.2));
    }
  }
  restore();
}

function tickStatus(b) {
  if (b.stance?.passive === 'regenTick' && b.currentHp > 0 && b.currentHp < b.maxHp) {
    b.currentHp = Math.min(b.maxHp, b.currentHp + Math.max(1, Math.floor(b.maxHp * 0.05)));
  }
  if (b.deathLustTurns > 0) b.deathLustTurns--;
  b.switchLocked = false;
  b.swerveLastTurn = !!b.swerveActive;
  b.swerveActive = false;

  if (b.burnStacks > 0 && b.currentHp > 0) {
    b.currentHp = Math.max(0, b.currentHp - Math.max(1, Math.floor(b.maxHp * 0.04 * b.burnStacks)));
    if (Math.random() < 0.5) b.burnStacks--;
  }
  if (b.boomerangHits.length > 0 && b.currentHp > 0) {
    for (const hit of b.boomerangHits.splice(0)) {
      b.currentHp = Math.max(0, b.currentHp - hit.damage);
      b.damagedThisTurn = true;
      if (b.currentHp <= 0) break;
    }
  }
  if (b.status === 'stun') { b.status = null; b.statusTurns = 0; }
  if (b.defBonusThisTurn) { b.stats.def -= b.defBonusThisTurn; b.defBonusThisTurn = 0; }
  if (b.healingPrayerPending && b.currentHp > 0) {
    b.currentHp = Math.min(b.maxHp, b.currentHp + Math.round(b.maxHp * 0.25));
    b.status = null; b.statusTurns = 0; b.blindStacks = 0; b.burnStacks = 0;
    b.healingPrayerPending = false;
  }
}

function teamAlive(team) { return team.some(b => b.currentHp > 0 && !b.fainted); }

function simulate2v2(team1Classes, team2Classes) {
  const t1 = team1Classes.map(c => createCombatant(c));
  const t2 = team2Classes.map(c => createCombatant(c));
  let a1 = 0, a2 = 0; // active indices

  // Apply stances to leads
  applyStance(t1[a1], aiPickStance(t1[a1]));
  applyStance(t2[a2], aiPickStance(t2[a2]));

  // Flashy Arrival
  if (t1[a1].stance.passive === 'flashyBlind') t2[a2].blindStacks += 2;
  if (t2[a2].stance.passive === 'flashyBlind') t1[a1].blindStacks += 2;

  for (let turn = 0; turn < 150; turn++) {
    const p = t1[a1], o = t2[a2];
    if (p.currentHp <= 0 || o.currentHp <= 0) break;

    p.damagedThisTurn = false;
    o.damagedThisTurn = false;

    // Check if AI wants to switch
    const pBench = t1.find((b, i) => i !== a1 && b.currentHp > 0);
    const oBench = t2.find((b, i) => i !== a2 && b.currentHp > 0);
    let pSwitching = shouldSwitch(p, pBench, o);
    let oSwitching = shouldSwitch(o, oBench, p);

    if (pSwitching) {
      switchOut(p);
      a1 = t1.indexOf(pBench);
      if (!t1[a1].stance) applyStance(t1[a1], aiPickStance(t1[a1]));
      if (t1[a1].stance.passive === 'flashyBlind') o.blindStacks += 2;
    }
    if (oSwitching) {
      switchOut(o);
      a2 = t2.indexOf(oBench);
      if (!t2[a2].stance) applyStance(t2[a2], aiPickStance(t2[a2]));
      if (t2[a2].stance.passive === 'flashyBlind') t1[a1].blindStacks += 2;
    }

    const pa = t1[a1], oa = t2[a2];
    if (pSwitching || oSwitching) { /* switching turn, skip combat */ }
    else {
      const pMove = aiPickMove(pa, oa);
      const oMove = aiPickMove(oa, pa);

      let pInit = getInit(pa), oInit = getInit(oa);
      if (pMove.counterMove) pInit = Math.floor(pInit * 0.5);
      if (oMove.counterMove) oInit = Math.floor(oInit * 0.5);
      if (pMove.swerve) { pInit = Math.floor(pInit * 1.5); pa.swerveActive = !pa.swerveLastTurn ? 'high' : 'low'; }
      if (oMove.swerve) { oInit = Math.floor(oInit * 1.5); oa.swerveActive = !oa.swerveLastTurn ? 'high' : 'low'; }

      const [first, second, fMove, sMove] = pInit >= oInit ? [pa, oa, pMove, oMove] : [oa, pa, oMove, pMove];
      executeHit(first, second, fMove);
      if (second.currentHp > 0) executeHit(second, first, sMove);
    }

    // Tick all active
    tickStatus(t1[a1]);
    tickStatus(t2[a2]);

    // Handle faints
    if (t1[a1].currentHp <= 0) {
      t1[a1].fainted = true;
      const next1 = t1.findIndex((b, i) => i !== a1 && b.currentHp > 0);
      if (next1 === -1) return team2Classes.map(c => c.id).join('+');
      a1 = next1;
      if (!t1[a1].stance) applyStance(t1[a1], aiPickStance(t1[a1]));
      if (t1[a1].stance.passive === 'flashyBlind') t2[a2].blindStacks += 2;
    }
    if (t2[a2].currentHp <= 0) {
      t2[a2].fainted = true;
      const next2 = t2.findIndex((b, i) => i !== a2 && b.currentHp > 0);
      if (next2 === -1) return team1Classes.map(c => c.id).join('+');
      a2 = next2;
      if (!t2[a2].stance) applyStance(t2[a2], aiPickStance(t2[a2]));
      if (t2[a2].stance.passive === 'flashyBlind') t1[a1].blindStacks += 2;
    }

    // Guerilla Fighter switch-out
    for (const [team, aIdx, setIdx] of [[t1, a1, v => a1 = v], [t2, a2, v => a2 = v]]) {
      const active = team[aIdx];
      if (active.makeWaySwitch && active.currentHp > 0) {
        const bench = team.findIndex((b, i) => i !== aIdx && b.currentHp > 0);
        if (bench !== -1) {
          switchOut(active);
          active.makeWaySwitch = false;
          setIdx(bench);
          if (!team[bench].stance) applyStance(team[bench], aiPickStance(team[bench]));
        } else {
          active.makeWaySwitch = false;
        }
      }
    }

    if (!teamAlive(t1)) return team2Classes.map(c => c.id).join('+');
    if (!teamAlive(t2)) return team1Classes.map(c => c.id).join('+');
  }
  return 'draw';
}

// Generate all 2-character teams from 4 characters
const N = 2000;
const teams = [];
for (let i = 0; i < CLASSES.length; i++) {
  for (let j = i + 1; j < CLASSES.length; j++) {
    teams.push([CLASSES[i], CLASSES[j]]);
  }
}

// Test all team matchups
for (let i = 0; i < teams.length; i++) {
  for (let j = i + 1; j < teams.length; j++) {
    const t1 = teams[i], t2 = teams[j];
    const t1Name = t1.map(c => c.label).join('+');
    const t2Name = t2.map(c => c.label).join('+');
    const t1Key = t1.map(c => c.id).join('+');
    const t2Key = t2.map(c => c.id).join('+');
    const results = { [t1Key]: 0, [t2Key]: 0, draw: 0 };

    for (let k = 0; k < N; k++) {
      const winner = simulate2v2(t1, t2);
      results[winner] = (results[winner] || 0) + 1;
    }

    const p1 = (results[t1Key] / N * 100).toFixed(1);
    const p2 = (results[t2Key] / N * 100).toFixed(1);
    const dr = (results.draw / N * 100).toFixed(1);
    console.log(`${t1Name} vs ${t2Name}: ${p1}% | ${p2}% | ${dr}% draw`);
  }
}
