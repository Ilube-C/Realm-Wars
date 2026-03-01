// Q6: Is Arctic Aura Lich → Glaciate until freeze → switch to Paladin good vs Berserker?
// Q7: Is Guerilla Fighter worth using for Ranger?

// Import core from sim2v2 (copy the functions we need)
function d(n) { return Math.floor(Math.random() * n) + 1; }
function rollDice(c, s) { let t = 0; for (let i = 0; i < c; i++) t += d(s); return t; }
const STAT_BUDGET=72,STAT_FLOOR=5,STAT_CAP=20,STAT_NAMES=['atk','def','con','int','cha','spd'];
function generateStats(cls){if(cls.stats)return{...cls.stats};const w=cls.statWeights;const s={};STAT_NAMES.forEach(n=>s[n]=STAT_FLOOR);let p=STAT_BUDGET-30;const tw=STAT_NAMES.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of STAT_NAMES){r-=(w[n]||1);if(r<=0){if(s[n]<STAT_CAP){s[n]++;p--;}break;}}}return s;}

const ABILITIES={lichBlast:{name:'Lich Blast',dmgType:'magical',stat:'int',fixed:8,dice:[2,6],uses:14,freezeChance:0.2},glaciate:{name:'Glaciate',dmgType:'magical',stat:'int',fixed:5,dice:[1,4],uses:16,freezeChance:0.6},lichLifeDrain:{name:'Life Drain',dmgType:'soul',stat:'int',fixed:7,dice:[1,8],uses:10,drain:0.5},shatter:{name:'Shatter',dmgType:'physical',stat:'atk',fixed:22,dice:[2,8],uses:6,requiresFrozen:true},tumpUp:{name:'Tump Up',dmgType:'physical',stat:'atk',fixed:5,dice:[1,6],uses:16,doubleHit:true},counterThrow:{name:'Counter Throw',dmgType:'physical',stat:'atk',fixed:7,dice:[1,6],uses:10,counterMove:true,counterBonus:0.75},subdue:{name:'Subdue',dmgType:'physical',stat:'atk',fixed:12,dice:[1,6],uses:12,switchLock:true},deathLust:{name:'Death Lust',dmgType:'physical',stat:'atk',fixed:6,dice:[1,4],uses:4,grantDeathLust:true},radialStrike:{name:'Radial Strike',dmgType:'physical',stat:'atk',fixed:9,dice:[1,6],uses:16,blindChance:0.4},makeWay:{name:'Make Way',dmgType:'physical',stat:'atk',fixed:5,dice:[1,4],uses:6,makeWay:true},heavenlyBlow:{name:'Heavenly Blow',dmgType:'physical',stat:'atk',fixed:8,dice:[1,8],uses:10,splitDamage:true},healingPrayer:{name:'Healing Prayer',dmgType:'heal',stat:'cha',fixed:0,dice:[1,1],uses:4,healingPrayer:true,heal:true},battlerang:{name:'Battlerang',dmgType:'physical',stat:'atk',fixed:8,dice:[1,6],uses:14,boomerang:true},emberang:{name:'Emberang',dmgType:'physical',stat:'atk',fixed:5,dice:[1,6],uses:12,boomerang:true,burnChance:0.35},whittle:{name:'Whittle',dmgType:'physical',stat:'atk',fixed:4,dice:[1,4],uses:4,grantWhittle:true},swerve:{name:'Swerve',dmgType:'physical',stat:'atk',fixed:0,dice:[1,1],uses:10,swerve:true}};

const CLASSES=[
  {id:'sirShining',label:'Paladin',statWeights:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},abilities:['radialStrike','makeWay','heavenlyBlow','healingPrayer'],stances:[{id:'battlefieldStar',statBoosts:{cha:2},passive:'blindPerTurn'},{id:'flashyArrival',statBoosts:{def:2},passive:'flashyBlind'}]},
  {id:'pitDweller',label:'Berserker',statWeights:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},abilities:['tumpUp','counterThrow','subdue','deathLust'],stances:[{id:'dirtyBoxing',statBoosts:{con:2},passive:'stunOnHit'},{id:'pitVeteran',statBoosts:{def:2},passive:'regenTick'}]},
  {id:'lich',label:'Mage',statWeights:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},abilities:['lichBlast','glaciate','lichLifeDrain','shatter'],stances:[{id:'arcticAura',statBoosts:{con:2,cha:2},passive:'freezeAll'},{id:'soulSnatcher',statBoosts:{int:3},passive:'killHeal'}]},
  {id:'rexRang',label:'Ranger',statWeights:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},abilities:['battlerang','emberang','whittle','swerve'],stances:[{id:'patientKiller',statBoosts:{atk:2},passive:'boomerangBonus'},{id:'guerillaFighter',statBoosts:{spd:2},passive:'guerillaSwitchOut'}]},
];

