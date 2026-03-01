'use strict';
// 1v1 matchup matrix with current balance values
function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const SN=['atk','def','con','int','cha','spd'];
function gs(w){const s={};SN.forEach(n=>s[n]=5);let p=42;const tw=SN.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of SN){r-=(w[n]||1);if(r<=0){if(s[n]<20){s[n]++;p--}break}}}return s}
function chab(a,d2){return Math.max(0,(a-d2))*0.02}
const AB={
  lichBlast:{t:'m',s:'int',f:8,dc:[2,6],u:14,fc:0.2},glaciate:{t:'m',s:'int',f:6,dc:[1,4],u:16,fc:0.6},
  lichLifeDrain:{t:'m',s:'int',f:7,dc:[1,8],u:10,dr:0.5},shatter:{t:'s',s:'int',f:20,dc:[2,6],u:6,rqF:1},
  tumpUp:{t:'p',s:'atk',f:4,dc:[1,6],u:16,dh:1},counterThrow:{t:'p',s:'atk',f:6,dc:[1,6],u:10,cm:1,cbo:0.75},
  subdue:{t:'p',s:'atk',f:11,dc:[1,6],u:12,sl:1},deathLust:{t:'p',s:'atk',f:6,dc:[1,4],u:4,gdl:1},
  radialStrike:{t:'p',s:'atk',f:8,dc:[1,6],u:16,bc:0.4},heavenlyBlow:{t:'p',s:'atk',f:7,dc:[1,8],u:10,sd:1},
  healingPrayer:{t:'h',s:'cha',f:0,dc:[1,1],u:4,hp:1,hl:1},
  battlerang:{t:'p',s:'atk',f:8,dc:[1,6],u:14,bm:1,fl:0.25},emberang:{t:'p',s:'atk',f:5,dc:[1,6],u:12,bm:1,bn:0.35},
  whittle:{t:'p',s:'atk',f:4,dc:[1,4],u:4,gw:1},swerve:{t:'p',s:'atk',f:0,dc:[1,1],u:10,sw:1},
  poisonDart:{t:'p',s:'atk',f:7,dc:[1,6],u:14,pc:1.00,pst:2},goblinGas:{t:'p',s:'atk',f:0,dc:[1,1],u:4,gg:1},
  remedialOintment:{t:'h',s:'cha',f:0,dc:[1,1],u:6,ro:1,hl:1},violentExtraction:{t:'s',s:'atk',f:0,dc:[1,1],u:6,ve:1},
  recklessSwing:{t:'p',s:'atk',f:14,dc:[2,6],u:10,rs:1},eviscerate:{t:'p',s:'atk',f:7,dc:[1,6],u:14,ev:1},
  lexShieldBash:{t:'p',s:'atk',f:6,dc:[1,4],u:16,sb:1,sc:0.35},chivalry:{t:'h',s:'def',f:0,dc:[1,1],u:6,ch:1,hl:1},
  petalStorm:{t:'m',s:'int',f:5,dc:[1,4],u:14,pst2:1,blc:0.50},ancientPower:{t:'m',s:'int',f:15,dc:[2,6],u:6,ap:1},
  transference:{t:'s',s:'int',f:0,dc:[1,1],u:4,tr:1},
  moonlight:{t:'h',s:'int',f:0,dc:[1,1],u:8,ml:1,hl:1},readScripture:{t:'s',s:'int',f:10,dc:[1,8],u:14,rs2:1},
  riot:{t:'s',s:'int',f:5,dc:[1,4],u:12,ri:1},lookAtMe:{t:'s',s:'cha',f:0,dc:[1,1],u:6,lam:1},
};
const CLS=[
  {id:'paladin',l:'Paladin',sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},ab:['radialStrike','heavenlyBlow','healingPrayer','heavenlyBlow'],st:[{sb:{cha:2},p:'bpt'},{sb:{def:2},p:'fb'}]},
  {id:'berserker',l:'Berserker',sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},ab:['tumpUp','counterThrow','subdue','deathLust'],st:[{sb:{con:2},p:'soh'},{sb:{def:2},p:'rt'}]},
  {id:'mage',l:'Mage',sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},ab:['lichBlast','glaciate','lichLifeDrain','shatter'],st:[{sb:{con:2,cha:2},p:'fa'},{sb:{int:2},p:'al'}]},
  {id:'ranger',l:'Ranger',sw:{atk:5.5,spd:3,con:3,int:0.5,def:2,cha:1},ab:['battlerang','emberang','whittle','swerve'],st:[{sb:{atk:2},p:'bb'},{sb:{spd:2},p:'gs'}]},
  {id:'rogue',l:'Rogue',sw:{atk:4,spd:4,con:3,int:0.5,def:2,cha:1.5},ab:['poisonDart','goblinGas','remedialOintment','violentExtraction'],st:[{sb:{cha:2},p:'rpt'},{sb:{spd:2},p:'nt'}]},
  {id:'warrior',l:'Warrior',sw:{atk:4,spd:2,con:3.5,int:0.5,def:3,cha:1},ab:['recklessSwing','eviscerate','lexShieldBash','chivalry'],st:[{sb:{atk:3},p:'ov'},{sb:{def:2},p:'du'}]},
  {id:'druid',l:'Druid',sw:{atk:0.5,spd:1,con:1,int:3.5,def:1.5,cha:2},ab:['petalStorm','ancientPower','transference','petalStorm'],st:[{sb:{int:2},p:'og',ogE:1},{sb:{con:2},p:'rest'}]},
  {id:'cleric',l:'Cleric',sw:{atk:0.5,spd:1,con:2,int:3.5,def:2,cha:3},ab:['moonlight','readScripture','riot','lookAtMe'],st:[{sb:{int:2},p:'hb'},{sb:{cha:2},p:'cpt'}]},
];
let terrain=null;
function cr(cls){const stats=gs(cls.sw);const hp=20+stats.con*4;return{cls,nm:cls.l,stats,origStats:{...stats},mhp:hp,chp:hp,ab:cls.ab.map(id=>{const a=AB[id];return{...a,id,cu:a.u}}),st:cls.st,stn:null,status:null,dlt:0,dtt:false,bs:0,brn:0,bh:[],sa:false,slt:false,wb:0,fl:false,ps:0,swl:false,ds:0,cp:false,ws:0,fainted:false,apq:[],cs:0,st2:0,shp:0,mlHeal:0,lookAtMeLocked:false};}
function apS(b,s){b.stn=s;if(s.sb)for(const[k,v]of Object.entries(s.sb))b.stats[k]+=v;if(s.ogE)terrain={tl:5,e:'vine'};}
function rmS(b){if(b.stn?.sb)for(const[k,v]of Object.entries(b.stn.sb))b.stats[k]-=v;b.stn=null;}
function gi(c){const b=rollDice(2,8)+c.stats.spd;if(c.status==='f')return Math.floor(b*0.4);if(c.status==='s')return Math.floor(b*0.5);return b;}
function cd(ab,a,d2){const raw=ab.f+rollDice(ab.dc[0],ab.dc[1]);if(ab.t==='s')return raw;if(ab.hl)return 0;if(ab.sd){return Math.max(1,Math.round(raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.atk)/(rollDice(2,6)+d2.stats.def))+raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.int)/(rollDice(2,6)+d2.stats.int))));}const at=a.stats[ab.s]||a.stats.atk;const ds=ab.t==='p'?d2.stats.def:d2.stats.int;return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+at)/(rollDice(2,6)+ds))));}
function rndS(b){return b.st[Math.floor(Math.random()*b.st.length)];}
function aP(t,st,src){if(src.stn?.p==='rpt'&&Math.random()<0.30+chab(src.stats.cha,t.stats.cha))st+=1;t.ps+=st;}
function am(a,d2){
  if(a.chp<a.mhp*0.3){const hi=a.ab.findIndex(x=>x.hl&&!x.ch&&x.cu>0);if(hi>=0)return a.ab[hi];}
  if(a.ps>=2&&a.chp<a.mhp*0.6){const ri=a.ab.findIndex(x=>x.ro&&x.cu>0);if(ri>=0)return a.ab[ri];}
  const av=a.ab.filter(x=>{if(x.cu<=0)return false;if(x.rqF&&d2.status!=='f')return false;if(x.gw&&a.wb>=8)return false;if(x.ro)return false;return true;});
  if(!av.length)return null;
  const w2=av.map(x=>{if(x.hl&&!x.ch)return a.chp<a.mhp*0.5?30:5;if(x.ch)return a.chp<a.mhp*0.8?15:5;if(x.gdl)return a.dlt>0?0:15;if(x.sw)return a.slt?5:18;if(x.gw)return a.wb===0?22:12;if(x.gg)return!terrain?25:3;if(x.ve)return d2.ps>=4?d2.ps*8:2;if(x.sb)return 12;if(x.ev)return d2.ws<3?18:10;if(x.ap)return 22;if(x.tr)return(a.ps+a.brn+a.bs+a.ws+a.cs)*6+(a.status?15:0);if(x.ml)return a.chp<a.mhp*0.7?20:3;if(x.rs2)return 15;if(x.ri)return 16;if(x.lam)return 10;let avg=x.f+x.dc[0]*(x.dc[1]+1)/2;if(x.dh)avg*=1.8;if(x.cbo&&a.dtt)avg*=1.75;if(x.rqF)avg*=1.3;if(x.bm)avg*=1.4;return avg;});
  const t2=w2.reduce((s,v)=>s+v,0);let r=Math.random()*t2;for(let i=0;i<av.length;i++){r-=w2[i];if(r<=0)return av[i];}return av[av.length-1];
}
function eh(a,d2,ab){
  if(!ab||a.chp<=0||d2.chp<=0)return;
  let suppressed=null;if(a.stn?.p==='ov'&&d2.stn){suppressed=d2.stn.p;d2.stn={...d2.stn,p:null};}
  let sd2=null;if(a.status==='s'){sd2={};for(const s2 of['spd','atk','int','cha']){const r=Math.floor(a.stats[s2]/2);a.stats[s2]-=r;sd2[s2]=r;}}
  const rs=()=>{if(sd2)for(const[s2,v]of Object.entries(sd2))a.stats[s2]+=v;if(suppressed&&d2.stn)d2.stn={...d2.stn,p:suppressed};};
  if(a.status==='f'&&!ab.hp&&Math.random()<0.66){rs();return;}
  if(a.bs>0&&Math.random()<a.bs*0.15){a.bs--;rs();return;}
  if(ab.rqF&&d2.status!=='f'){rs();return;}
  if(ab.gw){a.wb+=4;a.stats.atk+=4;ab.cu--;rs();return;}
  if(ab.sw){ab.cu--;rs();return;}
  if(ab.hl&&ab.hp){a.chp=Math.min(a.mhp,a.chp+Math.max(5,Math.round(a.mhp*0.25)));a.status=null;a.bs=0;a.brn=0;a.ps=0;a.ws=0;a.cs=0;ab.cu--;rs();return;}
  if(ab.gdl){a.dlt=2;ab.cu--;rs();return;}
  if(ab.gg){terrain={tl:5,e:'pb'};ab.cu--;rs();return;}
  if(ab.ro){const st=a.ps;if(st>0){a.ps=0;a.chp=Math.min(a.mhp,a.chp+st*9);}ab.cu--;rs();return;}
  if(ab.ve){const st=d2.ps;if(st>0){d2.ps=0;d2.chp-=st*15;d2.dtt=true;}ab.cu--;rs();return;}
  if(ab.ch){ab.cu--;a.cp=true;rs();return;}
  if(ab.ap){if(!a.apq)a.apq=[];a.apq.push({tl:2,tgt:d2});ab.cu--;rs();return;}
  if(ab.tr){if(a.status){d2.status=a.status;a.status=null;}if(a.ps>0){d2.ps+=a.ps;a.ps=0;}if(a.brn>0){d2.brn+=a.brn;a.brn=0;}if(a.bs>0){d2.bs+=a.bs;a.bs=0;}if(a.ws>0){d2.ws+=a.ws;a.ws=0;}if(a.cs>0){d2.cs+=a.cs;a.cs=0;}ab.cu--;rs();return;}
  if(ab.ml){const heal=Math.max(8,Math.floor(a.mhp*0.25))*(a.stn?.p==='hb'?1.3:1);a.chp=Math.min(a.mhp,a.chp+Math.floor(heal));ab.cu--;rs();return;}
  if(ab.lam){ab.cu--;rs();return;} // No effect in 1v1
  if(ab.ri){d2.cs+=2;d2.brn++;}
  if(ab.rs2){const r=Math.random();let cs=0;if(r<0.10)cs=3;else if(r<0.25)cs=2;else if(r<0.50)cs=1;if(cs>0)d2.cs+=cs;}
  let sbDef=0,sbSpd=0;if(ab.sb){sbDef=4;sbSpd=Math.floor(a.stats.spd*0.4);a.stats.def+=sbDef;a.stats.spd-=sbSpd;}
  ab.cu--;
  for(let h=0;h<(ab.dh?2:1);h++){
    if(d2.chp<=0)break;if(h>0&&ab.dh&&Math.random()<0.3)continue;
    if(d2.sa&&Math.random()<(d2.sa==='high'?1:0.2))continue;
    let dmg=cd(ab,a,d2);if(h>0&&ab.dh)dmg=Math.round(dmg*1.5);
    if(ab.cbo&&a.dtt)dmg=Math.round(dmg*(1+ab.cbo));
    if(a.dlt>0&&!ab.hl&&!ab.gdl)dmg+=4;
    if(dmg>0&&!ab.hl&&(Math.floor(Math.random()*100)+1+a.stats.atk)>100)dmg=Math.round(dmg*1.5);
    if(d2.st2>0&&d2.shp>0&&dmg>0&&!ab.hl){const x=Math.min(dmg,d2.shp);d2.shp-=x;dmg-=x;if(d2.shp<=0)d2.st2=0;}
    if(ab.ev&&d2.chp>0)d2.ws++;
    if(d2.ws>0&&dmg>0)dmg+=d2.ws*2;
    d2.chp-=dmg;d2.dtt=true;
    if(ab.rs&&dmg>0)a.chp=Math.max(1,a.chp-Math.max(1,Math.round(dmg*0.10)));
    if(a.stn?.p==='al'&&dmg>0)a.chp=Math.min(a.mhp,a.chp+Math.max(1,Math.floor(dmg*0.10)));
    if(d2.status==='f'&&!ab.rqF)d2.status=null;if(ab.rqF&&d2.status==='f')d2.status=null;
    if(ab.dr)a.chp=Math.min(a.mhp,a.chp+Math.round(dmg*ab.dr));
    if(ab.sl)d2.swl=true;
    if(a.stn?.p==='soh'&&!d2.status&&d2.chp>0&&Math.random()<0.3+chab(a.stats.cha,d2.stats.cha))d2.status='s';
    if(!d2.status&&d2.chp>0){let fc=ab.fc||0;if(a.stn?.p==='fa')fc+=0.1;fc+=chab(a.stats.cha,d2.stats.cha);if(fc>0&&Math.random()<fc)d2.status='f';}
    if(ab.bc&&d2.chp>0&&Math.random()<ab.bc+chab(a.stats.cha,d2.stats.cha))d2.bs++;
    if(a.stn?.p==='bpt'&&d2.chp>0&&Math.random()<0.25+chab(a.stats.cha,d2.stats.cha))d2.bs++;
    if(ab.bn&&d2.chp>0&&Math.random()<ab.bn+chab(a.stats.cha,d2.stats.cha))d2.brn++;
    if(ab.pc&&d2.chp>0&&Math.random()<ab.pc+chab(a.stats.cha,d2.stats.cha))aP(d2,ab.pst||1,a);
    if(ab.bm&&d2.chp>0)d2.bh.push({dm:Math.round(dmg*(a.stn?.p==='bb'?1.3:1.0))});
    if(h===0&&ab.fl&&d2.chp>0&&!d2.fl&&Math.random()<ab.fl+chab(a.stats.cha,d2.stats.cha))d2.fl=true;
    if(ab.pst2&&ab.blc&&dmg>0&&d2.chp>0&&Math.random()<ab.blc+chab(a.stats.cha,d2.stats.cha))d2.bs++;
    if(ab.sb&&ab.sc&&!d2.status&&d2.chp>0&&Math.random()<ab.sc+chab(a.stats.cha,d2.stats.cha))d2.status='s';
    if(a.stn?.p==='du'&&dmg>0){a.ds+=5;a.stats.atk+=5;}
  }
  if(a.ds>0&&!ab.ch){a.stats.atk-=a.ds;a.ds=0;}
  if(ab.sb){a.stats.def-=sbDef;a.stats.spd+=sbSpd;}
  rs();
}
function tk(b,enemy){
  if(b.stn?.p==='rt'&&b.chp>0&&b.chp<b.mhp)b.chp=Math.min(b.mhp,b.chp+Math.max(1,Math.floor(b.mhp*0.05)));
  if(b.dlt>0)b.dlt--;b.swl=false;b.slt=!!b.sa;b.sa=false;b.fl=false;
  if(b.st2>0){b.st2--;if(b.st2<=0)b.shp=0;}
  if(b.cs>0&&b.chp>0){for(let i=0;i<b.cs;i++){if(Math.random()<0.35){const opts=[];if(b.status!=='f')opts.push('f');if(b.status!=='s')opts.push('s');opts.push('bl','bn','po','wo');const c=opts[Math.floor(Math.random()*opts.length)];b.cs--;if(c==='f')b.status='f';else if(c==='s')b.status='s';else if(c==='bl')b.bs++;else if(c==='bn')b.brn++;else if(c==='po')b.ps++;else if(c==='wo')b.ws++;break;}}}
  if(b.stn?.p==='cpt'&&b.chp>0&&enemy&&enemy.chp>0)enemy.cs+=2;
  if(b.brn>0&&b.chp>0){b.chp=Math.max(0,b.chp-Math.max(1,Math.floor(b.mhp*0.04*b.brn)));if(Math.random()<0.5)b.brn--;}
  if(b.ps>0&&b.chp>0)b.chp=Math.max(0,b.chp-b.ps*2);
  if(b.bh.length>0&&b.chp>0){for(const h of b.bh.splice(0)){b.chp=Math.max(0,b.chp-h.dm);if(b.chp<=0)break;}}
  if(b.status==='s')b.status=null;
  if(b.chp<=0)b.fainted=true;
}
function sim1v1(cls1,cls2,N){
  let w1=0,w2=0;
  for(let i=0;i<N;i++){
    terrain=null;
    const a=cr(cls1),b=cr(cls2);
    apS(a,rndS(a));apS(b,rndS(b));
    if(a.stn?.p==='fb')b.bs+=2;if(b.stn?.p==='fb')a.bs+=2;
    for(let t=0;t<150;t++){
      a.dtt=false;b.dtt=false;a.cp=false;b.cp=false;
      const m1=am(a,b),m2=am(b,a);
      if(!m1&&!m2)break;
      let ai=gi(a),bi=gi(b);
      if(m1?.cm)ai=Math.floor(ai*0.5);if(m2?.cm)bi=Math.floor(bi*0.5);
      if(m1?.sw){ai=Math.floor(ai*1.5);a.sa=!a.slt?'high':'low';}
      if(m2?.sw){bi=Math.floor(bi*1.5);b.sa=!b.slt?'high':'low';}
      if(m1?.ch)ai=-100;if(m2?.ch)bi=-100;
      const[f,s,fm,sm]=ai>=bi?[a,b,m1,m2]:[b,a,m2,m1];
      eh(f,s,fm);if(s.chp>0&&!s.fl)eh(s,f,sm);f.fl=false;s.fl=false;
      if(a.cp&&!a.dtt)a.chp=Math.min(a.mhp,a.chp+Math.max(10,Math.round(a.mhp*0.30)));
      if(b.cp&&!b.dtt)b.chp=Math.min(b.mhp,b.chp+Math.max(10,Math.round(b.mhp*0.30)));
      for(const fighter of[a,b]){if(!fighter.apq)continue;for(let j=fighter.apq.length-1;j>=0;j--){fighter.apq[j].tl--;if(fighter.apq[j].tl<=0){const ap=fighter.apq.splice(j,1)[0];if(ap.tgt.chp>0){const raw=15+rollDice(2,6);const m=0.5+0.5*(rollDice(2,6)+fighter.stats.int)/(rollDice(2,6)+ap.tgt.stats.int);ap.tgt.chp-=Math.max(1,Math.round(raw*m));ap.tgt.dtt=true;}}}}
      if(terrain&&terrain.tl>0){terrain.tl--;if(terrain.e==='pb'){aP(a,1,b);aP(b,1,a);}if(terrain.e==='vine'){const fm2=ai>=bi?a:b;fm2.chp-=4;fm2.dtt=true;}if(terrain.tl<=0)terrain=null;}
      tk(a,b);tk(b,a);
      if(a.chp<=0){w2++;break;}if(b.chp<=0){w1++;break;}
    }
  }
  return{w1,w2};
}

