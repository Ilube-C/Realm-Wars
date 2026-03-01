function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const SB=72,SF=5,SC=20,SN=['atk','def','con','int','cha','spd'];
function gs(cls){const w=cls.sw;const s={};SN.forEach(n=>s[n]=SF);let p=42;const tw=SN.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of SN){r-=(w[n]||1);if(r<=0){if(s[n]<SC){s[n]++;p--}break}}}return s}
function chaScale(base,aCha,dCha){return base*(1+(aCha-dCha)*0.02);}
const AB={
  lichBlast:{n:'Lich Blast',t:'magical',s:'int',f:7,dc:[2,6],u:14,fc:0.2},
  glaciate:{n:'Glaciate',t:'magical',s:'int',f:5,dc:[1,4],u:16,fc:0.6},
  lichLifeDrain:{n:'Life Drain',t:'soul',s:'int',f:6,dc:[1,8],u:10,dr:0.5},
  shatter:{n:'Shatter',t:'soul',s:'int',f:18,dc:[2,6],u:6,rqF:1},
  tumpUp:{n:'Tump Up',t:'physical',s:'atk',f:5,dc:[1,6],u:16,dh:1},
  counterThrow:{n:'Counter Throw',t:'physical',s:'atk',f:7,dc:[1,6],u:10,cm:1,cb:0.75},
  subdue:{n:'Subdue',t:'physical',s:'atk',f:12,dc:[1,6],u:12,sl:1},
  deathLust:{n:'Death Lust',t:'physical',s:'atk',f:6,dc:[1,4],u:4,gdl:1},
  radialStrike:{n:'Radial Strike',t:'physical',s:'atk',f:9,dc:[1,6],u:16,bc:0.4},
  makeWay:{n:'Make Way',t:'physical',s:'atk',f:5,dc:[1,4],u:6,mw:1},
  heavenlyBlow:{n:'Heavenly Blow',t:'physical',s:'atk',f:8,dc:[1,8],u:10,sd:1},
  healingPrayer:{n:'Healing Prayer',t:'heal',s:'cha',f:0,dc:[1,1],u:4,hp:1,hl:1},
  battlerang:{n:'Battlerang',t:'physical',s:'atk',f:8,dc:[1,6],u:14,bm:1,fl:0.25},
  emberang:{n:'Emberang',t:'physical',s:'atk',f:5,dc:[1,6],u:12,bm:1,bn:0.35},
  whittle:{n:'Whittle',t:'physical',s:'atk',f:4,dc:[1,4],u:4,gw:1},
  swerve:{n:'Swerve',t:'physical',s:'atk',f:0,dc:[1,1],u:10,sw:1},
  poisonDart:{n:'Poison Dart',t:'physical',s:'atk',f:8,dc:[1,6],u:14,pc:0.60,pst:3},
  goblinGas:{n:'Goblin Gas',t:'physical',s:'atk',f:0,dc:[1,1],u:4,gg:1},
  remedialOintment:{n:'Remedial Ointment',t:'heal',s:'cha',f:0,dc:[1,1],u:6,ro:1,hl:1},
  violentExtraction:{n:'Violent Extraction',t:'soul',s:'atk',f:0,dc:[1,1],u:6,ve:1},
};
const CLS=[
  {id:'sirShining',l:'Paladin',sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},ab:['radialStrike','makeWay','heavenlyBlow','healingPrayer'],st:[{sb:{cha:2},p:'blindPerTurn'},{sb:{def:2},p:'flashyBlind'}]},
  {id:'pitDweller',l:'Berserker',sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},ab:['tumpUp','counterThrow','subdue','deathLust'],st:[{sb:{con:2},p:'stunOnHit'},{sb:{def:2},p:'regenTick'}]},
  {id:'lich',l:'Mage',sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},ab:['lichBlast','glaciate','lichLifeDrain','shatter'],st:[{sb:{con:2,cha:2},p:'freezeAll'},{sb:{int:3},p:'attackLifesteal'}]},
  {id:'rexRang',l:'Ranger',sw:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},ab:['battlerang','emberang','whittle','swerve'],st:[{sb:{atk:2},p:'boomerangBonus'},{sb:{spd:2},p:'guerillaSwitchOut'}]},
  {id:'countCoction',l:'Rogue',sw:{atk:3,spd:4,con:3,int:0.5,def:2,cha:1.5},ab:['poisonDart','goblinGas','remedialOintment','violentExtraction'],st:[{sb:{cha:2},p:'rapidTransmission'},{sb:{spd:2},p:'neurotoxin'}]},
];
const lv=8;let terrain=null;
function cr(cls){const stats=gs(cls);const hp=20+stats.con*lv*0.5;return{cls,nm:cls.l,stats,mhp:hp,chp:hp,lv,ab:cls.ab.map(id=>{const a=AB[id];return{...a,id,cu:a.u}}),st:cls.st,stn:null,status:null,st2:0,dlt:0,dtt:false,bs:0,brn:0,bh:[],sa:false,slt:false,wb:0,fl:false,ps:0,swl:false};}
function as(b,s){b.stn=s;if(s.sb)for(const[k,v]of Object.entries(s.sb))b.stats[k]+=v;}
function gi(c){const b=rollDice(2,8)+c.stats.spd;if(c.status==='frozen')return Math.floor(b*0.4);if(c.status==='stun')return Math.floor(b*0.5);return b;}
function cd(ab,a,d){const raw=ab.f+rollDice(ab.dc[0],ab.dc[1]);if(ab.t==='soul')return raw;if(ab.hl)return 0;if(ab.sd){return Math.max(1,Math.round(raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.atk)/(rollDice(2,6)+d.stats.def))+raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.int)/(rollDice(2,6)+d.stats.int))));}const at=a.stats[ab.s]||a.stats.atk;const ds=ab.t==='physical'?d.stats.def:d.stats.int;return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+at)/(rollDice(2,6)+ds))));}
function rs2(b){return b.st[Math.floor(Math.random()*b.st.length)];}
function ap(t,st,src){if(src.stn?.p==='rapidTransmission'&&Math.random()<chaScale(0.30,src.stats.cha,t.stats.cha))st+=1;t.ps+=st;}
function am(a,d){
  if(a.chp<a.mhp*0.3){const hi=a.ab.findIndex(x=>x.hl&&x.cu>0);if(hi>=0)return a.ab[hi];}
  if(a.ps>=2&&a.chp<a.mhp*0.6){const ri=a.ab.findIndex(x=>x.ro&&x.cu>0);if(ri>=0)return a.ab[ri];}
  const av=a.ab.filter(x=>{if(x.cu<=0)return false;if(x.rqF&&d.status!=='frozen')return false;if(x.mw)return false;if(x.gw&&a.wb>=8)return false;if(x.ro)return false;return true;});
  if(!av.length)return null;
  const w=av.map(x=>{if(x.hl)return a.chp<a.mhp*0.5?30:5;if(x.gdl)return a.dlt>0?0:15;if(x.sw)return a.slt?5:18;if(x.gw)return a.wb===0?22:12;if(x.gg)return!terrain?25:3;if(x.ve)return d.ps>=4?d.ps*8:2;let avg=x.f+x.dc[0]*(x.dc[1]+1)/2;if(x.dh)avg*=1.8;if(x.cb&&a.dtt)avg*=1.75;if(x.rqF)avg*=1.3;if(x.bm)avg*=1.4;return avg;});
  const t=w.reduce((s,v)=>s+v,0);let r=Math.random()*t;for(let i=0;i<av.length;i++){r-=w[i];if(r<=0)return av[i];}return av[av.length-1];
}
function eh(a,d,ab){
  if(!ab||a.chp<=0||d.chp<=0)return;
  let sd=null;if(a.status==='stun'){sd={};for(const s of['spd','atk','int','cha']){const r=Math.floor(a.stats[s]/2);a.stats[s]-=r;sd[s]=r;}}
  const rs=()=>{if(sd)for(const[s,v]of Object.entries(sd))a.stats[s]+=v;};
  if(a.status==='frozen'&&!ab.hp&&Math.random()<0.66){rs();return;}
  if(a.bs>0&&Math.random()<a.bs*0.15){a.bs--;rs();return;}
  if(ab.rqF&&d.status!=='frozen'){rs();return;}
  if(ab.gw){a.wb+=4;a.stats.atk+=4;ab.cu--;rs();return;}
  if(ab.sw){ab.cu--;rs();return;}
  if(ab.hl&&ab.hp){a.chp=Math.min(a.mhp,a.chp+Math.max(5,Math.round(a.mhp*0.25)));a.status=null;a.st2=0;a.bs=0;a.brn=0;a.ps=0;ab.cu--;rs();return;}
  if(ab.gdl){a.dlt=2;ab.cu--;rs();return;}
  if(ab.gg){terrain={tl:5,e:'pb'};ab.cu--;rs();return;}
  if(ab.ro){const st=a.ps;if(st>0){a.ps=0;a.chp=Math.min(a.mhp,a.chp+st*7);}ab.cu--;rs();return;}
  if(ab.ve){const st=d.ps;if(st>0){d.ps=0;d.chp-=st*10;d.dtt=true;}ab.cu--;rs();return;}
  ab.cu--;
  for(let h=0;h<(ab.dh?2:1);h++){
    if(d.chp<=0)break;if(h>0&&ab.dh&&Math.random()<0.3)continue;
    if(d.sa&&!ab.hl&&!ab.sw&&!ab.gw&&Math.random()<(d.sa==='high'?1:0.2))continue;
    let dmg=cd(ab,a,d);if(h>0&&ab.dh)dmg=Math.round(dmg*1.5);
    if(ab.cb&&a.dtt)dmg=Math.round(dmg*(1+ab.cb));
    if(a.dlt>0&&!ab.hl&&!ab.gdl)dmg+=5;
    d.chp-=dmg;d.dtt=true;
    if(a.stn?.p==='attackLifesteal'&&dmg>0)a.chp=Math.min(a.mhp,a.chp+Math.max(1,Math.floor(dmg*0.15)));
    if(d.status==='frozen'&&!ab.rqF){d.status=null;d.st2=0;}
    if(ab.rqF&&d.status==='frozen'){d.status=null;d.st2=0;}
    if(ab.dr)a.chp=Math.min(a.mhp,a.chp+Math.round(dmg*ab.dr));
    if(ab.sl)d.swl=true;
    if(a.stn?.p==='stunOnHit'&&!d.status&&d.chp>0&&Math.random()<chaScale(0.3,a.stats.cha,d.stats.cha)){d.status='stun';d.st2=1;}
    if(!d.status&&d.chp>0){let fc=ab.fc||0;if(a.stn?.p==='freezeAll')fc+=0.1;fc=chaScale(fc,a.stats.cha,d.stats.cha);if(fc>0&&Math.random()<fc){d.status='frozen';d.st2=99;}}
    if(ab.bc&&d.chp>0&&Math.random()<chaScale(ab.bc,a.stats.cha,d.stats.cha))d.bs++;
    if(a.stn?.p==='blindPerTurn'&&d.chp>0&&Math.random()<chaScale(0.25,a.stats.cha,d.stats.cha))d.bs++;
    if(ab.bn&&d.chp>0&&Math.random()<chaScale(ab.bn,a.stats.cha,d.stats.cha))d.brn++;
    if(ab.pc&&d.chp>0&&Math.random()<chaScale(ab.pc,a.stats.cha,d.stats.cha))ap(d,ab.pst||1,a);
    if(ab.bm&&d.chp>0){d.bh.push({dm:Math.round(dmg*(a.stn?.p==='boomerangBonus'?1.3:1.0))});}
    if(h===0&&ab.fl&&d.chp>0&&!d.fl&&Math.random()<chaScale(ab.fl,a.stats.cha,d.stats.cha))d.fl=true;
  }
  rs();
}
function tk(b){
  if(b.stn?.p==='regenTick'&&b.chp>0&&b.chp<b.mhp)b.chp=Math.min(b.mhp,b.chp+Math.max(1,Math.floor(b.mhp*0.05)));
  if(b.dlt>0)b.dlt--;b.swl=false;b.slt=!!b.sa;b.sa=false;b.fl=false;
  if(b.brn>0&&b.chp>0){b.chp=Math.max(0,b.chp-Math.max(1,Math.floor(b.mhp*0.04*b.brn)));if(Math.random()<0.5)b.brn--;}
  if(b.ps>0&&b.chp>0){b.chp=Math.max(0,b.chp-b.ps*2);}
  if(b.bh.length>0&&b.chp>0){for(const h of b.bh.splice(0)){b.chp=Math.max(0,b.chp-h.dm);if(b.chp<=0)break;}}
  if(b.status==='stun'){b.status=null;b.st2=0;}
}
function sim(c1,c2){
  terrain=null;const a=cr(c1),b=cr(c2);
  as(a,rs2(a));as(b,rs2(b));
  if(a.stn.p==='flashyBlind')b.bs+=2;if(b.stn.p==='flashyBlind')a.bs+=2;
  for(let t=0;t<100;t++){
    a.dtt=false;b.dtt=false;
    const am2=am(a,b),bm2=am(b,a);if(!am2&&!bm2)break;
    let ai=gi(a),bi=gi(b);
    if(am2?.cm)ai=Math.floor(ai*0.5);if(bm2?.cm)bi=Math.floor(bi*0.5);
    if(am2?.sw){ai=Math.floor(ai*1.5);a.sa=!a.slt?'high':'low';}
    if(bm2?.sw){bi=Math.floor(bi*1.5);b.sa=!b.slt?'high':'low';}
    const[f,s,fm,sm]=ai>=bi?[a,b,am2,bm2]:[b,a,bm2,am2];
    eh(f,s,fm);if(s.chp>0&&!s.fl)eh(s,f,sm);f.fl=false;s.fl=false;
    if(terrain&&terrain.tl>0){terrain.tl--;if(terrain.e==='pb'){for(const x of[a,b]){if(x.chp>0)ap(x,1,x===a?b:a);}}if(terrain.tl<=0)terrain=null;}
    tk(a);tk(b);if(a.chp<=0||b.chp<=0)break;
  }
  if(a.chp>0&&b.chp<=0)return c1.id;if(b.chp>0&&a.chp<=0)return c2.id;return'draw';
}
const N=3000;
console.log('=== FULL 1v1 MATRIX (with multiplicative CHA + buffed Rogue) ===');
for(let i=0;i<CLS.length;i++){for(let j=i+1;j<CLS.length;j++){
  const c1=CLS[i],c2=CLS[j],res={[c1.id]:0,[c2.id]:0,draw:0};
  for(let k=0;k<N;k++)res[sim(c1,c2)]++;
  console.log(`${c1.l} vs ${c2.l}: ${(res[c1.id]/N*100).toFixed(1)}% | ${(res[c2.id]/N*100).toFixed(1)}% | ${(res.draw/N*100).toFixed(1)}% draw`);
}}
