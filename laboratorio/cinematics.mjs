import * as THREE from 'three';

// Non-render-pass film shots: the real Three.js camera watches animated world
// geometry. No prerecorded cutscenes, paid assets or GPU postprocessing.
export const SHOTS=Object.freeze({
 reveal:{seconds:1.20,title:'ALGO ESTAVA ESPERANDO AQUI.'},
 power:{seconds:2.25,title:'CIRCUITO RESTAURADO · GRADE DE SEGURANÇA'},
 exit:{seconds:2.25,title:'PORTÃO DE EMERGÊNCIA · SAÍDA LIBERADA'},
 capture:{seconds:2.55,title:'ELE TE PEGOU.'}
});
const ease=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v)};
export function createCinematicDirector(camera,stalker){
 let active=null;
 function begin(kind,time){
  const config=SHOTS[kind];
  if(!config||active)return false;
  active={
   kind,start:time,seconds:config.seconds,
   entryPosition:camera.position.clone(),
   entryRotation:camera.quaternion.clone(),
   entryFov:camera.fov,
   entryPoint:stalker?.position?.()||{x:0,z:-40}
  };
  return true;
 }
 function update(time){
  if(!active)return null;
  const shot=active;
  const u=Math.max(0,Math.min(1,(time-shot.start)/shot.seconds));
  const kind=shot.kind;
  if(kind==='power'||kind==='exit'){
   // Place the film camera inside the authored service passage, never outside
   // the map. These shots show the ACTUAL rising shutters in the game scene.
   const gate=kind==='power';
   const p=gate?{x:8.0,y:1.87,z:-51.20}:{x:16.2,y:1.77,z:-51.05};
   const focus=gate?{x:11.45,y:1.5+ease(u)*2.0,z:-51.25}:{x:19.03,y:1.61+ease(u)*2.25,z:-51.0};
   camera.position.set(p.x+.18*Math.sin(u*Math.PI),p.y,p.z);
   camera.lookAt(focus.x,focus.y,focus.z);
   camera.fov=66;
  }else if(kind==='reveal'){
   const spot=stalker?.group;
   if(spot){
    const target=new THREE.Vector3().setFromMatrixPosition(spot.matrixWorld).add(new THREE.Vector3(0,1.7,0));
    const look=new THREE.Matrix4().lookAt(camera.position,target,new THREE.Vector3(0,1,0));
    const q=new THREE.Quaternion().setFromRotationMatrix(look);
    const amount=u<.62?ease(u/.62):1-ease((u-.62)/.38);
    camera.quaternion.copy(shot.entryRotation).slerp(q,amount*.85);
   }
   camera.position.copy(shot.entryPosition);
   camera.fov=76+Math.sin(u*Math.PI)*4;
  }else if(kind==='capture'){
   const actor=stalker;
   actor?.poseCapture?.(u,shot.entryPosition);
   if(actor?.group){
    actor.group.updateMatrixWorld(true);
    const face=actor.group.localToWorld(new THREE.Vector3(0,1.98,-.34));
    const pull=u<.17?0:ease((u-.17)/.83)*.94;
    camera.position.copy(shot.entryPosition).lerp(face,pull);
    camera.lookAt(face);
    camera.rotation.z+=(Math.sin(u*39)*.019+u*.075)*Math.sin(Math.min(1,u*3)*Math.PI/2);
    camera.fov=74+ease(u)*34;
   }
  }
  camera.updateProjectionMatrix();
  const finished=u>=1;
  if(finished){
   if(kind!=='capture'){
    camera.position.copy(shot.entryPosition);
    camera.quaternion.copy(shot.entryRotation);
    camera.fov=shot.entryFov;
    camera.updateProjectionMatrix();
   }
   active=null;
  }
  return {kind,progress:u,finished,title:SHOTS[kind].title};
 }
 return {begin,update,get active(){return !!active},get kind(){return active?.kind||null}};
}
