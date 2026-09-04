const fs = require("fs");
function parsePath(d) {
  const tokens = d.match(/[a-df-zA-DF-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let i = 0, curCmd = null, pen = [0, 0], start = [0, 0];
  const polys = [], curPoly = [];
  const emit = () => { if (curPoly.length >= 3) polys.push(curPoly.slice()); curPoly.length = 0; };
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-df-zA-DF-Z]$/.test(t)) { curCmd = t; i++; continue; }
    const val = parseFloat(t);
    const readPair = () => { const x = val, y = parseFloat(tokens[i+1]); i += 2; return [x, y]; };
    if (curCmd === "M" || curCmd === "m") {
      const [x, y] = readPair();
      pen = curCmd === "m" ? [pen[0]+x, pen[1]+y] : [x, y];
      start = [pen[0], pen[1]];
      curPoly.push([pen[0], pen[1]]);
      curCmd = curCmd === "M" ? "L" : "l";
    } else if (curCmd === "L" || curCmd === "l") {
      const [x, y] = readPair();
      pen = curCmd === "l" ? [pen[0]+x, pen[1]+y] : [x, y];
      curPoly.push([pen[0], pen[1]]);
    } else if (curCmd === "H" || curCmd === "h") {
      const x = val; i++;
      pen = curCmd === "h" ? [pen[0]+x, pen[1]] : [x, pen[1]];
      curPoly.push([pen[0], pen[1]]);
    } else if (curCmd === "V" || curCmd === "v") {
      const y = val; i++;
      pen = curCmd === "v" ? [pen[0], pen[1]+y] : [pen[0], y];
      curPoly.push([pen[0], pen[1]]);
    } else if (curCmd === "C" || curCmd === "c") {
      const c1x=val,c1y=parseFloat(tokens[i+1]);const c2x=parseFloat(tokens[i+2]),c2y=parseFloat(tokens[i+3]);const x=parseFloat(tokens[i+4]),y=parseFloat(tokens[i+5]);i+=6;
      const s=pen,c1=curCmd==="c"?[s[0]+c1x,s[1]+c1y]:[c1x,c1y],c2=curCmd==="c"?[s[0]+c2x,s[1]+c2y]:[c2x,c2y],e=curCmd==="c"?[s[0]+x,s[1]+y]:[x,y];
      for(let k=1;k<=10;k++){const t=k/10,mt=1-t;curPoly.push([mt*mt*mt*s[0]+3*mt*mt*t*c1[0]+3*mt*t*t*c2[0]+t*t*t*e[0],mt*mt*mt*s[1]+3*mt*mt*t*c1[1]+3*mt*t*t*c2[1]+t*t*t*e[1]]);} pen=e;
    } else if (curCmd === "Q" || curCmd === "q") {
      const c1x=val,c1y=parseFloat(tokens[i+1]);const x=parseFloat(tokens[i+2]),y=parseFloat(tokens[i+3]);i+=4;
      const s=pen,c1=curCmd==="q"?[s[0]+c1x,s[1]+c1y]:[c1x,c1y],e=curCmd==="q"?[s[0]+x,s[1]+y]:[x,y];
      for(let k=1;k<=8;k++){const t=k/8,mt=1-t;curPoly.push([mt*mt*s[0]+2*mt*t*c1[0]+t*t*e[0],mt*mt*s[1]+2*mt*t*c1[1]+t*t*e[1]]);} pen=e;
    } else if (curCmd === "Z" || curCmd === "z") { emit(); pen=start; curCmd=null; } else break;
  }
  emit(); return polys;
}
const src = fs.readFileSync("D:/NEXPROBITE/public/images/world.svg", "utf8");
const matches = src.match(/<path[^>]*d="([^"]*)"/g) || [];
let totalPts = 0; let big = 0;
const sizes = [];
for (const m of matches) {
  const d = m.match(/d="([^"]*)"/)[1];
  const polys = parsePath(d);
  for (const p of polys) { sizes.push(p.length); totalPts += p.length; if (p.length>1000) big++; }
}
sizes.sort((a,b)=>b-a);
console.log("paths:", matches.length, "polys:", sizes.length, "totalPts:", totalPts, "polys>1000pts:", big);
console.log("largest polys:", sizes.slice(0,10));
