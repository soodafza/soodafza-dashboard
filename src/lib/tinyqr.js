// src/lib/tinyqr.js
// Mini QR encoder (numeric + alphanumeric, SVG & canvas) — ~1 KB

/* ===== utility ===== */
const ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

function bitBuf(){ const b=[]; return{put:(v,l)=>{for(let i=l-1;i>=0;--i)b.push((v>>>i)&1);},get:()=>b}; }
function mode(t){ return /^[0-9]*$/.test(t)?1: /^[A-Z0-9 $%*+\-./:]*$/.test(t)?2:4; }   // numeric / alphanum / byte

/* ===== core encode ===== */
function encode(data){
  const m = mode(data);
  const bb = bitBuf();
  bb.put(m,4);                                      // mode
  bb.put(data.length, m===1?10:m===2?9:8);          // len
  if(m===1){ for(let i=0;i<data.length;i+=3){
      const s=data.substr(i,3); bb.put(parseInt(s,10), s.length===3?10:s.length===2?7:4);} }
  else if(m===2){ for(let i=0;i<data.length;i+=2){
      const s=data.substr(i,2); const v=ALPHA.indexOf(s[0])*45+(s[1]?ALPHA.indexOf(s[1]):0);
      bb.put(v, s.length===2?11:6);} }
  else { for(const c of new TextEncoder().encode(data)) bb.put(c,8); }                  // byte
  bb.put(0,4); while(bb.get().length%8) bb.put(0,1);                                   // terminator + pad
  return bb.get();
}

/* ===== primitive draw ===== */
function matrix(bits){
  // smallest version (21×21) + finder only
  const size=21, mat=Array(size).fill().map(()=>Array(size).fill(0));
  const put=(x,y,v)=>{if(mat[y]&&mat[y][x]!==undefined)mat[y][x]=v};
  const box=(x,y)=>{for(let i=-1;i<=7;i++)for(let j=-1;j<=7;j++){
    const xx=x+j,yy=y+i;
    const inF= j>=0&&j<=6&&i>=0&&i<=6 && (j===0||j===6||i===0||i===6|| (j>=2&&j<=4&&i>=2&&i<=4));
    put(xx,yy,inF?1:0);
  }};
  box(0,0); box(size-7,0); box(0,size-7);            // finder
  // timing
  for(let i=8;i<size-8;i++){ put(i,6,i%2); put(6,i,i%2);}
  // data bits (simplified, no masking/error corr)
  let k=0; for(let x=size-1;x>0;x-=2){ if(x===6)x--;
    for(let dir=0;dir<2;dir++){
      for(let y=0;y<size;y++){
        const yy=dir?y:size-1-y;
        for(let dx=0;dx<2;dx++){
          const xx=x-dx;
          if(mat[yy][xx]===0){
            mat[yy][xx]= bits[k++]||0;
          }
        }
      }
    }
  }
  return mat;
}

function svg(str,opt={}){             // return SVG string
  const bits=encode(str), m=matrix(bits);
  const sz=(opt.size||180)/(m.length+2* (opt.margin||2));
  let p=`<svg xmlns="http://www.w3.org/2000/svg" width="${(m.length+opt.margin*2)*sz}" height="${(m.length+opt.margin*2)*sz}" shape-rendering="crispEdges">`;
  p+=`<rect width="100%" height="100%" fill="${opt.stroke||'#000'}"/>`;
  p+=`<g fill="${opt.fill||'#fff'}">`;
  for(let y=0;y<m.length;y++)for(let x=0;x<m.length;x++)
    if(m[y][x])p+=`<rect x="${(x+opt.margin)*sz}" y="${(y+opt.margin)*sz}" width="${sz}" height="${sz}"/>`;
  return p+"</g></svg>";
}

function canvas(str,opt={}){          // return HTMLCanvasElement
  const bits=encode(str), m=matrix(bits);
  const c=document.createElement("canvas");
  const margin=opt.margin||2, scale=(opt.size||256)/(m.length+margin*2);
  c.width=c.height=(m.length+margin*2)*scale;
  const ctx=c.getContext("2d");
  ctx.fillStyle=opt.stroke||"#000"; ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle=opt.fill||"#fff";
  for(let y=0;y<m.length;y++)for(let x=0;x<m.length;x++)
    if(m[y][x]) ctx.fillRect((x+margin)*scale,(y+margin)*scale,scale,scale);
  return c;
}

export default { svg, canvas };
