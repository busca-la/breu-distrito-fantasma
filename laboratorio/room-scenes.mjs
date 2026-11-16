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
   mesh.material.color.setScalar(1);
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
 return {update,roomAt,rooms:ROOM_ZONES,visited,turners};
}
