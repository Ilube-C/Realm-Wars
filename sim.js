// Headless 1v1 battle simulator for Realm Wars
// Extracts core mechanics from index.html

function d(n) { return Math.floor(Math.random() * n) + 1; }
function rollDice(count, sides) { let t = 0; for (let i = 0; i < count; i++) t += d(sides); return t; }

const ABILITIES = {
  lichBlast:    { name:'Lich Blast',      dmgType:'magical',  stat:'int', fixed:8,  dice:[2,6],  uses:14, freezeChance:0.2 },
  glaciate:     { name:'Glaciate',        dmgType:'magical',  stat:'int', fixed:5,  dice:[1,4],  uses:16, freezeChance:0.6 },
  lichLifeDrain:{ name:'Life Drain',      dmgType:'soul',     stat:'int', fixed:6,  dice:[1,6],  uses:8,  drain:0.5 },
  shatter:      { name:'Shatter',         dmgType:'physical', stat:'atk', fixed:16, dice:[2,8],  uses:6,  requiresFrozen:true },
  tumpUp:       { name:'Tump Up',         dmgType:'physical', stat:'atk', fixed:6,  dice:[1,6],  uses:10, multiHit:2, secondHitMult:1.5 },
  counterThrow: { name:'Counter Throw',   dmgType:'physical', stat:'atk', fixed:6,  dice:[2,6],  uses:10, halveInit:true, counterBonus:0.5 },
  subdue:       { name:'Subdue',          dmgType:'physical', stat:'atk', fixed:12, dice:[1,6],  uses:8,  switchLock:true },
  deathLust:    { name:'Death Lust',      dmgType:'physical', stat:'atk', fixed:6,  dice:[1,4],  uses:4,  grantDeathLust:true },
  radialStrike: { name:'Radial Strike',   dmgType:'physical', stat:'atk', fixed:9,  dice:[1,6],  uses:16, blindChance:0.4 },
  makeWay:      { name:'Make Way',        dmgType:'physical', stat:'atk', fixed:5,  dice:[1,4],  uses:6,  makeWay:true },
  heavenlyBlow: { name:'Heavenly Blow',   dmgType:'physical', stat:'atk', fixed:8,  dice:[1,8],  uses:10, splitDamage:true },
  healingPrayer:{ name:'Healing Prayer',  dmgType:'heal',     stat:'cha', fixed:0,  dice:[1,1],  uses:4,  healingPrayer:true, heal:true },
};

const CLASSES = [
  { id:'sirShining', label:'Paladin', stats:{atk:14,spd:10,con:15,int:12,def:17,cha:16},
    abilities:['radialStrike','makeWay','heavenlyBlow','healingPrayer'],
    stances: [
      { id:'battlefieldStar', name:'Battlefield Star', statBoosts:{cha:2}, passive:'blindPerTurn' },
      { id:'flashyArrival', name:'Flashy Arrival', statBoosts:{def:2}, passive:'flashyBlind' },
    ]},
  { id:'pitDweller', label:'Berserker', stats:{atk:17,spd:9,con:16,int:6,def:12,cha:8},
    abilities:['tumpUp','counterThrow','subdue','deathLust'],
    stances: [
      { id:'dirtyBoxing', name:'Dirty Boxing', statBoosts:{con:2}, passive:'stunOnHit' },
      { id:'pitVeteran', name:'Pit Veteran', statBoosts:{def:2}, passive:'regenTick' },
    ]},
  { id:'lich', label:'Mage', stats:{atk:6,spd:10,con:12,int:19,def:14,cha:14},
    abilities:['lichBlast','glaciate','lichLifeDrain','shatter'],
    stances: [
      { id:'arcticAura', name:'Arctic Aura', statBoosts:{con:2,cha:2}, passive:'freezeAll' },
      { id:'soulSnatcher', name:'Soul Snatcher', statBoosts:{int:3}, passive:'killHeal' },
    ]},
];

const level = 8;

function createCombatant(cls) {
  const stats = {...cls.stats};
  const hp = 20 + cls.stats.con * level * 0.5;
  const abilities = cls.abilities.map(id => ({...ABILITIES[id], id, currentUses: ABILITIES[id].uses}));
  return {
    cls, name: cls.label, stats, baseStats: {...stats},
    maxHp: hp, currentHp: hp, level,
    abilities,
    stances: cls.stances,
    stance: null,
    status: null, statusTurns: 0,
    switchLocked: false, deathLustTurns: 0, damagedThisTurn: false,
    blindStacks: 0, healingPrayerPending: false, makeWaySwitch: false, defBonusThisTurn: 0,
    fainted: false,
  };
}

