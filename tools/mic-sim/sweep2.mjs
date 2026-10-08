import {run,consensus,makeSignal} from './loud.mjs';
const near12=(r,m)=>Math.abs(((r-m)%12+18)%12-6)<=0.6;
const scale=[45,47,48,50,52,53,55,57,59,60,62,64,62,60,59,57,55,53,52,50];
const cache={};
for(const room of [0.4,0.7]) for(const wrongBy of [0,1,7]){
  const res={}; const TH=[0.34,0.4,0.5,0.6];
  TH.forEach(t=>res[t]=0); let cons=0;
  for(let seed=1;seed<=8;seed++){
    const played=scale.map(m=>m+wrongBy);
    const sig=makeSignal({bpm:80,notes:scale,played,room,seed:seed*97});
    const evs=run(sig,40,true);
    for(const e of sig.ev){
      const near=evs.filter(x=>Math.abs(x.t-e.t)<sig.beat*0.45); if(!near.length) continue;
      const f=near.reduce((a,b)=>Math.abs(a.t-e.t)<Math.abs(b.t-e.t)?a:b);
      const c=consensus(f.readings); const cok=c!=null&&near12(c,e.m); if(cok)cons++;
      const sh=f.readings.length?f.readings.filter(r=>Math.abs(r-e.m)<=0.6||Math.abs(r-e.m-12)<=0.6).length/f.readings.length:0;
      TH.forEach(t=>{ if(cok||(f.readings.length>=2&&sh>=t)) res[t]++; });
    }
  }
  console.log(`room ${room} played ${wrongBy?('+'+wrongBy+' semitones (WRONG)'):'right note'}: consensus ${cons} | vote@`+TH.map(t=>t+'='+res[t]).join(' '));
}
