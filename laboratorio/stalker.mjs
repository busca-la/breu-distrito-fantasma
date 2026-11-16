import * as THREE from 'three';
import {circleFits} from './layout.mjs';
import {getNavigation} from './threat-nav.mjs';
import {hasLineOfSight,canSee,canHear,intersectsBarrier,SIGHT_BLOCKERS} from './perception.mjs';
import {INTERACTION} from './layout.mjs';
import {roomAt} from './room-scenes.mjs';

// The maintenance worker is a low-poly, original procedural silhouette.
// This is an autonomous enemy with real pathfinding; the model is intentionally
// angular and concealed by darkness, not a stock humanoid or external API asset.
export function createStalker(scene){
 const group=new THREE.Group();group.name='The Watchman';
 const cloth=new THREE.MeshStandardMaterial({color:'#101516',roughness:.97,metalness:.03,side:THREE.DoubleSide});
 const wet=new THREE.MeshStandardMaterial({color:'#1d2524',roughness:.4,metalness:.17});
 const skin=new THREE.MeshStandardMaterial({color:'#434844',roughness:1});
 const pale=new THREE.MeshBasicMaterial({color:'#8b9e9c'});
 const dull=new THREE.MeshBasicMaterial({color:'#374449'});
 function part(name,geometry,material,x,y,z,rotX=0,rotY=0,rotZ=0){
  const o=new THREE.Mesh(geometry,material);o.name=name;o.position.set(x,y,z);o.rotation.set(rotX,rotY,rotZ);
  o.castShadow=true;o.receiveShadow=true;group.add(o);return o;
 }
 part('torn jacket body',new THREE.CylinderGeometry(.33,.47,1.15,7),cloth,0,1.36,0);
 part('wet overcoat tails',new THREE.CylinderGeometry(.4,.55,.82,7),wet,0,.65,0);
 part('raised shoulders',new THREE.BoxGeometry(.88,.2,.4),cloth,0,1.90,-.05);
 part('unlit face',new THREE.SphereGeometry(.245,10,8),skin,0,2.12,-.08);
 part('hood shadow',new THREE.SphereGeometry(.305,10,9),cloth,0,2.18,.035);
 part('face recess',new THREE.BoxGeometry(.39,.26,.032),new THREE.MeshBasicMaterial({color:'#030607'}),0,2.13,-.262);
 part('left eye glint',new THREE.BoxGeometry(.065,.017,.016),pale,-.10,2.17,-.281);
 part('right eye glint',new THREE.BoxGeometry(.055,.018,.016),dull,.09,2.17,-.281);
 const armG=new THREE.CylinderGeometry(.10,.13,.89,6),legG=new THREE.CylinderGeometry(.13,.155,.9,6);
 const armL=part('left long arm',armG,wet,-.47,1.27,-.07,0,0,-.1),armR=part('right long arm',armG,wet,.47,1.27,-.07,0,0,.1);
 const legL=part('left slow leg',legG,cloth,-.22,.32,0),legR=part('right slow leg',legG,cloth,.22,.32,0);
 for(const x of [-.47,.47])part('hanging glove',new THREE.SphereGeometry(.13,6,6),skin,x,.79,-.06);
 // Face rig is deliberately non-graphic. The mouth opens during the capture
 // shot so the player sees the grab rather than an instant fail screen.
 const mouth=part('dark open mouth',new THREE.BoxGeometry(.31,.12,.085),new THREE.MeshBasicMaterial({color:'#020406'}),0,1.97,-.305);
 const jaw=new THREE.Group();jaw.position.set(0,1.90,-.29);
 const chin=new THREE.Mesh(new THREE.BoxGeometry(.34,.10,.15),skin);chin.position.set(0,-.055,-.015);jaw.add(chin);
 const toothMaterial=new THREE.MeshBasicMaterial({color:'#aab4ad'});
 for(let i=-2;i<=2;i++){
  const tooth=new THREE.Mesh(new THREE.ConeGeometry(.035,.13,5),toothMaterial);
  tooth.position.set(i*.065,-.015,-.106);tooth.rotation.x=Math.PI; jaw.add(tooth);
 }
 group.add(jaw);
 const eyeGlimmer=part('deep eye glint',new THREE.BoxGeometry(.027,.03,.02),pale,.11,2.17,-.285);
 scene.add(group);
 const navigation=getNavigation();
 // The Watchman waits in rooms and is not continuously visible as a patrol.
 const HIDES={
  minato:{x:-8.8,z:-11.3},kino:{x:8.9,z:-10.4},
  fashion:{x:-8.85,z:-24.4},arcade:{x:-8.9,z:-36.8},
  pharmacy:{x:8.8,z:-41.5},maintenance:{x:-8.7,z:-48.6},
  restroom:{x:8.9,z:8.7},denki:{x:8.8,z:-29.3}
 };
 const initial={x:-8.9,z:-36.8};
 const securityGate={x:11.45,z:-51.25,w:.24,d:3.38};
 const exitGate={x:19.03,z:-51,w:.28,d:3.45};
 let position={...initial},route=[],pathTime=0,steps=0;
 let lastKnown={...initial},huntUntil=-1,graceUntil=0,alarmHeard=false,wasChasing=false;
 let hidden=true,nextReveal=9,reveals=0,revealUntil=0;
 group.visible=false;
 function recalc(target){
  route=navigation.route(position,target);
  if(route.length>1)route.shift();
  pathTime=0;
 }
 function update(dt,player,alarm,time,{sprinting=false,walking=false,flashOn=true,securityOpen=false,exitOpen=false,facing=null}={}){
  if(!player)return {distance:999,chasing:false,caught:false,spotted:false,lost:false,hidden};
  const room=roomAt(player);
  const gates=[];
  if(!securityOpen)gates.push(securityGate);
  if(!exitOpen)gates.push(exitGate);
  let ambush=false;
  const ambushPosition=HIDES[room];
  // Opening one of the designed rooms is a meaningful risk. The creature
  // emerges from a fixed hiding place, not from thin air at the player.
  if(hidden&&time>=nextReveal&&ambushPosition){
   const d=Math.hypot(player.x-ambushPosition.x,player.z-ambushPosition.z);
   if(d<7.0&&d>1.6){
    position={...ambushPosition};
    hidden=false;reveals++;ambush=true;revealUntil=time+1.25;
    lastKnown={x:player.x,z:player.z};huntUntil=time+7;
    route=[];pathTime=50;
    group.position.set(position.x,0,position.z);
    group.rotation.y=Math.atan2(-(player.x-position.x),-(player.z-position.z));
    group.visible=true;
   }
  }
  if(hidden&&alarm){
   // The evacuation siren draws him out from a distant maintenance hiding
   // spot. It doesn't reveal the player's current position through walls.
   position={...HIDES.maintenance};hidden=false;revealUntil=time+1.0;
   lastKnown={x:INTERACTION.panel.x,z:INTERACTION.panel.z};
   huntUntil=time+13;route=[];pathTime=40;
   group.position.set(position.x,0,position.z);
   group.visible=true;alarmHeard=true;ambush=true;
  }
  if(hidden){
   group.visible=false;
   return {distance:999,chasing:false,caught:false,spotted:false,lost:false,ambush:false,hidden:true,location:{...position}};
  }
  group.visible=true;
  const distance=Math.hypot(player.x-position.x,player.z-position.z);
  const visible=hasLineOfSight(position,player,[...SIGHT_BLOCKERS,...gates]);
  const detected=time>=graceUntil&&(
   canSee({distance,visible,flashlight:flashOn,sprinting})||
   canHear({distance,sprinting,walking})
  );
  if(alarm&&!alarmHeard){
   alarmHeard=true;
   lastKnown={x:INTERACTION.panel.x,z:INTERACTION.panel.z};
   huntUntil=time+13;
  }
  if(detected){
   lastKnown={x:player.x,z:player.z};
   huntUntil=Math.max(huntUntil,time+(alarm?7:5));
  }
  let chasing=time<huntUntil;
  const target=chasing?lastKnown:{x:Math.sin(time*.17)*.75,z:-40+Math.sin(time*.22)*5};
  if(chasing&&!detected&&Math.hypot(position.x-lastKnown.x,position.z-lastKnown.z)<1)
   huntUntil=Math.min(huntUntil,time+1.1);
  // Once the player breaks sight and gets away, disappear into another room.
  const facingDot=facing?(position.x-player.x)*facing.x+(position.z-player.z)*facing.z:-1;
  const playerObserves=visible&&facingDot>Math.max(0,distance)*.28&&distance<17;
  if(!chasing&&time>revealUntil+2&&distance>7&&!playerObserves){
   hidden=true;group.visible=false;nextReveal=time+17;
   route=[];wasChasing=false;
   return {distance:999,chasing:false,caught:false,spotted:false,lost:true,ambush:false,hidden:true,location:{...position}};
  }
  pathTime+=dt;if(pathTime>1.15||!route.length)recalc(target);
  const speed=chasing?(alarm?3.25:2.35):.63;
  let movement=0;
  // During the ambush the creature stands still long enough to be seen and
  // to give the player a fair chance to react.
  if(time>revealUntil){
   for(let attempts=0;attempts<2&&route.length;attempts++){
    const wp=route[0],dx=wp.x-position.x,dz=wp.z-position.z,d=Math.hypot(dx,dz);
    if(d<.16){route.shift();continue;}
    const step=Math.min(speed*dt,d),nx=position.x+dx/d*step,nz=position.z+dz/d*step;
    const blocked=gates.some(g=>intersectsBarrier(position,{x:nx,z:nz},g));
    if(!blocked&&circleFits(nx,nz,.40)){
     position.x=nx;position.z=nz;movement=step;group.rotation.y=Math.atan2(-dx,-dz);
    }else{route=[];pathTime=100;}
    break;
   }
  }
  steps+=movement;
  group.position.set(position.x,0,position.z);
  const stride=Math.sin(steps*(chasing?11.5:8.5))*(movement?(chasing?.42:.29):.015);
  armL.rotation.x=stride+(chasing?-.19:0);armR.rotation.x=-stride+(chasing?-.19:0);
  legL.rotation.x=-stride;legR.rotation.x=stride;
  armL.rotation.z=chasing?-.25:-.1;armR.rotation.z=chasing?.25:.1;
  group.position.y=.035*Math.sin(time*(chasing?3.3:1.25));
  pale.color.setHex(chasing&&Math.sin(time*11)>-.15?0xe5aaa0:0x8b9e9c);
  const now=Math.hypot(player.x-position.x,player.z-position.z);
  const caught=time>=Math.max(graceUntil,revealUntil+.5)&&now<.88&&hasLineOfSight(position,player,[...SIGHT_BLOCKERS,...gates]);
  const spotted=(chasing&&!wasChasing)&&!ambush;
  const lost=!chasing&&wasChasing;
  wasChasing=chasing;
  return {distance:now,chasing,caught,spotted,lost,ambush,hidden:false,visible,location:{...position}};
 }
 function poseCapture(u,playerLocation){
  hidden=false;group.visible=true;
  const t=Math.max(0,Math.min(1,u));
  const reach=t*t*(3-2*t);
  group.rotation.y=Math.atan2(-(playerLocation.x-position.x),-(playerLocation.z-position.z));
  armL.rotation.x=-.28-reach*1.18;armR.rotation.x=-.28-reach*1.18;
  armL.rotation.z=-.18-reach*.6;armR.rotation.z=.18+reach*.6;
  jaw.position.y=1.90-reach*.14;
  mouth.scale.y=1+reach*3;
  eyeGlimmer.scale.setScalar(1+reach*.9);
  group.position.y=.035-Math.sin(t*Math.PI)*.10;
 }
 function reset(time=0,{alarm=false}={}){
  position={...initial};route=[];pathTime=0;steps=0;
  lastKnown={...initial};huntUntil=-1;graceUntil=time+5;
  alarmHeard=alarm;wasChasing=false;hidden=true;nextReveal=time+8;revealUntil=0;
  jaw.position.y=1.90;mouth.scale.y=1;group.visible=false;
  group.position.set(position.x,0,position.z);
 }
 group.position.set(position.x,0,position.z);
 return {group,update,reset,poseCapture,position:()=>({...position}),navigation,isHidden:()=>hidden,ambushes:()=>reveals};
}
