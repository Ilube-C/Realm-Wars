// Headless 1v1 battle simulator for Realm Wars
function d(n) { return Math.floor(Math.random() * n) + 1; }
function rollDice(count, sides) { let t = 0; for (let i = 0; i < count; i++) t += d(sides); return t; }

const STAT_BUDGET = 72, STAT_FLOOR = 5, STAT_CAP = 20;
const STAT_NAMES = ['atk','def','con','int','cha','spd'];

function generateStats(cls) {
  if (cls.stats) return {...cls.stats};
  const weights = cls.statWeights;
  const stats = {};
  STAT_NAMES.forEach(s => stats[s] = STAT_FLOOR);
  let pool = STAT_BUDGET - STAT_FLOOR * STAT_NAMES.length;
  const totalWeight = STAT_NAMES.reduce((sum, s) => sum + (weights[s] || 1), 0);
  while (pool > 0) {
    let r = Math.random() * totalWeight;
    for (const s of STAT_NAMES) {
      r -= (weights[s] || 1);
      if (r <= 0) { if (stats[s] < STAT_CAP) { stats[s]++; pool--; } break; }
    }
  }
  return stats;
}

const ABILITIES = {
  lichBlast:    { name:'Lich Blast',      dmgType:'magical',  stat:'int', fixed:8,  dice:[2,6],  uses:14, freezeChance:0.2 },
  glaciate:     { name:'Glaciate',        dmgType:'magical',  stat:'int', fixed:5,  dice:[1,4],  uses:16, freezeChance:0.6 },
  lichLifeDrain:{ name:'Life Drain',      dmgType:'soul',     stat:'int', fixed:7,  dice:[1,8],  uses:10, drain:0.5 },
  shatter:{name:'Shatter',dmgType:'soul',stat:'int',fixed:18,dice:[2,6],uses:6,requiresFrozen:true},
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
  { id:'sirShining', label:'Paladin',
    statWeights:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},
    abilities:['radialStrike','makeWay','heavenlyBlow','healingPrayer'],
    stances: [
      { id:'battlefieldStar', statBoosts:{cha:2}, passive:'blindPerTurn' },
      { id:'flashyArrival', statBoosts:{def:2}, passive:'flashyBlind' },
    ]},
  { id:'pitDweller', label:'Berserker',
    statWeights:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},
    abilities:['tumpUp','counterThrow','subdue','deathLust'],
    stances: [
      { id:'dirtyBoxing', statBoosts:{con:2}, passive:'stunOnHit' },
      { id:'pitVeteran', statBoosts:{def:2}, passive:'regenTick' },
    ]},
  { id:'lich', label:'Mage',
    statWeights:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},
    abilities:['lichBlast','glaciate','lichLifeDrain','shatter'],
    stances: [
      { id:'arcticAura', statBoosts:{con:2,cha:2}, passive:'freezeAll' },
      { id:'soulSnatcher', statBoosts:{int:3}, passive:'attackLifesteal' },
    ]},
  { id:'rexRang', label:'Ranger',
    statWeights:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},
    abilities:['battlerang','emberang','whittle','swerve'],
    stances: [
      { id:'patientKiller', statBoosts:{atk:2}, passive:'boomerangBonus' },
      { id:'guerillaFighter', statBoosts:{spd:2}, passive:'guerillaSwitchOut' },
    ]},
];

const level = 8;

function createCombatant(cls) {
  const stats = generateStats(cls);
  const hp = 20 + stats.con * level * 0.5;
  const abilities = cls.abilities.map(id => ({...ABILITIES[id], id, currentUses: ABILITIES[id].uses}));
  return {
    cls, name: cls.label, stats, baseStats: {...stats},
    maxHp: hp, currentHp: hp, level,
    abilities, stances: cls.stances, stance: null,
    status: null, statusTurns: 0, fainted: false,
    switchLocked: false, deathLustTurns: 0, damagedThisTurn: false,
    blindStacks: 0, healingPrayerPending: false, makeWaySwitch: false, defBonusThisTurn: 0,
    boomerangHits: [], burnStacks: 0, swerveActive: false, swerveLastTurn: false, whittleBoost: 0,
  };
}