function applyStance(b, stance) {
  b.stance = stance;
  if (stance.statBoosts) {
    for (const [stat, val] of Object.entries(stance.statBoosts)) {
      b.stats[stat] += val;
    }
  }
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
    const physHalf = raw / 2;
    const magHalf = raw / 2;
    const physMult = 0.5 + 0.5 * (rollDice(2,6) + attacker.stats.atk) / (rollDice(2,6) + defender.stats.def);
    const magMult = 0.5 + 0.5 * (rollDice(2,6) + attacker.stats.int) / (rollDice(2,6) + defender.stats.int);
    return Math.max(1, Math.round(physHalf * physMult + magHalf * magMult));
  }

  let atkStat, defStat;
  if (ability.dmgType === 'physical') { atkStat = attacker.stats.atk; defStat = defender.stats.def; }
  else { atkStat = attacker.stats.int; defStat = defender.stats.int; }

  const mult = 0.5 + 0.5 * (rollDice(2,6) + atkStat) / (rollDice(2,6) + defStat);
  return Math.max(1, Math.round(raw * mult));
}

function aiPickStance(b) {
  return b.stances[Math.floor(Math.random() * b.stances.length)];
}

function aiPickMove(attacker, defender) {
  const available = attacker.abilities.filter(a => {
    if (a.currentUses <= 0) return false;
    if (a.requiresFrozen && defender.status !== 'frozen') return false;
    if (a.makeWay) return false; // skip in 1v1
    return true;
  });
  if (available.length === 0) return null;

  // Simple AI: weighted random by estimated damage
  const weights = available.map(a => {
    if (a.heal) return attacker.currentHp < attacker.maxHp * 0.5 ? 30 : 5;
    if (a.grantDeathLust) return attacker.deathLustTurns > 0 ? 0 : 15;
    let avg = a.fixed + a.dice[0] * (a.dice[1] + 1) / 2;
    if (a.multiHit) avg *= 1.8;
    if (a.counterBonus && attacker.damagedThisTurn) avg *= 1.5;
    if (a.requiresFrozen) avg *= 1.3; // bonus for shatter opportunity
    return avg;
  });

  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < available.length; i++) {
    r -= weights[i];
    if (r <= 0) return available[i];
  }
  return available[available.length - 1];
}

