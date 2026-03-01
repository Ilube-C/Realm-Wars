function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const STAT_BUDGET=72,STAT_FLOOR=5,STAT_CAP=20,STAT_NAMES=['atk','def','con','int','cha','spd'];
function genStats(cls){const w=cls.statWeights;const s={};STAT_NAMES.forEach(n=>s[n]=STAT_FLOOR);let p=42;const tw=STAT_NAMES.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of STAT_NAMES){r-=(w[n]||1);if(r<=0){if(s[n]<STAT_CAP){s[n]++;p--}break}}}return s}
function makeAB(o){return{
  lichBlast:{name:'Lich Blast',dmgType:'magical',stat:'int',fixed:7,dice:[2,6],uses:14,freezeChance:0.2},glaciate:{name:'Glaciate',dmgType:'magical',stat:'int',fixed:5,dice:[1,4],uses:16,freezeChance:0.6},lichLifeDrain:{name:'Life Drain',dmgType:'soul',stat:'int',fixed:6,dice:[1,8],uses:10,drain:0.5},shatter:{name:'Shatter',dmgType:'soul',stat:'int',fixed:18,dice:[2,6],uses:6,requiresFrozen:true},
  tumpUp:{name:'Tump Up',dmgType:'physical',stat:'atk',fixed:5,dice:[1,6],uses:16,doubleHit:true},counterThrow:{name:'Counter Throw',dmgType:'physical',stat:'atk',fixed:7,dice:[1,6],uses:10,counterMove:true,counterBonus:0.75},subdue:{name:'Subdue',dmgType:'physical',stat:'atk',fixed:12,dice:[1,6],uses:12,switchLock:true},deathLust:{name:'Death Lust',dmgType:'physical',stat:'atk',fixed:6,dice:[1,4],uses:4,grantDeathLust:true},
  radialStrike:{name:'Radial Strike',dmgType:'physical',stat:'atk',fixed:9,dice:[1,6],uses:16,blindChance:0.4},makeWay:{name:'Make Way',dmgType:'physical',stat:'atk',fixed:5,dice:[1,4],uses:6,makeWay:true},heavenlyBlow:{name:'Heavenly Blow',dmgType:'physical',stat:'atk',fixed:8,dice:[1,8],uses:10,splitDamage:true},healingPrayer:{name:'Healing Prayer',dmgType:'heal',stat:'cha',fixed:0,dice:[1,1],uses:4,healingPrayer:true,heal:true},
  battlerang:{name:'Battlerang',dmgType:'physical',stat:'atk',fixed:8,dice:[1,6],uses:14,boomerang:true,flinchChance:0.25},emberang:{name:'Emberang',dmgType:'physical',stat:'atk',fixed:5,dice:[1,6],uses:12,boomerang:true,burnChance:0.35},whittle:{name:'Whittle',dmgType:'physical',stat:'atk',fixed:4,dice:[1,4],uses:4,grantWhittle:true},swerve:{name:'Swerve',dmgType:'physical',stat:'atk',fixed:0,dice:[1,1],uses:10,swerve:true},
  poisonDart:{name:'Poison Dart',dmgType:'physical',stat:'atk',fixed:o.dartFixed,dice:[1,o.dartDice],uses:14,poisonChance:o.dartPoison},
  goblinGas:{name:'Goblin Gas',dmgType:'physical',stat:'atk',fixed:0,dice:[1,1],uses:4,goblinGas:true},
  remedialOintment:{name:'Remedial Ointment',dmgType:'heal',stat:'cha',fixed:0,dice:[1,1],uses:6,remedialOintment:true,heal:true,ointmentHeal:o.ointHeal},
  violentExtraction:{name:'Violent Extraction',dmgType:'soul',stat:'atk',fixed:0,dice:[1,1],uses:6,violentExtraction:true,extractDmg:o.extractDmg},
};}
function makeCLS(sw){return[
  {id:'sirShining',label:'Paladin',statWeights:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},abilities:['radialStrike','makeWay','heavenlyBlow','healingPrayer'],stances:[{id:'battlefieldStar',statBoosts:{cha:2},passive:'blindPerTurn'},{id:'flashyArrival',statBoosts:{def:2},passive:'flashyBlind'}]},
  {id:'pitDweller',label:'Berserker',statWeights:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},abilities:['tumpUp','counterThrow','subdue','deathLust'],stances:[{id:'dirtyBoxing',statBoosts:{con:2},passive:'stunOnHit'},{id:'pitVeteran',statBoosts:{def:2},passive:'regenTick'}]},
  {id:'lich',label:'Mage',statWeights:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},abilities:['lichBlast','glaciate','lichLifeDrain','shatter'],stances:[{id:'arcticAura',statBoosts:{con:2,cha:2},passive:'freezeAll'},{id:'soulSnatcher',statBoosts:{int:3},passive:'attackLifesteal'}]},
  {id:'rexRang',label:'Ranger',statWeights:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},abilities:['battlerang','emberang','whittle','swerve'],stances:[{id:'patientKiller',statBoosts:{atk:2},passive:'boomerangBonus'},{id:'guerillaFighter',statBoosts:{spd:2},passive:'guerillaSwitchOut'}]},
  {id:'countCoction',label:'Rogue',statWeights:sw,abilities:['poisonDart','goblinGas','remedialOintment','violentExtraction'],stances:[{id:'rapidTransmission',statBoosts:{cha:2},passive:'rapidTransmission'},{id:'neurotoxin',statBoosts:{spd:2},passive:'neurotoxin'}]},
];}
const level=8;let terrain=null;
function create(cls,AB){const stats=genStats(cls);const hp=20+stats.con*level*0.5;return{cls,name:cls.label,stats,baseStats:{...stats},maxHp:hp,currentHp:hp,level,abilities:cls.abilities.map(id=>({...AB[id],id,currentUses:AB[id].uses})),stances:cls.stances,stance:null,status:null,statusTurns:0,fainted:false,switchLocked:false,deathLustTurns:0,damagedThisTurn:false,blindStacks:0,boomerangHits:[],burnStacks:0,swerveActive:false,swerveLastTurn:false,whittleBoost:0,flinched:false,poisonStacks:0};}
function applyStance(b,s){b.stance=s;if(s.statBoosts)for(const[k,v]of Object.entries(s.statBoosts))b.stats[k]+=v;}
function getInit(c){const b=rollDice(2,8)+c.stats.spd;if(c.status==='frozen')return Math.floor(b*0.4);if(c.status==='stun')return Math.floor(b*0.5);return b;}
function calcDmg(ab,atk,def){const raw=ab.fixed+rollDice(ab.dice[0],ab.dice[1]);if(ab.dmgType==='soul')return raw;if(ab.heal)return 0;if(ab.splitDamage){return Math.max(1,Math.round(raw/2*(0.5+0.5*(rollDice(2,6)+atk.stats.atk)/(rollDice(2,6)+def.stats.def))+raw/2*(0.5+0.5*(rollDice(2,6)+atk.stats.int)/(rollDice(2,6)+def.stats.int))));}const as=atk.stats[ab.stat]||atk.stats.atk;const ds=ab.dmgType==='physical'?def.stats.def:def.stats.int;return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+as)/(rollDice(2,6)+ds))));}
function aiStance(b){return b.stances[Math.floor(Math.random()*b.stances.length)];}
function applyPoison(t,st,src){if(src.stance?.passive==='rapidTransmission'&&Math.random()<0.30+Math.max(0,(src.stats.cha-t.stats.cha))*0.02)st*=2;t.poisonStacks+=st;}
function aiMove(a,d){
  if(a.currentHp<a.maxHp*0.3){const hi=a.abilities.findIndex(x=>x.heal&&x.currentUses>0);if(hi>=0)return a.abilities[hi];}
  if(a.poisonStacks>=2&&a.currentHp<a.maxHp*0.6){const ri=a.abilities.findIndex(x=>x.remedialOintment&&x.currentUses>0);if(ri>=0)return a.abilities[ri];}
  const av=a.abilities.filter(x=>{if(x.currentUses<=0)return false;if(x.requiresFrozen&&d.status!=='frozen')return false;if(x.makeWay)return false;if(x.grantWhittle&&a.whittleBoost>=8)return false;if(x.remedialOintment)return false;return true;});
  if(!av.length)return null;
  const w=av.map(x=>{if(x.heal)return a.currentHp<a.maxHp*0.5?30:5;if(x.grantDeathLust)return a.deathLustTurns>0?0:15;if(x.swerve)return a.swerveLastTurn?5:18;if(x.grantWhittle)return a.whittleBoost===0?22:12;if(x.goblinGas)return!terrain?25:3;if(x.violentExtraction)return d.poisonStacks>=3?d.poisonStacks*8:2;let avg=x.fixed+x.dice[0]*(x.dice[1]+1)/2;if(x.doubleHit)avg*=1.8;if(x.counterBonus&&a.damagedThisTurn)avg*=1.75;if(x.requiresFrozen)avg*=1.3;if(x.boomerang)avg*=1.4;return avg;});
  const t=w.reduce((s,v)=>s+v,0);let r=Math.random()*t;for(let i=0;i<av.length;i++){r-=w[i];if(r<=0)return av[i];}return av[av.length-1];
}
function executeHit(atk,def,ab){
  if(!ab||atk.currentHp<=0||def.currentHp<=0)return;
  let sd=null;if(atk.status==='stun'){sd={};for(const s of['spd','atk','int','cha']){const r=Math.floor(atk.stats[s]/2);atk.stats[s]-=r;sd[s]=r;}}
  const rs=()=>{if(sd)for(const[s,v]of Object.entries(sd))atk.stats[s]+=v;};
  if(atk.status==='frozen'&&!ab.healingPrayer&&Math.random()<0.66){rs();return;}
  if(atk.blindStacks>0&&Math.random()<atk.blindStacks*0.15){atk.blindStacks--;rs();return;}
  if(ab.requiresFrozen&&def.status!=='frozen'){rs();return;}
  if(ab.grantWhittle){atk.whittleBoost+=4;atk.stats.atk+=4;ab.currentUses--;rs();return;}
  if(ab.swerve){ab.currentUses--;rs();return;}
  if(ab.heal&&ab.healingPrayer){atk.currentHp=Math.min(atk.maxHp,atk.currentHp+Math.max(5,Math.round(atk.maxHp*0.25)));atk.status=null;atk.statusTurns=0;atk.blindStacks=0;atk.burnStacks=0;atk.poisonStacks=0;ab.currentUses--;rs();return;}
  if(ab.grantDeathLust){atk.deathLustTurns=2;ab.currentUses--;rs();return;}
  if(ab.goblinGas){terrain={turnsLeft:5,effect:'poisonBoth'};ab.currentUses--;rs();return;}
  if(ab.remedialOintment){const st=atk.poisonStacks;if(st>0){atk.poisonStacks=0;atk.currentHp=Math.min(atk.maxHp,atk.currentHp+st*(ab.ointmentHeal||5));}ab.currentUses--;rs();return;}
  if(ab.violentExtraction){const st=def.poisonStacks;if(st>0){def.poisonStacks=0;def.currentHp-=st*(ab.extractDmg||6);def.damagedThisTurn=true;}ab.currentUses--;rs();return;}
  ab.currentUses--;
  for(let h=0;h<(ab.doubleHit?2:1);h++){
    if(def.currentHp<=0)break;if(h>0&&ab.doubleHit&&Math.random()<0.3)continue;
    if(def.swerveActive&&!ab.heal&&!ab.swerve&&!ab.grantWhittle&&Math.random()<(def.swerveActive==='high'?1:0.2))continue;
    let dmg=calcDmg(ab,atk,def);if(h>0&&ab.doubleHit)dmg=Math.round(dmg*1.5);
    if(ab.counterBonus&&atk.damagedThisTurn)dmg=Math.round(dmg*(1+ab.counterBonus));
    if(atk.deathLustTurns>0&&!ab.heal&&!ab.grantDeathLust)dmg+=5;
    def.currentHp-=dmg;def.damagedThisTurn=true;
    if(atk.stance?.passive==='attackLifesteal'&&dmg>0)atk.currentHp=Math.min(atk.maxHp,atk.currentHp+Math.max(1,Math.floor(dmg*0.15)));
    if(def.status==='frozen'&&!ab.requiresFrozen){def.status=null;def.statusTurns=0;}
    if(ab.requiresFrozen&&def.status==='frozen'){def.status=null;def.statusTurns=0;}
    if(ab.drain)atk.currentHp=Math.min(atk.maxHp,atk.currentHp+Math.round(dmg*ab.drain));
    if(ab.switchLock)def.switchLocked=true;
    if(atk.stance?.passive==='stunOnHit'&&!def.status&&def.currentHp>0&&Math.random()<0.3+Math.max(0,(atk.stats.cha-def.stats.cha))*0.02){def.status='stun';def.statusTurns=1;}
    if(!def.status&&def.currentHp>0){let fc=ab.freezeChance||0;if(atk.stance?.passive==='freezeAll')fc+=0.1;fc+=Math.max(0,(atk.stats.cha-def.stats.cha))*0.02;if(fc>0&&Math.random()<fc){def.status='frozen';def.statusTurns=99;}}
    if(ab.blindChance&&def.currentHp>0&&Math.random()<ab.blindChance+Math.max(0,(atk.stats.cha-def.stats.cha))*0.02)def.blindStacks++;
    if(atk.stance?.passive==='blindPerTurn'&&def.currentHp>0&&Math.random()<0.25+Math.max(0,(atk.stats.cha-def.stats.cha))*0.02)def.blindStacks++;
    if(ab.burnChance&&def.currentHp>0&&Math.random()<ab.burnChance+Math.max(0,(atk.stats.cha-def.stats.cha))*0.02)def.burnStacks++;
    if(ab.poisonChance&&def.currentHp>0&&Math.random()<ab.poisonChance+Math.max(0,(atk.stats.cha-def.stats.cha))*0.02)applyPoison(def,1,atk);
    if(ab.boomerang&&def.currentHp>0){def.boomerangHits.push({damage:Math.round(dmg*(atk.stance?.passive==='boomerangBonus'?1.3:1.0))});}
    if(h===0&&ab.flinchChance&&def.currentHp>0&&!def.flinched&&Math.random()<ab.flinchChance+Math.max(0,(atk.stats.cha-def.stats.cha))*0.02)def.flinched=true;
  }
  rs();
}
function tick(b,pdmg){
  if(b.stance?.passive==='regenTick'&&b.currentHp>0&&b.currentHp<b.maxHp)b.currentHp=Math.min(b.maxHp,b.currentHp+Math.max(1,Math.floor(b.maxHp*0.05)));
  if(b.deathLustTurns>0)b.deathLustTurns--;b.switchLocked=false;b.swerveLastTurn=!!b.swerveActive;b.swerveActive=false;b.flinched=false;
  if(b.burnStacks>0&&b.currentHp>0){b.currentHp=Math.max(0,b.currentHp-Math.max(1,Math.floor(b.maxHp*0.04*b.burnStacks)));if(Math.random()<0.5)b.burnStacks--;}
  if(b.poisonStacks>0&&b.currentHp>0){b.currentHp=Math.max(0,b.currentHp-b.poisonStacks*pdmg);}
  if(b.boomerangHits.length>0&&b.currentHp>0){for(const h of b.boomerangHits.splice(0)){b.currentHp=Math.max(0,b.currentHp-h.damage);if(b.currentHp<=0)break;}}
  if(b.status==='stun'){b.status=null;b.statusTurns=0;}
}
function sim1v1(cls1,cls2,AB,pdmg){
  terrain=null;const a=create(cls1,AB),b=create(cls2,AB);
  applyStance(a,aiStance(a));applyStance(b,aiStance(b));
  if(a.stance.passive==='flashyBlind')b.blindStacks+=2;if(b.stance.passive==='flashyBlind')a.blindStacks+=2;
  for(let t=0;t<100;t++){
    a.damagedThisTurn=false;b.damagedThisTurn=false;
    const am=aiMove(a,b),bm=aiMove(b,a);if(!am&&!bm)break;
    let ai=getInit(a),bi=getInit(b);
    if(am?.counterMove)ai=Math.floor(ai*0.5);if(bm?.counterMove)bi=Math.floor(bi*0.5);
    if(am?.swerve){ai=Math.floor(ai*1.5);a.swerveActive=!a.swerveLastTurn?'high':'low';}
    if(bm?.swerve){bi=Math.floor(bi*1.5);b.swerveActive=!b.swerveLastTurn?'high':'low';}
    const[f,s,fm,sm]=ai>=bi?[a,b,am,bm]:[b,a,bm,am];
    executeHit(f,s,fm);if(s.currentHp>0&&!s.flinched)executeHit(s,f,sm);f.flinched=false;s.flinched=false;
    if(terrain&&terrain.turnsLeft>0){terrain.turnsLeft--;if(terrain.effect==='poisonBoth'){for(const fighter of[a,b]){if(fighter.currentHp>0)applyPoison(fighter,1,fighter===a?b:a);}}if(terrain.turnsLeft<=0)terrain=null;}
    tick(a,pdmg);tick(b,pdmg);if(a.currentHp<=0||b.currentHp<=0)break;
  }
  if(a.currentHp>0&&b.currentHp<=0)return cls1.id;if(b.currentHp>0&&a.currentHp<=0)return cls2.id;return'draw';
}

