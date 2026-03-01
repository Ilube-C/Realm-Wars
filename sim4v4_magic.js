'use strict';
function d(n){return Math.floor(Math.random()*n)+1}
function rollDice(c,s){let t=0;for(let i=0;i<c;i++)t+=d(s);return t}
const SN=['atk','def','con','int','cha','spd'];
function gs(w){const s={};SN.forEach(n=>s[n]=5);let p=42;const tw=SN.reduce((a,n)=>a+(w[n]||1),0);while(p>0){let r=Math.random()*tw;for(const n of SN){r-=(w[n]||1);if(r<=0){if(s[n]<20){s[n]++;p--}break}}}return s}
function chab(a,d2){return Math.max(0,(a-d2))*0.02}
const AB={
  lichBlast:{t:'m',s:'int',f:8,dc:[2,6],u:14,fc:0.2},glaciate:{t:'m',s:'int',f:6,dc:[1,4],u:16,fc:0.6},
  lichLifeDrain:{t:'s',s:'int',f:7,dc:[1,8],u:10,dr:0.5},shatter:{t:'s',s:'int',f:18,dc:[2,6],u:6,rqF:1},
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
  petalStorm:{t:'m',s:'int',f:5,dc:[1,4],u:14,pst2:1,blc:0.50},
  ancientPower:{t:'m',s:'int',f:15,dc:[2,6],u:6,ap:1},
  transference:{t:'s',s:'int',f:0,dc:[1,1],u:4,tr:1},
  // Cleric
  moonlight:{t:'h',s:'int',f:0,dc:[1,1],u:8,ml:1,hl:1},
  readScripture:{t:'s',s:'int',f:10,dc:[1,8],u:14,rs2:1},
  riot:{t:'s',s:'int',f:5,dc:[1,4],u:12,ri:1},
  lookAtMe:{t:'s',s:'cha',f:0,dc:[1,1],u:6,lam:1},
};
const CLS=[
  {id:'paladin',l:'Paladin',sw:{atk:3,spd:1,con:3,int:1.5,def:4,cha:3.5},ab:['radialStrike','heavenlyBlow','healingPrayer','heavenlyBlow'],st:[{sb:{cha:2},p:'bpt'},{sb:{def:2},p:'fb'}]},
  {id:'berserker',l:'Berserker',sw:{atk:4,spd:1.5,con:3,int:0.5,def:2,cha:1},ab:['tumpUp','counterThrow','subdue','deathLust'],st:[{sb:{con:2},p:'soh'},{sb:{def:2},p:'rt'}]},
  {id:'mage',l:'Mage',sw:{atk:0.5,spd:1.5,con:1.5,int:5,def:2.5,cha:3},ab:['lichBlast','glaciate','lichLifeDrain','shatter'],st:[{sb:{con:2,cha:2},p:'fa'},{sb:{int:2},p:'al'}]},
  {id:'ranger',l:'Ranger',sw:{atk:4.5,spd:3,con:3,int:0.5,def:2,cha:1},ab:['battlerang','emberang','whittle','swerve'],st:[{sb:{atk:2},p:'bb'},{sb:{spd:2},p:'gs'}]},
  {id:'rogue',l:'Rogue',sw:{atk:3,spd:4,con:3,int:0.5,def:2,cha:1.5},ab:['poisonDart','goblinGas','remedialOintment','violentExtraction'],st:[{sb:{cha:2},p:'rpt'},{sb:{spd:2},p:'nt'}]},
  {id:'warrior',l:'Warrior',sw:{atk:4,spd:2,con:3.5,int:0.5,def:3,cha:1},ab:['recklessSwing','eviscerate','lexShieldBash','chivalry'],st:[{sb:{atk:3},p:'ov'},{sb:{def:2},p:'du'}]},
  {id:'druid',l:'Druid',sw:{atk:0.5,spd:1,con:1,int:3.5,def:1.5,cha:2},ab:['petalStorm','ancientPower','transference','petalStorm'],st:[{sb:{int:2},p:'og',ogE:1},{sb:{con:2},p:'rest'}]},
  {id:'cleric',l:'Cleric',sw:{atk:0.5,spd:1,con:2,int:3.5,def:2,cha:3},ab:['moonlight','readScripture','riot','lookAtMe'],st:[{sb:{int:2},p:'hb'},{sb:{cha:2},p:'cpt'}]},
];
let terrain=null;
function cr(cls){const stats=gs(cls.sw);const hp=20+stats.con*4;return{cls,nm:cls.l,stats,origStats:{...stats},mhp:hp,chp:hp,ab:cls.ab.map(id=>{const a=AB[id];return{...a,id,cu:a.u}}),st:cls.st,stn:null,status:null,dlt:0,dtt:false,bs:0,brn:0,bh:[],sa:false,slt:false,wb:0,fl:false,ps:0,swl:false,ds:0,cp:false,ws:0,fainted:false,apq:[],cs:0,st2:0,shp:0,mlHeal:0,lookAtMeLocked:false};}
function apS(b,s){b.stn=s;if(s.sb)for(const[k,v]of Object.entries(s.sb))b.stats[k]+=v;if(s.ogE)terrain={tl:5,e:'vine'};}
function rmS(b){if(b.stn?.sb)for(const[k,v]of Object.entries(b.stn.sb))b.stats[k]-=v;b.stn=null;}
function clrEff(b){
  if(b.stn?.p==='rest'&&b.chp>0&&!b.fainted){b.chp=Math.min(b.mhp,b.chp+Math.floor(b.mhp*0.20));}
  b.dlt=0;b.wb=0;b.sa=false;b.slt=false;b.fl=false;b.swl=false;b.dtt=false;b.ds=0;b.cp=false;b.stats.atk=b.origStats.atk+(b.stn?.sb?.atk||0);if(b.ws>0)b.ws--;rmS(b);
}
function gi(c){const b=rollDice(2,8)+c.stats.spd;if(c.status==='f')return Math.floor(b*0.4);if(c.status==='s')return Math.floor(b*0.5);return b;}
function cd(ab,a,d2){const raw=ab.f+rollDice(ab.dc[0],ab.dc[1]);if(ab.t==='s')return raw;if(ab.hl)return 0;if(ab.sd){return Math.max(1,Math.round(raw/2*(0.5+0.5*(rollDice(2,6)+a.stats.atk)/(rollDice(2,6)+d2.stats.def))+raw/2*(0.55+0.45*(rollDice(2,6)+a.stats.int)/(rollDice(2,6)+d2.stats.int))));}const at=a.stats[ab.s]||a.stats.atk;const ds=ab.t==='p'?d2.stats.def:d2.stats.int;const fl=ab.t==='m'?0.55:0.5;const vr=ab.t==='m'?0.45:0.5;return Math.max(1,Math.round(raw*(fl+vr*(rollDice(2,6)+at)/(rollDice(2,6)+ds))));}
function rndS(b){return b.st[Math.floor(Math.random()*b.st.length)];}
function aP(t,st,src){if(src.stn?.p==='rpt'&&Math.random()<0.30+chab(src.stats.cha,t.stats.cha))st+=1;t.ps+=st;}
function matchScore(me,them){let s=0;if(me.cls.sw.atk>=3&&them.stats.def<10)s+=15;if(me.cls.sw.int>=3&&them.stats.int<10)s+=15;if(me.cls.id==='paladin'&&them.cls.id==='rogue')s+=20;if(me.cls.id==='mage'&&them.cls.id==='paladin')s+=15;if(me.cls.id==='warrior'&&them.cls.id==='rogue')s+=15;if(me.cls.id==='rogue'&&them.cls.id==='mage')s+=5;if(me.cls.id==='warrior'&&them.cls.id==='druid')s+=15;if(me.cls.id==='druid'&&them.cls.id==='rogue')s+=15;if(me.cls.id==='cleric')s-=10; // Cleric prefers not to be active
s+=(me.chp/me.mhp-them.chp/them.mhp)*20;return s;}