function simulateBattle(cls1, cls2) {
  const a = createCombatant(cls1);
  const b = createCombatant(cls2);

  applyStance(a, aiPickStance(a));
  applyStance(b, aiPickStance(b));

  // Flashy Arrival
  if (a.stance.passive === 'flashyBlind') b.blindStacks += 2;
  if (b.stance.passive === 'flashyBlind') a.blindStacks += 2;

  let turns = 0;
  const maxTurns = 100;

  while (a.currentHp > 0 && b.currentHp > 0 && turns < maxTurns) {
    turns++;
    a.damagedThisTurn = false;
    b.damagedThisTurn = false;

    let aInit = getInitiative(a);
    let bInit = getInitiative(b);

    const aMove = aiPickMove(a, b);
    const bMove = aiPickMove(b, a);
    if (!aMove && !bMove) break;

    if (aMove && aMove.halveInit) aInit = Math.floor(aInit * 0.5);
    if (bMove && bMove.halveInit) bInit = Math.floor(bInit * 0.5);

    if (aMove && aMove.makeWay) { aInit = Math.floor(aInit * 2.0); a.defBonusThisTurn = 5; a.stats.def += 5; }
    if (bMove && bMove.makeWay) { bInit = Math.floor(bInit * 2.0); b.defBonusThisTurn = 5; b.stats.def += 5; }

    const first = aInit >= bInit ? a : b;
    const second = aInit >= bInit ? b : a;
    const firstMove = aInit >= bInit ? aMove : bMove;
    const secondMove = aInit >= bInit ? bMove : aMove;

    // Execute attacks
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

      // Frozen check
      if (attacker.status === 'frozen') {
        attacker.stats.spd = Math.floor(attacker.stats.spd * 0.4);
        if (Math.random() < 0.66) {
          // Can't act
          if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
          attacker.stats.spd = attacker.baseStats.spd + (attacker.stance?.statBoosts?.spd || 0);
          return;
        }
      }

      // Blind miss check
      if (attacker.blindStacks > 0) {
        const missChance = attacker.blindStacks * 0.15;
        if (Math.random() < missChance) {
          attacker.blindStacks--;
          if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
          if (attacker.status === 'frozen') attacker.stats.spd = attacker.baseStats.spd + (attacker.stance?.statBoosts?.spd || 0);
          return; // miss
        }
      }

      // Shatter requires frozen
      if (ability.requiresFrozen && defender.status !== 'frozen') {
        if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
        if (attacker.status === 'frozen') attacker.stats.spd = attacker.baseStats.spd + (attacker.stance?.statBoosts?.spd || 0);
        return;
      }

      ability.currentUses--;

      if (ability.heal && ability.healingPrayer) {
        attacker.healingPrayerPending = true;
        if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
        if (attacker.status === 'frozen') attacker.stats.spd = attacker.baseStats.spd + (attacker.stance?.statBoosts?.spd || 0);
        return;
      }

      if (ability.grantDeathLust) {
        attacker.deathLustTurns = 3;
        if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
        if (attacker.status === 'frozen') attacker.stats.spd = attacker.baseStats.spd + (attacker.stance?.statBoosts?.spd || 0);
        return;
      }

      const hits = ability.multiHit || 1;
      for (let h = 0; h < hits; h++) {
        if (defender.currentHp <= 0) break;

        let dmg = calcDamage(ability, attacker, defender);
        if (h > 0 && ability.secondHitMult) dmg = Math.round(dmg * ability.secondHitMult);

        // Counter bonus
        if (ability.counterBonus && attacker.damagedThisTurn) {
          dmg = Math.round(dmg * (1 + ability.counterBonus));
        }

        // Death Lust soul bonus
        if (attacker.deathLustTurns > 0 && !ability.heal && !ability.grantDeathLust) {
          dmg += 5; // flat soul bonus
        }

        // Frozen damage reduction
        if (defender.status === 'frozen') {
          dmg = Math.round(dmg * 0.8);
        }

        defender.currentHp -= dmg;
        defender.damagedThisTurn = true;

        // Thaw on damage
        if (defender.status === 'frozen' && !ability.requiresFrozen) {
          defender.status = null; defender.statusTurns = 0;
        }

        // Shatter unfreezes
        if (ability.requiresFrozen && defender.status === 'frozen') {
          defender.status = null; defender.statusTurns = 0;
        }

        // Drain
        if (ability.drain) {
          attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + Math.round(dmg * ability.drain));
        }

        // Switch lock
        if (ability.switchLock) defender.switchLocked = true;

        // Dirty Boxing stun
        if (attacker.stance?.passive === 'stunOnHit' && !defender.status && defender.currentHp > 0) {
          const stunChance = 0.2 + (attacker.stats.cha / 200);
          if (Math.random() < stunChance) {
            defender.status = 'stun'; defender.statusTurns = 1;
          }
        }

        // Freeze chance
        if (!defender.status && defender.currentHp > 0) {
          let freezeChance = ability.freezeChance || 0;
          if (attacker.stance?.passive === 'freezeAll') freezeChance += 0.1;
          freezeChance += (attacker.stats.cha / 200);
          if (freezeChance > 0 && Math.random() < freezeChance) {
            defender.status = 'frozen'; defender.statusTurns = 99;
          }
        }

        // Blind chance from ability
        if (ability.blindChance && defender.currentHp > 0) {
          if (Math.random() < ability.blindChance + (attacker.stats.cha / 200)) {
            defender.blindStacks++;
          }
        }

        // Battlefield Star blind
        if (attacker.stance?.passive === 'blindPerTurn' && defender.currentHp > 0) {
          const bsChance = 0.15 + (attacker.stats.cha / 200);
          if (Math.random() < bsChance) {
            defender.blindStacks++;
          }
        }
      }

      // Restore stun debuffs
      if (stunDebuffs) for (const [s,v] of Object.entries(stunDebuffs)) attacker.stats[s] += v;
      if (attacker.status === 'frozen') attacker.stats.spd = attacker.baseStats.spd + (attacker.stance?.statBoosts?.spd || 0);
    }

    executeHit(first, second, firstMove);
    executeHit(second, first, secondMove);

    // End of turn effects

    // Healing Prayer resolves
    [a, b].forEach(fighter => {
      if (fighter.healingPrayerPending && fighter.currentHp > 0) {
        const heal = Math.round(fighter.maxHp * 0.3);
        fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + heal);
        fighter.status = null; fighter.statusTurns = 0; fighter.blindStacks = 0;
        fighter.healingPrayerPending = false;
      }
    });

    // Pit Veteran regen
    [a, b].forEach(fighter => {
      if (fighter.stance?.passive === 'regenTick' && fighter.currentHp > 0) {
        const regen = Math.round(fighter.maxHp * 0.05);
        fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + regen);
      }
    });

    // Status tick
    [a, b].forEach(fighter => {
      if (fighter.status === 'stun') { fighter.status = null; fighter.statusTurns = 0; }
      if (fighter.deathLustTurns > 0) { fighter.deathLustTurns--; }
      fighter.switchLocked = false;
      fighter.defBonusThisTurn && (fighter.stats.def -= fighter.defBonusThisTurn, fighter.defBonusThisTurn = 0);
    });
  }

  if (a.currentHp > 0 && b.currentHp <= 0) return cls1.id;
  if (b.currentHp > 0 && a.currentHp <= 0) return cls2.id;
  return 'draw';
}

// Run simulations
const N = 2000;
const matchups = [
  ['sirShining', 'pitDweller'],
  ['sirShining', 'lich'],
  ['pitDweller', 'lich'],
];

for (const [id1, id2] of matchups) {
  const cls1 = CLASSES.find(c => c.id === id1);
  const cls2 = CLASSES.find(c => c.id === id2);
  const results = { [id1]: 0, [id2]: 0, draw: 0 };

  for (let i = 0; i < N; i++) {
    const winner = simulateBattle(cls1, cls2);
    results[winner]++;
  }

  const pct1 = (results[id1] / N * 100).toFixed(1);
  const pct2 = (results[id2] / N * 100).toFixed(1);
  const pctD = (results.draw / N * 100).toFixed(1);
  console.log(`${cls1.label} vs ${cls2.label}: ${cls1.label} ${pct1}% | ${cls2.label} ${pct2}% | Draw ${pctD}%`);
}