const N=2000;
const configs=[
  // Much tankier + higher poison damage + bigger extraction
  {label:'V4: CON 3, DEF 2, Dart 8+1d6 60%, Extract 10/stack, Poison 3/stack, Ointment 7/stack',
   sw:{atk:3,spd:4,con:3,int:0.5,def:2,cha:1.5}, dartFixed:8,dartDice:6,dartPoison:0.60,extractDmg:10,poisonDmg:3,ointHeal:7},
  {label:'V5: CON 3, DEF 2.5, Dart 9+1d6 55%, Extract 10/stack, Poison 3/stack',
   sw:{atk:3,spd:3.5,con:3,int:0.5,def:2.5,cha:1.5}, dartFixed:9,dartDice:6,dartPoison:0.55,extractDmg:10,poisonDmg:3,ointHeal:7},
  {label:'V6: CON 3.5, DEF 2, Dart 8+1d6 65%, Extract 12/stack, Poison 3/stack',
   sw:{atk:3,spd:3.5,con:3.5,int:0.5,def:2,cha:1.5}, dartFixed:8,dartDice:6,dartPoison:0.65,extractDmg:12,poisonDmg:3,ointHeal:8},
];
for(const cfg of configs){
  const AB=makeAB(cfg);const CLS=makeCLS(cfg.sw);const rogue=CLS.find(c=>c.id==='countCoction');
  console.log(`\n=== ${cfg.label} ===`);
  for(const opp of CLS){
    if(opp.id===rogue.id)continue;
    const res={[rogue.id]:0,[opp.id]:0,draw:0};
    for(let i=0;i<N;i++)res[sim1v1(rogue,opp,AB,cfg.poisonDmg)]++;
    console.log(`  vs ${opp.label}: Rogue ${(res[rogue.id]/N*100).toFixed(1)}% | ${opp.label} ${(res[opp.id]/N*100).toFixed(1)}%`);
  }
}
