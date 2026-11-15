import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {WALLS, CEILINGS, STORE_SIGNS, PROPS, WING, INTERACTION} from './layout.mjs';
import {addArtPass} from './detail-pass.mjs';

const hex=s=>new THREE.Color(s);
const mat=(color,roughness=.87,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const palette={
 concrete:mat('#424a4e',.98),tile:mat('#666d6b',.85),frame:mat('#272e33',.77,.5),glass:new THREE.MeshPhysicalMaterial({color:'#748b92',metalness:.28,roughness:.28,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false}),
 shutter:mat('#536069',.76,.67),rust:mat('#714b42',.96,.43),black:mat('#12191b',1),board:mat('#a3aaa6',.94),copper:mat('#654b40',.91,.6),white:mat('#b3bdbd',.9),wood:mat('#56453b',.9),red:mat('#5c252e',.8,.12),plastic:mat('#39484c',.6,.3),wire:mat('#131a1c',.72),rubber:mat('#181b1d',.96)
};
function rng(seed){let s=seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
const rand=rng(21679);
function texture(kind){
 const c=document.createElement('canvas');c.width=c.height=512;
 const g=c.getContext('2d'),base=kind==='floor'?'#474e4e':kind==='wall'?'#565e5d':kind==='ceiling'?'#414b4d':'#636a67';
 g.fillStyle=base;g.fillRect(0,0,512,512);
 const step=kind==='floor'?96:kind==='ceiling'?64:125;
 g.strokeStyle='rgba(10,15,18,.35)';g.lineWidth=2;
 for(let i=0;i<=512;i+=step){g.beginPath();g.moveTo(i,0);g.lineTo(i,512);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(512,i);g.stroke();}
 for(let i=0;i<18000;i++){
  const x=rand()*512,y=rand()*512,rr=rand()*2.2,alpha=rand()*.13;
  g.fillStyle=rand()<.54?`rgba(0,0,0,${alpha})`:`rgba(232,224,207,${alpha*.57})`;
  g.fillRect(x,y,rr+.4,rr+.4);
 }
 // Cracked edges and dark, uneven stains.
 for(let i=0;i<58;i++){
  let x=rand()*512,y=rand()*512;
  g.strokeStyle=`rgba(15,19,22,${.05+rand()*.23})`;g.lineWidth=rand()*3+.4;g.beginPath();g.moveTo(x,y);
  for(let j=0;j<4;j++){x+=(rand()-.5)*38;y+=(rand()-.5)*40;g.lineTo(x,y);}g.stroke();
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
 t.repeat.set(kind==='floor'?2:kind==='ceiling'?3:1,kind==='floor'?11:kind==='ceiling'?11:2);
 return t;
}
function inkGraphic(title,caption,color,mode='sign'){
 const c=document.createElement('canvas');c.width=1024;c.height=280;
 const g=c.getContext('2d');g.clearRect(0,0,1024,280);
 g.fillStyle='#131b21';g.fillRect(0,0,1024,280);
 const light=color||'#b4c3b7';
 g.fillStyle=light;g.globalAlpha=.12;g.fillRect(0,0,1024,280);g.globalAlpha=1;
 g.fillStyle='#06090d';g.fillRect(22,18,980,245);
 g.fillStyle=light;g.font=`700 ${mode==='poster'?65:94}px system-ui, sans-serif`;g.fillText(title,45,128,924);
 g.font='500 27px system-ui, sans-serif';g.letterSpacing='6px';g.fillText(caption,48,198,900);
 g.fillStyle=light;g.fillRect(45,225,920,3);g.globalAlpha=.7;
 for(let i=0;i<60;i++) {g.fillStyle=rand()<.5?'#252b2d':'#07090c';g.fillRect(rand()*1024,rand()*280,rand()*30+2,rand()*4+1)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
export function createLevel(scene){
 const mobile=('ontouchstart' in window||navigator.maxTouchPoints>0);
 const items=[];const interactive={};const lights=[];
 const concreteTex=texture('wall'),floorTex=texture('floor'),roofTex=texture('ceiling');
 const concrete=new THREE.MeshStandardMaterial({map:concreteTex,color:0xffffff,roughness:.98});
 const floorMat=new THREE.MeshStandardMaterial({map:floorTex,roughness:.46,metalness:.08,color:'#c2caca'});
 const ceilingMat=new THREE.MeshStandardMaterial({map:roofTex,roughness:.95,color:'#acb2af'});
 function box(name,x,y,z,w,h,d,material=palette.concrete,shadows=true){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);mesh.name=name;mesh.receiveShadow=true;mesh.castShadow=shadows;scene.add(mesh);items.push(mesh);return mesh;
 }
 function cylinder(name,x,y,z,top,bottom,height,material,rotX=0,rotZ=0){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,10),material);
  mesh.position.set(x,y,z);mesh.rotation.set(rotX,0,rotZ);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);items.push(mesh);return mesh;
 }
 function tube(name,points,r=.023,material=palette.wire){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(6,points.length*7),r,5,false),material);mesh.name=name;scene.add(mesh);items.push(mesh);return mesh;
 }
 const floor=(x,z,w,d)=>box('wet ceramic tile',x,-.07,z,w,.14,d,floorMat,false);
 floor(0,-19.5,21.5,75.2);floor(11.65,-51.6,15.7,10.5);floor(20.75,-51,3.6,4.55);
 for(const ceiling of CEILINGS)box('sealed acoustic ceiling',ceiling.x,ceiling.h+.1,ceiling.z,ceiling.w,.20,ceiling.d,ceilingMat,false);
 box('vestibule ceiling',20.75,4.45,-51,3.6,.26,4.55,ceilingMat,false);
 for(const w of WALLS){
  box(w.name,w.x,w.h/2,w.z,w.w,w.h,w.d,w.material==='tile'?palette.tile:concrete);
  // Add architectural capping, light rail and damp ceramic skirting.
  if(w.d>3&&w.w<1){box('tile wainscot',w.x+.09,.43,w.z,w.w+.04,.85,w.d,palette.tile,false);box('upper conduit',w.x+.04,3.48,w.z,.08,.09,w.d,palette.frame,false)}
  if(w.w>3&&w.d<1){box('wainscot',w.x,.37,w.z,w.w,.73,w.d+.055,palette.tile,false)}
 }
 // Structural beams interrupt the long corridor at regular but imperfect intervals.
 for(let z=12;z>-54;z-=7.8){
  const shift=rand()*.38-.19;
  box('steel crossbeam',shift,4.0,z,7.45,.3,.36,palette.frame);
  for(const side of [-1,1]) {
   box('column cladding',side*3.15,2.05,z,.48,4.1,.57,palette.concrete);
   box('warning stripe',side*3.15,.38,z,.52,.13,.6,palette.rust,false);
  }
 }
 // Real ceiling HVAC, damaged ducts, and cable trays.
 for(let i=0;i<9;i++){
  const z=7-i*7.15;
  box('suspended ventilation duct',1.45,3.88,z,1.05,.36,5.4,palette.shutter,false);
  box('duct clamp',1.45,3.65,z,1.12,.08,.15,palette.rust,false);
  for(let k=-1;k<=1;k++)tube('hanging data wires',[[2.45,4.05,z+k*.7],[2.4,3.15,z+k*.7+.8],[1.9,2.72,z+k*.7+1.9],[2.54,3.05,z+k*.7+2.55]],.014+k*.001,palette.wire);
 }
 // Signage panels, genuinely distinct storefront silhouettes and local props.
 for(const s of STORE_SIGNS){
  const x=s.side*3.48;
  const accent=new THREE.MeshStandardMaterial({color:s.accent,roughness:.55,metalness:.26});
  const signTexture=inkGraphic(s.name,s.sub,s.accent);
  const signMat=new THREE.MeshStandardMaterial({map:signTexture,emissive:s.lit?hex(s.accent):hex('#10151a'),emissiveMap:signTexture,emissiveIntensity:s.lit?.28:.025,roughness:.35,side:THREE.DoubleSide});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.93),signMat);sign.rotation.y=s.side<0?Math.PI/2:-Math.PI/2;sign.position.set(x,3.26,s.z);scene.add(sign);items.push(sign);
  for(const dz of [-1.86,1.86]){
   box('store pillar',x,1.55,s.z+dz,.22,3.1,.25,palette.frame);
   box('store sconce',x-s.side*.09,2.48,s.z+dz,.12,.38,.13,accent,false);
  }
  const open=s.type==='ramen'||s.type==='electronics';
  if(!open){
   box('corrugated steel shutter',x-s.side*.03,1.43,s.z,.1,2.65,3.7,palette.shutter);
   for(let j=0;j<16;j++)box('shutter rib',x-s.side*.11,.18+j*.151,s.z,.065,.024,3.72,j%5===0?palette.rust:palette.board,false);
  }else{
   box('retracted rolling shutter',x-s.side*.1,2.75,s.z,.32,.5,3.85,palette.shutter);
   for(let j=0;j<5;j++)box('rolled shutter blades',x-s.side*.27,2.66+j*.075,s.z,.08,.037,3.85,palette.rust,false);
   for(const dz of [-1.85,1.85])box('store door rail',x,1.32,s.z+dz,.13,2.63,.09,palette.frame);
  }
  // Typical 3D Japanese-style sign on an angled hanging bracket (not just texture on wall).
  if(s.z<-3&&s.z>-45){
   box('projecting bracket',s.side*2.92,3.48,s.z,.8,.08,.12,palette.frame,false);
   const tab=box('projecting blade sign',s.side*2.79,2.93,s.z,.12,.94,.48,accent,false);
   box('blade stripe',s.side*2.71,2.93,s.z,.035,.64,.39,palette.black,false);
  }
 }
 // Bespoke ramen shop, warmer and visibly older than others.
 box('ramen tiled backsplash',-9.5,1.4,-11.4,.18,2.5,4.2,palette.tile);
 box('ramen counter top',-7,1.12,-13.3,3.25,.18,.9,palette.wood);
 box('counter base',-7,.52,-13.3,3.2,1,.85,palette.frame);
 for(let i=-1;i<=1;i++){
  cylinder('round stool',-8+i, .46,-10.1,.35,.34,.11,palette.wood);
  cylinder('steel stool leg',-8+i,.24,-10.1,.055,.055,.45,palette.frame);
 }
 for(let i=0;i<5;i++)cylinder('old kitchen bowl',-8.1+i*.53,1.27,-13.1,.18,.12,.14,palette.board);
 tube('broken noodle shop pipe',[[-9.3,2.15,-9],[-8.8,2.0,-10],[-8.6,1.5,-11],[-8,1.28,-11.5]],.045,palette.rust);
 // Electronics: shelves, CRTs and a counter with realistic silhouettes.
 for(let j=0;j<3;j++){
  const z=-24.65-j*1.85;
  box('retro computer shelf',9.55,1.55,z,1.06,2.8,.7,palette.frame);
  for(let h=0;h<3;h++){
   box('CRT case',9.4,.66+h*.72,z,.64,.45,.52,palette.plastic);
   box('CRT screen',9.065,.66+h*.72,z,.03,.31,.4,palette.black,false);
  }
 }
 box('store cashier counter',7,1.02,-29,3.05,1.14,.85,palette.frame);
 box('glass countertop',7,1.62,-29,3.1,.08,.9,palette.glass);
 // Arcade machine silhouettes set into the shuttered storefront, visible from gallery.
 for(let j=0;j<2;j++){
  const z=-34.4+(j-.5)*1.15;
  box('arcade standing cabinet',-3.17,1.05,z,.8,1.86,.84,palette.black);
  box('arcade bevel display',-2.736,1.5,z,.035,.67,.65,palette.red,false);
  box('arcade controls',-2.75,.94,z,.12,.15,.65,palette.frame);
 }
 // Low-ceiling service transition with reinforcing lintel.
 box('service lintel',8.4,3.3,-46.8,8.0,.35,.7,palette.rust);
 for(let x=4.2;x<19;x+=1.8){box('service pipe',x,3.87,-47.2,.12,.12,8.5,palette.copper,false)}
 // Security office desk and panels: actual purpose, not collectibles.
 box('security counter',16.2,.57,-53.6,2.15,1.04,.63,palette.frame);
 box('security desk top',16.2,1.11,-53.6,2.22,.12,.73,palette.wood);
 for(let i=0;i<3;i++){box('security monitor',14.3+i*.85,1.52,-53.7,.65,.56,.18,palette.black);box('security dark display',14.3+i*.85,1.55,-53.59,.52,.34,.01,palette.plastic,false)}
 const panel=box('emergency panel',INTERACTION.panel.x,INTERACTION.panel.y,INTERACTION.panel.z,.42,.84,.21,palette.rust);
 box('power toggle',INTERACTION.panel.x,INTERACTION.panel.y+.12,INTERACTION.panel.z+.13,.26,.3,.04,palette.white,false);
 interactive.panel=panel;
 // Exterior egress door is a 3D panel and a matching Rapier rigid collider.
 const door=box('fire exit solid door',19.02,1.61,-51,.3,3.22,3.43,palette.rust);
 box('fire exit white band',18.83,2.48,-51,.05,.17,2.8,palette.board,false);
 interactive.exit=door;
 // Each solid collision prop gets a visual volume aligned with the physics collider.
 for(const p of PROPS){
  const material=p.name.includes('crate')?palette.wood:p.name.includes('cabinet')?palette.rust:p.name.includes('trolley')?palette.board:palette.frame;
  box(p.name,p.x,p.h/2,p.z,p.w,p.h,p.d,material);
  if(p.name==='fallen rack'){
   for(let i=0;i<3;i++)box('buckled shelving',p.x,p.h*.3+i*.12,p.z,p.w+.1,.06,p.d+.09,palette.rust,false);
  }
  if(p.name==='stacked crates'){
   for(let i=0;i<3;i++)box('wooden crate planks',p.x,p.h*.32+i*.28,p.z,p.w+.02,.11,p.d+.01,palette.wood,false);
  }
  if(p.name==='trolley')for(const s of [-1,1])cylinder('cart wheel',p.x+s*.4,.11,p.z,.14,.14,.12,palette.rubber,0,Math.PI/2);
 }
 // Irregular pieces of trash, flyers and damp puddles outside movement lanes.
 const stickerMaterial=new THREE.MeshStandardMaterial({color:'#737e7e',transparent:true,opacity:.46,roughness:1,side:THREE.DoubleSide,depthWrite:false});
 const waterMaterial=new THREE.MeshPhysicalMaterial({color:'#384a53',metalness:.65,roughness:.13,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide});
 for(let i=0;i<90;i++){
  const x=(rand()<.5?-1:1)*(2.2+rand()*1.15),z=-52+rand()*64;
  if(i%4===0){
   const wet=new THREE.Mesh(new THREE.CircleGeometry(.3+rand()*.65,13),waterMaterial);
   wet.rotation.x=-Math.PI/2;wet.scale.set(1,.3+rand()*.85,1);wet.position.set(x,.012,z);scene.add(wet);items.push(wet);
  }else{
   const rubbish=new THREE.Mesh(new THREE.PlaneGeometry(.08+rand()*.25,.06+rand()*.3),stickerMaterial);
   rubbish.rotation.x=-Math.PI/2;rubbish.rotation.z=rand()*6.28;rubbish.position.set(x,.014,z);scene.add(rubbish);items.push(rubbish);
  }
 }
 // Localized, dying fixture lighting. Only 2-3 remain bright in each section.
 const zones=[
  {z:9,color:'#c9b5a1',power:1.2},
  {z:-2,color:'#aeac9e',power:.85},
  {z:-11,color:'#d69b77',power:1.35,flicker:true},
  {z:-20,color:'#7896a2',power:.62},
  {z:-29,color:'#7ca5b7',power:1.1,flicker:true},
  {z:-40,color:'#b76d6f',power:.86},
  {z:-49,color:'#b48569',power:.92,flicker:true},
  {z:-54,color:'#7c8d8e',power:.55},
 ];
 for(let i=0;i<zones.length;i++){
  if(mobile&&i%2===1)continue;
  const zone=zones[i];
  box('fluorescent housing',0,4.02,zone.z,1.6,.23,.34,palette.frame,false);
  const glowMat=new THREE.MeshBasicMaterial({color:zone.color});
  const diffuser=box('fluorescent translucent diffuser',0,3.885,zone.z,1.38,.022,.21,glowMat,false);
  const light=new THREE.PointLight(zone.color,zone.power*17,12,2);
  light.position.set(0,3.5,zone.z);scene.add(light);lights.push({light,base:zone.power*17,seed:i*19.5,flag:!!zone.flicker,diffuser});
 }
 for(const zone of [{x:-7,z:-11,c:'#e1a373',p:16},{x:7,z:-27,c:'#93bcca',p:12},{x:15,z:-51,c:'#c87163',p:10}]){
  const l=new THREE.PointLight(zone.c,zone.p,9,2.2);l.position.set(zone.x,2.75,zone.z);scene.add(l);lights.push({light:l,base:zone.p,seed:24.1,flag:true});
 }
 // Hanging warnings at junctions; dynamic illuminated textures not random duplicates.
 for(const s of [{title:'非常口',subtitle:'EMERGENCY EXIT / B2',z:-48},{title:'02 / LIFT',subtitle:'POWER DISCONNECTED',z:-18}]){
  const tex=inkGraphic(s.title,s.subtitle,'#c6b2a5','poster');
  const material=new THREE.MeshStandardMaterial({map:tex,emissive:'#51413b',emissiveMap:tex,emissiveIntensity:.12,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.25,.61),material);mesh.position.set(0,3.05,s.z);mesh.rotation.x=-.11;scene.add(mesh);items.push(mesh);
  for(const dx of [-.85,.85])box('ceiling sign mount',dx,3.62,s.z,.035,1.1,.04,palette.frame,false);
 }
 const detail=addArtPass(scene,{mobile});
 const amb=new THREE.HemisphereLight('#9eafc1','#262727',.4);scene.add(amb);
 const emergency=new THREE.PointLight('#b7534e',0,13,2);emergency.position.set(13,2.7,-51);scene.add(emergency);
 return {interactive,lights,emergency,box,count:items.length+detail.count,update(time,alarm){
  detail.update(time,alarm);
  for(const l of lights){const strobe=l.flag?(Math.sin(time*11+l.seed)+Math.sin(time*37+l.seed*2))*.5:0;
   l.light.intensity=Math.max(.04,l.base*(l.flag&&strobe>.45?.12:1+strobe*.09));}
  emergency.intensity=alarm?(10+5*Math.sin(time*9)):0;
  interactive.exit.position.y=alarm?5.4:1.61;
 },openExit(){interactive.exit.visible=false;}};
}
