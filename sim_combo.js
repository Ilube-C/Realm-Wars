'use strict';
// Simulate Rogue→Druid combo strategy vs each class
function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const SN=['atk','def','con','int','cha','spd'];
function gs(w){const s={};SN.forEach(n=>s[n]=5);let p=42;const tw=SN.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of SN){r-=(w[n]||1);if(r<=0){if(s[n]<20){s[n]++;p--}break}}}return s}
function chab(a,d2){return Math.max(0,(a-d2))*0.02}
const CLS_DATA={
  paladin:{sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5}},
  berserker:{sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1}},
  mage:{sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3}},
  ranger:{sw:{atk:5.5,spd:3,con:3,int:0.5,def:2,cha:1}},
  warrior:{sw:{atk:4,spd:2,con:3.5,int:0.5,def:3,cha:1}},
};
const rogueSw={atk:4,spd:4,con:3,int:0.5,def:2,cha:1.5};
const druidSw={atk:0.5,spd:1,con:1,int:3.5,def:1.5,cha:2};

function cr(sw){const stats=gs(sw);const hp=20+stats.con*4;return{stats,mhp:hp,chp:hp,ps:0,brn:0,bs:0,ws:0,cs:0,status:null};}

function physDmg(atk,def,fixed,dice){
  const raw=fixed+rollDice(dice[0],dice[1]);
  return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+atk)/(rollDice(2,6)+def))));
}
function magDmg(int_a,int_d,fixed,dice){
  const raw=fixed+rollDice(dice[0],dice[1]);
  return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+int_a)/(rollDice(2,6)+int_d))));
}

const N=1000;
console.log('=== ROGUE(Gas) → DRUID(AP+Petal+Transference) COMBO ===\n');

