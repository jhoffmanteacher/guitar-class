import fs from 'fs'; import {extract} from './extract.mjs';
const [oldP,newP]=process.argv.slice(2);
const oldF = new Function(extract(fs.readFileSync(oldP,'utf8'),'coachDetectPitch')+';return coachDetectPitch;')();
const newF = new Function('let coachYinD=null;'+extract(fs.readFileSync(newP,'utf8'),'coachDetectPitch')+';return coachDetectPitch;')();
let n=0,diff=0, tOld=0,tNew=0;
function rnd(seed){ return ()=> (seed = (seed*1664525+1013904223)>>>0)/4294967296; }
const r=rnd(7);
for (const sr of [44100,48000,96000]){
  for (let trial=0; trial<400; trial++){
    const buf=new Float32Array(4096);
    const kind=trial%4;
    const freqs = kind===0?[]:kind===1?[60+r()*900]:kind===2?[82+r()*300, 0, 0]:[110,138.6,164.8,220];
    const f0=freqs[0]||0;
    for(let i=0;i<4096;i++){
      let v=(r()-0.5)*0.02*(kind===0?5:1);
      if(kind===1) v+=0.3*Math.sin(2*Math.PI*f0*i/sr)+0.15*Math.sin(4*Math.PI*f0*i/sr+1);
      if(kind===2) v+=0.3*Math.sin(2*Math.PI*f0*i/sr)+0.2*Math.sin(6*Math.PI*f0*i/sr);
      if(kind===3) for(const f of freqs) v+=0.1*Math.sin(2*Math.PI*f*i/sr+f);
      buf[i]=v;
    }
    for (const c of [0.22,0.55]){
      let a=performance.now(); const o=oldF(buf,sr,c); tOld+=performance.now()-a;
      a=performance.now(); const nn=newF(buf,sr,c); tNew+=performance.now()-a;
      n++; if (o!==nn && !(Number.isNaN(o)&&Number.isNaN(nn))){ diff++; if(diff<5) console.log('DIFF',sr,kind,c,o,nn); }
    }
  }
}
console.log({n,diff,msOld:tOld.toFixed(0),msNew:tNew.toFixed(0)});