function applyStance(b, stance) {
  b.stance = stance;
  if (stance.statBoosts) for (const [stat, val] of Object.entries(stance.statBoosts)) b.stats[stat] += val;
}

function getInitiative(c) {
  const base = rollDice(2, 8) + c.stats.spd;
  if (c.status === 'frozen') return Math.floor(base * 0.4);
  if (c.status === 'stun') return Math.floor(base * 0.5);
  return base;
}

function calcDamage(ability, attacker, defender) {
  const fixed = ability.fixed;
  const dice = rollDice(ability.dice[0], ability.dice[1]);
  const raw = fixed + dice;
  if (ability.dmgType === 'soul') return raw;
  if (ability.heal) return 0;
  if (ability.splitDamage) {
    const physMult = 0.5 + 0.5 * (rollDice(2,6) + attacker.stats.atk) / (rollDice(2,6) + defender.stats.def);
    const magMult = 0.5 + 0.5 * (rollDice(2,6) + attacker.stats.int) / (rollDice(2,6) + defender.stats.int);
    return Math.max(1, Math.round(raw/2 * physMult + raw/2 * magMult));
  }
  let atkStat, defStat;
  atkStat = attacker.stats[ability.stat] || attacker.stats.atk;
  if (ability.dmgType === 'physical') { defStat = defender.stats.def; }
  else { defStat = defender.stats.int; }
  const mult = 0.5 + 0.5 * (rollDice(2,6) + atkStat) / (rollDice(2,6) + defStat);
  return Math.max(1, Math.round(raw * mult));
}

function aiPickStance(b) { return b.stances[Math.floor(Math.random() * b.stances.length)]; }