function aiDecision(active,bench,enemy,myTeam){
  if(active.swl)return{a:'fight'};
  if(active.lookAtMeLocked)return{a:'fight'}; // Can't switch when locked
  const ab2=bench.filter(b=>!b.fainted&&b!==active);
  if(!ab2.length)return{a:'fight'};
  const cs=matchScore(active,enemy);
  let bs2=null,bsc=cs;
  for(const b of ab2){const sc=matchScore(b,enemy)+(b.chp/b.mhp)*10;if(sc>bsc){bsc=sc;bs2=b;}}
  if(active.chp<active.mhp*0.25&&bs2&&bsc>cs+10)return{a:'switch',t:bs2};
  if(bs2&&bsc>cs+25)return{a:'switch',t:bs2};
  return{a:'fight'};
}

function am(a,d2,myTeam){
  if(a.chp<a.mhp*0.3){const hi=a.ab.findIndex(x=>x.hl&&!x.ch&&x.cu>0);if(hi>=0)return a.ab[hi];}
  if(a.ps>=2&&a.chp<a.mhp*0.6){const ri=a.ab.findIndex(x=>x.ro&&x.cu>0);if(ri>=0)return a.ab[ri];}
  const av=a.ab.filter(x=>{if(x.cu<=0)return false;if(x.rqF&&d2.status!=='f')return false;if(x.gw&&a.wb>=8)return false;if(x.ro)return false;return true;});
  if(!av.length)return null;
  const w2=av.map(x=>{
    if(x.hl&&!x.ch)return a.chp<a.mhp*0.5?30:5;
    if(x.ch)return a.chp<a.mhp*0.8?15:5;
    if(x.gdl)return a.dlt>0?0:15;
    if(x.sw)return a.slt?5:18;
    if(x.gw)return a.wb===0?22:12;
    if(x.gg)return!terrain?25:3;
    if(x.ve)return d2.ps>=4?d2.ps*8:2;
    if(x.sb)return 12;
    if(x.ev)return d2.ws<3?18:10;
    if(x.ap)return 22;
    if(x.tr)return(a.ps+a.brn+a.bs+a.ws+a.cs)*6+(a.status?15:0);
    // Cleric moves
    if(x.ml){const hurt=myTeam?myTeam.filter(m=>!m.fainted&&m.chp<m.mhp*0.8).length:0;return hurt>0?hurt*12:3;}
    if(x.rs2)return 15;
    if(x.ri)return 16;
    if(x.lam)return 10;
    let avg=x.f+x.dc[0]*(x.dc[1]+1)/2;if(x.dh)avg*=1.8;if(x.cbo&&a.dtt)avg*=1.75;if(x.rqF)avg*=1.3;if(x.bm)avg*=1.4;return avg;
  });
  const t2=w2.reduce((s2,v)=>s2+v,0);let r=Math.random()*t2;for(let i=0;i<av.length;i++){r-=w2[i];if(r<=0)return av[i];}return av[av.length-1];
}

