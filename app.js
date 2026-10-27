"use strict";
const NOTES=["A","Bb","B","C","C#","D","Eb","E","F","F#","G","Ab"];
const TYPES=[["Major",""],["Minor","m"],["7","7"],["Major 7","maj7"],["Minor 7","m7"],["9","9"],["Major 9","maj9"],["Minor 9","m9"],["6","6"],["Minor 6","m6"],["add9","add9"],["sus2","sus2"],["sus4","sus4"],["7sus4","7sus4"],["11","11"],["13","13"],["7b9","7b9"],["7#9","7#9"],["Diminished","dim"],["Diminished 7","dim7"],["Half-diminished (m7b5)","m7b5"],["Augmented","aug"]];
const INTERVALS={"":[0,4,7],m:[0,3,7],"7":[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],"9":[0,4,7,10,14],maj9:[0,4,7,11,14],m9:[0,3,7,10,14],"6":[0,4,7,9],m6:[0,3,7,9],add9:[0,4,7,14],sus2:[0,2,7],sus4:[0,5,7],"7sus4":[0,5,7,10],"11":[0,4,7,10,14,17],"13":[0,4,7,10,14,21],"7b9":[0,4,7,10,13],"7#9":[0,4,7,10,15],dim:[0,3,6],dim7:[0,3,6,9],m7b5:[0,3,6,10],aug:[0,4,8]};
const CHROMA=["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
const SVGNS="http://www.w3.org/2000/svg";

const keyEl=document.getElementById("key"),typeEl=document.getElementById("type"),grid=document.getElementById("grid");
const kbBtn=document.getElementById("kbbtn"),kbPanel=document.getElementById("kbpanel"),kbSvg=document.getElementById("kbsvg");
const themeEl=document.getElementById("theme");

NOTES.forEach(n=>keyEl.add(new Option(n,n)));
TYPES.forEach(([l,s])=>typeEl.add(new Option(l,s)));
keyEl.value="C";

function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function fmt(n){return n.replace("b","\u266d").replace("#","\u266f");}

// Builds SVG elements with the DOM API (no innerHTML), so text is never parsed as markup.
function svgEl(name,attrs,text){
  const e=document.createElementNS(SVGNS,name);
  for(const k in attrs)e.setAttribute(k,String(attrs[k]));
  if(text!==undefined)e.textContent=text;
  return e;
}

function drawKeyboard(rootName){
  rootName=rootName||keyEl.value;
  const suffix=typeEl.value,root=CHROMA.indexOf(rootName);
  if(root<0||!(suffix in INTERVALS))return;
  document.getElementById("kbtitle").textContent=fmt(rootName)+suffix;
  const W=30,H=70,BW=18,BH=44,T=22,TT=16,G=8,WH=[0,2,4,5,7,9,11],GH=TT+T+H;
  const titles=["Root position","1st inversion","2nd inversion"];
  let pos=INTERVALS[suffix].map(i=>root+i).sort((a,b)=>a-b);
  const frag=document.createDocumentFragment();
  for(let g=0;g<3;g++){
    if(g>0)pos=pos.slice(1).concat(pos[0]+12).sort((a,b)=>a-b);
    const set=new Set(pos),y0=g*(GH+G),ky=y0+TT+T;
    const names=pos.map(p=>fmt(CHROMA[p%12])).join(" ");
    frag.appendChild(svgEl("text",{"class":"gt",x:2,y:y0+12},titles[g]+" \u00b7 "+names));
    frag.appendChild(svgEl("rect",{x:0,y:y0+TT,width:21*W,height:T+4,rx:5,fill:"#1a1b1d"}));
    const labels=[];
    for(let i=0;i<21;i++){
      const pc=WH[i%7],on=set.has(Math.floor(i/7)*12+pc),x=i*W;
      frag.appendChild(svgEl("rect",{"class":"wk"+(on?" on":""),x:x,y:ky,width:W,height:H}));
      if(on)labels.push(svgEl("text",{"class":"lbl",x:x+W/2,y:ky-7},fmt(CHROMA[pc])));
    }
    for(let o=0;o<3;o++){
      for(const [pc,p] of [[1,0],[3,1],[6,3],[8,4],[10,5]]){
        const on=set.has(o*12+pc),x=(o*7+p)*W+W-BW/2;
        frag.appendChild(svgEl("rect",{"class":"bk"+(on?" on":""),x:x,y:ky,width:BW,height:BH}));
        if(on)labels.push(svgEl("text",{"class":"lbl",x:x+BW/2,y:ky-7},fmt(CHROMA[pc])));
      }
    }
    labels.forEach(l=>frag.appendChild(l));
  }
  kbSvg.replaceChildren(frag);
}

function showChord(n){
  drawKeyboard(n);
  kbPanel.hidden=false;
  kbBtn.textContent="Hide keyboard";
  kbBtn.setAttribute("aria-expanded","true");
}

function render(){
  const suffix=typeEl.value,order=shuffle(NOTES);
  grid.replaceChildren();
  for(let r=0;r<3;r++){
    const tr=grid.insertRow();
    for(let c=0;c<4;c++){
      const n=order[r*4+c],td=tr.insertCell();
      td.textContent=n+suffix;
      td.onclick=()=>showChord(n);
    }
  }
  drawKeyboard();
}
keyEl.onchange=typeEl.onchange=document.getElementById("shuffle").onclick=render;

document.getElementById("random").onclick=()=>{
  keyEl.selectedIndex=Math.floor(Math.random()*keyEl.options.length);
  typeEl.selectedIndex=Math.floor(Math.random()*typeEl.options.length);
  render();
};

kbBtn.onclick=()=>{
  kbPanel.hidden=!kbPanel.hidden;
  kbBtn.textContent=kbPanel.hidden?"Show keyboard":"Hide keyboard";
  kbBtn.setAttribute("aria-expanded",String(!kbPanel.hidden));
};

// Theme: theme-init.js already applied the saved choice before first paint.
function applyTheme(v){
  if(v==="light"||v==="dark")document.documentElement.setAttribute("data-theme",v);
  else document.documentElement.removeAttribute("data-theme");
}
try{
  const saved=localStorage.getItem("chord-theme");
  if(saved==="light"||saved==="dark"||saved==="auto")themeEl.value=saved;
}catch(e){}
applyTheme(themeEl.value);
themeEl.onchange=()=>{
  applyTheme(themeEl.value);
  try{localStorage.setItem("chord-theme",themeEl.value);}catch(e){}
};

render();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{navigator.serviceWorker.register("service-worker.js").catch(()=>{});});
}