function aiPickMove(attacker, defender) {
  const available = attacker.abilities.filter(a => {
    if (a.currentUses <= 0) return false;
    if (a.requiresFrozen && defender.status !== 'frozen') return false;
    if (a.makeWay) return false;
    if (a.grantWhittle && attacker.whittleBoost >= 8) return false;
    return true;
  });
  if (available.length === 0) return null;
  const weights = available.map(a => {
    if (a.heal) return attacker.currentHp < attacker.maxHp * 0.5 ? 30 : 5;
    if (a.grantDeathLust) return attacker.deathLustTurns > 0 ? 0 : 15;
    if (a.swerve) return attacker.swerveLastTurn ? 5 : 18;
    if (a.grantWhittle) return attacker.whittleBoost === 0 ? 22 : 12;
    let avg = a.fixed + a.dice[0] * (a.dice[1] + 1) / 2;
    if (a.doubleHit) avg *= 1.8;
    if (a.counterBonus && attacker.damagedThisTurn) avg *= 1.75;
    if (a.requiresFrozen) { avg += (a.currentHpPct || 0) * 60; avg *= 1.3; }
    if (a.boomerang) avg *= 1.4;
    return avg;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < available.length; i++) { r -= weights[i]; if (r <= 0) return available[i]; }
  return available[available.length - 1];
}

function simulateBattle(cls1, cls2) {
  const a = createCombatant(cls1);
  const b = createCombatant(cls2);
  applyStance(a, aiPickStance(a));
  applyStance(b, aiPickStance(b));
  if (a.stance.passive === 'flashyBlind') b.blindStacks += 2;
  if (b.stance.passive === 'flashyBlind') a.blindStacks += 2;

  let turns = 0;
  while (a.currentHp > 0 && b.currentHp > 0 && turns < 100) {
    turns++;
    a.damagedThisTurn = false;
    b.damagedThisTurn = false;

    const aMove = aiPickMove(a, b);
    const bMove = aiPickMove(b, a);
    if (!aMove && !bMove) break;

    let aInit = getInitiative(a);
    let bInit = getInitiative(b);
    if (aMove?.counterMove) aInit = Math.floor(aInit * 0.5);
    if (bMove?.counterMove) bInit = Math.floor(bInit * 0.5);
    if (aMove?.makeWay) { aInit *= 2; a.defBonusThisTurn = 5; a.stats.def += 5; }
    if (bMove?.makeWay) { bInit *= 2; b.defBonusThisTurn = 5; b.stats.def += 5; }
    if (aMove?.swerve) { aInit = Math.floor(aInit * 1.5); a.swerveActive = !a.swerveLastTurn ? 'high' : 'low'; }
    if (bMove?.swerve) { bInit = Math.floor(bInit * 1.5); b.swerveActive = !b.swerveLastTurn ? 'high' : 'low'; }

    const first = aInit >= bInit ? a : b;
    const second = aInit >= bInit ? b : a;
    const firstMove = aInit >= bInit ? aMove : bMove;
    const secondMove = aInit >= bInit ? bMove : aMove;

    function executeHit(attacker, defender, ability) {
      if (!ability || attacker.currentHp <= 0 || defender.currentHp <= 0) return;

      // Stun debuff
      let stunDebuffs = null;
      if (attacker.status === 'stun') {
        stunDebuffs = {};
        for (const stat of ['spd','atk','int','cha']) {
          const reduction = Math.floor(attacker.stats[stat] / 2);
          attacker.stats[stat] -= reduction;
          stunDebuffs[stat] = reduction;
        }
      }

      const restoreStats = () => {
        if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
      };

      // Frozen check
      if (attacker.status === 'frozen') {
        if (Math.random() < 0.66) { restoreStats(); return; }
      }

      // Blind miss check
      if (attacker.blindStacks > 0) {
        if (Math.random() < attacker.blindStacks * 0.15) {
          attacker.blindStacks--;
          restoreStats();
          return;
        }
      }

      if (ability.requiresFrozen && defender.status !== 'frozen') { restoreStats(); return; }

      // Whittle
      if (ability.grantWhittle) {
        attacker.whittleBoost += 4;
        attacker.stats.atk += 4;
        ability.currentUses--;
        restoreStats();
        return;
      }

      // Swerve - no damage
      if (ability.swerve) { ability.currentUses--; restoreStats(); return; }

      // Healing Prayer
      if (ability.heal && ability.healingPrayer) {
        attacker.healingPrayerPending = true;
        ability.currentUses--;
        restoreStats();
        return;
      }

      // Death Lust
      if (ability.grantDeathLust) {
        attacker.deathLustTurns = 2;
        ability.currentUses--;
        restoreStats();
        return;
      }

      ability.currentUses--;

      const hits = ability.doubleHit ? 2 : 1;
      for (let h = 0; h < hits; h++) {
        if (defender.currentHp <= 0) break;

        // Tump Up second hit 30% miss
        if (h > 0 && ability.doubleHit && Math.random() < 0.3) continue;

        // Swerve dodge check
        if (defender.swerveActive && !ability.heal && !ability.swerve && !ability.grantWhittle) {
          const dodgeChance = defender.swerveActive === 'high' ? 1.0 : 0.2;
          if (Math.random() < dodgeChance) continue;
        }

        let dmg = calcDamage(ability, attacker, defender);
        if (h > 0 && ability.doubleHit) dmg = Math.round(dmg * 1.5);

        // Counter bonus
        if (ability.counterBonus && attacker.damagedThisTurn) dmg = Math.round(dmg * (1 + ability.counterBonus));

        // Death Lust soul bonus
        if (attacker.deathLustTurns > 0 && !ability.heal && !ability.grantDeathLust) dmg += 5;

        // Frozen damage reduction

        defender.currentHp -= dmg;
        defender.damagedThisTurn = true;
        if (attacker.stance?.passive === 'attackLifesteal' && dmg > 0) attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + Math.max(1, Math.floor(dmg * 0.15)));

        // Thaw on damage
        if (defender.status === 'frozen' && !ability.requiresFrozen) {
          defender.status = null; defender.statusTurns = 0;
        }
        if (ability.requiresFrozen && defender.status === 'frozen') {
          defender.status = null; defender.statusTurns = 0;
        }

        // Drain
        if (ability.drain) attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + Math.round(dmg * ability.drain));

        // Switch lock
        if (ability.switchLock) defender.switchLocked = true;

        // Dirty Boxing stun
        if (attacker.stance?.passive === 'stunOnHit' && !defender.status && defender.currentHp > 0) {
          if (Math.random() < 0.2 + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) {
            defender.status = 'stun'; defender.statusTurns = 1;
          }
        }

        // Freeze chance
        if (!defender.status && defender.currentHp > 0) {
          let freezeChance = ability.freezeChance || 0;
          if (attacker.stance?.passive === 'freezeAll') freezeChance += 0.1;
          freezeChance += Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02;
          if (freezeChance > 0 && Math.random() < freezeChance) {
            defender.status = 'frozen'; defender.statusTurns = 99;
          }
        }

        // Blind chance
        if (ability.blindChance && defender.currentHp > 0) {
          if (Math.random() < ability.blindChance + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) defender.blindStacks++;
        }
        if (attacker.stance?.passive === 'blindPerTurn' && defender.currentHp > 0) {
          if (Math.random() < 0.15 + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) defender.blindStacks++;
        }

        // Burn chance
        if (ability.burnChance && defender.currentHp > 0) {
          if (Math.random() < ability.burnChance + Math.max(0, (attacker.stats.cha - defender.stats.cha)) * 0.02) defender.burnStacks++;
        }

        // Boomerang
        if (ability.boomerang && defender.currentHp > 0) {
          const bonusMult = attacker.stance?.passive === 'boomerangBonus' ? 1.3 : 1.0;
          defender.boomerangHits.push({ damage: Math.round(dmg * 1.0 * bonusMult), source: attacker.name });
        }
      }

      restoreStats();
    }

    executeHit(first, second, firstMove);
    executeHit(second, first, secondMove);

    // End of turn
    for (const fighter of [a, b]) {
      // Healing Prayer
      if (fighter.healingPrayerPending && fighter.currentHp > 0) {
        fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + Math.round(fighter.maxHp * 0.25));
        fighter.status = null; fighter.statusTurns = 0; fighter.blindStacks = 0; fighter.burnStacks = 0;
        fighter.healingPrayerPending = false;
      }
      // Regen
      if (fighter.stance?.passive === 'regenTick' && fighter.currentHp > 0) {
        fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + Math.round(fighter.maxHp * 0.05));
      }
      // Burn tick
      if (fighter.burnStacks > 0 && fighter.currentHp > 0) {
        const burnDmg = Math.max(1, Math.floor(fighter.maxHp * 0.04 * fighter.burnStacks));
        fighter.currentHp = Math.max(0, fighter.currentHp - burnDmg);
        if (Math.random() < 0.5) fighter.burnStacks--;
        if (fighter.currentHp <= 0) fighter.fainted = true;
      }
      // Boomerang hits
      if (fighter.boomerangHits.length > 0 && fighter.currentHp > 0) {
        for (const hit of fighter.boomerangHits.splice(0)) {
          fighter.currentHp = Math.max(0, fighter.currentHp - hit.damage);
          fighter.damagedThisTurn = true;
          if (fighter.currentHp <= 0) { fighter.fainted = true; break; }
        }
      }
      // Status tick
      if (fighter.status === 'stun') { fighter.status = null; fighter.statusTurns = 0; }
      if (fighter.deathLustTurns > 0) fighter.deathLustTurns--;
      fighter.switchLocked = false;
      fighter.swerveLastTurn = !!fighter.swerveActive;
      fighter.swerveActive = false;
      if (fighter.defBonusThisTurn) { fighter.stats.def -= fighter.defBonusThisTurn; fighter.defBonusThisTurn = 0; }
    }

    if (a.currentHp <= 0 || b.currentHp <= 0) break;
  }

  if (a.currentHp > 0 && b.currentHp <= 0) return cls1.id;
  if (b.currentHp > 0 && a.currentHp <= 0) return cls2.id;
  return 'draw';
}

const N = 2000;
const ids = CLASSES.map(c => c.id);
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    const cls1 = CLASSES[i], cls2 = CLASSES[j];
    const results = { [cls1.id]: 0, [cls2.id]: 0, draw: 0 };
    for (let k = 0; k < N; k++) results[simulateBattle(cls1, cls2)]++;
    console.log(`${cls1.label} vs ${cls2.label}: ${cls1.label} ${(results[cls1.id]/N*100).toFixed(1)}% | ${cls2.label} ${(results[cls2.id]/N*100).toFixed(1)}% | Draw ${(results.draw/N*100).toFixed(1)}%`);
  }
}