function eh(a,d2,ab,myTeam,enemyTeam){
  if(!ab||a.chp<=0||a.fainted||d2.chp<=0||d2.fainted)return;
  let suppressed=null;if(a.stn?.p==='ov'&&d2.stn){suppressed=d2.stn.p;d2.stn={...d2.stn,p:null};}
  let sd2=null;if(a.status==='s'){sd2={};for(const s2 of['spd','atk','int','cha']){const r=Math.floor(a.stats[s2]/2);a.stats[s2]-=r;sd2[s2]=r;}}
  const rs2=()=>{if(sd2)for(const[s2,v]of Object.entries(sd2))a.stats[s2]+=v;if(suppressed&&d2.stn)d2.stn={...d2.stn,p:suppressed};};
  if(a.status==='f'&&!ab.hp&&Math.random()<0.66){rs2();return;}
  if(a.bs>0&&Math.random()<a.bs*0.15){a.bs--;rs2();return;}
  if(ab.rqF&&d2.status!=='f'){rs2();return;}
  if(ab.gw){a.wb+=4;a.stats.atk+=4;ab.cu--;rs2();return;}
  if(ab.sw){ab.cu--;rs2();return;}
  if(ab.hl&&ab.hp){a.chp=Math.min(a.mhp,a.chp+Math.max(5,Math.round(a.mhp*0.25)));a.status=null;a.bs=0;a.brn=0;a.ps=0;a.ws=0;a.cs=0;ab.cu--;rs2();return;}
  if(ab.gdl){a.dlt=2;ab.cu--;rs2();return;}
  if(ab.gg){terrain={tl:5,e:'pb'};ab.cu--;rs2();return;}
  if(ab.ro){const st=a.ps;if(st>0){a.ps=0;a.chp=Math.min(a.mhp,a.chp+st*9);}ab.cu--;rs2();return;}
  if(ab.ve){const st=d2.ps;if(st>0){d2.ps=0;d2.chp-=st*15;d2.dtt=true;}ab.cu--;rs2();return;}
  if(ab.ch){ab.cu--;a.cp=true;rs2();return;}
  if(ab.ap){if(!a.apq)a.apq=[];a.apq.push({tl:2,tgt:d2});ab.cu--;rs2();return;}
  if(ab.tr){if(a.status){d2.status=a.status;a.status=null;}if(a.ps>0){d2.ps+=a.ps;a.ps=0;}if(a.brn>0){d2.brn+=a.brn;a.brn=0;}if(a.bs>0){d2.bs+=a.bs;a.bs=0;}if(a.ws>0){d2.ws+=a.ws;a.ws=0;}if(a.cs>0){d2.cs+=a.cs;a.cs=0;}ab.cu--;rs2();return;}
  // Moonlight: heal self 25% + store heal for next switch-in
  if(ab.ml){
    const heal=Math.max(8,Math.floor(a.mhp*0.25))*(a.stn?.p==='hb'?1.3:1);
    a.chp=Math.min(a.mhp,a.chp+Math.floor(heal));
    a.mlHeal=Math.floor(heal); // stored for next ally switch-in
    ab.cu--;rs2();return;
  }
  // Riot: low soul dmg + 2 curse + 1 burn (falls through to hit)
  if(ab.ri){d2.cs+=2;d2.brn++;}
  // Read Scripture: variable curse stacks (falls through to hit)
  if(ab.rs2){const r=Math.random();let cs=0;if(r<0.10)cs=3;else if(r<0.25)cs=2;else if(r<0.50)cs=1;if(cs>0)d2.cs+=cs;}
  // Look at Me: switch lock
  if(ab.lam){d2.lookAtMeLocked=true;ab.cu--;rs2();return;}
  // Read Scripture: 30% high damage
  // (Read Scripture curse applied above, damage handled by normal hit below)
  let sbDef=0,sbSpd=0;if(ab.sb){sbDef=4;sbSpd=Math.floor(a.stats.spd*0.4);a.stats.def+=sbDef;a.stats.spd-=sbSpd;}
  ab.cu--;
  for(let h=0;h<(ab.dh?2:1);h++){
    if(d2.chp<=0)break;if(h>0&&ab.dh&&Math.random()<0.3)continue;
    if(d2.sa&&Math.random()<(d2.sa==='high'?1:0.2))continue;
    let dmg=cd(ab,a,d2);if(h>0&&ab.dh)dmg=Math.round(dmg*1.5);
    if(ab.cbo&&a.dtt)dmg=Math.round(dmg*(1+ab.cbo));
    if(a.dlt>0&&!ab.hl&&!ab.gdl)dmg+=4;
    // Crit: d100 + ATK > 100 = 1.5x
    if(dmg>0&&!ab.hl&&(Math.floor(Math.random()*100)+1+a.stats.atk)>100){dmg=Math.round(dmg*1.5);}
    // Shield: full block up to shieldHp, excess goes through
    if(d2.st2>0&&d2.shp>0&&dmg>0&&!ab.hl){const ab2=Math.min(dmg,d2.shp);d2.shp-=ab2;dmg-=ab2;if(d2.shp<=0)d2.st2=0;}
    if(ab.ev&&d2.chp>0)d2.ws++;
    if(d2.ws>0&&dmg>0)dmg+=d2.ws*2;
    d2.chp-=dmg;d2.dtt=true;
    if(ab.rs&&dmg>0){a.chp=Math.max(1,a.chp-Math.max(1,Math.round(dmg*0.10)));}
    if(a.stn?.p==='al'&&dmg>0)a.chp=Math.min(a.mhp,a.chp+Math.max(1,Math.floor(dmg*0.10)));
    if(d2.status==='f'&&!ab.rqF){d2.status=null;}if(ab.rqF&&d2.status==='f'){d2.status=null;}
    if(ab.dr)a.chp=Math.min(a.mhp,a.chp+Math.round(dmg*ab.dr));
    if(ab.sl)d2.swl=true;
    if(a.stn?.p==='soh'&&!d2.status&&d2.chp>0&&Math.random()<0.3+chab(a.stats.cha,d2.stats.cha)){d2.status='s';}
    if(!d2.status&&d2.chp>0){let fc=ab.fc||0;if(a.stn?.p==='fa')fc+=0.1;fc+=chab(a.stats.cha,d2.stats.cha);if(fc>0&&Math.random()<fc){d2.status='f';}}
    if(ab.bc&&d2.chp>0&&Math.random()<ab.bc+chab(a.stats.cha,d2.stats.cha))d2.bs++;
    if(a.stn?.p==='bpt'&&d2.chp>0&&Math.random()<0.25+chab(a.stats.cha,d2.stats.cha))d2.bs++;
    if(ab.bn&&d2.chp>0&&Math.random()<ab.bn+chab(a.stats.cha,d2.stats.cha))d2.brn++;
    if(ab.pc&&d2.chp>0&&Math.random()<ab.pc+chab(a.stats.cha,d2.stats.cha))aP(d2,ab.pst||1,a);
    if(ab.bm&&d2.chp>0){d2.bh.push({dm:Math.round(dmg*(a.stn?.p==='bb'?1.3:1.0))});}
    if(h===0&&ab.fl&&d2.chp>0&&!d2.fl&&Math.random()<ab.fl+chab(a.stats.cha,d2.stats.cha))d2.fl=true;
    if(ab.pst2&&ab.blc&&dmg>0&&d2.chp>0&&Math.random()<ab.blc+chab(a.stats.cha,d2.stats.cha))d2.bs++;
    if(ab.sb&&ab.sc&&!d2.status&&d2.chp>0&&Math.random()<ab.sc+chab(a.stats.cha,d2.stats.cha)){d2.status='s';}
    if(a.stn?.p==='du'&&dmg>0){a.ds+=5;a.stats.atk+=5;}
  }
  if(a.ds>0&&!ab.ch){a.stats.atk-=a.ds;a.ds=0;}
  if(ab.sb){a.stats.def-=sbDef;a.stats.spd+=sbSpd;}
  rs2();
}
function tk(b,enemy){
  if(b.stn?.p==='rt'&&b.chp>0&&b.chp<b.mhp)b.chp=Math.min(b.mhp,b.chp+Math.max(1,Math.floor(b.mhp*0.05)));
  if(b.dlt>0)b.dlt--;b.swl=false;b.lookAtMeLocked=false;b.slt=!!b.sa;b.sa=false;b.fl=false;
  // Shield decrement
  if(b.st2>0){b.st2--;if(b.st2<=0)b.shp=0;}
  // Curse tick: can become any status
  if(b.cs>0&&b.chp>0){
    for(let i=0;i<b.cs;i++){
      if(Math.random()<0.35){
        const opts=[];
        if(b.status!=='f')opts.push('f');if(b.status!=='s')opts.push('s');
        opts.push('bl','bn','po','wo');
        const c=opts[Math.floor(Math.random()*opts.length)];b.cs--;
        if(c==='f'){b.status='f';}else if(c==='s'){b.status='s';}
        else if(c==='bl'){b.bs++;}else if(c==='bn'){b.brn++;}
        else if(c==='po'){b.ps++;}else if(c==='wo'){b.ws++;}
        break;
      }
    }
  }
  // Forbidden Sermon: curse per turn
  if(b.stn?.p==='cpt'&&b.chp>0&&enemy&&enemy.chp>0){enemy.cs+=2;}
  if(b.brn>0&&b.chp>0){b.chp=Math.max(0,b.chp-Math.max(1,Math.floor(b.mhp*0.04*b.brn)));if(Math.random()<0.5)b.brn--;}
  if(b.ps>0&&b.chp>0){b.chp=Math.max(0,b.chp-b.ps*2);}
  if(b.bh.length>0&&b.chp>0){for(const h of b.bh.splice(0)){b.chp=Math.max(0,b.chp-h.dm);if(b.chp<=0)break;}}
  if(b.status==='s'){b.status=null;}
  if(b.chp<=0)b.fainted=true;
}

