import * as THREE from 'three';

// Distinct interiors behind the real doorways in layout.mjs. Large fixtures
// stay at the edges: no uncollided obstacles in walkable room centres.
export const ROOM_ZONES=Object.freeze([
 {id:'restroom',name:'Banheiro público',x0:4.3,x1:10.35,z0:2.1,z1:9.6},
 {id:'minato',name:'MINATO',x0:-10.35,x1:-4.25,z0:-15.0,z1:-8.2},
 {id:'kino',name:'KINO',x0:4.35,x1:10.4,z0:-12.5,z1:-5.6},
 {id:'fashion',name:'A-07',x0:-10.4,x1:-4.35,z0:-26.0,z1:-19.5},
 {id:'denki',name:'DENKI',x0:4.35,x1:10.4,z0:-31.0,z1:-23.8},
 {id:'arcade',name:'GAME 99',x0:-10.4,x1:-4.35,z0:-39.25,z1:-30.5},
 {id:'pharmacy',name:'Farmácia',x0:4.35,x1:10.4,z0:-43.0,z1:-37.0},
 {id:'maintenance',name:'Manutenção',x0:-10.4,x1:-4.35,z0:-51.2,z1:-45.6},
 {id:'security',name:'Segurança',x0:12.2,x1:18.7,z0:-54.2,z1:-48.6},
]);
export function roomAt(p){
 if(!p)return null;
 return ROOM_ZONES.find(r=>p.x>r.x0&&p.x<r.x1&&p.z>r.z0&&p.z<r.z1)?.id||null;
}
export function createRoomScenes(scene,{lowPower=false}={}){
 const mats={
  porcelain:new THREE.MeshStandardMaterial({color:'#758985',roughness:.36,metalness:.12}),
  paper:new THREE.MeshStandardMaterial({color:'#aaa39a',roughness:1}),
  dark:new THREE.MeshStandardMaterial({color:'#1a262a',metalness:.22,roughness:.72}),
  steel:new THREE.MeshStandardMaterial({color:'#525f61',metalness:.65,roughness:.48}),
  wood:new THREE.MeshStandardMaterial({color:'#6b4c3d',roughness:.87}),
  neon:new THREE.MeshBasicMaterial({color:'#bf777d'}),
  cool:new THREE.MeshBasicMaterial({color:'#9fc5c4'}),
  warm:new THREE.MeshBasicMaterial({color:'#e0b38b'}),
  sick:new THREE.MeshBasicMaterial({color:'#adbda1'}),
 };
 const geo=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,8);
 const make=(name,x,y,z,w,h,d,material=mats.dark)=>{
  const mesh=new THREE.Mesh(geo,material);
  mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.name=name;
  scene.add(mesh);return mesh;
 };
 const strips=[],turners=[],displayMaterials=[];
 const illuminated=(name,x,y,z,w,h,d,mat)=>{
  const m=mat.clone();displayMaterials.push(m);
  const mesh=make(name,x,y,z,w,h,d,m);strips.push(mesh);return mesh;
 };
 // PUBLIC RESTROOM: broken mirrors, reflective panels, divided cubicles.
 make('Restroom wet mosaic',7.15,.025,6.0,5.7,.019,6.1,mats.porcelain);
 for(let i=0;i<3;i++){
  make('Cracked mirror',5.0,2.15,3.1+i*1.58,.035,.85,.95,mats.steel);
  make('Mirror dark crack',4.965,2.12,3.0+i*1.58,.016,.59,.024,mats.dark);
 }
 for(let i=0;i<2;i++){
  make('Restroom stall indicator',9.12,2.2,3.3+i*3.2,.035,.09,.28,mats.neon);
 }
 // MINATO: dirty kitchen fluorescent, hanging order tickets, steam hood,
 // greasy equipment and a flickering hand-written warning.
 make('Kitchen extract metal hood',-8.5,2.62,-12.55,2.4,.30,1.15,mats.steel);
 for(let i=0;i<6;i++){
  make('Kitchen order ticket',-9.45+i*.28,1.85,-11.95,.15,.25,.015,mats.paper);
 }
 illuminated('MINATO service lamp',-6.1,2.65,-10.5,.95,.09,.21,mats.warm);
 make('Kitchen soaked board',-9.75,1.4,-10.8,.09,1.28,1.5,mats.wood);
 // KINO: camera shelf and red recording indicator, security monitors.
 for(let i=0;i<5;i++){
  make('KINO lens shelf',9.55,.65+i*.43,-7.75,.52,.065,2.15,mats.steel);
  make('KINO boxed film',9.25,.78+i*.42,-8.5+(i%3)*.72,.32,.22,.22,mats.dark);
 }
 illuminated('Recording tally lamp',7.8,2.55,-7.65,.45,.14,.1,mats.neon);
 make('KINO film hanging screen',9.6,2.38,-10.5,.10,1.6,1.05,mats.paper);
 // FASHION: broken dressing mirror, side mannequin on a low plinth, rails.
 make('A-07 diagonal display carpet',-7.35,.027,-22.4,3.0,.015,3.2,mats.wood);
 make('A-07 mirror back',-9.72,1.75,-21.3,.08,2.3,1.05,mats.steel);
 const mannequin=new THREE.Group();mannequin.position.set(-8.75,0,-24.55);
 const torso=new THREE.Mesh(new THREE.CylinderGeometry(.18,.30,.88,8),mats.paper);torso.position.y=1.25;
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,8,7),mats.paper);head.position.y=1.96;
 const stand=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.10,8),mats.steel);stand.position.y=.06;
 mannequin.add(torso,head,stand);scene.add(mannequin);turners.push({object:mannequin,phase:1.3});
 for(let i=0;i<4;i++)make('A-07 bent coat hanger',-9.85,1.78,-24.5+i*.57,.08,.035,.33,mats.steel);
 // DENKI: assorted CRT screens and electrical meter bank, not a generic room.
 for(let i=0;i<4;i++){
  make('DENKI monitor chassis',9.58,1.15+(i%2)*.81,-29.2+Math.floor(i/2)*2.0,.51,.55,.67,mats.dark);
  illuminated('DENKI CRT glow',9.27,1.19+(i%2)*.81,-29.2+Math.floor(i/2)*2.0,.018,.36,.5,mats.cool);
 }
 make('DENKI overhead cable tray',8.5,3.12,-26.2,1.7,.13,2.5,mats.steel);
 illuminated('Power board arrow',5.65,2.16,-27.25,.52,.09,.08,mats.warm);
 // GAME 99: black-and-red lane with deliberately different cabinet heights.
 make('GAME 99 carpet',-7.0,.025,-34.6,5.0,.015,7.7,mats.dark);
 for(let i=0;i<4;i++){
  const z=-38+i*1.68;
  make('GAME 99 cabinet chassis',-9.72,1.0,z,.6,1.85,.83,mats.steel);
  illuminated('GAME 99 CRT screen',-9.38,1.42,z,.025,.64,.67,i%2?mats.neon:mats.cool);
  make('GAME 99 input deck',-9.34,.88,z,.15,.18,.57,mats.wood);
 }
 illuminated('GAME 99 flickering marquee',-6.0,2.92,-33.7,1.6,.14,.18,mats.neon);
 // PHARMACY: sickly green prescription area, display cartons, cold counter.
 make('Pharmacy examination curtain',9.76,2.0,-39.9,.07,2.3,1.72,mats.paper);
 for(let i=0;i<3;i++){
  make('Pharmacy wall medicine shelf',9.62,.69+i*.67,-41.2,.54,.10,2.05,mats.steel);
  for(let j=0;j<4;j++){
   make('Pharmacy stacked carton',9.31,.85+i*.65,-42.0+j*.52,.33,.24,.26,j%2?mats.paper:mats.porcelain);
  }
 }
 illuminated('Emergency pharmacy cross',7.75,2.91,-39.0,.12,.48,.12,mats.sick);
 illuminated('Emergency pharmacy cross bar',7.75,2.91,-39.0,.43,.12,.12,mats.sick);
 // MAINTENANCE: suspended service hoses, chalk marks and a broken fan.
 for(let i=0;i<3;i++){
  make('Maintenance spare pipe',-9.7,2.85,-46.65-i*.98,.16,.16,1.35,mats.steel);
 }
 make('Maintenance electrical junction',-9.85,1.56,-46.7,.23,.73,.75,mats.dark);
 illuminated('Maintenance unstable amber light',-8.2,2.8,-47.8,.72,.09,.18,mats.warm);
 // SECURITY: actually contains operating panels, monitors and case records.
 for(let i=0;i<3;i++){
  make('Security monitor column',17.15,2.13,-48.7-i*.37,.15,.51,.33,mats.dark);
  illuminated('CCTV monitor visual',17.04,2.13,-48.7-i*.37,.018,.36,.24,mats.cool);
 }
 make('Security incident archive',16.2,1.51,-54.14,2.1,.67,.11,mats.paper);
 illuminated('Powered gate status panel',12.35,2.85,-51.2,.15,.45,.61,mats.neon);
 // DENSE, HAND-PLACED ROOM DRESSING: stock, debris, broken shop fixtures
 // and wall-level detail. Walkable floor is still governed by layout.PROPS.
 // All meshes use shared geometry/materials and are batched below.
 const fixtures=[
  {name:'MINATO',x:-9.91,z:-11.5,side:-1,accent:mats.warm,stock:mats.paper,spread:3.1},
  {name:'KINO',x:9.89,z:-8.7,side:1,accent:mats.cool,stock:mats.steel,spread:3.1},
  {name:'A-07',x:-9.91,z:-22.5,side:-1,accent:mats.paper,stock:mats.wood,spread:3.2},
  {name:'DENKI',x:9.88,z:-27.1,side:1,accent:mats.cool,stock:mats.dark,spread:3.2},
  {name:'GAME 99',x:-9.89,z:-34.5,side:-1,accent:mats.neon,stock:mats.steel,spread:3.25},
  {name:'PHARMACY',x:9.89,z:-39.7,side:1,accent:mats.sick,stock:mats.paper,spread:3.0},
  {name:'MAINTENANCE',x:-9.9,z:-48.5,side:-1,accent:mats.warm,stock:mats.steel,spread:2.8},
 ];
 for(const f of fixtures){
  // A distinct back-wall merchandising system for each shop, offset well
  // away from the door centre and the player traversable floor.
  for(let tier=0;tier<3;tier++){
   const yy=.84+tier*.55;
   make(f.name+' wall-mounted shelving',f.x,yy,f.z,.21,.085,f.spread,mats.steel);
   for(let slot=0;slot<6;slot++){
    const z=f.z-f.spread*.43+slot*f.spread*.172;
    const width=(slot%3===0?.27:.18);
    const height=.18+(slot%4)*.065;
    const material=slot%5===0?f.accent:slot%3===0?f.stock:mats.dark;
    make(f.name+' authentic merchandise',f.x-f.side*.2,yy+.10+height*.5,z,.25,height,width,material);
    if(tier===1&&slot%2===0)
     make(f.name+' paper price label',f.x-f.side*.3,yy-.08,z,.014,.11,.18,mats.paper);
   }
  }
  make(f.name+' scratched wall fascia',f.x,2.83,f.z,.09,.19,f.spread,mats.wood);
  make(f.name+' broken wall light',f.x-f.side*.19,2.68,f.z,.22,.10,.85,f.accent);
 }
 // Bathroom: worn sinks, hand dryers, mirrors and water-stained notices.
 for(let i=0;i<4;i++){
  const z=2.8+i*1.56;
  make('Restroom sink lip',5.04,.88,z,.49,.09,.44,mats.porcelain);
  make('Restroom chrome tap',5.01,1.01,z,.08,.19,.07,mats.steel);
  make('Restroom sanitation placard',5.01,2.48,z,.02,.31,.25,mats.paper);
 }
 // Clothing store: proper hanging racks and garments along the west wall.
 for(let i=0;i<8;i++){
  const z=-24.6+i*.58;
  make('A-07 steel hanger',-9.53,2.19,z,.37,.035,.04,mats.steel);
  make('A-07 garment torso',-9.35,1.59,z,.39,.76,.11,i%3===0?mats.paper:i%3===1?mats.dark:mats.wood);
 }
 // Arcade: nested screens, token slots and scattered prize cartons.
 for(let i=0;i<8;i++){
  const z=-38.1+i*.86;
  make('GAME 99 color cabinet edge',-9.18,1.18,z,.08,1.65,.08,i%2?mats.neon:mats.cool);
  make('GAME 99 control panel',-9.08,.91,z,.29,.14,.32,mats.steel);
  make('GAME 99 coin slot',-9.05,.55,z,.04,.15,.09,mats.paper);
 }
 // The shopping gallery itself should not look like a sterile hallway.
 // Keep the actual corridor centre clear for combat, physical obstacles and
 // the emergency route. This is only small rubbish, overhead banners and
 // storefront debris along the edges.
 let seed=30927;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<(lowPower?65:125);i++){
  const z=13-rand()*65;
  const x=(rand()>.5?1:-1)*(2.20+rand()*.55);
  const width=.07+rand()*.21,depth=.08+rand()*.25;
  make('Abandoned shopping flyer',x,.045,z,width,.018,depth,i%4===0?mats.paper:i%3===0?mats.wood:mats.dark);
 }
 for(const [z,label] of [[-2,'north'],[-17,'retail'],[-30,'arcade'],[-46,'service']]){
  make(label+' mall overhead directory',0,3.23,z,3.8,.58,.11,mats.steel);
  make(label+' mall peeled direction arrow',-.85,3.20,z-.07,1.26,.16,.028,mats.paper);
  make(label+' mall emergency pointer',.92,3.18,z-.07,.91,.10,.028,mats.warm);
 }
 // Shipping boxes cluster beside the real solid shelves, not across doors.
 for(const f of fixtures){
  for(let k=0;k<5;k++){
   const z=f.z-1.05+(k%3)*.7;
   const x=f.x-f.side*.47;
   make(f.name+' fallen stock',x,.14+(k%2)*.20,z,.25,.24,.26,k%3===0?mats.paper:mats.wood);
  }
 }
 // Batch the dozens of static room fixtures. Dynamic screens stay separate,
 // so the nine redesigned rooms cost only a handful of extra draw calls.
 const animated=new Set(strips);
 const materialGroups=new Map();
 for(const obj of [...scene.children]){
  if(!obj.isMesh||obj.geometry!==geo||animated.has(obj)||!Object.values(mats).includes(obj.material))continue;
  if(!materialGroups.has(obj.material))materialGroups.set(obj.material,[]);
  materialGroups.get(obj.material).push(obj);
 }
 let batchCount=0;
 for(const [material,meshes] of materialGroups){
  if(meshes.length<2)continue;
  const combined=new THREE.InstancedMesh(geo,material,meshes.length);
  combined.name='Room detail batched / '+material.color.getHexString();
  for(let j=0;j<meshes.length;j++){
   const original=meshes[j];
   original.updateMatrix();
   combined.setMatrixAt(j,original.matrix);
   scene.remove(original);
  }
  combined.instanceMatrix.needsUpdate=true;
  combined.computeBoundingSphere();
  scene.add(combined);batchCount++;
 }
 const visited=new Set();
 let lastRoom=null,lastBeat=-100;
 // Emissive-only color animation; no additional shadow-casting light.
 function update(time,player,{power=false}={}){
  const current=roomAt(player);
  if(current!==lastRoom)lastRoom=current;
  const energy=power?1:.38;
  for(let i=0;i<strips.length;i++){
   const mesh=strips[i];
   const blink= Math.sin(time*(3.2+i*.21)+i*1.7);
   const base=mesh.name.includes('DENKI')||mesh.name.includes('Security')?energy:1;
   mesh.material.opacity=1;mesh.material.transparent=false;
   mesh.visible=base>.3&&(blink>-.83||i%3!==0);
  }
  for(const t of turners)t.object.rotation.y=(Math.sin(time*.18+t.phase)*.1);
  if(current&&!visited.has(current)&&time-lastBeat>3.8){
   visited.add(current);lastBeat=time;
   const messages={
    restroom:{kind:'metal',text:'UMA PORTA DE CABINE ACABOU DE BATER.'},
    minato:{kind:'radio',text:'UM RÁDIO CHIA ATRÁS DO BALCÃO DO MINATO.'},
    kino:{kind:'electric',text:'UMA CÂMERA ANTIGA LIGOU SOZINHA.'},
    fashion:{kind:'metal',text:'UM MANEQUIM MUDOU DE POSIÇÃO.'},
    denki:{kind:'electric',text:'UM MONITOR ACENDEU E APAGOU.'},
    arcade:{kind:'electric',text:'AS MÁQUINAS ESTÃO RESPONDENDO À SUA PRESENÇA.'},
    pharmacy:{kind:'metal',text:'ALGO ARRASTOU UMA GAVETA NA FARMÁCIA.'},
    maintenance:{kind:'metal',text:'PASSOS NO FORRO DA MANUTENÇÃO.'},
    security:{kind:'radio',text:'A CENTRAL ESTÁ REGISTRANDO MOVIMENTO NA ALA.'},
   };
   return {room:current,...messages[current]};
  }
  return null;
 }
 return {update,roomAt,rooms:ROOM_ZONES,visited,turners,batchCount};
}