const level=8;
function createCombatant(cls){const stats=generateStats(cls);const hp=20+stats.con*level*0.5;return{cls,name:cls.label,stats,baseStats:{...stats},maxHp:hp,currentHp:hp,level,abilities:cls.abilities.map(id=>({...ABILITIES[id],id,currentUses:ABILITIES[id].uses})),stances:cls.stances,stance:null,status:null,statusTurns:0,fainted:false,switchLocked:false,deathLustTurns:0,damagedThisTurn:false,blindStacks:0,healingPrayerPending:false,makeWaySwitch:false,defBonusThisTurn:0,boomerangHits:[],burnStacks:0,swerveActive:false,swerveLastTurn:false,whittleBoost:0};}
function applyStance(b,stance){b.stance=stance;if(stance.statBoosts)for(const[s,v]of Object.entries(stance.statBoosts))b.stats[s]+=v;}
function removeStance(b){if(b.stance?.statBoosts)for(const[s,v]of Object.entries(b.stance.statBoosts))b.stats[s]-=v;b.stance=null;}
function switchOutUnit(b){b.deathLustTurns=0;if(b.whittleBoost){b.stats.atk-=b.whittleBoost;b.whittleBoost=0;}b.swerveActive=false;b.swerveLastTurn=false;removeStance(b);}
function getInit(c){const base=rollDice(2,8)+c.stats.spd;if(c.status==='frozen')return Math.floor(base*0.4);if(c.status==='stun')return Math.floor(base*0.5);return base;}
function calcDmg(ab,atk,def){const raw=ab.fixed+rollDice(ab.dice[0],ab.dice[1]);if(ab.dmgType==='soul')return raw;if(ab.heal)return 0;if(ab.splitDamage){const pm=0.5+0.5*(rollDice(2,6)+atk.stats.atk)/(rollDice(2,6)+def.stats.def);const mm=0.5+0.5*(rollDice(2,6)+atk.stats.int)/(rollDice(2,6)+def.stats.int);return Math.max(1,Math.round(raw/2*pm+raw/2*mm));}const as=ab.dmgType==='physical'?atk.stats.atk:atk.stats.int;const ds=ab.dmgType==='physical'?def.stats.def:def.stats.int;return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+as)/(rollDice(2,6)+ds))));}

