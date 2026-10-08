import {run,consensus,makeSignal} from './loud.mjs';
const near12=(r,m)=>Math.abs(((r-m)%12+18)%12-6)<=0.6;
const vote=(rd,m)=>rd.length>=2 && rd.filter(r=>near12(r,m)).length/rd.length>=0.4;
const cok=(rd,m)=>{const c=consensus(rd);return c!=null&&near12(c,m);};
const scale=[45,47,48,50,52,53,55,57,59,60,62,64,62,60,59,57,55,53,52,50];
for(const room of [0,0.4,0.7]) for(const wrong of [false,true]){
  const T={};
  for(const overlap of [false,true]) for(const pick of ['nearest','best']){
    let c=0,v=0;
    for(let seed=1;seed<=8;seed++){
      const played=scale.map(m=>wrong?m+2:m);
      const sig=makeSignal({bpm:80,notes:scale,played,room,seed:seed*97});
      const evs=run(sig,40,overlap);
      for(const e of sig.ev){
        const near=evs.filter(x=>Math.abs(x.t-e.t)<sig.beat*0.45); if(!near.length) continue;
        if(pick==='nearest'){ const f=near.reduce((a,b)=>Math.abs(a.t-e.t)<Math.abs(b.t-e.t)?a:b); if(cok(f.readings,e.m))c++; if(vote(f.readings,e.m)||cok(f.readings,e.m))v++; }
        else { if(near.some(f=>cok(f.readings,e.m)))c++; if(near.some(f=>vote(f.readings,e.m)||cok(f.readings,e.m)))v++; }
      }
    }
    T[(overlap?'overlap':'cut')+'/'+pick]=`consensus ${c} | +vote ${v}`;
  }
  console.log(`room ${room} ${wrong?'WRONG':'right'}:`, JSON.stringify(T));
}