function buildTeam(classes){const team=[];for(const cls of classes)team.push(cr(cls));return{members:team,active:null};}

function sim4v4(){
  terrain=null;
  const pool=[...CLS].sort(()=>Math.random()-0.5);
  const t1=buildTeam(pool.slice(0,4)),t2=buildTeam(pool.slice(4,8));
  t1.active=t1.members[0];t2.active=t2.members[0];
  apS(t1.active,rndS(t1.active));apS(t2.active,rndS(t2.active));
  if(t1.active.stn?.p==='fb')t2.active.bs+=2;if(t2.active.stn?.p==='fb')t1.active.bs+=2;
  for(let turn=0;turn<200;turn++){
    const a=t1.active,b=t2.active;if(!a||!b)break;
    a.dtt=false;b.dtt=false;a.cp=false;b.cp=false;
    const d1=aiDecision(a,t1.members,b,t1.members),d2=aiDecision(b,t2.members,a,t2.members);
    let am1=null,am2=null,sw1=false,sw2=false;
    if(d1.a==='switch'){
      // Look at Me: failed switch grants shield
      if(a.lookAtMeLocked){
        const shT=b.stn?.p==='hb'?3:2;const shH=b.stn?.p==='hb'?20:15;
        for(const m of t2.members){if(!m.fainted){m.st2=Math.max(m.st2,shT);m.shp=Math.max(m.shp,shH);}}
        a.lookAtMeLocked=false;sw1=false;am1=am(a,b,t1.members);
      } else {
        clrEff(a);t1.active=d1.t;apS(t1.active,rndS(t1.active));if(t1.active.stn?.p==='fb')b.bs+=2;
        // Moonlight heal on switch-in
        for(const m of t1.members){if(m!==t1.active&&m.mlHeal>0){t1.active.chp=Math.min(t1.active.mhp,t1.active.chp+m.mlHeal);m.mlHeal=0;break;}}
        sw1=true;
      }
    }else{am1=am(a,b,t1.members);}
    if(d2.a==='switch'){
      if(b.lookAtMeLocked){
        const shT=a.stn?.p==='hb'?3:2;const shH=a.stn?.p==='hb'?20:15;
        for(const m of t1.members){if(!m.fainted){m.st2=Math.max(m.st2,shT);m.shp=Math.max(m.shp,shH);}}
        b.lookAtMeLocked=false;sw2=false;am2=am(b,a,t2.members);
      } else {
        clrEff(b);t2.active=d2.t;apS(t2.active,rndS(t2.active));if(t2.active.stn?.p==='fb')t1.active.bs+=2;
        for(const m of t2.members){if(m!==t2.active&&m.mlHeal>0){t2.active.chp=Math.min(t2.active.mhp,t2.active.chp+m.mlHeal);m.mlHeal=0;break;}}
        sw2=true;
      }
    }else{am2=am(b,a,t2.members);}
    const fa=t1.active,fb=t2.active;
    if(sw1&&sw2){tk(fa,fb);tk(fb,fa);}
    else if(sw1){eh(fb,fa,am2,t2.members,t1.members);tk(fa,fb);tk(fb,fa);}
    else if(sw2){eh(fa,fb,am1,t1.members,t2.members);tk(fa,fb);tk(fb,fa);}
    else{
      if(!am1&&!am2)break;
      let ai2=gi(fa),bi2=gi(fb);
      if(am1?.cm)ai2=Math.floor(ai2*0.5);if(am2?.cm)bi2=Math.floor(bi2*0.5);
      if(am1?.sw){ai2=Math.floor(ai2*1.5);fa.sa=!fa.slt?'high':'low';}
      if(am2?.sw){bi2=Math.floor(bi2*1.5);fb.sa=!fb.slt?'high':'low';}
      if(am1?.ch)ai2=-100;if(am2?.ch)bi2=-100;
      const[f,s,fm,sm,ft,st2]=ai2>=bi2?[fa,fb,am1,am2,t1,t2]:[fb,fa,am2,am1,t2,t1];
      eh(f,s,fm,ft.members,st2.members);if(s.chp>0&&!s.fl)eh(s,f,sm,st2.members,ft.members);f.fl=false;s.fl=false;
      if(fa.cp&&!fa.dtt){fa.chp=Math.min(fa.mhp,fa.chp+Math.max(10,Math.round(fa.mhp*0.30)));}
      if(fb.cp&&!fb.dtt){fb.chp=Math.min(fb.mhp,fb.chp+Math.max(10,Math.round(fb.mhp*0.30)));}
      for(const fighter of[...t1.members,...t2.members]){
        if(!fighter.apq)continue;
        for(let i=fighter.apq.length-1;i>=0;i--){
          fighter.apq[i].tl--;
          if(fighter.apq[i].tl<=0){
            const ap=fighter.apq.splice(i,1)[0];
            if(ap.tgt.chp>0&&!ap.tgt.fainted&&!fighter.fainted){
              const raw=14+rollDice(2,6);const m=0.55+0.45*(rollDice(2,6)+fighter.stats.int)/(rollDice(2,6)+ap.tgt.stats.int);
              const dmg=Math.max(1,Math.round(raw*m));ap.tgt.chp-=dmg;ap.tgt.dtt=true;
            }
          }
        }
      }
      if(terrain&&terrain.tl>0){terrain.tl--;
        if(terrain.e==='pb'){for(const x of[fa,fb]){if(x.chp>0)aP(x,1,x===fa?fb:fa);}}
        if(terrain.e==='vine'){const fm2=ai2>=bi2?fa:fb;if(fm2.chp>0){fm2.chp-=4;fm2.dtt=true;}}
        if(terrain.tl<=0)terrain=null;}
      tk(fa,fb);tk(fb,fa);
    }
    if(t1.active.fainted){const al=t1.members.filter(m=>!m.fainted);if(!al.length)return{w:2,t1:t1.members.map(m=>m.cls.l),t2:t2.members.map(m=>m.cls.l)};let best=al[0],bs2=-999;for(const b2 of al){const sc=matchScore(b2,t2.active);if(sc>bs2){bs2=sc;best=b2;}}t1.active=best;apS(t1.active,rndS(t1.active));if(t1.active.stn?.p==='fb')t2.active.bs+=2;for(const m of t1.members){if(m!==t1.active&&m.mlHeal>0){t1.active.chp=Math.min(t1.active.mhp,t1.active.chp+m.mlHeal);m.mlHeal=0;break;}}}
    if(t2.active.fainted){const al=t2.members.filter(m=>!m.fainted);if(!al.length)return{w:1,t1:t1.members.map(m=>m.cls.l),t2:t2.members.map(m=>m.cls.l)};let best=al[0],bs2=-999;for(const b2 of al){const sc=matchScore(b2,t1.active);if(sc>bs2){bs2=sc;best=b2;}}t2.active=best;apS(t2.active,rndS(t2.active));if(t2.active.stn?.p==='fb')t1.active.bs+=2;for(const m of t2.members){if(m!==t2.active&&m.mlHeal>0){t2.active.chp=Math.min(t2.active.mhp,t2.active.chp+m.mlHeal);m.mlHeal=0;break;}}}
  }
  return{w:0,t1:t1.members.map(m=>m.cls.l),t2:t2.members.map(m=>m.cls.l)};
}