function executeHit(attacker,defender,ability){
  if(!ability||attacker.currentHp<=0||defender.currentHp<=0)return;
  let sd=null;if(attacker.status==='stun'){sd={};for(const s of['spd','atk','int','cha']){const r=Math.floor(attacker.stats[s]/2);attacker.stats[s]-=r;sd[s]=r;}}
  const rs=()=>{if(sd)for(const[s,v]of Object.entries(sd))attacker.stats[s]+=v;};
  if(attacker.status==='frozen'&&Math.random()<0.66){rs();return;}
  if(attacker.blindStacks>0&&Math.random()<attacker.blindStacks*0.15){attacker.blindStacks--;rs();return;}
  if(ability.requiresFrozen&&defender.status!=='frozen'){rs();return;}
  if(ability.grantWhittle){attacker.whittleBoost+=4;attacker.stats.atk+=4;ability.currentUses--;rs();return;}
  if(ability.swerve){ability.currentUses--;rs();return;}
  if(ability.heal&&ability.healingPrayer){attacker.healingPrayerPending=true;ability.currentUses--;rs();return;}
  if(ability.grantDeathLust){attacker.deathLustTurns=2;ability.currentUses--;rs();return;}
  ability.currentUses--;
  const hits=ability.doubleHit?2:1;
  for(let h=0;h<hits;h++){
    if(defender.currentHp<=0)break;
    if(h>0&&ability.doubleHit&&Math.random()<0.3)continue;
    if(defender.swerveActive&&!ability.heal&&!ability.swerve&&!ability.grantWhittle){const dc=defender.swerveActive==='high'?1.0:0.2;if(Math.random()<dc){if(defender.stance?.passive==='guerillaSwitchOut')defender.makeWaySwitch=true;continue;}}
    let dmg=calcDmg(ability,attacker,defender);
    if(h>0&&ability.doubleHit)dmg=Math.round(dmg*1.5);
    if(ability.counterBonus&&attacker.damagedThisTurn)dmg=Math.round(dmg*(1+ability.counterBonus));
    if(attacker.deathLustTurns>0&&!ability.heal&&!ability.grantDeathLust)dmg+=5;
    if(defender.status==='frozen')dmg=Math.round(dmg*0.8);
    defender.currentHp-=dmg;defender.damagedThisTurn=true;
    if(defender.status==='frozen'&&!ability.requiresFrozen){defender.status=null;defender.statusTurns=0;}
    if(ability.requiresFrozen&&defender.status==='frozen'){defender.status=null;defender.statusTurns=0;}
    if(ability.drain)attacker.currentHp=Math.min(attacker.maxHp,attacker.currentHp+Math.round(dmg*ability.drain));
    if(ability.switchLock)defender.switchLocked=true;
    const chaDiff=Math.max(0,(attacker.stats.cha-defender.stats.cha))/200;
    if(attacker.stance?.passive==='stunOnHit'&&!defender.status&&defender.currentHp>0&&Math.random()<0.2+chaDiff){defender.status='stun';defender.statusTurns=1;}
    if(!defender.status&&defender.currentHp>0){let fc=ability.freezeChance||0;if(attacker.stance?.passive==='freezeAll')fc+=0.1;fc+=chaDiff;if(fc>0&&Math.random()<fc){defender.status='frozen';defender.statusTurns=99;}}
    if(ability.blindChance&&defender.currentHp>0&&Math.random()<ability.blindChance+chaDiff)defender.blindStacks++;
    if(attacker.stance?.passive==='blindPerTurn'&&defender.currentHp>0&&Math.random()<0.15+chaDiff)defender.blindStacks++;
    if(ability.burnChance&&defender.currentHp>0&&Math.random()<ability.burnChance+chaDiff)defender.burnStacks++;
    if(ability.boomerang&&defender.currentHp>0){const bm=attacker.stance?.passive==='boomerangBonus'?1.3:1.0;defender.boomerangHits.push({damage:Math.round(dmg*1.0*bm)});}
    if(defender.currentHp<=0&&attacker.stance?.passive==='killHeal')attacker.currentHp=Math.min(attacker.maxHp,attacker.currentHp+Math.round(attacker.maxHp*0.2));
  }
  rs();
}

function tickStatus(b){
  if(b.stance?.passive==='regenTick'&&b.currentHp>0&&b.currentHp<b.maxHp)b.currentHp=Math.min(b.maxHp,b.currentHp+Math.max(1,Math.floor(b.maxHp*0.05)));
  if(b.deathLustTurns>0)b.deathLustTurns--;
  b.switchLocked=false;b.swerveLastTurn=!!b.swerveActive;b.swerveActive=false;
  if(b.burnStacks>0&&b.currentHp>0){b.currentHp=Math.max(0,b.currentHp-Math.max(1,Math.floor(b.maxHp*0.04*b.burnStacks)));if(Math.random()<0.5)b.burnStacks--;}
  if(b.boomerangHits.length>0&&b.currentHp>0){for(const hit of b.boomerangHits.splice(0)){b.currentHp=Math.max(0,b.currentHp-hit.damage);b.damagedThisTurn=true;if(b.currentHp<=0)break;}}
  if(b.status==='stun'){b.status=null;b.statusTurns=0;}
  if(b.defBonusThisTurn){b.stats.def-=b.defBonusThisTurn;b.defBonusThisTurn=0;}
  if(b.healingPrayerPending&&b.currentHp>0){b.currentHp=Math.min(b.maxHp,b.currentHp+Math.round(b.maxHp*0.25));b.status=null;b.statusTurns=0;b.blindStacks=0;b.burnStacks=0;b.healingPrayerPending=false;}
}

