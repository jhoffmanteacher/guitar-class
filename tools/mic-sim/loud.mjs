import fs from 'fs'; import {extract} from './extract.mjs';
const SR=48000, HWLAT=50; let vnow=0;
const src=fs.readFileSync(process.argv[2],'utf8');
function makeSignal({bpm, notes, played, room, seed}){
  let s=seed; const r=()=> (s=(s*1664525+1013904223)>>>0)/4294967296;
  const beat=60000/bpm, ev=[];
  notes.forEach((m,i)=>ev.push({t:1000+i*beat, f:440*2**((played[i]-69)/12), a:0.25, mine:true, m, p:played[i]}));
  if(room) for(let t=0;t<1000+notes.length*beat+1000;t+=150+r()*400) ev.push({t, f:440*2**((40+Math.floor(r()*30)-69)/12), a:0.25*room*(0.4+r()*0.6)});
  const total=Math.ceil((1000+notes.length*beat+2000)/1000*SR), x=new Float32Array(total);
  for(let i=0;i<total;i++) x[i]=(r()-0.5)*0.004;
  for(const e of ev){ const i0=Math.round(e.t/1000*SR);
    for(let i=i0;i<Math.min(total,i0+SR*2);i++){ const tt=(i-i0)/SR, env=Math.exp(-tt/0.6)*e.a;
      let v=Math.sin(2*Math.PI*e.f*tt)+0.5*Math.sin(4*Math.PI*e.f*tt)+0.25*Math.sin(6*Math.PI*e.f*tt);
      if(tt<0.006) v+=(r()-0.5)*6*(1-tt/0.006); x[i]+=v*env*0.5; } }
  return {x, ev: ev.filter(e=>e.mine), beat};
}
const pre='const COACH_LVL_WIN = 1024, COACH_LVL_HOP = 512; const COACH_CATCHUP_MAX_MS = 150; let coachHfRms=0, coachOnsetAt=0, coachReadCtx=null, coachReadCtxT=0, coachYinD=null;';
const mk=new Function('coachAnalyser','coachCtx','coachFrameBuf','coachUpdateMicLevel','performance','nrOffset',
  pre+['coachReadFrame','coachDetectPitch','coachPitchReadings'].map(n=>extract(src,n)).join('\n')+';return {read:coachReadFrame,hf:()=>coachHfRms,at:()=>coachOnsetAt,pr:coachPitchReadings};');
const median=a=>{const b=[...a].sort((x,y)=>x-y);const k=b.length>>1;return b.length%2?b[k]:(b[k-1]+b[k])/2;};
export function run(sig, frameMs, overlap){
  const buf=new Float32Array(4096);
  const ctx={sampleRate:SR,get currentTime(){return vnow/1000;}};
  const an={getFloatTimeDomainData(b){const end=Math.floor((vnow-HWLAT)/1000*SR);for(let i=0;i<4096;i++){const k=end-4096+i;b[i]=k>=0&&k<sig.x.length?sig.x[k]*3:0;}}};
  const F=mk(an,ctx,buf,()=>{},{now:()=>vnow},()=>50);
  let smR=0,smH=0,lastOn=-1e9,pend=null,lastP=0; const events=[]; let pends=[];
  const fin=()=>{events.push(pend);pend=null;};
  let seed=11; const r=()=> (seed=(seed*1664525+1013904223)>>>0)/4294967296;
  const endT=sig.ev[sig.ev.length-1].t+1500+HWLAT;
  for(vnow=500;vnow<endT;vnow+=frameMs*(0.7+r()*0.6)){
    const now=vnow,rms=F.read(),hf=F.hf(),at=F.at();
    if(overlap){
      if(at-lastOn>140&&((rms>0.003&&rms>smR*1.4)||(hf>0.0008&&hf>smH*1.7))){lastOn=at;pends.push({t:at-50,at,readings:[]});}
      smR=smR*0.82+rms*0.18;smH=smH*0.82+hf*0.18;
      if(pends.length&&rms>0.002){ const oldest=Math.min(...pends.map(p=>p.at)); F.pr(lastP,oldest+70,0.22).forEach(x=>{lastP=x.t; if(x.midi!=null) pends.forEach(p=>{ if(x.t>=p.at+70&&x.t-p.at<=340) p.readings.push(x.midi);});}); }
      pends=pends.filter(p=>{ if(now-p.at>340){events.push(p);return false;} return true; });
    } else {
    if(at-lastOn>140&&((rms>0.003&&rms>smR*1.4)||(hf>0.0008&&hf>smH*1.7))){lastOn=at;if(pend)fin();pend={t:at-50,at,readings:[]};}
    smR=smR*0.82+rms*0.18;smH=smH*0.82+hf*0.18;
    if(pend&&rms>0.002) F.pr(lastP,pend.at+70,0.22).forEach(x=>{lastP=x.t;if(x.midi!=null&&x.t-pend.at<=340)pend.readings.push(x.midi);});
    if(pend&&now-pend.at>340)fin();
    }
  }
  if(pend)fin(); events.push(...pends);
  return events;
}
export function consensus(rd){ if(rd.length<2)return null; const md=median(rd); const tg=rd.filter(r=>Math.abs(r-md)<=0.6); return (tg.length>=2&&tg.length*2>=rd.length)?Math.round(median(tg)):null; }
export {makeSignal};
