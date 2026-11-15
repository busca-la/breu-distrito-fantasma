import * as THREE from 'three';

// Hand-authored movement along an unobstructed route in layout.mjs.
// These scripted characters and props are visual-only; they do not modify
// Rapier colliders or pretend to be interactive doors.
export const OPENING_STEPS=Object.freeze([
 {t:0,x:.2,z:6.8},
 {t:1.2,x:.2,z:6.8},
 {t:4.9,x:.2,z:-7.9},
 {t:5.7,x:-.25,z:-10.9},
 {t:7.15,x:-5.5,z:-10.9},
]);
export function openingPosition(t){
 if(!Number.isFinite(t))return {...OPENING_STEPS[0]};
 for(let i=1;i<OPENING_STEPS.length;i++){
  const a=OPENING_STEPS[i-1],b=OPENING_STEPS[i];
  if(t<=b.t){const u=Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t)));
   return {x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u};}
 }
 const end=OPENING_STEPS[OPENING_STEPS.length-1];
 return {x:end.x,z:end.z};
}
function figure(scene){
 const fabric=new THREE.MeshStandardMaterial({color:'#242b2c',roughness:.93});
 const jacket=new THREE.MeshStandardMaterial({color:'#465053',roughness:.82});
 const metal=new THREE.MeshStandardMaterial({color:'#778785',roughness:.74,metalness:.21});
 const reflective=new THREE.MeshBasicMaterial({color:'#9ebbb1'});
 const face=new THREE.MeshStandardMaterial({color:'#59605b',roughness:1});
 const root=new THREE.Group();
 root.name='Fleeing maintenance worker';
 function box(parent,name,w,h,d,x,y,z,m){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  o.name=name;o.position.set(x,y,z);parent.add(o);return o;
 }
 // The body is recognizable in low light: dark coat, raised shoulders and
 // pale reflective maintenance tape. Not another glowing static light.
 const body=box(root,'coat',.65,1.06,.37,0,1.16,0,jacket);
 box(root,'reflective back stripe',.57,.07,.035,0,1.27,-.204,reflective);
 box(root,'reflective front stripe',.54,.045,.032,0,1.39,.21,reflective);
 box(root,'head',.34,.41,.35,0,1.94,.015,face);
 box(root,'hood',.43,.16,.39,0,2.17,-.015,fabric);
 for(const sign of [-1,1]){
  box(root,'visor reflection',.09,.028,.018,sign*.095,1.98,.197,metal);
 }
 const arms=[],legs=[];
 for(const sign of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(sign*.43,1.65,0);
  box(shoulder,'arm',.22,.83,.23,0,-.37,0,fabric);
  box(shoulder,'glove',.17,.16,.19,0,-.83,.025,metal);
  root.add(shoulder);arms.push(shoulder);
  const hip=new THREE.Group();hip.position.set(sign*.2,.72,0);
  box(hip,'leg',.26,.71,.3,0,-.34,0,jacket);
  box(hip,'boot',.28,.16,.46,0,-.69,.07,fabric);
  root.add(hip);legs.push(hip);
 }
 scene.add(root);
 return {root,body,arms,legs};
}
export function createLiveEncounters(scene){
 const actor=figure(scene);
 const iron=new THREE.MeshStandardMaterial({color:'#3c4749',roughness:.88,metalness:.54});
 const signFace=new THREE.MeshBasicMaterial({color:'#b8aba0',side:THREE.DoubleSide});
 // A sizeable moving sign at the entrance, not a tiny flickering LED.
 const signRig=new THREE.Group();
 signRig.position.set(-1.1,3.97,7.7);
 const bar=new THREE.Mesh(new THREE.BoxGeometry(2.0,.12,.2),iron);bar.position.y=-.07;
 const panel=new THREE.Mesh(new THREE.BoxGeometry(2,.7,.12),iron);panel.position.y=-.62;
 const label=new THREE.Mesh(new THREE.BoxGeometry(1.6,.105,.02),signFace);label.position.set(0,-.6,.075);
 signRig.add(bar,panel,label);scene.add(signRig);
 // Lightweight rolling can down the edge of the corridor.
 const can=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.29,8),iron);
 can.name='Rolling maintenance can';scene.add(can);
 const rig={actor,signRig,can};
 let lastTime=0;const fired=new Set();
 function update(t,player){
  const events=[];
  const actorTime=Math.max(0,t);
  const loc=openingPosition(actorTime);
  actor.root.visible=actorTime<7.5;
  actor.root.position.set(loc.x,.015+(actorTime>1.2?.055*Math.abs(Math.sin(t*15)):0),loc.z);
  actor.root.rotation.y=actorTime<1.15?0:Math.min(Math.PI,Math.max(0,(actorTime-1.15)*5.3));
  const stride=actorTime>1.2&&actorTime<7.2?Math.sin(t*16)*.66:Math.sin(t*1.4)*.04;
  actor.arms[0].rotation.x=stride;
  actor.arms[1].rotation.x=-stride;
  actor.legs[0].rotation.x=-stride;
  actor.legs[1].rotation.x=stride;
  actor.body.rotation.z=Math.sin(t*11)*.036;
  const crashTime=4.25;
  const motion=t<crashTime?.015*Math.sin(t*1.6):
   Math.sin((t-crashTime)*17)*.33*Math.exp(-Math.max(0,t-crashTime)*.7);
  signRig.rotation.z=motion;
  signRig.rotation.x=motion*.6;
  can.visible=t>2.8&&t<11;
  const travel=Math.max(0,Math.min(1,(t-2.8)/7.7));
  can.position.set(-2.18+.38*Math.sin(t*.65),.15,-.5-7*travel);
  can.rotation.z=travel*16;
  can.rotation.x=travel*4;
  if(t>=1.2&&!fired.has('run')){
   fired.add('run');
   events.push({kind:'pursuit',text:'UMA FIGURA TE ENCAROU. ESTÁ CORRENDO!' });
  }
  if(t>=crashTime&&!fired.has('crash')){
   fired.add('crash');
   events.push({kind:'metal',text:'UMA PLACA DE FERRO SE SOLTOU NO CORREDOR.'});
  }
  if(t>=6.35&&!fired.has('vanish')){
   fired.add('vanish');
   events.push({kind:'electric',text:'A SILHUETA DESAPARECEU DENTRO DA LOJA.'});
  }
  lastTime=t;
  return events;
 }
 return {update,rig,fired};
}
