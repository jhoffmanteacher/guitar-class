import fs from 'fs'; import {extract} from './extract.mjs';
const [oldP,newP]=process.argv.slice(2);
const SR=48000, HWLAT=70;  // ms the mic path delays the sound
let vnow=0;
// --- the "room": signal as a function of sample index (time since start)
function makeSignal({bpm, notes, room, quiet, seed}){
  let s=seed; const r=()=> (s=(s*1664525+1013904223)>>>0)/4294967296;
  const beat=60000/bpm, ev=[];
  notes.forEach((m,i)=>ev.push({t:1000+i*beat, f:440*2**((m-69)/12), a:0.25*quiet, mine:true, m}));
  if(room) for(let t=0;t<1000+notes.length*beat+1000;t+=150+r()*400) ev.push({t, f:440*2**((40+Math.floor(r()*30)-69)/12), a:0.25*room*(0.4+r()*0.6), mine:false});
  const total=Math.ceil((1000+notes.length*beat+2000)/1000*SR);
  const x=new Float32Array(total);
  for(let i=0;i<total;i++) x[i]=(r()-0.5)*0.004;
  for(const e of ev){
    const i0=Math.round(e.t/1000*SR);
    for(let i=i0;i<Math.min(total,i0+SR*2);i++){
      const tt=(i-i0)/SR, env=Math.exp(-tt/0.6)*e.a;
      let v=Math.sin(2*Math.PI*e.f*tt)+0.5*Math.sin(4*Math.PI*e.f*tt)+0.25*Math.sin(6*Math.PI*e.f*tt);
      if(tt<0.006) v+= (r()-0.5)*6*(1-tt/0.006);   // pick attack
      x[i]+=v*env*0.5;
    }
  }
  return {x, ev: ev.filter(e=>e.mine), beat};
}
function load(path, isNew){
  const src=fs.readFileSync(path,'utf8');
  const names=['coachReadFrame','coachDetectPitch'].concat(isNew?['coachPitchReadings','coachMicLatencyMs']:[]);
  const pre = isNew ? 'const COACH_LVL_WIN = 1024, COACH_LVL_HOP = 512; const COACH_CATCHUP_MAX_MS = 150; let micRec=null, coachHfRms=0, coachOnsetAt=0, coachReadCtx=null, coachReadCtxT=0, coachYinD=null;' : 'let coachHfRms=0;';
  const body = pre + names.map(n=>extract(src,n)).join('\n') +
    ';return {read:coachReadFrame, hf:()=>coachHfRms, at:()=>coachOnsetAt, pr: typeof coachPitchReadings!=="undefined"?coachPitchReadings:null, det:coachDetectPitch, lat: typeof coachMicLatencyMs!=="undefined"?coachMicLatencyMs:null};';
  return new Function('coachAnalyser','coachCtx','coachFrameBuf','coachUpdateMicLevel','performance','nrOffset', body);
}
const median=a=>{const b=[...a].sort((x,y)=>x-y);const k=b.length>>1;return b.length%2?b[k]:(b[k-1]+b[k])/2;};
function run(path,isNew,sig,frameMs){
  const buf=new Float32Array(4096);
  const ctx={sampleRate:SR,get currentTime(){return vnow/1000;}};
  const an={getFloatTimeDomainData(b){ const end=Math.floor((vnow-HWLAT)/1000*SR); for(let i=0;i<4096;i++){const k=end-4096+i; b[i]=k>=0&&k<sig.x.length?sig.x[k]*3:0;} }};
  const F=load(path,isNew)(an,ctx,buf,()=>{}, {now:()=>vnow}, ()=>70);
  let smR=0,smH=0,lastOn=-1e9,pend=null,lastP=0; const events=[];
  const fin=()=>{const p=pend;pend=null;let midi=null;if(p.readings.length>=2){const md=median(p.readings);const tg=p.readings.filter(r=>Math.abs(r-md)<=0.6);if(tg.length>=2&&tg.length*2>=p.readings.length)midi=Math.round(median(tg));}events.push({t:p.t,midi});};
  let seed=11; const r=()=> (seed=(seed*1664525+1013904223)>>>0)/4294967296;
  const endT=sig.ev[sig.ev.length-1].t+1500+HWLAT;
  for(vnow=500; vnow<endT; vnow+=frameMs*(0.7+r()*0.6)){
    const now=vnow, rms=F.read(), hf=F.hf();
    const at=isNew?F.at():now;
    if(at-lastOn>140 && ((rms>0.003&&rms>smR*1.4)||(hf>0.0008&&hf>smH*1.7))){
      lastOn=at; if(pend) fin(); pend={t:isNew?at-70:now, at, readings:[]};
    }
    smR=smR*0.82+rms*0.18; smH=smH*0.82+hf*0.18;
    if(pend && rms>0.002){
      if(isNew){ F.pr(lastP,pend.at+70,0.22).forEach(x=>{lastP=x.t; if(x.midi!=null&&x.t-pend.at<=340) pend.readings.push(x.midi);}); }
      else if(now-pend.t>=70 && now-lastP>=40){ lastP=now; const f=F.det(buf,SR,0.22); if(f>0) pend.readings.push(69+12*Math.log2(f/440)); }
    }
    if(pend && now-pend.at>340) fin();
  }
  if(pend) fin();
  // score: each true note -> nearest event within ±beat*0.45 of it (after the old/new time convention)
  let hit=0,right=0; const errs=[];
  for(const e of sig.ev){
    let best=null,bd=1e9; for(const v of events){const d=Math.abs(v.t-e.t); if(d<bd){bd=d;best=v;}}
    if(best && bd<sig.beat*0.45){ hit++; errs.push(best.t-e.t); if(best.midi!=null && best.midi%12===e.m%12) right++; }
  }
  const mean=errs.reduce((a,b)=>a+b,0)/(errs.length||1);
  const sd=Math.sqrt(errs.reduce((a,b)=>a+(b-mean)**2,0)/(errs.length||1));
  return {heard:hit,rightPitch:right,of:sig.ev.length,lateMs:Math.round(mean),jitterMs:Math.round(sd)};
}
const scale=[45,47,48,50,52,53,55,57,59,60,62,64,62,60,59,57,55,53,52,50];
for (const sc of [{name:'quiet room',room:0,quiet:1},{name:'loud classroom',room:0.7,quiet:1},{name:'quiet mic + loud room',room:0.7,quiet:0.4}]){
 for (const bpm of [80,120]){
  for (const fm of [16.7,33,50,80]){
    let agg={old:[0,0,0,0,0,0],nw:[0,0,0,0,0,0]};
    for(let seed=1;seed<=6;seed++){
      const sig=makeSignal({bpm,notes:scale,room:sc.room,quiet:sc.quiet,seed:seed*97});
      const o=run(oldP,false,sig,fm), n=run(newP,true,sig,fm);
      [[agg.old,o],[agg.nw,n]].forEach(([a,x])=>{a[0]+=x.heard;a[1]+=x.rightPitch;a[2]+=x.of;a[3]+=x.lateMs;a[4]+=x.jitterMs;a[5]++;});
    }
    const f=a=>`heard ${a[0]}/${a[2]} right ${a[1]} late ${Math.round(a[3]/a[5])}ms jitter ${Math.round(a[4]/a[5])}ms`;
    console.log(`${sc.name.padEnd(22)} ${bpm}bpm ${String(Math.round(1000/fm)).padStart(2)}fps | OLD ${f(agg.old)} | NEW ${f(agg.nw)}`);
  }
 }
}
