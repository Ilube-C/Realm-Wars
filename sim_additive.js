function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const SN=['atk','def','con','int','cha','spd'];
function gs(w){const s={};SN.forEach(n=>s[n]=5);let p=42;const tw=SN.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of SN){r-=(w[n]||1);if(r<=0){if(s[n]<20){s[n]++;p--}break}}}return s}
function cs(b,diff){return b+Math.max(0,diff)*0.02;} // ADDITIVE
const AB={lichBlast:{t:'m',s:'int',f:7,dc:[2,6],u:14,fc:0.2},glaciate:{t:'m',s:'int',f:5,dc:[1,4],u:16,fc:0.6},lichLifeDrain:{t:'s',s:'int',f:6,dc:[1,8],u:10,dr:0.5},shatter:{t:'s',s:'int',f:18,dc:[2,6],u:6,rqF:1},tumpUp:{t:'p',s:'atk',f:5,dc:[1,6],u:16,dh:1},counterThrow:{t:'p',s:'atk',f:7,dc:[1,6],u:10,cm:1,cb:0.75},subdue:{t:'p',s:'atk',f:12,dc:[1,6],u:12,sl:1},deathLust:{t:'p',s:'atk',f:6,dc:[1,4],u:4,gdl:1},radialStrike:{t:'p',s:'atk',f:9,dc:[1,6],u:16,bc:0.4},heavenlyBlow:{t:'p',s:'atk',f:8,dc:[1,8],u:10,sd:1},healingPrayer:{t:'h',s:'cha',f:0,dc:[1,1],u:4,hp:1,hl:1},battlerang:{t:'p',s:'atk',f:8,dc:[1,6],u:14,bm:1,fl:0.25},emberang:{t:'p',s:'atk',f:5,dc:[1,6],u:12,bm:1,bn:0.35},whittle:{t:'p',s:'atk',f:4,dc:[1,4],u:4,gw:1},swerve:{t:'p',s:'atk',f:0,dc:[1,1],u:10,sw:1},poisonDart:{t:'p',s:'atk',f:8,dc:[1,6],u:14,pc:0.60,pst:3},goblinGas:{t:'p',s:'atk',f:0,dc:[1,1],u:4,gg:1},remedialOintment:{t:'h',s:'cha',f:0,dc:[1,1],u:6,ro:1,hl:1},violentExtraction:{t:'s',s:'atk',f:0,dc:[1,1],u:6,ve:1}};
const CLS=[
  {id:'P',l:'Paladin',sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},ab:['radialStrike','heavenlyBlow','healingPrayer','heavenlyBlow'],st:[{sb:{cha:2},p:'bpt'},{sb:{def:2},p:'fb'}]},
  {id:'B',l:'Berserker',sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},ab:['tumpUp','counterThrow','subdue','deathLust'],st:[{sb:{con:2},p:'soh'},{sb:{def:2},p:'rt'}]},
  {id:'M',l:'Mage',sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},ab:['lichBlast','glaciate','lichLifeDrain','shatter'],st:[{sb:{con:2,cha:2},p:'fa'},{sb:{int:3},p:'al'}]},
  {id:'Ra',l:'Ranger',sw:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},ab:['battlerang','emberang','whittle','swerve'],st:[{sb:{atk:2},p:'bb'},{sb:{spd:2},p:'gs'}]},
  {id:'Ro',l:'Rogue',sw:{atk:3,spd:4,con:3,int:0.5,def:2,cha:1.5},ab:['poisonDart','goblinGas','remedialOintment','violentExtraction'],st:[{sb:{cha:2},p:'rpt'},{sb:{spd:2},p:'nt'}]},
];
let terrain=null;
function cr(cls){const stats=gs(cls.sw);const hp=20+stats.con*4;return{cls,nm:cls.l,stats,mhp:hp,chp:hp,ab:cls.ab.map(id=>{const a=AB[id];return{...a,id,cu:a.u}}),st:cls.st,stn:null,status:null,dlt:0,dtt:false,bs:0,brn:0,bh:[],sa:false,slt:false,wb:0,fl:false,ps:0,swl:false};}
function apS(b,s){b.stn=s;if(s.sb)for(const[k,v]of Object.entries(s.sb))b.stats[k]+=v;}
function gi(c){const b=rollDice(2,8)+c.stats.spd;if(c.status==='f')return Math.floor(b*0.4);if(c.status==='s')return Math.floor(b*0.5);return b;}
function cd(ab,a,d){const raw=ab.f+rollDice(ab.dc[0],ab.dc[1]);if(ab.t==='s')return raw;if(ab.hl)return 0;if(ab.sd){return Math.max(1,Math.round(raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.atk)/(rollDice(2,6)+d.stats.def))+raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.int)/(rollDice(2,6)+d.stats.int))));}const at=a.stats[ab.s]||a.stats.atk;const ds=ab.t==='p'?d.stats.def:d.stats.int;return Math.max(1,Math.round(raw*(0.5+0.5*(rollDice(2,6)+at)/(rollDice(2,6)+ds))));}
function rS(b){return b.st[Math.floor(Math.random()*b.st.length)];}
function aP(t,st,src){if(src.stn?.p==='rpt'&&Math.random()<cs(0.30,src.stats.cha-t.stats.cha))st+=1;t.ps+=st;}
function am(a,d2){
  if(a.chp<a.mhp*0.3){const hi=a.ab.findIndex(x=>x.hl&&x.cu>0);if(hi>=0)return a.ab[hi];}
  if(a.ps>=2&&a.chp<a.mhp*0.6){const ri=a.ab.findIndex(x=>x.ro&&x.cu>0);if(ri>=0)return a.ab[ri];}
  const av=a.ab.filter(x=>{if(x.cu<=0)return false;if(x.rqF&&d2.status!=='f')return false;if(x.gw&&a.wb>=8)return false;if(x.ro)return false;return true;});
  if(!av.length)return null;
  const w=av.map(x=>{if(x.hl)return a.chp<a.mhp*0.5?30:5;if(x.gdl)return a.dlt>0?0:15;if(x.sw)return a.slt?5:18;if(x.gw)return a.wb===0?22:12;if(x.gg)return!terrain?25:3;if(x.ve)return d2.ps>=4?d2.ps*8:2;let avg=x.f+x.dc[0]*(x.dc[1]+1)/2;if(x.dh)avg*=1.8;if(x.cb&&a.dtt)avg*=1.75;if(x.rqF)avg*=1.3;if(x.bm)avg*=1.4;return avg;});
  const t=w.reduce((s2,v)=>s2+v,0);let r=Math.random()*t;for(let i=0;i<av.length;i++){r-=w[i];if(r<=0)return av[i];}return av[av.length-1];
}
function eh(a,d2,ab){
  if(!ab||a.chp<=0||d2.chp<=0)return;
  let sd2=null;if(a.status==='s'){sd2={};for(const s2 of['spd','atk','int','cha']){const r=Math.floor(a.stats[s2]/2);a.stats[s2]-=r;sd2[s2]=r;}}
  const rs2=()=>{if(sd2)for(const[s2,v]of Object.entries(sd2))a.stats[s2]+=v;};
  if(a.status==='f'&&!ab.hp&&Math.random()<0.66){rs2();return;}
  if(a.bs>0&&Math.random()<a.bs*0.15){a.bs--;rs2();return;}
  if(ab.rqF&&d2.status!=='f'){rs2();return;}
  if(ab.gw){a.wb+=4;a.stats.atk+=4;ab.cu--;rs2();return;}
  if(ab.sw){ab.cu--;rs2();return;}
  if(ab.hl&&ab.hp){a.chp=Math.min(a.mhp,a.chp+Math.max(5,Math.round(a.mhp*0.25)));a.status=null;a.bs=0;a.brn=0;a.ps=0;ab.cu--;rs2();return;}
  if(ab.gdl){a.dlt=2;ab.cu--;rs2();return;}
  if(ab.gg){terrain={tl:5,e:'pb'};ab.cu--;rs2();return;}
  if(ab.ro){const st=a.ps;if(st>0){a.ps=0;a.chp=Math.min(a.mhp,a.chp+st*7);}ab.cu--;rs2();return;}
  if(ab.ve){const st=d2.ps;if(st>0){d2.ps=0;d2.chp-=st*10;d2.dtt=true;}ab.cu--;rs2();return;}
  ab.cu--;
  for(let h=0;h<(ab.dh?2:1);h++){
    if(d2.chp<=0)break;if(h>0&&ab.dh&&Math.random()<0.3)continue;
    if(d2.sa&&!ab.hl&&!ab.sw&&!ab.gw&&Math.random()<(d2.sa==='high'?1:0.2))continue;
    let dmg=cd(ab,a,d2);if(h>0&&ab.dh)dmg=Math.round(dmg*1.5);
    if(ab.cb&&a.dtt)dmg=Math.round(dmg*(1+ab.cb));
    if(a.dlt>0&&!ab.hl&&!ab.gdl)dmg+=5;
    d2.chp-=dmg;d2.dtt=true;
    if(a.stn?.p==='al'&&dmg>0)a.chp=Math.min(a.mhp,a.chp+Math.max(1,Math.floor(dmg*0.15)));
    if(d2.status==='f'&&!ab.rqF){d2.status=null;}
    if(ab.rqF&&d2.status==='f'){d2.status=null;}
    if(ab.dr)a.chp=Math.min(a.mhp,a.chp+Math.round(dmg*ab.dr));
    if(ab.sl)d2.swl=true;
    if(a.stn?.p==='soh'&&!d2.status&&d2.chp>0&&Math.random()<cs(0.3,a.stats.cha-d2.stats.cha)){d2.status='s';}
    if(!d2.status&&d2.chp>0){let fc=ab.fc||0;if(a.stn?.p==='fa')fc+=0.1;fc=cs(fc,a.stats.cha-d2.stats.cha);if(fc>0&&Math.random()<fc){d2.status='f';}}
    if(ab.bc&&d2.chp>0&&Math.random()<cs(ab.bc,a.stats.cha-d2.stats.cha))d2.bs++;
    if(a.stn?.p==='bpt'&&d2.chp>0&&Math.random()<cs(0.25,a.stats.cha-d2.stats.cha))d2.bs++;
    if(ab.bn&&d2.chp>0&&Math.random()<cs(ab.bn,a.stats.cha-d2.stats.cha))d2.brn++;
    if(ab.pc&&d2.chp>0&&Math.random()<cs(ab.pc,a.stats.cha-d2.stats.cha))aP(d2,ab.pst||1,a);
    if(ab.bm&&d2.chp>0){d2.bh.push({dm:Math.round(dmg*(a.stn?.p==='bb'?1.3:1.0))});}
    if(h===0&&ab.fl&&d2.chp>0&&!d2.fl&&Math.random()<cs(ab.fl,a.stats.cha-d2.stats.cha))d2.fl=true;
  }
  rs2();
}
function tk(b){
  if(b.stn?.p==='rt'&&b.chp>0&&b.chp<b.mhp)b.chp=Math.min(b.mhp,b.chp+Math.max(1,Math.floor(b.mhp*0.05)));
  if(b.dlt>0)b.dlt--;b.swl=false;b.slt=!!b.sa;b.sa=false;b.fl=false;
  if(b.brn>0&&b.chp>0){b.chp=Math.max(0,b.chp-Math.max(1,Math.floor(b.mhp*0.04*b.brn)));if(Math.random()<0.5)b.brn--;}
  if(b.ps>0&&b.chp>0){b.chp=Math.max(0,b.chp-b.ps*2);}
  if(b.bh.length>0&&b.chp>0){for(const h of b.bh.splice(0)){b.chp=Math.max(0,b.chp-h.dm);if(b.chp<=0)break;}}
  if(b.status==='s'){b.status=null;}
}
function sim(c1,c2){
  terrain=null;const a=cr(c1),b=cr(c2);apS(a,rS(a));apS(b,rS(b));
  if(a.stn.p==='fb')b.bs+=2;if(b.stn.p==='fb')a.bs+=2;
  for(let t=0;t<100;t++){
    a.dtt=false;b.dtt=false;const a2=am(a,b),b2=am(b,a);if(!a2&&!b2)break;
    let ai=gi(a),bi=gi(b);
    if(a2?.cm)ai=Math.floor(ai*0.5);if(b2?.cm)bi=Math.floor(bi*0.5);
    if(a2?.sw){ai=Math.floor(ai*1.5);a.sa=!a.slt?'high':'low';}
    if(b2?.sw){bi=Math.floor(bi*1.5);b.sa=!b.slt?'high':'low';}
    const[f,s,fm,sm]=ai>=bi?[a,b,a2,b2]:[b,a,b2,a2];
    eh(f,s,fm);if(s.chp>0&&!s.fl)eh(s,f,sm);f.fl=false;s.fl=false;
    if(terrain&&terrain.tl>0){terrain.tl--;if(terrain.e==='pb'){for(const x of[a,b]){if(x.chp>0)aP(x,1,x===a?b:a);}}if(terrain.tl<=0)terrain=null;}
    tk(a);tk(b);if(a.chp<=0||b.chp<=0)break;
  }
  if(a.chp>0&&b.chp<=0)return c1.id;if(b.chp>0&&a.chp<=0)return c2.id;return'draw';
}
const N=2000;
console.log('=== FULL 1v1 (Additive CHA + all current changes) ===');
for(let i=0;i<CLS.length;i++){for(let j=i+1;j<CLS.length;j++){
  const c1=CLS[i],c2=CLS[j],res={[c1.id]:0,[c2.id]:0,draw:0};
  for(let k=0;k<N;k++)res[sim(c1,c2)]++;
  console.log(`${c1.l} vs ${c2.l}: ${(res[c1.id]/N*100).toFixed(1)}% | ${(res[c2.id]/N*100).toFixed(1)}% | ${(res.draw/N*100).toFixed(1)}% draw`);
}}
