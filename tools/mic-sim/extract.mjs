import fs from 'fs';
export function extract(src, name){
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('no ' + name);
  let j = src.indexOf('{', i), depth = 0, k = j;
  for (; k < src.length; k++){ if (src[k]==='{') depth++; else if (src[k]==='}'){ depth--; if(!depth) break; } }
  return src.slice(i, k+1);
}