for(const[name,cls] of Object.entries(CLS_DATA)){
  let wins=0,losses=0;
  const logs=[];
  
  for(let i=0;i<N;i++){
    const rogue=cr(rogueSw);
    const druid=cr(druidSw);
    // Druid gets Overgrowth: INT+2
    druid.stats.int+=2;
    const enemy=cr(cls.sw);
    let log=[];
    let turn=0;
    
    // Phase 1: Rogue sets Goblin Gas (takes 1 turn, enemy attacks rogue)
    // Enemy attacks rogue
    const enemyDmg1=physDmg(enemy.stats.atk,rogue.stats.def,8,[1,6]);
    rogue.chp-=enemyDmg1;
    // Gas is set — both get 1 poison per turn for 5 turns
    let gasTurns=5;
    rogue.ps+=1; enemy.ps+=1;
    // Poison tick
    rogue.chp-=rogue.ps*2; enemy.chp-=enemy.ps*2;
    log.push(`T1: Rogue sets Gas, takes ${enemyDmg1} dmg. Both poisoned.`);
    
    if(rogue.chp<=0){losses++;continue;}
    
    // Phase 2: Rogue switches to Druid (enemy gets free attack on druid)
    const enemyDmg2=physDmg(enemy.stats.atk,druid.stats.def,8,[1,6]);
    druid.chp-=enemyDmg2;
    // Gas tick
    gasTurns--;
    if(gasTurns>0){enemy.ps+=1;} // druid doesn't get gas poison (switched in after)
    enemy.chp-=enemy.ps*2;
    log.push(`T2: Switch to Druid, takes ${enemyDmg2} free hit. Enemy at ${enemy.ps} poison.`);
    
    if(druid.chp<=0){losses++;continue;}
    
    // Phase 3: Druid uses Ancient Power (delayed 2 turns)
    let apQueued=true, apTimer=2;
    const enemyDmg3=physDmg(enemy.stats.atk,druid.stats.def,8,[1,6]);
    druid.chp-=enemyDmg3;
    gasTurns--;
    if(gasTurns>0)enemy.ps+=1;
    enemy.chp-=enemy.ps*2;
    log.push(`T3: Druid channels AP. Takes ${enemyDmg3}. Enemy poison: ${enemy.ps}`);
    
    if(druid.chp<=0||enemy.chp<=0){enemy.chp<=0?wins++:losses++;continue;}
    
    // Phase 4: Petal Storm #1
    const ps1=magDmg(druid.stats.int,enemy.stats.int,5,[1,4]);
    const enemyDmg4=physDmg(enemy.stats.atk,druid.stats.def,8,[1,6]);
    druid.chp-=enemyDmg4; enemy.chp-=ps1;
    if(Math.random()<0.50+chab(druid.stats.cha,enemy.stats.cha))enemy.bs++;
    gasTurns--;
    if(gasTurns>0)enemy.ps+=1;
    enemy.chp-=enemy.ps*2;
    apTimer--;
    log.push(`T4: Petal Storm ${ps1} dmg. Blind: ${enemy.bs}. Enemy HP: ${enemy.chp}/${enemy.mhp}`);
    
    if(druid.chp<=0||enemy.chp<=0){enemy.chp<=0?wins++:losses++;continue;}
    
    // Phase 5: Petal Storm #2 + AP lands
    const ps2=magDmg(druid.stats.int,enemy.stats.int,5,[1,4]);
    const enemyDmg5=physDmg(enemy.stats.atk,druid.stats.def,8,[1,6]);
    // Blind miss check
    let enemyMissed=false;
    if(enemy.bs>0&&Math.random()<enemy.bs*0.15){enemy.bs--;enemyMissed=true;}
    if(!enemyMissed)druid.chp-=enemyDmg5;
    enemy.chp-=ps2;
    if(Math.random()<0.50+chab(druid.stats.cha,enemy.stats.cha))enemy.bs++;
    // AP lands!
    const apRaw=15+rollDice(2,6);
    const apMul=0.5+0.5*(rollDice(2,6)+druid.stats.int)/(rollDice(2,6)+enemy.stats.int);
    const apDmg=Math.max(1,Math.round(apRaw*apMul));
    enemy.chp-=apDmg;
    gasTurns--;
    if(gasTurns>0)enemy.ps+=1;
    enemy.chp-=enemy.ps*2;
    log.push(`T5: Petal ${ps2} + AP LANDS for ${apDmg}! Enemy HP: ${enemy.chp}/${enemy.mhp}. Poison: ${enemy.ps}`);
    
    if(druid.chp<=0||enemy.chp<=0){enemy.chp<=0?wins++:losses++;continue;}
    
    // Phase 6: Transference! Dump all druid's statuses onto enemy
    // Druid accumulated: poison from gas (if any), possibly frozen/stun from enemy
    // But more importantly, dump whatever druid has
    const druidPoison=druid.ps;
    const druidBurn=druid.brn;
    if(druidPoison>0){enemy.ps+=druidPoison;druid.ps=0;}
    if(druidBurn>0){enemy.brn+=druidBurn;druid.brn=0;}
    const enemyDmg6=physDmg(enemy.stats.atk,druid.stats.def,8,[1,6]);
    let em2=false;
    if(enemy.bs>0&&Math.random()<enemy.bs*0.15){enemy.bs--;em2=true;}
    if(!em2)druid.chp-=enemyDmg6;
    enemy.chp-=enemy.ps*2;
    if(enemy.brn>0){enemy.chp-=Math.max(1,Math.floor(enemy.mhp*0.04*enemy.brn));if(Math.random()<0.5)enemy.brn--;}
    log.push(`T6: TRANSFERENCE! Dumped ${druidPoison} poison onto enemy. Total poison: ${enemy.ps}. Enemy HP: ${enemy.chp}/${enemy.mhp}`);
    
    if(enemy.chp<=0)wins++;
    else if(druid.chp<=0)losses++;
    else{
      // Continue fighting for a few more turns
      for(let t=0;t<10;t++){
        if(druid.chp<=0||enemy.chp<=0)break;
        const pd=magDmg(druid.stats.int,enemy.stats.int,5,[1,4]);
        const ed=physDmg(enemy.stats.atk,druid.stats.def,8,[1,6]);
        let miss=false;
        if(enemy.bs>0&&Math.random()<enemy.bs*0.15){enemy.bs--;miss=true;}
        if(!miss)druid.chp-=ed;
        enemy.chp-=pd;
        enemy.chp-=enemy.ps*2;
        if(enemy.brn>0){enemy.chp-=Math.max(1,Math.floor(enemy.mhp*0.04*enemy.brn));if(Math.random()<0.5)enemy.brn--;}
        if(Math.random()<0.50)enemy.bs++;
      }
      if(enemy.chp<=0)wins++;
      else losses++;
    }
    
    if(i<3&&enemy.chp<=0)logs.push(log);
  }
  
  const wr=(wins/(wins+losses)*100).toFixed(1);
  console.log(`vs ${name.padEnd(10)}: ${wr}% WR (${wins}W/${losses}L)`);
  if(logs.length>0){
    console.log(`  Example game:`);
    for(const l of logs[0])console.log(`    ${l}`);
  }
}
