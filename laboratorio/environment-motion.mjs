import * as THREE from 'three';

// Small, independent world events. No new collision volumes, shadow maps,
// textures, particle engines or network dependencies.
export const BEATS = Object.freeze([
 {z:5,kind:'metal',text:'ALGUMA COISA SE MOVEU ATRÁS DAS LOJAS.'},
 {z:-15,kind:'electric',text:'CURTO-CIRCUITO NA GALERIA. NÃO PARE.'},
 {z:-30,kind:'pursuit',text:'PASSOS PESADOS ECOAM NA ALA DE SERVIÇO.'},
 {z:-46,kind:'metal',text:'A CENTRAL DE SEGURANÇA ESTÁ PRÓXIMA.'},
]);
export function crossedBeat(before,after,beat){
 return Number.isFinite(before)&&Number.isFinite(after)&&before>beat.z&&after<=beat.z;
}

export function createEnvironmentMotion(scene,{lowPower=false}={}){
 const metal=new THREE.MeshStandardMaterial({color:'#3b4547',roughness:.89,metalness:.38});
 const dull=new THREE.MeshBasicMaterial({color:'#b1a6a0'});
 const pale=new THREE.MeshBasicMaterial({color:'#a1c4c1'});
 const black=new THREE.MeshBasicMaterial({color:'#182024'});
 const fixtures=[];
 const cables=new THREE.CylinderGeometry(.012,.012,.48,5);
 const shade=new THREE.BoxGeometry(1.15,.16,.27);
 const strip=new THREE.BoxGeometry(1.06,.035,.18);
 for(const [x,z,phase] of [[.25,9,0],[.75,-5,.9],[1.5,-24,1.3],[-.9,-41,2.5]]){
  const pivot=new THREE.Group();pivot.position.set(x,4.05,z);
  const cable=new THREE.Mesh(cables,metal);cable.position.y=-.24;
  const body=new THREE.Mesh(shade,metal);body.position.y=-.54;
  const glow=new THREE.Mesh(strip,pale);glow.position.y=-.64;
  pivot.add(cable,body,glow);scene.add(pivot);
  fixtures.push({pivot,glow,phase,z});
 }
 // Non-blocking steel shutter on an already closed shop facade.
 const gate=new THREE.Group();gate.position.set(3.38,2.75,-38.4);
 const rail=new THREE.Mesh(new THREE.BoxGeometry(.08,1.65,1.4),metal);
 rail.position.y=-.9;gate.add(rail);
 for(let i=0;i<6;i++){
  const rib=new THREE.Mesh(new THREE.BoxGeometry(.09,.035,1.45),black);
  rib.position.y=-.20-i*.24;gate.add(rib);
 }
 scene.add(gate);
 // A faulty ceiling inspection camera travels under the roof, tracks the
 // corridor and retreats on approach. It never blocks the player's capsule.
 const scanner=new THREE.Group();
 const scannerBody=new THREE.Mesh(new THREE.BoxGeometry(.63,.19,.42),metal);
 const scannerArm=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.36,6),metal);
 scannerArm.position.y=.24;
 const scannerEye=new THREE.Mesh(new THREE.BoxGeometry(.095,.07,.08),
  new THREE.MeshBasicMaterial({color:'#be5148'}));
 scannerEye.position.set(0,-.025,-.255);
 scanner.add(scannerBody,scannerArm,scannerEye);
 scene.add(scanner);
 // A single draw call for suspended dust, recycled around the viewer.
 const count=lowPower?18:42,positions=new Float32Array(count*3);
 const seeds=Array.from({length:count},(_,i)=>({
  x:Math.sin(i*43.71)*4.1,z:Math.sin(i*19.81)*5.8,y:.3+(i%13)*.22,
  speed:.05+(i%7)*.017
 }));
 const dustGeo=new THREE.BufferGeometry();
 dustGeo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
 const dustMat=new THREE.PointsMaterial({color:'#a6b7ae',size:lowPower?.035:.05,transparent:true,opacity:.18,depthWrite:false,sizeAttenuation:true});
 const dust=new THREE.Points(dustGeo,dustMat);dust.frustumCulled=false;scene.add(dust);
 // Sparks are finite and only light up near the electric failure.
 const sparkPositions=new Float32Array(9*3);
 const sparkGeo=new THREE.BufferGeometry();
 sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3).setUsage(THREE.DynamicDrawUsage));
 const sparkMat=new THREE.PointsMaterial({color:'#c9f5ed',size:.12,transparent:true,opacity:0,depthWrite:false});
 const sparks=new THREE.Points(sparkGeo,sparkMat);sparks.frustumCulled=false;scene.add(sparks);
 const state={previousZ:13.1,seen:new Set(),pulse:-100,pulseKind:'',alarmWas:false};
 function burst(kind,time){state.pulse=time;state.pulseKind=kind;}
 function update(dt,time,player,{flashlight=true,alarm=false}={}){
  let triggered=null;
  for(let i=0;i<BEATS.length;i++){
   if(state.seen.has(i)||!crossedBeat(state.previousZ,player.z,BEATS[i]))continue;
   state.seen.add(i);triggered=BEATS[i];burst(triggered.kind,time);
   break;
  }
  state.previousZ=player.z;
  if(alarm&&!state.alarmWas){burst('alarm',time);triggered={kind:'alarm',text:'O SHOPPING INTEIRO OUVIU O ALARME.'};}
  state.alarmWas=alarm;
  const elapsed=time-state.pulse,active=elapsed>=0&&elapsed<1.6;
  for(const f of fixtures){
   const near=Math.abs(player.z-f.z)<15;
   f.pivot.rotation.z=near?Math.sin(time*1.38+f.phase)*.075+(active?Math.sin(elapsed*27)*.07*Math.max(0,1-elapsed):0):0;
   f.glow.visible=!near||Math.sin(time*8+f.phase)>.04;
  }
  gate.rotation.z=(Math.abs(player.z+38.4)<13||alarm)?Math.sin(time*19)*.014:0;
  // The security scanner is visible from the first corridor, but occupies
  // the ceiling volume: visual animation cannot create invisible obstacles.
  const scanZ=6.0+Math.sin(time*.43)*3.3;
  scanner.position.set(.9+Math.sin(time*.67)*1.1,3.53+Math.sin(time*2.4)*.045,scanZ);
  scanner.rotation.y=Math.sin(time*.63)*.48;
  scanner.visible=player.z> -9&&player.z<17;
  scannerEye.visible=alarm||Math.sin(time*7.9)>.22;
  dust.visible=flashlight;
  if(flashlight){
   for(let i=0;i<count;i++){
    const seed=seeds[i],o=i*3;
    positions[o]=player.x+seed.x+Math.sin(time*seed.speed+i)*.25;
    positions[o+1]=.4+(seed.y+time*seed.speed*.23)%2.7;
    positions[o+2]=player.z+seed.z+Math.sin(time*.13+i)*.18;
   }
   dustGeo.attributes.position.needsUpdate=true;
  }
  sparkMat.opacity=active&&state.pulseKind==='electric'?Math.max(0,(1.3-elapsed)/1.3)*.95:0;
  if(sparkMat.opacity>0){
   for(let i=0;i<9;i++){
    const o=i*3,a=time*13+i*2.39;
    sparkPositions[o]=2.85+Math.cos(a)*(.06+i*.035);
    sparkPositions[o+1]=3.36-(elapsed*(.85+i*.07))+.15*Math.sin(a);
    sparkPositions[o+2]=-16.7+Math.sin(a)*(.07+i*.04);
   }
   sparkGeo.attributes.position.needsUpdate=true;
  }
  return triggered;
 }
 return {update,burst,state,fixtures};
}