function simTeamBattle(t1, t2, t1Lead, t2Lead, t1Stances, t2Stances) {
  const team1 = t1.map(c => createCombatant(c));
  const team2 = t2.map(c => createCombatant(c));
  let a1 = t1Lead || 0, a2 = t2Lead || 0;
  
  applyStance(team1[a1], (t1Stances && t1Stances[a1]) || team1[a1].stances[Math.floor(Math.random()*team1[a1].stances.length)]);
  applyStance(team2[a2], (t2Stances && t2Stances[a2]) || team2[a2].stances[Math.floor(Math.random()*team2[a2].stances.length)]);

  for (let turn = 0; turn < 150; turn++) {
    const p = team1[a1], o = team2[a2];
    if (p.currentHp <= 0 || o.currentHp <= 0) break;
    p.damagedThisTurn = false; o.damagedThisTurn = false;

    // Simple switch logic
    const pBench = team1.find((b,i) => i !== a1 && b.currentHp > 0);
    const oBench = team2.find((b,i) => i !== a2 && b.currentHp > 0);
    let pSwitch = false, oSwitch = false;
    if (pBench && !p.switchLocked && p.currentHp < p.maxHp * 0.25 && pBench.currentHp > pBench.maxHp * 0.4) pSwitch = true;
    if (pBench && !p.switchLocked && p.status === 'frozen' && pBench.currentHp > pBench.maxHp * 0.4 && Math.random() < 0.4) pSwitch = true;
    if (oBench && !o.switchLocked && o.currentHp < o.maxHp * 0.25 && oBench.currentHp > oBench.maxHp * 0.4) oSwitch = true;
    if (oBench && !o.switchLocked && o.status === 'frozen' && oBench.currentHp > oBench.maxHp * 0.4 && Math.random() < 0.4) oSwitch = true;

    if (pSwitch) { switchOutUnit(p); a1 = team1.indexOf(pBench); if (!team1[a1].stance) applyStance(team1[a1], (t1Stances && t1Stances[a1]) || team1[a1].stances[Math.floor(Math.random()*team1[a1].stances.length)]); }
    if (oSwitch) { switchOutUnit(o); a2 = team2.indexOf(oBench); if (!team2[a2].stance) applyStance(team2[a2], (t2Stances && t2Stances[a2]) || team2[a2].stances[Math.floor(Math.random()*team2[a2].stances.length)]); }

    if (!pSwitch && !oSwitch) {
      const pa = team1[a1], oa = team2[a2];
      const pMove = aiPickMove(pa, oa);
      const oMove = aiPickMove(oa, pa);
      let pI = getInit(pa), oI = getInit(oa);
      if (pMove?.counterMove) pI = Math.floor(pI*0.5);
      if (oMove?.counterMove) oI = Math.floor(oI*0.5);
      if (pMove?.swerve) { pI = Math.floor(pI*1.5); pa.swerveActive = !pa.swerveLastTurn ? 'high' : 'low'; }
      if (oMove?.swerve) { oI = Math.floor(oI*1.5); oa.swerveActive = !oa.swerveLastTurn ? 'high' : 'low'; }
      const [f,s,fm,sm] = pI >= oI ? [pa,oa,pMove,oMove] : [oa,pa,oMove,pMove];
      executeHit(f, s, fm);
      if (s.currentHp > 0) executeHit(s, f, sm);
    }

    tickStatus(team1[a1]); tickStatus(team2[a2]);

    // Handle faints
    if (team1[a1].currentHp <= 0) { team1[a1].fainted = true; const n = team1.findIndex((b,i) => i!==a1 && b.currentHp>0); if (n===-1) return 'team2'; a1=n; if (!team1[a1].stance) applyStance(team1[a1], (t1Stances && t1Stances[a1]) || team1[a1].stances[Math.floor(Math.random()*team1[a1].stances.length)]); }
    if (team2[a2].currentHp <= 0) { team2[a2].fainted = true; const n = team2.findIndex((b,i) => i!==a2 && b.currentHp>0); if (n===-1) return 'team1'; a2=n; if (!team2[a2].stance) applyStance(team2[a2], (t2Stances && t2Stances[a2]) || team2[a2].stances[Math.floor(Math.random()*team2[a2].stances.length)]); }

    // Guerilla switch
    for (const [team, ai, set] of [[team1, a1, v=>a1=v],[team2, a2, v=>a2=v]]) {
      if (team[ai].makeWaySwitch && team[ai].currentHp > 0) {
        const bench = team.findIndex((b,i) => i!==ai && b.currentHp>0);
        if (bench !== -1) { switchOutUnit(team[ai]); team[ai].makeWaySwitch = false; set(bench); if (!team[bench].stance) applyStance(team[bench], team[bench].stances[Math.floor(Math.random()*team[bench].stances.length)]); }
        else team[ai].makeWaySwitch = false;
      }
    }

    if (!team1.some(b=>b.currentHp>0)) return 'team2';
    if (!team2.some(b=>b.currentHp>0)) return 'team1';
  }
  return 'draw';
}