const N=2000;
console.log('\n=== 1v1 MATCHUP MATRIX (current balance, '+N+' games each) ===\n');
const labels=CLS.map(c=>c.l);
const pad=11;
// Header
process.stdout.write(''.padEnd(pad));
for(const l of labels)process.stdout.write(l.substring(0,5).padStart(7));
process.stdout.write('   Avg\n');
const avgWr={};
for(const c of CLS)avgWr[c.l]={wins:0,games:0};
for(let i=0;i<CLS.length;i++){
  process.stdout.write(labels[i].padEnd(pad));
  for(let j=0;j<CLS.length;j++){
    if(i===j){process.stdout.write('   --- ');continue;}
    const r=sim1v1(CLS[i],CLS[j],N);
    const wr=Math.round(r.w1/(r.w1+r.w2)*100);
    avgWr[CLS[i].l].wins+=r.w1;avgWr[CLS[i].l].games+=r.w1+r.w2;
    avgWr[CLS[j].l].wins+=r.w2;avgWr[CLS[j].l].games+=r.w1+r.w2;
    const mark=wr>=60?'⬆':wr<=40?'⬇':' ';
    process.stdout.write(`${mark}${String(wr).padStart(4)}% `);
  }
  const avg=(avgWr[CLS[i].l].wins/avgWr[CLS[i].l].games*100).toFixed(1);
  process.stdout.write(`  ${avg}%\n`);
}
console.log('\n--- Counter relationships (>60% WR) ---');
for(let i=0;i<CLS.length;i++){
  const counters=[];
  for(let j=0;j<CLS.length;j++){
    if(i===j)continue;
    const r=sim1v1(CLS[i],CLS[j],N);
    const wr=r.w1/(r.w1+r.w2)*100;
    if(wr>=60)counters.push(`${CLS[j].l} (${wr.toFixed(0)}%)`);
  }
  if(counters.length)console.log(`  ${CLS[i].l} beats: ${counters.join(', ')}`);
  else console.log(`  ${CLS[i].l}: no hard counters`);
}
