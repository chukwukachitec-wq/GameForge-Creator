(() => {
const canvas=document.getElementById('gameCanvas'), ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const W=canvas.width,H=canvas.height;
let objects=[],selectedId=null,playing=false,drag=null,keys={};
let nextId=1,coinsCollected=0;
const colors={player:'#ffcc4d',building:'#7288aa',house:'#d77c66',tree:'#2d9b70',rock:'#8290a2',coin:'#ffd34f',platform:'#9a78df'};
function make(type,x,y){return {id:nextId++,type,x,y,w:({player:32,building:100,house:82,tree:42,rock:42,coin:22,platform:120})[type]||40,h:({player:40,building:115,house:82,tree:58,rock:32,coin:22,platform:18})[type]||40};}
function add(type,x,y){const o=make(type,x??120+Math.random()*500,y??120+Math.random()*300);objects.push(o);selectedId=o.id;render();setStatus('Added '+type+'.');}
function setStatus(s){$('status').textContent=s}
function selected(){return objects.find(o=>o.id===selectedId)}
function drawObject(o){
 const x=o.x,y=o.y;ctx.save();
 if(o.type==='player'){ctx.fillStyle=colors.player;ctx.fillRect(x-o.w/2,y-o.h/2,o.w,o.h);ctx.fillStyle='#27334a';ctx.fillRect(x-7,y-7,4,4);ctx.fillRect(x+4,y-7,4,4);ctx.fillStyle='#e78d3d';ctx.fillRect(x-7,y+8,14,3)}
 else if(o.type==='building'){ctx.fillStyle='#4e617d';ctx.fillRect(x-o.w/2+6,y-o.h/2+7,o.w,o.h);ctx.fillStyle=colors.building;ctx.fillRect(x-o.w/2,y-o.h/2,o.w,o.h);ctx.fillStyle='#b8d4ef';for(let yy=y-o.h/2+14;yy<y+o.h/2-12;yy+=27)for(let xx=x-o.w/2+13;xx<x+o.w/2-10;xx+=27)ctx.fillRect(xx,yy,13,16);ctx.fillStyle='#384965';ctx.fillRect(x-10,y+o.h/2-32,20,32)}
 else if(o.type==='house'){ctx.fillStyle='#e7b18c';ctx.fillRect(x-o.w/2,y-o.h/2+25,o.w,o.h-25);ctx.fillStyle=colors.house;ctx.beginPath();ctx.moveTo(x-o.w/2-7,y-o.h/2+27);ctx.lineTo(x,y-o.h/2-10);ctx.lineTo(x+o.w/2+7,y-o.h/2+27);ctx.closePath();ctx.fill();ctx.fillStyle='#684b4a';ctx.fillRect(x-9,y+8,18, o.h/2-5);ctx.fillStyle='#c9f0fa';ctx.fillRect(x-o.w/2+12,y+2,15,15);ctx.fillRect(x+o.w/2-27,y+2,15,15)}
 else if(o.type==='tree'){ctx.fillStyle='#815e43';ctx.fillRect(x-5,y+4,10,25);ctx.fillStyle=colors.tree;ctx.beginPath();ctx.arc(x,y-6,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4fbe85';ctx.beginPath();ctx.arc(x-8,y-13,11,0,Math.PI*2);ctx.fill()}
 else if(o.type==='rock'){ctx.fillStyle=colors.rock;ctx.beginPath();ctx.moveTo(x-o.w/2,y+o.h/2);ctx.lineTo(x-o.w/2+6,y-o.h/2+7);ctx.lineTo(x+4,y-o.h/2);ctx.lineTo(x+o.w/2,y-o.h/2+10);ctx.lineTo(x+o.w/2-4,y+o.h/2);ctx.closePath();ctx.fill()}
 else if(o.type==='coin'){ctx.fillStyle='#a66a14';ctx.beginPath();ctx.arc(x,y,o.w/2+2,0,Math.PI*2);ctx.fill();ctx.fillStyle=colors.coin;ctx.beginPath();ctx.arc(x,y,o.w/2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b87513';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',x,y)}
 else if(o.type==='platform'){ctx.fillStyle=colors.platform;ctx.fillRect(x-o.w/2,y-o.h/2,o.w,o.h);ctx.fillStyle='#d4c6ff';ctx.fillRect(x-o.w/2,y-o.h/2,o.w,4)}
 if(selectedId===o.id&&!playing){ctx.strokeStyle='#fffb9c';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(x-o.w/2-5,y-o.h/2-5,o.w+10,o.h+10)}
 ctx.restore();
}
function render(){
 ctx.clearRect(0,0,W,H);
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cde8f3');g.addColorStop(1,'#d9efcf');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#b7dfaa';ctx.fillRect(0,H-75,W,75);
 ctx.strokeStyle='rgba(75,125,110,.15)';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 // Decorative path
 ctx.fillStyle='#e9e0c7';ctx.fillRect(0,H-57,W,22);
 objects.forEach(drawObject);
 if(playing){ctx.fillStyle='#18334b';ctx.font='bold 16px sans-serif';ctx.textAlign='left';ctx.fillText('Coins: '+coinsCollected,18,28)}
 $('objectCount').textContent=objects.length+' object'+(objects.length===1?'':'s');
 const s=selected();$('selectionInfo').textContent=s?`${s.type} #${s.id} • x:${Math.round(s.x)} y:${Math.round(s.y)}`:'Nothing selected';
}
function setPlaying(v){
 playing=v;$('playBtn').disabled=v;$('stopBtn').disabled=!v;$('addBtn').disabled=v;$('addBuildingBtn').disabled=v;$('objectType').disabled=v;$('deleteBtn').disabled=v;
 $('modeTitle').textContent=v?'Play Test':'Scene Editor';$('modeHint').textContent=v?'Use arrow keys or WASD to move the yellow player and collect coins.':'Tap an object to select it. Drag objects to reposition.';
 $('modeBadge').textContent=v?'PLAY MODE':'EDIT MODE';$('modeBadge').classList.toggle('playing',v);
 setStatus(v?'Game running — use arrow keys or WASD.':'Back in edit mode.');render();
}
function move(dx,dy){const o=selected();if(!o||playing)return;o.x=Math.max(o.w/2,Math.min(W-o.w/2,o.x+dx));o.y=Math.max(o.h/2,Math.min(H-o.h/2,o.y+dy));render()}
function hit(x,y,o){return x>=o.x-o.w/2-6&&x<=o.x+o.w/2+6&&y>=o.y-o.h/2-6&&y<=o.y+o.h/2+6}
function coords(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
canvas.addEventListener('pointerdown',e=>{if(playing)return;const p=coords(e);const o=[...objects].reverse().find(a=>hit(p.x,p.y,a));selectedId=o?.id??null;if(o)drag={id:o.id,dx:p.x-o.x,dy:p.y-o.y};canvas.setPointerCapture(e.pointerId);render()});
canvas.addEventListener('pointermove',e=>{if(!drag||playing)return;const p=coords(e),o=objects.find(a=>a.id===drag.id);if(o){o.x=Math.max(o.w/2,Math.min(W-o.w/2,p.x-drag.dx));o.y=Math.max(o.h/2,Math.min(H-o.h/2,p.y-drag.dy));render()}});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
$('addBtn').onclick=()=>add($('objectType').value);
$('addBuildingBtn').onclick=()=>add('building');
$('leftBtn').onclick=()=>move(-10,0);$('rightBtn').onclick=()=>move(10,0);$('upBtn').onclick=()=>move(0,-10);$('downBtn').onclick=()=>move(0,10);
$('deleteBtn').onclick=()=>{if(!selectedId)return setStatus('Select an object first.');objects=objects.filter(o=>o.id!==selectedId);selectedId=null;render();setStatus('Object deleted.')};
$('playBtn').onclick=()=>{if(!objects.some(o=>o.type==='player'))add('player',80,H-110);coinsCollected=0;setPlaying(true);requestAnimationFrame(gameLoop)};
$('stopBtn').onclick=()=>setPlaying(false);
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.toLowerCase()]=true;if(!playing){if(e.key==='ArrowLeft')move(-10,0);if(e.key==='ArrowRight')move(10,0);if(e.key==='ArrowUp')move(0,-10);if(e.key==='ArrowDown')move(0,10)}});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function gameLoop(){if(!playing)return;const p=objects.find(o=>o.type==='player');if(p){let dx=0,dy=0;if(keys.arrowleft||keys.a)dx=-3;if(keys.arrowright||keys.d)dx=3;if(keys.arrowup||keys.w)dy=-3;if(keys.arrowdown||keys.s)dy=3;p.x=Math.max(p.w/2,Math.min(W-p.w/2,p.x+dx));p.y=Math.max(p.h/2,Math.min(H-p.h/2,p.y+dy));
 objects=objects.filter(o=>{if(o.type==='coin'&&Math.abs(o.x-p.x)<(o.w+p.w)/2&&Math.abs(o.y-p.y)<(o.h+p.h)/2){coinsCollected++;return false}return true});}
 render();requestAnimationFrame(gameLoop)}
function projectData(){return {name:'CHITEC GameForge project',width:W,height:H,objects:objects.map(o=>({...o}))}}
function playableHtml(data){
 const json=JSON.stringify(data).replace(/</g,'\\u003c');
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Game | Made with CHITEC GameForge</title><style>body{margin:0;background:#10172a;color:white;font-family:system-ui;text-align:center}h1{font-size:20px}canvas{display:block;width:min(96vw,960px);height:auto;margin:10px auto;border-radius:12px;touch-action:none}p{color:#c7d2e8;font-size:13px}</style></head><body><h1>My Game</h1><p>Made with CHITEC GameForge Creator · Move with arrow keys or WASD. On mobile, tap the controls below.</p><canvas id="c" width="${W}" height="${H}"></canvas><div><button onclick="keys.ArrowLeft=true">←</button> <button onclick="keys.ArrowUp=true">↑</button> <button onclick="keys.ArrowDown=true">↓</button> <button onclick="keys.ArrowRight=true">→</button><button onclick="keys={};">Release</button></div><script>const data=${json},c=document.getElementById('c'),x=c.getContext('2d');let os=data.objects.map(o=>({...o})),keys={};window.onkeydown=e=>keys[e.key]=true;window.onkeyup=e=>keys[e.key]=false;let score=0;function draw(o){let a=o.x,b=o.y;x.save();if(o.type==='player'){x.fillStyle='#ffcc4d';x.fillRect(a-o.w/2,b-o.h/2,o.w,o.h);x.fillStyle='#27334a';x.fillRect(a-7,b-7,4,4);x.fillRect(a+4,b-7,4,4)}else if(o.type==='building'){x.fillStyle='#7288aa';x.fillRect(a-o.w/2,b-o.h/2,o.w,o.h);x.fillStyle='#b8d4ef';for(let yy=b-o.h/2+14;yy<b+o.h/2-12;yy+=27)for(let xx=a-o.w/2+13;xx<a+o.w/2-10;xx+=27)x.fillRect(xx,yy,13,16)}else if(o.type==='house'){x.fillStyle='#d77c66';x.fillRect(a-o.w/2,b-o.h/2+25,o.w,o.h-25);x.beginPath();x.moveTo(a-o.w/2-7,b-o.h/2+27);x.lineTo(a,b-o.h/2-10);x.lineTo(a+o.w/2+7,b-o.h/2+27);x.fill()}else if(o.type==='tree'){x.fillStyle='#815e43';x.fillRect(a-5,b+4,10,25);x.fillStyle='#2d9b70';x.beginPath();x.arc(a,b-6,22,0,7);x.fill()}else if(o.type==='coin'){x.fillStyle='#ffd34f';x.beginPath();x.arc(a,b,o.w/2,0,7);x.fill()}else if(o.type==='rock'){x.fillStyle='#8290a2';x.beginPath();x.arc(a,b,18,0,7);x.fill()}else if(o.type==='platform'){x.fillStyle='#9a78df';x.fillRect(a-o.w/2,b-o.h/2,o.w,o.h)}x.restore()}function frame(){x.fillStyle='#cde8f3';x.fillRect(0,0,c.width,c.height);x.fillStyle='#b7dfaa';x.fillRect(0,c.height-75,c.width,75);x.fillStyle='#e9e0c7';x.fillRect(0,c.height-57,c.width,22);let p=os.find(o=>o.type==='player');if(p){let s=3;if(keys.ArrowLeft||keys.a)p.x-=s;if(keys.ArrowRight||keys.d)p.x+=s;if(keys.ArrowUp||keys.w)p.y-=s;if(keys.ArrowDown||keys.s)p.y+=s;p.x=Math.max(p.w/2,Math.min(c.width-p.w/2,p.x));p.y=Math.max(p.h/2,Math.min(c.height-p.h/2,p.y));os=os.filter(o=>{if(o.type==='coin'&&Math.abs(o.x-p.x)<(o.w+p.w)/2&&Math.abs(o.y-p.y)<(o.h+p.h)/2){score++;return false}return true})}os.forEach(draw);x.fillStyle='#18334b';x.font='bold 16px sans-serif';x.fillText('Coins: '+score,18,28);requestAnimationFrame(frame)}frame();</script></body></html>`;
}
function download(name,content,type='text/plain'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('exportHtmlBtn').onclick=()=>{download('my-game.html',playableHtml(projectData()),'text/html');setStatus('Playable HTML exported. Open my-game.html to play.')};
function crc32(bytes){let c=~0;for(let i=0;i<bytes.length;i++){c^=bytes[i];for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (~c)>>>0}
function makeZip(entries){
 const enc=new TextEncoder(),local=[],central=[];let offset=0;
 for(const entry of entries){
  const name=enc.encode(entry.name),data=enc.encode(entry.content),crc=crc32(data);
  const lh=new Uint8Array(30+name.length+data.length),lv=new DataView(lh.buffer);
  lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0,true);lv.setUint16(8,0,true);
  lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);lv.setUint16(28,0,true);
  lh.set(name,30);lh.set(data,30+name.length);local.push(lh);
  const ch=new Uint8Array(46+name.length),cv=new DataView(ch.buffer);
  cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0,true);cv.setUint16(10,0,true);
  cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint16(30,0,true);cv.setUint16(32,0,true);cv.setUint32(38,0,true);cv.setUint32(42,offset,true);
  ch.set(name,46);central.push(ch);offset+=lh.length;
 }
 const centralSize=central.reduce((n,a)=>n+a.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
 ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
 const all=[...local,...central,end],total=all.reduce((n,a)=>n+a.length,0),out=new Uint8Array(total);let p=0;for(const a of all){out.set(a,p);p+=a.length}return out;
}
$('exportZipBtn').onclick=()=>{
 const files=[
  {name:'index.html',content:document.documentElement.outerHTML.replace('<script src="app.js"></script>','<script>'+document.querySelector('script[src="app.js"]').textContent+'</script>')},
  {name:'styles.css',content:document.querySelector('link[rel="stylesheet"]').href},
  {name:'app.js',content:document.querySelector('script[src="app.js"]').textContent},
  {name:'README.txt',content:'CHITEC GameForge Creator project — created by CHITEC. Open index.html in a browser. Use Play Game to test with arrow keys/WASD. Export Playable HTML creates a standalone game.'}
 ];
 // Include actual CSS text where available, rather than the stylesheet URL.
 fetch('styles.css').then(r=>r.text()).then(cssText=>{
  files[1].content=cssText;
  const zip=makeZip(files);download('CHITEC_GameForge_Project.zip',zip,'application/zip');setStatus('Project ZIP exported successfully.');
 }).catch(()=>{setStatus('Could not read styles.css. Export the full source ZIP from the supplied project package.');});
};
$('newBtn').onclick=()=>{if(confirm('Start a new project? This clears the current scene.')){objects=[];selectedId=null;nextId=1;setPlaying(false);render();setStatus('New project ready.')}};
add('player',100,450);add('building',280,420);add('house',440,465);add('tree',560,475);add('coin',680,410);selectedId=null;render();
})();