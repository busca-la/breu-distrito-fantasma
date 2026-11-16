import * as THREE from 'three';

// Longer real-time direction, not a video overlay. Film the actual geometry,
// with an establishing beat, an action beat and a consequence beat.
export const SHOTS=Object.freeze({
 repair:{seconds:3.75,title:'A LUMINÁRIA VOLTOU A ACENDER.',beats:[
  {at:0,text:'UMA LUZ FALHANDO. O REATOR ESTÁ SOLTO.',cue:'ballast'},
  {at:.35,text:'VOCÊ LEVANTA A MÃO PARA ALCANÇAR A LUMINÁRIA.',cue:'cloth'},
  {at:.63,text:'UM GOLPE NO REFLETOR.',cue:'lamp-hit'},
  {at:.78,text:'O REATOR PEGA DE NOVO. A LUZ SE ESTABILIZA.',cue:'lamp-restart'}
 ]},
 reveal:{seconds:4.75,title:'ALGO ESTAVA ESPERANDO AQUI.',beats:[
  {at:0,text:'UM BARULHO VEIO DO FUNDO DA LOJA.',cue:'metal'},
  {at:.23,text:'NÃO ERA UM FUNCIONÁRIO.',cue:'ambush'},
  {at:.70,text:'A COISA ESTÁ OLHANDO DIRETO PARA VOCÊ.',cue:'pursuit'}
 ]},
 power:{seconds:5.85,title:'A ENERGIA RETORNOU.',beats:[
  {at:0,text:'DISJUNTOR ATIVADO.',cue:'electric'},
  {at:.25,text:'MOTORES DE EMERGÊNCIA INICIADOS.',cue:'metal'},
  {at:.66,text:'A GRADE DA SEGURANÇA SUBIU. O CAMINHO ESTÁ LIVRE.',cue:'electric'}
 ]},
 exit:{seconds:5.85,title:'SAÍDA DE INCÊNDIO.',beats:[
  {at:0,text:'A TRAVA DE INCÊNDIO DESBLOQUEOU.',cue:'alarm'},
  {at:.30,text:'O PORTÃO ESTÁ SUBINDO.',cue:'metal'},
  {at:.70,text:'ATRAVESSE ANTES QUE ELE VOLTE.',cue:'pursuit'}
 ]},
 capture:{seconds:6.8,title:'ELE TE PEGOU.',beats:[
  {at:0,text:'VOCÊ NÃO CONSEGUE SE MOVER.',cue:'capture'},
  {at:.19,text:'AS MÃOS DELE AGARRAM A CÂMERA.',cue:'metal'},
  {at:.48,text:'ELE TE PUXA PARA PERTO.',cue:'capture'},
  {at:.78,text:'NÃO HÁ PARA ONDE OLHAR.',cue:'pursuit'}
 ]}
});
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{const v=clamp(t);return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*clamp(t);
const towards=(camera,x,y,z)=>camera.lookAt(x,y,z);

export function createCinematicDirector(camera,stalker,atmosphere=null){
 // In-camera rig: a low-poly glove with articulated knuckles and a jacket
 // cuff, always hidden outside the single automatic lamp-repair shot.
 const gloveMaterial=new THREE.MeshStandardMaterial({color:'#4b5352',roughness:.88});
 const sleeveMaterial=new THREE.MeshStandardMaterial({color:'#303b40',roughness:.93});
 const cuffMaterial=new THREE.MeshStandardMaterial({color:'#687070',roughness:.82});
 const arm=new THREE.Group();arm.name='First-person automatic lamp tap';arm.visible=false;
 const forearm=new THREE.Mesh(new THREE.CylinderGeometry(.105,.15,.62,10),sleeveMaterial);
 forearm.position.set(0,-.23,.24);forearm.rotation.x=-.42;arm.add(forearm);
 const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.113,.122,.10,10),cuffMaterial);cuff.position.y=.08;arm.add(cuff);
 const palm=new THREE.Mesh(new THREE.BoxGeometry(.205,.22,.12),gloveMaterial);palm.position.set(0,.20,-.11);arm.add(palm);
 for(let i=0;i<4;i++){
  const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.022,.12,3,5),gloveMaterial);
  finger.position.set(-.078+i*.052,.34,-.18);finger.rotation.x=-.55;arm.add(finger);
 }
 const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.033,.10,3,5),gloveMaterial);
 thumb.position.set(.13,.18,-.08);thumb.rotation.z=-.85;arm.add(thumb);
 camera.add(arm);
 let active=null;
 function begin(kind,time){
  const config=SHOTS[kind];
  if(!config||active)return false;
  active={
   kind,start:time,seconds:config.seconds,beat:-1,
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
  const u=clamp((time-shot.start)/shot.seconds),kind=shot.kind;
  const config=SHOTS[kind];
  let beat=0;for(let i=1;i<config.beats.length;i++)if(u>=config.beats[i].at)beat=i;
  const cue=beat!==shot.beat?config.beats[beat].cue:null;
  shot.beat=beat;
  if(kind==='power'||kind==='exit'){
   // Wide establishing shot, slow dolly, then close-up of the real gate
   // rising in the actual level. Never fly outside the existing world.
   const power=kind==='power';
   const gateX=power?11.45:19.03,gateZ=power?-51.25:-51.0;
   const startX=power?7.9:15.75,endX=power?10.55:18.12;
   const dolly=u<.34?ease(u/.34)*.38:u<.79?.38+ease((u-.34)/.45)*.54:.92;
   camera.position.set(
    mix(startX,endX,dolly),
    1.83+Math.sin(u*Math.PI*2)*.065,
    gateZ+.18+Math.sin(u*Math.PI)*.30
   );
   towards(camera,gateX,1.10+ease(u)*2.15,gateZ);
   camera.fov=64+(1-u)*6;
  }else if(kind==='repair'){
   const lamp=atmosphere?.repair?.position;
   const target=lamp?lamp.clone():new THREE.Vector3(-1.35,2.14,-17.3);
   const matrix=new THREE.Matrix4().lookAt(shot.entryPosition,target,new THREE.Vector3(0,1,0));
   const facing=new THREE.Quaternion().setFromRotationMatrix(matrix);
   const turn=ease(u/.24);
   // A short first-person step toward the lamp makes actual contact
   // plausible. At the end return smoothly to the original Rapier viewpoint.
   const delta=target.clone().sub(shot.entryPosition);
   delta.y=0;
   const approachDistance=Math.min(.85,Math.max(0,delta.length()-.9));
   const forward=delta.length()>1e-3?delta.normalize():new THREE.Vector3(0,0,-1);
   const dolly=u<.60?ease(u/.60):1-ease((u-.60)/.40);
   camera.position.copy(shot.entryPosition).addScaledVector(forward,approachDistance*dolly);
   camera.position.y+=Math.sin(u*Math.PI)*.035;
   camera.quaternion.copy(shot.entryRotation).slerp(facing,turn);
   camera.fov=shot.entryFov-Math.sin(u*Math.PI)*6;
   const stretch=u<.32?0:u<.64?ease((u-.32)/.32):u<.77?1:1-ease((u-.77)/.23);
   arm.visible=true;
   arm.position.set(-.40+stretch*.31,-.50+stretch*.43,-.69-stretch*.72);
   arm.rotation.set(-.23-stretch*.43,0,-.13+stretch*.12);
 }else if(kind==='reveal'){
   // A sustained first-person stare, instead of a split-second camera snap.
   stalker?.poseReveal?.(u,shot.entryPosition);
   const group=stalker?.group;
   if(group){
    group.updateMatrixWorld(true);
    const target=group.localToWorld(new THREE.Vector3(0,1.70,-.08));
    const look=new THREE.Matrix4().lookAt(shot.entryPosition,target,new THREE.Vector3(0,1,0));
    const wanted=new THREE.Quaternion().setFromRotationMatrix(look);
    const strength=u<.20?ease(u/.20):u>.88?1-ease((u-.88)/.12):1;
    camera.quaternion.copy(shot.entryRotation).slerp(wanted,strength*.94);
   }
   camera.position.copy(shot.entryPosition);
   camera.position.y-=.02*Math.sin(u*Math.PI);
   camera.fov=shot.entryFov+Math.sin(u*Math.PI)*7;
  }else if(kind==='capture'){
   // Four complete dramatic beats: shock, raised hands, grip, mouth.
   // Camera travels toward articulated *real* mesh, without graphics gore.
   const actor=stalker;
   actor?.poseCapture?.(u,shot.entryPosition);
   if(actor?.group){
    actor.group.updateMatrixWorld(true);
    const face=actor.group.localToWorld(new THREE.Vector3(0,1.97,-.38));
    const pull=u<.25?0:ease((u-.25)/.61)*.88;
    camera.position.copy(shot.entryPosition).lerp(face,pull);
    const shake=u>.23?Math.sin(u*67)*.021*(1-u*.55):0;
    camera.position.x+=shake;
    camera.position.y+=Math.sin(u*39)*.016*Math.sin(u*Math.PI);
    towards(camera,face.x,face.y,face.z);
    camera.rotation.z+=Math.sin(u*47)*.024*Math.sin(u*Math.PI)+ease(u)*.14;
    camera.fov=76+ease(u)*37;
   }
  }
  camera.updateProjectionMatrix();
  const finished=u>=1;
  if(finished){
   arm.visible=false;
   if(kind!=='capture'){
    camera.position.copy(shot.entryPosition);
    camera.quaternion.copy(shot.entryRotation);
    camera.fov=shot.entryFov;
    camera.updateProjectionMatrix();
   }
   active=null;
  }
  return {kind,progress:u,finished,caption:config.beats[beat].text,cue,title:config.title,beat};
 }
 return {begin,update,arm,get active(){return !!active},get kind(){return active?.kind||null}};
}
