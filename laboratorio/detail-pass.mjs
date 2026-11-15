// BREU · ALA 03 / ART PASS 02
// Added architectural layers are non-blocking surface details. Solid collision
// remains declared exclusively in layout.mjs and instantiated in physics-world.mjs.
// All original textures are generated locally, without external assets or subscriptions.
import * as THREE from 'three';
import {STORE_SIGNS,facadePanelAllowed} from './layout.mjs';

const ambient=(c,roughness=.87,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});
const MATERIAL={
 lacquer:ambient('#243236',.76,.18),brushed:ambient('#5e6260',.54,.63),steel:ambient('#222a2d',.77,.58),
 enamel:ambient('#9c9d92',.42,.13),dark:ambient('#0b1013',.97),rust:ambient('#65413a',.96,.37),
 plastic:ambient('#363d3d',.88,.03),fabric:new THREE.MeshStandardMaterial({color:'#72645b',roughness:1,side:THREE.DoubleSide}),
 warning:ambient('#c69c5b',.8,.1),green:ambient('#557364',.62),ceramic:ambient('#a0a19a',.65),
};
function seeded(seed){let s=seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
function artTex(mode,seed=11,w=512,h=512){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d'),r=seeded(seed);
 let base=mode==='tile'?'#6b7470':mode==='rust'?'#55504b':mode==='poster'?'#a69b8a':mode==='crack'?'#3e4b4c':'#788080';
 ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 if(mode==='tile'){
  ctx.fillStyle='#656e6d';for(let x=0;x<w;x+=58)for(let y=0;y<h;y+=57)if(r()>.44)ctx.fillRect(x+2,y+2,55,54);
  ctx.strokeStyle='rgba(14,20,22,.38)';ctx.lineWidth=3;
  for(let x=0;x<w;x+=58){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=57){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 }
 if(mode==='rust'){
  for(let i=0;i<115;i++){const x=r()*w,y=r()*h;const g=ctx.createRadialGradient(x,y,2,x,y,4+r()*66);g.addColorStop(0,'rgba(103,48,31,.4)');g.addColorStop(1,'rgba(50,45,37,0)');ctx.fillStyle=g;ctx.fillRect(x-80,y-80,160,160)}
 }
 if(mode==='poster'){
  ctx.fillStyle='#383f3c';ctx.fillRect(20,16,w-40,h-35);ctx.fillStyle='#a0a9a3';
  ctx.font='900 58px sans-serif';ctx.fillText('閉鎖',35,87);ctx.font='700 24px sans-serif';ctx.fillText('CLOSED / 03',36,126);
  ctx.fillStyle='#666861';for(let y=157;y<h-48;y+=22)ctx.fillRect(39,y,w-86,3);
 }
 for(let i=0;i<3500;i++){
  ctx.fillStyle=r()>.54?`rgba(9,14,15,${r()*.12})`:`rgba(231,214,187,${r()*.055})`;
  ctx.fillRect(r()*w,r()*h,.6+r()*5,.5+r()*3);
 }
 if(mode==='crack'||mode==='tile')for(let n=0;n<13;n++){
  let x=r()*w,y=r()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.strokeStyle=`rgba(9,16,18,${.2+r()*.44})`;ctx.lineWidth=.6+r()*1.9;
  for(let i=0;i<8;i++){x+=(r()-.5)*28;y+=(r()-.5)*39;ctx.lineTo(x,y)}ctx.stroke();
 }
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function graphicTexture(title,sub,c='#b2b6a9'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const g=canvas.getContext('2d'),r=seeded(title.length*137+sub.length);
 g.fillStyle='#1a2021';g.fillRect(0,0,512,256);g.fillStyle=c;g.fillRect(19,17,474,7);
 g.font='bold 71px sans-serif';g.fillText(title,24,117,462);
 g.fillStyle='#b4bbb2';g.font='600 25px sans-serif';g.fillText(sub,25,169,463);
 for(let i=0;i<60;i++){g.fillStyle=r()>.5?'#1b2324':'#59605a';g.fillRect(r()*512,r()*256,1+r()*38,1+r()*2)}
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}
export function addArtPass(scene,{mobile=false}={}){
 const objects=[],blinkers=[];
 const r=seeded(12096);
 const surfaceRust=new THREE.MeshStandardMaterial({map:artTex('rust',21),color:'#9f9891',roughness:.92,metalness:.17,side:THREE.DoubleSide});
 const tiles=new THREE.MeshStandardMaterial({map:artTex('tile',18),roughness:.81,color:'#9da5a1',side:THREE.DoubleSide});
 const crack=new THREE.MeshStandardMaterial({map:artTex('crack',34),roughness:.96,color:'#697576',side:THREE.DoubleSide});
 const poster=new THREE.MeshStandardMaterial({map:artTex('poster',51,512,256),roughness:1,side:THREE.DoubleSide});
 const glow=new THREE.MeshBasicMaterial({color:'#a7babb',side:THREE.DoubleSide});
 function box(name,x,y,z,w,h,d,m=MATERIAL.steel,rotY=0){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.name=name;o.position.set(x,y,z);o.rotation.y=rotY;o.castShadow=(!mobile&&h>.4);o.receiveShadow=true;scene.add(o);objects.push(o);return o;
 }
 function plane(name,x,y,z,w,h,m,rotY=0){
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.name=name;o.position.set(x,y,z);o.rotation.y=rotY;scene.add(o);objects.push(o);return o;
 }
 function pipe(name,points,radius=.022,material=MATERIAL.steel){
  const line=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const o=new THREE.Mesh(new THREE.TubeGeometry(line,Math.max(8,points.length*5),radius,5,false),material);
  o.name=name;scene.add(o);objects.push(o);return o;
 }
 // Different construction periods: wall finish stripes by sector; original shell is still physical.
 for(let z=12,n=0;z>-54;z-=5.1,n++){
  if(mobile&&n%2===1)continue;
  const color=z>-14?tiles:z>-39?crack:surfaceRust;
  for(const side of [-1,1]){
   if(!facadePanelAllowed(side,z,2.43))continue;
   const x=side*3.43;
   plane('weathered lower corridor tiles',x,1.10,z,4.85,1.65,color,side===-1?Math.PI/2:-Math.PI/2);
   box('damaged skirting',x-side*.04,.23,z,.095,.22,4.88,MATERIAL.brushed);
  }
 }
 // Ceiling detailing: backed recesses, hanging wires, rusty tracks and voids that
 // LOOK broken but never remove physical roof/floor or create see-through world seams.
 for(let z=10,n=0;z>-53;z-=5.65,n++){
  if(mobile&&n%2===1)continue;
  box('ceiling perimeter grid left',-3.04,4.21,z,.05,.08,5.5,MATERIAL.brushed);
  box('ceiling perimeter grid right',3.04,4.21,z,.05,.08,5.5,MATERIAL.brushed);
  const x=.4+(r()-.5)*3.6;
  box('acoustic panel missing / backed recess',x,4.21,z,1.05,.025,.87,MATERIAL.dark);
  box('aluminium broken ceiling frame',x-.55,4.16,z,.035,.08,1.05,MATERIAL.brushed);
  if(r()>.42){
   const anchor=x+.18;
   pipe('loose ceiling cable',[[anchor,4.19,z-1.7],[anchor+.35,3.65,z-.7],[anchor-.18,3.15,z+.4],[anchor+.28,3.42,z+1.3]],.016+r()*.012,MATERIAL.dark);
   box('suspended cable connector',anchor+.28,3.42,z+1.3,.13,.16,.14,MATERIAL.rust);
  }
 }
 // Non-repeating store fronts: visible merchandise and signage depth. They remain
 // nonblocking surface details; physical open/closed doors come from WALLS.
 const special={
  ramen:{s:'立入禁止',sub:'熱い蒸気 / 立ち入り禁止'},
  camera:{s:'CAMERA',sub:'PRE-OWNED GOODS'},
  fashion:{s:'NO SIGNAL',sub:'ARCHIVE COLLECTION'},
  electronics:{s:'D E N K I',sub:'REPAIRS / NO POWER'},
  pharmacy:{s:'薬',sub:'PRESCRIPTIONS'},
  arcade:{s:'G A M E',sub:'GAME CENTER 99'},
  maintenance:{s:'KEEP OUT',sub:'AUTHORIZED PERSONNEL'},
 };
 for(const s of STORE_SIGNS){
  const x=s.side*3.30,face=s.side<0?Math.PI/2:-Math.PI/2;
  const corroded=s.type==='maintenance';
  box(s.type+' rusted overdoor',x,2.79,s.z,.18,.23,4.4,corroded?surfaceRust:MATERIAL.brushed);
  for(const q of [-1,1]){
   box('store vertical glazed aluminum mullion',x,1.52,s.z+q*2.10,.19,2.9,.095,MATERIAL.brushed);
   box('loose fascia bracket',x-s.side*.16,2.93,s.z+q*2.1,.35,.09,.2,MATERIAL.rust);
  }
  const sign=special[s.type]||{s:'CLOSED',sub:'NO SERVICE'};
  const signFace=new THREE.MeshStandardMaterial({map:graphicTexture(sign.s,sign.sub,s.accent),roughness:.59,emissive:s.lit?'#655957':'#141719',emissiveIntensity:s.lit?.19:.02,side:THREE.DoubleSide});
  plane('shop identity poster '+s.type,x-s.side*.16,2.64,s.z+1.16,1.25,.43,signFace,face);
  if(corroded){
   for(let j=0;j<4;j++)box('welded protective bar',x-s.side*.11,.6+j*.55,s.z,.075,.042,3.5,MATERIAL.rust);
   plane('warning sheet',x-s.side*.2,1.4,s.z-1.15,.78,.86,poster,face);
  }
  if(s.type==='fashion'){
   // Interior display, not a false wall across the accessible doorway.
   plane('retro fashion display',-9.7,1.7,s.z-.9,1.65,1.65,poster,Math.PI/2);
   for(let i=0;i<5;i++)box('fashion hanging shelf',-8.1,.55+i*.29,s.z+1.0,.11,.04,1.5,i%3?MATERIAL.brushed:MATERIAL.rust);
  }
  if(s.type==='arcade'){
   // The arcade advert is dark except for one LED section.
   const ed=new THREE.MeshBasicMaterial({color:'#8c435a'});
   box('disconnected arcade light bar',x-s.side*.24,2.58,s.z,.06,.08,2.6,ed);
   blinkers.push({material:ed,base:0.35,phase:12.1});
  }
 }
 // Ramen shop: cloth entrance, asymmetric vapor hood, cupboards, lamps and greasy service area.
 const cloth=MATERIAL.fabric.clone();cloth.color.set('#695a50');
 for(let i=0;i<5;i++){
  const strip=plane('aged noren cloth curtain',-3.32,2.10,-10.9-1.55+i*.76,.75,.88,cloth,Math.PI/2);
  strip.rotation.z=(r()-.5)*.07;
  box('noren print patch',-3.34,2.24,-10.9-1.55+i*.76,.016,.28,.29,MATERIAL.warning);
 }
 pipe('noren support rail',[[-3.33,2.62,-12.73],[-3.33,2.62,-9.07]],.025,MATERIAL.brushed);
 box('grease extractor canopy',-8.2,2.86,-12.5,3.2,.44,1.25,MATERIAL.brushed);
 box('extraction duct',-8.6,3.53,-12.6,.79,1,.85,MATERIAL.rust);
 for(let i=0;i<6;i++){
  box('kitchen glazed upper storage',-9.56,2.2,-13.3+i*.55,.09,.54,.48,MATERIAL.brushed);
  box('kitchen shadow inside cabinet',-9.50,2.14,-13.3+i*.55,.03,.4,.42,MATERIAL.dark);
 }
 const yellow=new THREE.MeshBasicMaterial({color:'#e2b17f'});
 for(let i=0;i<3;i++){
  box('suspended noodle shop pendant',-7.9+i*.85,2.87,-11.2,.32,.35,.3,MATERIAL.rust);
  box('subtle amber light source',-7.9+i*.85,2.69,-11.2,.17,.025,.19,yellow);
 }
 // Restroom: a separate, fully walkable room (shared collider shell in layout).
 // Entry is preserved at x=3.65, z=4.82..8.08: no fictitious wall over it.
 const glazed=new THREE.MeshPhysicalMaterial({color:'#8eaaaa',roughness:.23,metalness:.22,transparent:true,opacity:.62,side:THREE.DoubleSide});
 box('bathroom ceramic floor overlay',7.14,.007,5.91,6.55,.014,8.02,tiles);
 for(const zz of [1.96,9.83])plane('restroom ceramic wall',7.15,1.45,zz,6.28,2.83,tiles,zz===9.83?Math.PI:0);
 const bathroomSign=new THREE.MeshStandardMaterial({map:graphicTexture('化粧室','RESTROOM / LAVATORY','#9bb1a7'),emissive:'#475b56',emissiveIntensity:.19,side:THREE.DoubleSide});
 plane('public restroom entrance indicator',3.28,3.05,6.45,1.78,.66,bathroomSign,-Math.PI/2);
 box('bathroom mirror frame',5.25,1.83,2.01,1.78,1.20,.09,MATERIAL.steel);
 plane('foggy restroom mirror',5.25,1.83,2.07,1.61,1.03,glazed);
 pipe('restroom mirror fractured edge',[[4.9,2.23,2.08],[5.1,1.9,2.08],[5.42,1.84,2.08],[5.63,1.56,2.08]],.007,MATERIAL.dark);
 box('ceramic sink slab',5.25,.87,2.53,1.61,.11,.64,MATERIAL.ceramic);
 for(const xx of [4.79,5.58]){
  const basin=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.07,14),MATERIAL.ceramic);
  basin.name='porcelain basin';basin.position.set(xx,.93,2.53);scene.add(basin);objects.push(basin);
  box('drain plug',xx,.963,2.52,.07,.015,.07,MATERIAL.dark);
  pipe('water-stained faucet',[[xx,1.0,2.30],[xx,1.18,2.30],[xx,1.21,2.50]],.02,MATERIAL.brushed);
 }
 for(const zz of [3.06,6.02,8.82]){
  const bowl=new THREE.Mesh(new THREE.TorusGeometry(.27,.065,6,13),MATERIAL.ceramic);
  bowl.name='toilet rim';bowl.rotation.x=Math.PI/2;bowl.position.set(9.4,.54,zz);scene.add(bowl);objects.push(bowl);
  box('toilet ceramic tank',9.4,.79,zz+.27,.53,.45,.23,MATERIAL.ceramic);
  box('toilet flush lever',9.25,.99,zz+.27,.11,.04,.035,MATERIAL.brushed);
 }
 for(const zz of [4.38,7.48]){
  box('stall partition steel trim',7.96,2.16,zz,.08,.07,.14,MATERIAL.brushed);
  box('stall door hinge detail',8.02,1.44,zz+.15,.06,.18,.09,MATERIAL.rust);
 }
 box('restroom safety lighting casing',5.83,4.06,6.0,1.23,.14,.4,MATERIAL.brushed);
 const restroomLight=new THREE.PointLight('#a8b7af',mobile?2.8:5.1,7,2.1);
 restroomLight.position.set(6.0,3.30,5.95);scene.add(restroomLight);objects.push(restroomLight);
 // Electronics: actual CRT colored glass, tiny keyboards and old repair station.
 for(let j=0;j<3;j++)for(let k=0;k<3;k++){
  const z=-24.65-j*1.85,y=.66+k*.72;
  box('CRT display reflection',9.044,y,z,.016,.25,.33,new THREE.MeshBasicMaterial({color:j%2===0?'#415a5a':'#364955'}));
  box('computer ventilation side',9.77,y,z,.028,.16,.27,MATERIAL.brushed);
 }
 for(let j=0;j<2;j++){
  box('repair desk drawer',7.4,.55,-28.7+j*.52,1.15,.2,.48,MATERIAL.brushed);
  box('tiny checkout terminal',6.4,1.7,-28.2,.3,.24,.26,MATERIAL.dark);
 }
 // Arcade and derelict vending machines are tall, distinct silhouettes.
 for(let i=0;i<2;i++){
  const z=-34.1+i*1.2;
  box('arcade joystick',-2.66,.94,z-.15,.10,.09,.10,MATERIAL.warning);
  box('arcade token slot',-2.62,.63,z,.03,.08,.12,MATERIAL.brushed);
 }
 const screen=new THREE.MeshBasicMaterial({color:'#486a66'});
 box('vending cabinet side',-2.45,1.25,-20.7,.65,2.2,1.0,MATERIAL.rust);
 box('vending light panel',-2.08,1.60,-20.7,.04,.82,.67,screen);
 box('vending dispenser',-2.07,.62,-20.7,.04,.25,.48,MATERIAL.dark);
 blinkers.push({material:screen,base:.7,phase:4});
 // Security wing: steel mesh, concrete desk and dull CCTV screens behind glass.
 box('service emergency beam cover',13.2,3.8,-47.28,12.2,.26,.33,surfaceRust);
 for(let i=0;i<7;i++)box('security conduit vertical',12.2+i*1.2,3.38,-47.29,.06,.75,.05,MATERIAL.brushed);
 for(let i=0;i<3;i++){
  const x=14.3+i*.85;
  box('security monitor no signal',x,1.57,-53.58,.51,.32,.018,new THREE.MeshBasicMaterial({color:'#243939'}));
  box('security camera label',x,1.29,-53.57,.31,.038,.014,MATERIAL.warning);
 }
 for(let i=0;i<3;i++){
  const x=14.3+i*.85;
  box('cable bundle over security wall',x,3.8,-53.9,.045,.52,.05,MATERIAL.dark);
 }
 // Surface stains and posters on the corridor side. Individual pieces use alpha
 // and never cover an actual doorway opening with collision.
 const flaked=new THREE.MeshStandardMaterial({color:'#354146',roughness:1,transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide});
 for(let i=0;i<(mobile?22:66);i++){
  const z=12-r()*62;const side=r()>.5?1:-1;const x=side*3.31;
  const w=.15+r()*.47,h=.2+r()*1.1;
  if(facadePanelAllowed(side,z,w*.5))plane('corridor water damage',x,h*.5+.16,z,w,h,flaked,side===-1?Math.PI/2:-Math.PI/2);
 }
 // Practical emergency lit exit sign, not a neon strip of uniform intensity.
 const egressTex=graphicTexture('出口','FIRE EXIT / SERVICE','#be8c7b');
 const egressMat=new THREE.MeshStandardMaterial({map:egressTex,emissive:'#824f4b',emissiveMap:egressTex,emissiveIntensity:.22,side:THREE.DoubleSide});
 plane('fire exit wall-mounted sign',18.85,2.91,-51.02,1.6,.61,egressMat,Math.PI/2);
 // Structural repairs around service doorway (only decorative; colliders remain aligned).
 for(const side of [-1,1])box('heavy service door jamb',19.0,1.72,-51+side*1.75,.24,3.44,.22,MATERIAL.brushed);
 box('exit overhead steel lintel',19.0,3.45,-51,.33,.22,3.75,MATERIAL.rust);
 return {
  count:objects.length,
  update(time,alarm){
   for(const b of blinkers){const off=Math.sin(time*13+b.phase)+Math.sin(time*29+b.phase*1.4)>1.22;b.material.color.set(off?'#151b1b':alarm?'#9a534c':'#526c6e');}
  }
 };
}
