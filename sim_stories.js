'use strict';
// Narrated sim — logs interesting mechanic interactions
function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const SN=['atk','def','con','int','cha','spd'];
function gs(w){const s={};SN.forEach(n=>s[n]=5);let p=42;const tw=SN.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of SN){r-=(w[n]||1);if(r<=0){if(s[n]<20){s[n]++;p--}break}}}return s}
function chab(a,d2){return Math.max(0,(a-d2))*0.02}
const AB={
  lichBlast:{t:'m',s:'int',f:8,dc:[2,6],u:14,fc:0.2,n:'Lich Blast'},glaciate:{t:'m',s:'int',f:6,dc:[1,4],u:16,fc:0.6,n:'Glaciate'},
  lichLifeDrain:{t:'m',s:'int',f:7,dc:[1,8],u:10,dr:0.4,n:'Life Drain'},shatter:{t:'s',s:'int',f:18,dc:[2,6],u:6,rqF:1,n:'Shatter'},
  tumpUp:{t:'p',s:'atk',f:4,dc:[1,6],u:16,dh:1,n:'Tump Up'},counterThrow:{t:'p',s:'atk',f:6,dc:[1,6],u:10,cm:1,cbo:0.75,n:'Counter Throw'},
  subdue:{t:'p',s:'atk',f:11,dc:[1,6],u:12,sl:1,n:'Subdue'},deathLust:{t:'p',s:'atk',f:6,dc:[1,4],u:4,gdl:1,n:'Death Lust'},
  radialStrike:{t:'p',s:'atk',f:8,dc:[1,6],u:16,bc:0.4,n:'Radial Strike'},heavenlyBlow:{t:'p',s:'atk',f:7,dc:[1,8],u:10,sd:1,n:'Heavenly Blow'},
  healingPrayer:{t:'h',s:'cha',f:0,dc:[1,1],u:4,hp:1,hl:1,n:'Healing Prayer'},
  battlerang:{t:'p',s:'atk',f:8,dc:[1,6],u:14,bm:1,fl:0.25,n:'Battlerang'},emberang:{t:'p',s:'atk',f:5,dc:[1,6],u:12,bm:1,bn:0.35,n:'Emberang'},
  whittle:{t:'p',s:'atk',f:4,dc:[1,4],u:4,gw:1,n:'Whittle'},swerve:{t:'p',s:'atk',f:0,dc:[1,1],u:10,sw:1,n:'Swerve'},
  poisonDart:{t:'p',s:'atk',f:7,dc:[1,6],u:14,pc:1.00,pst:2,n:'Poison Dart'},goblinGas:{t:'p',s:'atk',f:0,dc:[1,1],u:4,gg:1,n:'Goblin Gas'},
  remedialOintment:{t:'h',s:'cha',f:0,dc:[1,1],u:6,ro:1,hl:1,n:'Remedial Ointment'},violentExtraction:{t:'s',s:'atk',f:0,dc:[1,1],u:6,ve:1,n:'Violent Extraction'},
  recklessSwing:{t:'p',s:'atk',f:14,dc:[2,6],u:10,rs:1,n:'Reckless Swing'},eviscerate:{t:'p',s:'atk',f:7,dc:[1,6],u:14,ev:1,n:'Eviscerate'},
  lexShieldBash:{t:'p',s:'atk',f:6,dc:[1,4],u:16,sb:1,sc:0.35,n:'Shield Bash'},chivalry:{t:'h',s:'def',f:0,dc:[1,1],u:6,ch:1,hl:1,n:'Chivalry'},
  petalStorm:{t:'m',s:'int',f:5,dc:[1,4],u:14,pst2:1,blc:0.50,n:'Petal Storm'},ancientPower:{t:'m',s:'int',f:15,dc:[2,6],u:6,ap:1,n:'Ancient Power'},
  transference:{t:'s',s:'int',f:0,dc:[1,1],u:4,tr:1,n:'Transference'},
  moonlight:{t:'h',s:'int',f:0,dc:[1,1],u:8,ml:1,hl:1,n:'Moonlight'},readScripture:{t:'s',s:'int',f:10,dc:[1,8],u:14,rs2:1,n:'Read Scripture'},
  riot:{t:'s',s:'int',f:5,dc:[1,4],u:12,ri:1,n:'Riot'},lookAtMe:{t:'s',s:'cha',f:0,dc:[1,1],u:6,lam:1,n:'Look at Me'},
};
const STANCES=[
  {id:'bstar',n:'Battlefield Star',sb:{cha:2},p:'bpt'},
  {id:'flashy',n:'Flashy Arrival',sb:{def:2},p:'fb'},
  {id:'dirty',n:'Dirty Boxing',sb:{con:2},p:'soh'},
  {id:'pitvet',n:'Pit Veteran',sb:{def:2},p:'rt'},
  {id:'arctic',n:'Arctic Aura',sb:{con:2,cha:2},p:'fa'},
  {id:'soul',n:'Soul Snatcher',sb:{int:2},p:'al'},
  {id:'patient',n:'Patient Killer',sb:{atk:2},p:'bb'},
  {id:'guerilla',n:'Guerilla Fighter',sb:{spd:2},p:'gs'},
  {id:'rapid',n:'Rapid Transmission',sb:{cha:2},p:'rpt'},
  {id:'night',n:'Night Terrors',sb:{spd:2},p:'nt'},
  {id:'over',n:'Overwhelming',sb:{atk:3},p:'ov'},
  {id:'duel',n:'Duelist',sb:{def:2},p:'du'},
  {id:'overgrow',n:'Overgrowth',sb:{int:2},p:'og',ogE:1},
  {id:'restore',n:'Restoration',sb:{con:2},p:'rest'},
  {id:'gekyume',n:"Gekyume's Blessing",sb:{int:2},p:'hb'},
  {id:'sermon',n:'Forbidden Sermon',sb:{cha:2},p:'cpt'},
];
const CLS=[
  {id:'paladin',l:'Paladin',sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},ab:['radialStrike','heavenlyBlow','healingPrayer','heavenlyBlow'],st:[0,1]},
  {id:'berserker',l:'Berserker',sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},ab:['tumpUp','counterThrow','subdue','deathLust'],st:[2,3]},
  {id:'mage',l:'Mage',sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},ab:['lichBlast','glaciate','lichLifeDrain','shatter'],st:[4,5]},
  {id:'ranger',l:'Ranger',sw:{atk:5.5,spd:3,con:3,int:0.5,def:2,cha:1},ab:['battlerang','emberang','whittle','swerve'],st:[6,7]},
  {id:'rogue',l:'Rogue',sw:{atk:4,spd:4,con:3,int:0.5,def:2,cha:1.5},ab:['poisonDart','goblinGas','remedialOintment','violentExtraction'],st:[8,9]},
  {id:'warrior',l:'Warrior',sw:{atk:4,spd:2,con:3.5,int:0.5,def:3,cha:1},ab:['recklessSwing','eviscerate','lexShieldBash','chivalry'],st:[10,11]},
  {id:'druid',l:'Druid',sw:{atk:0.5,spd:1,con:1,int:3.5,def:1.5,cha:2},ab:['petalStorm','ancientPower','transference','petalStorm'],st:[12,13]},
  {id:'cleric',l:'Cleric',sw:{atk:0.5,spd:1,con:2,int:3.5,def:2,cha:3},ab:['moonlight','readScripture','riot','lookAtMe'],st:[14,15]},
];
let terrain=null;
function cr(cls){const stats=gs(cls.sw);const hp=20+stats.con*4;return{cls,nm:cls.l,stats,origStats:{...stats},mhp:hp,chp:hp,ab:cls.ab.map(id=>{const a=AB[id];return{...a,id,cu:a.u}}),stI:cls.st,stn:null,status:null,dlt:0,dtt:false,bs:0,brn:0,bh:[],sa:false,slt:false,wb:0,fl:false,ps:0,swl:false,ds:0,cp:false,ws:0,fainted:false,apq:[],cs:0,st2:0,shp:0,mlHeal:0,lookAtMeLocked:false};}
function apS(b,s){b.stn=s;if(s.sb)for(const[k,v]of Object.entries(s.sb))b.stats[k]+=v;if(s.ogE)terrain={tl:5,e:'vine'};}
function rndS(b){const i=b.stI[Math.floor(Math.random()*b.stI.length)];return STANCES[i];}
function cd(ab,a,d2){const raw=ab.f+rollDice(ab.dc[0],ab.dc[1]);if(ab.t==='s')return raw;if(ab.hl)return 0;if(ab.sd){return Math.max(1,Math.round(raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.atk)/(rollDice(2,6)+d2.stats.def))+raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.int)/(rollDice(2,6)+d2.stats.int))));}const at=a.stats[ab.s]||a.stats.atk;const ds=ab.t==='p'?d2.stats.def:d2.stats.int;return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+at)/(rollDice(2,6)+ds))));}
function aP(t,st,src){if(src.stn?.p==='rpt'&&Math.random()<0.30+chab(src.stats.cha,t.stats.cha))st+=1;t.ps+=st;}
function gi(c){const b=rollDice(2,8)+c.stats.spd;if(c.status==='f')return Math.floor(b*0.4);if(c.status==='s')return Math.floor(b*0.5);return b;}
function am(a,d2){
  if(a.chp<a.mhp*0.3){const hi=a.ab.findIndex(x=>x.hl&&!x.ch&&x.cu>0);if(hi>=0)return a.ab[hi];}
  if(a.ps>=2&&a.chp<a.mhp*0.6){const ri=a.ab.findIndex(x=>x.ro&&x.cu>0);if(ri>=0)return a.ab[ri];}
  const av=a.ab.filter(x=>{if(x.cu<=0)return false;if(x.rqF&&d2.status!=='f')return false;if(x.gw&&a.wb>=8)return false;if(x.ro)return false;return true;});
  if(!av.length)return null;
  const w2=av.map(x=>{if(x.hl&&!x.ch)return a.chp<a.mhp*0.5?30:5;if(x.ch)return a.chp<a.mhp*0.8?15:5;if(x.gdl)return a.dlt>0?0:15;if(x.sw)return a.slt?5:18;if(x.gw)return a.wb===0?22:12;if(x.gg)return!terrain?25:3;if(x.ve)return d2.ps>=4?d2.ps*8:2;if(x.sb)return 12;if(x.ev)return d2.ws<3?18:10;if(x.ap)return 22;if(x.tr)return(a.ps+a.brn+a.bs+a.ws+a.cs)*6+(a.status?15:0);if(x.ml)return a.chp<a.mhp*0.7?20:3;if(x.rs2)return 15;if(x.ri)return 16;if(x.lam)return 10;let avg=x.f+x.dc[0]*(x.dc[1]+1)/2;if(x.dh)avg*=1.8;if(x.cbo&&a.dtt)avg*=1.75;if(x.rqF)avg*=1.3;if(x.bm)avg*=1.4;return avg;});
  const t2=w2.reduce((s,v)=>s+v,0);let r=Math.random()*t2;for(let i=0;i<av.length;i++){r-=w2[i];if(r<=0)return av[i];}return av[av.length-1];
}