const N=3000;
const classWins={},classPicks={},teamWins={};
for(const cls of CLS){classWins[cls.l]=0;classPicks[cls.l]=0;}
let draws=0;
for(let i=0;i<N;i++){
  const r=sim4v4();if(r.w===0){draws++;continue;}
  const winners=r.w===1?r.t1:r.t2;
  for(const l of winners)classWins[l]++;
  for(const l of[...r.t1,...r.t2])classPicks[l]++;
  const wKey=[...winners].sort().join('+');teamWins[wKey]=(teamWins[wKey]||0)+1;
}
console.log(`\n=== 4v4 TEAM BATTLE (8 chars, ${N} games, ${draws} draws) ===\n`);
console.log('Class win rates (when picked):');
const sorted2=Object.entries(classWins).sort((a,b)=>b[1]-a[1]);
for(const[cls,wins] of sorted2){
  const picks=classPicks[cls];
  const wr=picks>0?(wins/picks*100).toFixed(1):'0';
  console.log(`  ${cls.padEnd(10)} ${wr}% (${wins}W / ${picks} picks)`);
}
console.log('\nTop 10 winning teams:');
const sorted=Object.entries(teamWins).sort((a,b)=>b[1]-a[1]).slice(0,10);
for(const[comp,wins]of sorted)console.log(`  ${comp.padEnd(40)} ${wins} wins`);