function aiPickMove(atk,def){
  const avail=atk.abilities.filter(a=>{if(a.currentUses<=0)return false;if(a.requiresFrozen&&def.status!=='frozen')return false;if(a.makeWay)return false;if(a.grantWhittle&&atk.whittleBoost>=8)return false;return true;});
  if(!avail.length)return{name:'Struggle',dmgType:'physical',stat:'atk',fixed:3,dice:[1,4],uses:999,currentUses:999};
  const w=avail.map(a=>{if(a.heal)return atk.currentHp<atk.maxHp*0.5?30:5;if(a.grantDeathLust)return atk.deathLustTurns>0?0:15;if(a.swerve)return atk.swerveLastTurn?5:18;if(a.grantWhittle)return atk.whittleBoost===0?22:12;let avg=a.fixed+a.dice[0]*(a.dice[1]+1)/2;if(a.doubleHit)avg*=1.8;if(a.counterBonus&&atk.damagedThisTurn)avg*=1.75;if(a.requiresFrozen)avg*=1.3;if(a.boomerang)avg*=1.4;return avg;});
  const total=w.reduce((s,v)=>s+v,0);let r=Math.random()*total;for(let i=0;i<avail.length;i++){r-=w[i];if(r<=0)return avail[i];}return avail[avail.length-1];
}

// ===== Q6: Arctic Aura Lich lead → Glaciate spam → switch to Paladin vs Berserker =====
const N = 3000;
const lich = CLASSES.find(c => c.id === 'lich');
const paladin = CLASSES.find(c => c.id === 'sirShining');
const berserker = CLASSES.find(c => c.id === 'pitDweller');
const ranger = CLASSES.find(c => c.id === 'rexRang');

console.log("=== Q6: Lich(Arctic Aura)+Paladin vs Berserker teams ===");
// Lich lead with Arctic Aura forced, Paladin backup
let r1 = {team1:0,team2:0,draw:0};
for (let i = 0; i < N; i++) {
  const res = simTeamBattle(
    [lich, paladin], [berserker, ranger],
    0, 0, // Lich leads
    [lich.stances[0], null], // Force Arctic Aura for Lich
    null
  );
  r1[res]++;
}
console.log(`Lich(AA)+Paladin vs Berserker+Ranger: ${(r1.team1/N*100).toFixed(1)}% | ${(r1.team2/N*100).toFixed(1)}% | ${(r1.draw/N*100).toFixed(1)}% draw`);

// Compare with random stances
let r2 = {team1:0,team2:0,draw:0};
for (let i = 0; i < N; i++) { const res = simTeamBattle([lich, paladin], [berserker, ranger], 0, 0, null, null); r2[res]++; }
console.log(`Lich+Paladin (random) vs Berserker+Ranger: ${(r2.team1/N*100).toFixed(1)}% | ${(r2.team2/N*100).toFixed(1)}% | ${(r2.draw/N*100).toFixed(1)}% draw`);

let r3 = {team1:0,team2:0,draw:0};
for (let i = 0; i < N; i++) { const res = simTeamBattle([lich, paladin], [berserker, berserker], 0, 0, [lich.stances[0], null], null); r3[res]++; }
console.log(`Lich(AA)+Paladin vs 2xBerserker: ${(r3.team1/N*100).toFixed(1)}% | ${(r3.team2/N*100).toFixed(1)}% | ${(r3.draw/N*100).toFixed(1)}% draw`);

// ===== Q7: Guerilla Fighter vs Patient Killer for Ranger =====
console.log("\n=== Q7: Guerilla Fighter vs Patient Killer for Ranger ===");
// Force stances and compare
for (const opponent of [berserker, paladin, lich]) {
  let guerilla = {team1:0,team2:0,draw:0};
  let patient = {team1:0,team2:0,draw:0};
  for (let i = 0; i < N; i++) {
    const g = simTeamBattle([ranger, paladin], [opponent, lich], 0, 0, [ranger.stances[1], null], null);
    guerilla[g]++;
    const p = simTeamBattle([ranger, paladin], [opponent, lich], 0, 0, [ranger.stances[0], null], null);
    patient[p]++;
  }
  console.log(`vs ${opponent.label}+Mage:`);
  console.log(`  Guerilla Fighter: ${(guerilla.team1/N*100).toFixed(1)}% win`);
  console.log(`  Patient Killer:   ${(patient.team1/N*100).toFixed(1)}% win`);
}