// Run games and collect interesting moments
const moments = [];

function runGame() {
  terrain = null;
  const pool = [...CLS].sort(() => Math.random() - 0.5);
  const t1 = pool.slice(0, 4).map(c => cr(c));
  const t2 = pool.slice(4, 8).map(c => cr(c));
  let a1 = 0, a2 = 0;
  const log = [];
  
  // Apply stances
  for (const m of [...t1, ...t2]) { apS(m, rndS(m)); }
  
  const t1Names = t1.map(m => m.nm).join('+');
  const t2Names = t2.map(m => m.nm).join('+');
  
  for (let turn = 0; turn < 200; turn++) {
    const a = t1[a1], b = t2[a2];
    if (!a || !b || a.fainted || b.fainted) break;
    a.dtt = false; b.dtt = false; a.cp = false; b.cp = false;
    
    const m1 = am(a, b), m2 = am(b, a);
    if (!m1 && !m2) break;
    
    let ai = gi(a), bi = gi(b);
    if (m1?.cm) ai = Math.floor(ai * 0.5);
    if (m2?.cm) bi = Math.floor(bi * 0.5);
    if (m1?.sw) { ai = Math.floor(ai * 1.5); a.sa = !a.slt ? 'high' : 'low'; }
    if (m2?.sw) { bi = Math.floor(bi * 1.5); b.sa = !b.slt ? 'high' : 'low'; }
    if (m1?.ch) ai = -100; if (m2?.ch) bi = -100;
    
    const [f, s, fm, sm] = ai >= bi ? [a, b, m1, m2] : [b, a, m2, m1];
    
    // Execute hits and track events
    function doHit(atk, def, ab) {
      if (!ab || atk.chp <= 0 || def.chp <= 0) return;
      let suppressed = null;
      if (atk.stn?.p === 'ov' && def.stn) { suppressed = def.stn.p; def.stn = { ...def.stn, p: null }; }
      let sd = null;
      if (atk.status === 's') { sd = {}; for (const s2 of ['spd','atk','int','cha']) { const r = Math.floor(atk.stats[s2] / 2); atk.stats[s2] -= r; sd[s2] = r; } }
      const rs = () => { if (sd) for (const [s2, v] of Object.entries(sd)) atk.stats[s2] += v; if (suppressed && def.stn) def.stn = { ...def.stn, p: suppressed }; };
      
      if (atk.status === 'f' && !ab.hp && Math.random() < 0.66) { rs(); return; }
      if (atk.bs > 0 && Math.random() < atk.bs * 0.15) { atk.bs--; log.push(`${atk.nm} misses through blind!`); rs(); return; }
      if (ab.rqF && def.status !== 'f') { rs(); return; }
      if (ab.gw) { atk.wb += 4; atk.stats.atk += 4; ab.cu--; rs(); return; }
      if (ab.sw) { ab.cu--; rs(); return; }
      if (ab.hl && ab.hp) { const before = atk.chp; atk.chp = Math.min(atk.mhp, atk.chp + Math.max(5, Math.round(atk.mhp * 0.25))); const healed = atk.chp - before; atk.status = null; atk.bs = 0; atk.brn = 0; atk.ps = 0; atk.ws = 0; atk.cs = 0; ab.cu--; if (healed > atk.mhp * 0.2) log.push(`💚 ${atk.nm} Healing Prayer restores ${healed} HP + cleanses all statuses!`); rs(); return; }
      if (ab.gdl) { atk.dlt = 2; ab.cu--; log.push(`🔥 ${atk.nm} activates Death Lust! +4 soul damage for 2 turns`); rs(); return; }
      if (ab.gg) { terrain = { tl: 5, e: 'pb' }; ab.cu--; log.push(`☁️ ${atk.nm} releases Goblin Gas! Both sides get poisoned each turn`); rs(); return; }
      if (ab.ro) { const st = atk.ps; if (st > 0) { atk.ps = 0; const heal = st * 9; atk.chp = Math.min(atk.mhp, atk.chp + heal); log.push(`💊 ${atk.nm} Remedial Ointment removes ${st} poison stacks, heals ${heal} HP!`); } ab.cu--; rs(); return; }
      if (ab.ve) { const st = def.ps; if (st > 0) { def.ps = 0; const dmg = st * 15; def.chp -= dmg; def.dtt = true; log.push(`💀 ${atk.nm} Violent Extraction on ${def.nm}! ${st} stacks → ${dmg} soul damage!`); } ab.cu--; rs(); return; }
      if (ab.ch) { ab.cu--; atk.cp = true; rs(); return; }
      if (ab.ap) { if (!atk.apq) atk.apq = []; atk.apq.push({ tl: 2, tgt: def }); ab.cu--; log.push(`🌟 ${atk.nm} channels Ancient Power at ${def.nm}...`); rs(); return; }
      if (ab.tr) {
        const had = [];
        if (atk.status) had.push(atk.status === 'f' ? 'frozen' : 'stun');
        if (atk.ps > 0) had.push(`${atk.ps} poison`);
        if (atk.brn > 0) had.push(`${atk.brn} burn`);
        if (atk.cs > 0) had.push(`${atk.cs} curse`);
        if (atk.status) { def.status = atk.status; atk.status = null; }
        if (atk.ps > 0) { def.ps += atk.ps; atk.ps = 0; }
        if (atk.brn > 0) { def.brn += atk.brn; atk.brn = 0; }
        if (atk.bs > 0) { def.bs += atk.bs; atk.bs = 0; }
        if (atk.ws > 0) { def.ws += atk.ws; atk.ws = 0; }
        if (atk.cs > 0) { def.cs += atk.cs; atk.cs = 0; }
        if (had.length) log.push(`🔄 ${atk.nm} Transference! Dumps ${had.join(', ')} onto ${def.nm}!`);
        ab.cu--; rs(); return;
      }
      if (ab.ml) { const heal = Math.max(8, Math.floor(atk.mhp * 0.25)) * (atk.stn?.p === 'hb' ? 1.3 : 1); atk.chp = Math.min(atk.mhp, atk.chp + Math.floor(heal)); atk.mlHeal = Math.floor(heal); ab.cu--; rs(); return; }
      if (ab.lam) { def.lookAtMeLocked = true; ab.cu--; rs(); return; }
      if (ab.ri) { def.cs += 2; def.brn++; }
      if (ab.rs2) { const r = Math.random(); let cs = 0; if (r < 0.10) cs = 3; else if (r < 0.25) cs = 2; else if (r < 0.50) cs = 1; if (cs > 0) { def.cs += cs; if (cs >= 2) log.push(`📖 ${atk.nm} Read Scripture inflicts ${cs} curse stacks on ${def.nm}!`); } }
      
      let sbDef = 0, sbSpd = 0;
      if (ab.sb) { sbDef = 4; sbSpd = Math.floor(atk.stats.spd * 0.4); atk.stats.def += sbDef; atk.stats.spd -= sbSpd; }
      ab.cu--;
      
      let totalDmg = 0;
      for (let h = 0; h < (ab.dh ? 2 : 1); h++) {
        if (def.chp <= 0) break;
        if (h > 0 && ab.dh && Math.random() < 0.3) { log.push(`${atk.nm}'s Tump Up second hit misses!`); continue; }
        if (def.sa && Math.random() < (def.sa === 'high' ? 1 : 0.2)) { log.push(`🌀 ${def.nm} Swerves the attack!`); continue; }
        let dmg = cd(ab, atk, def);
        if (h > 0 && ab.dh) dmg = Math.round(dmg * 1.5);
        if (ab.cbo && atk.dtt) { dmg = Math.round(dmg * (1 + ab.cbo)); log.push(`⚡ ${atk.nm} Counter Throw bonus! (damaged this turn)`); }
        if (atk.dlt > 0 && !ab.hl && !ab.gdl) dmg += 4;
        let crit = false;
        if (dmg > 0 && !ab.hl && (Math.floor(Math.random() * 100) + 1 + atk.stats.atk) > 100) { dmg = Math.round(dmg * 1.5); crit = true; }
        if (def.st2 > 0 && def.shp > 0 && dmg > 0 && !ab.hl) { const absorbed = Math.min(dmg, def.shp); def.shp -= absorbed; dmg -= absorbed; if (absorbed > 0) log.push(`🛡️ ${def.nm}'s shield absorbs ${absorbed} damage!`); if (def.shp <= 0) { def.st2 = 0; log.push(`💥 ${def.nm}'s shield breaks!`); } }
        if (ab.ev && def.chp > 0) def.ws++;
        if (def.ws > 0 && dmg > 0) dmg += def.ws * 2;
        def.chp -= dmg; def.dtt = true; totalDmg += dmg;
        if (crit) log.push(`💥 CRIT! ${atk.nm}'s ${ab.n} deals ${dmg} damage to ${def.nm}!`);
        if (ab.rs && dmg > 0) { const recoil = Math.max(1, Math.round(dmg * 0.10)); atk.chp = Math.max(1, atk.chp - recoil); }
        if (atk.stn?.p === 'al' && dmg > 0) { const steal = Math.max(1, Math.floor(dmg * 0.10)); atk.chp = Math.min(atk.mhp, atk.chp + steal); }
        if (def.status === 'f' && !ab.rqF) def.status = null;
        if (ab.rqF && def.status === 'f') { def.status = null; log.push(`❄️💀 ${atk.nm} SHATTERS ${def.nm} for ${dmg} soul damage!`); }
        if (ab.dr) { const drained = Math.round(dmg * ab.dr); atk.chp = Math.min(atk.mhp, atk.chp + drained); if (drained >= 8) log.push(`🧛 ${atk.nm} Life Drain heals ${drained} HP from ${def.nm}!`); }
        if (ab.sl) def.swl = true;
        if (atk.stn?.p === 'soh' && !def.status && def.chp > 0 && Math.random() < 0.3 + chab(atk.stats.cha, def.stats.cha)) { def.status = 's'; log.push(`🥊 Dirty Boxing stuns ${def.nm}!`); }
        if (!def.status && def.chp > 0) { let fc = ab.fc || 0; if (atk.stn?.p === 'fa') fc += 0.1; fc += chab(atk.stats.cha, def.stats.cha); if (fc > 0 && Math.random() < fc) { def.status = 'f'; log.push(`❄️ ${def.nm} is frozen!`); } }
        if (ab.bc && def.chp > 0 && Math.random() < ab.bc + chab(atk.stats.cha, def.stats.cha)) { def.bs++; }
        if (atk.stn?.p === 'bpt' && def.chp > 0 && Math.random() < 0.25 + chab(atk.stats.cha, def.stats.cha)) def.bs++;
        if (ab.bn && def.chp > 0 && Math.random() < ab.bn + chab(atk.stats.cha, def.stats.cha)) { def.brn++; log.push(`🔥 ${def.nm} is burning! (${def.brn} stacks)`); }
        if (ab.pc && def.chp > 0 && Math.random() < ab.pc + chab(atk.stats.cha, def.stats.cha)) { aP(def, ab.pst || 1, atk); log.push(`🧪 ${def.nm} poisoned! (${def.ps} stacks)`); }
        if (ab.bm && def.chp > 0) def.bh.push({ dm: Math.round(dmg * (atk.stn?.p === 'bb' ? 1.3 : 1.0)) });
        if (h === 0 && ab.fl && def.chp > 0 && !def.fl && Math.random() < ab.fl + chab(atk.stats.cha, def.stats.cha)) { def.fl = true; log.push(`😵 ${def.nm} flinches from Battlerang!`); }
        if (ab.pst2 && ab.blc && dmg > 0 && def.chp > 0 && Math.random() < ab.blc + chab(atk.stats.cha, def.stats.cha)) def.bs++;
        if (ab.sb && ab.sc && !def.status && def.chp > 0 && Math.random() < ab.sc + chab(atk.stats.cha, def.stats.cha)) { def.status = 's'; log.push(`🛡️💫 Shield Bash stuns ${def.nm}!`); }
        if (atk.stn?.p === 'du' && dmg > 0) { atk.ds += 5; atk.stats.atk += 5; }
      }
      if (atk.ds > 0 && !ab.ch) { atk.stats.atk -= atk.ds; atk.ds = 0; }
      if (ab.sb) { atk.stats.def -= sbDef; atk.stats.spd += sbSpd; }
      if (def.chp <= 0) { def.fainted = true; log.push(`☠️ ${def.nm} falls! (killed by ${atk.nm}'s ${ab.n})`); }
      rs();
    }
    
    doHit(f, s, fm);
    if (s.chp > 0 && !s.fl) doHit(s, f, sm);
    f.fl = false; s.fl = false;
    
    // Chivalry resolve
    if (a.cp && !a.dtt) { const heal = Math.max(10, Math.round(a.mhp * 0.30)); a.chp = Math.min(a.mhp, a.chp + heal); log.push(`⚔️ ${a.nm} stands with honour! Chivalry heals ${heal} HP!`); }
    if (b.cp && !b.dtt) { const heal = Math.max(10, Math.round(b.mhp * 0.30)); b.chp = Math.min(b.mhp, b.chp + heal); log.push(`⚔️ ${b.nm} stands with honour! Chivalry heals ${heal} HP!`); }
    
    // Ancient Power resolve
    for (const fighter of [...t1, ...t2]) {
      if (!fighter.apq) continue;
      for (let i = fighter.apq.length - 1; i >= 0; i--) {
        fighter.apq[i].tl--;
        if (fighter.apq[i].tl <= 0) {
          const ap = fighter.apq.splice(i, 1)[0];
          if (ap.tgt.chp > 0 && !ap.tgt.fainted && !fighter.fainted) {
            const raw = 15 + rollDice(2, 6);
            const m = 0.5 + 0.5 * (rollDice(2, 6) + fighter.stats.int) / (rollDice(2, 6) + ap.tgt.stats.int);
            const dmg = Math.max(1, Math.round(raw * m));
            ap.tgt.chp -= dmg; ap.tgt.dtt = true;
            log.push(`🌟💥 Ancient Power strikes ${ap.tgt.nm} for ${dmg}!`);
            if (ap.tgt.chp <= 0) { ap.tgt.fainted = true; log.push(`☠️ ${ap.tgt.nm} falls to Ancient Power!`); }
          }
        }
      }
    }
    
    // Terrain
    if (terrain && terrain.tl > 0) {
      terrain.tl--;
      if (terrain.e === 'pb') { for (const x of [a, b]) if (x.chp > 0) aP(x, 1, x === a ? b : a); }
      if (terrain.e === 'vine') { const fm2 = ai >= bi ? a : b; if (fm2.chp > 0) { fm2.chp -= 4; fm2.dtt = true; } }
      if (terrain.tl <= 0) terrain = null;
    }
    
    // Tick status
    function tk(b2, enemy) {
      if (b2.stn?.p === 'rt' && b2.chp > 0 && b2.chp < b2.mhp) b2.chp = Math.min(b2.mhp, b2.chp + Math.max(1, Math.floor(b2.mhp * 0.05)));
      if (b2.dlt > 0) b2.dlt--;
      b2.swl = false; b2.lookAtMeLocked = false; b2.slt = !!b2.sa; b2.sa = false; b2.fl = false;
      if (b2.st2 > 0) { b2.st2--; if (b2.st2 <= 0) b2.shp = 0; }
      if (b2.cs > 0 && b2.chp > 0) {
        for (let i = 0; i < b2.cs; i++) {
          if (Math.random() < 0.35) {
            const opts = []; if (b2.status !== 'f') opts.push('f'); if (b2.status !== 's') opts.push('s');
            opts.push('bl', 'bn', 'po', 'wo');
            const c = opts[Math.floor(Math.random() * opts.length)];
            b2.cs--;
            const names = { f: 'FROZEN', s: 'STUN', bl: 'BLIND', bn: 'BURN', po: 'POISON', wo: 'WOUND' };
            if (c === 'f') b2.status = 'f'; else if (c === 's') b2.status = 's';
            else if (c === 'bl') b2.bs++; else if (c === 'bn') b2.brn++;
            else if (c === 'po') b2.ps++; else if (c === 'wo') b2.ws++;
            log.push(`🌀 ${b2.nm}'s curse manifests as ${names[c]}!`);
            break;
          }
        }
      }
      if (b2.stn?.p === 'cpt' && b2.chp > 0 && enemy && enemy.chp > 0) { enemy.cs += 2; }
      if (b2.brn > 0 && b2.chp > 0) { const d2 = Math.max(1, Math.floor(b2.mhp * 0.04 * b2.brn)); b2.chp = Math.max(0, b2.chp - d2); if (Math.random() < 0.5) b2.brn--; if (b2.chp <= 0) { b2.fainted = true; log.push(`☠️ ${b2.nm} burns to death!`); } }
      if (b2.ps > 0 && b2.chp > 0) { b2.chp = Math.max(0, b2.chp - b2.ps * 2); if (b2.chp <= 0) { b2.fainted = true; log.push(`☠️ ${b2.nm} dies to poison! (${b2.ps} stacks)`); } }
      if (b2.bh.length > 0 && b2.chp > 0) { for (const h of b2.bh.splice(0)) { b2.chp = Math.max(0, b2.chp - h.dm); if (b2.chp <= 0) { b2.fainted = true; log.push(`🪃 ${b2.nm} killed by returning boomerang!`); break; } } }
      if (b2.status === 's') b2.status = null;
      if (b2.chp <= 0) b2.fainted = true;
    }
    tk(a, b); tk(b, a);
    
    // Replace fainted
    if (t1[a1].fainted) { const alive = t1.findIndex((m, i) => i !== a1 && !m.fainted); if (alive < 0) return { winner: 2, t1Names, t2Names, log }; a1 = alive; apS(t1[a1], rndS(t1[a1])); }
    if (t2[a2].fainted) { const alive = t2.findIndex((m, i) => i !== a2 && !m.fainted); if (alive < 0) return { winner: 1, t1Names, t2Names, log }; a2 = alive; apS(t2[a2], rndS(t2[a2])); }
  }
  return { winner: 0, t1Names, t2Names, log };
}

// Run many games, find the most interesting ones
const interesting = [];
for (let i = 0; i < 500; i++) {
  const result = runGame();
  if (!result.winner) continue;
  // Score by number of interesting events
  const score = result.log.length;
  if (score >= 12) interesting.push(result);
}

// Sort by most interesting
interesting.sort((a, b) => b.log.length - a.log.length);

// Print top 3
for (let i = 0; i < Math.min(3, interesting.length); i++) {
  const g = interesting[i];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`GAME ${i + 1}: ${g.t1Names} vs ${g.t2Names}`);
  console.log(`Winner: Team ${g.winner} | ${g.log.length} notable events`);
  console.log('='.repeat(60));
  for (const line of g.log) console.log(`  ${line}`);
}
