import * as THREE from 'three';
import {circleFits} from './layout.mjs';
import {getNavigation} from './threat-nav.mjs';
import {hasLineOfSight,canSee,canHear,intersectsBarrier,SIGHT_BLOCKERS} from './perception.mjs';
import {INTERACTION} from './layout.mjs';

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
 scene.add(group);
 const navigation=getNavigation();
 const initial={x:.35,z:-40.4};
 const securityGate={x:11.45,z:-51.25,w:.24,d:3.38};
 const exitGate={x:19.03,z:-51,w:.28,d:3.45};
 let position={...initial},route=[],pathTime=0,steps=0;
 let lastKnown={...initial},huntUntil=-1,graceUntil=0,alarmHeard=false,wasChasing=false;
 function recalc(target){
  route=navigation.route(position,target);
  if(route.length>1)route.shift();
  pathTime=0;
 }
 function update(dt,player,alarm,time,{sprinting=false,walking=false,flashOn=true,securityOpen=false,exitOpen=false}={}){
  if(!player)return {distance:999,chasing:false,caught:false,spotted:false,lost:false};
  const distance=Math.hypot(player.x-position.x,player.z-position.z);
  const gates=[];
  if(!securityOpen)gates.push(securityGate);
  if(!exitOpen)gates.push(exitGate);
  const visible=hasLineOfSight(position,player,[...SIGHT_BLOCKERS,...gates]);
  const detected=time>=graceUntil&&(
   canSee({distance,visible,flashlight:flashOn,sprinting})||
   canHear({distance,sprinting,walking})
  );
  if(alarm&&!alarmHeard){
   // The alarm reveals only its location, not the player's live position.
   alarmHeard=true;
   lastKnown={x:INTERACTION.panel.x,z:INTERACTION.panel.z};
   huntUntil=time+13;
  }
  if(detected){
   lastKnown={x:player.x,z:player.z};
   huntUntil=Math.max(huntUntil,time+(alarm?7:5));
  }
  let chasing=time<huntUntil;
  const roaming={x:Math.sin(time*.17)*.75,z:-40+Math.sin(time*.22)*5};
  const target=chasing?lastKnown:roaming;
  // The creature actually searches the last known spot instead of magically
  // knowing where the player is behind an opaque wall.
  if(chasing&&!detected&&Math.hypot(position.x-lastKnown.x,position.z-lastKnown.z)<1){
   huntUntil=Math.min(huntUntil,time+1.1);
  }
  pathTime+=dt;
  if(pathTime>1.15||!route.length)recalc(target);
  const speed=chasing?(alarm?3.55:2.65):.72;
  let movement=0;
  for(let attempts=0;attempts<2&&route.length;attempts++){
   const wp=route[0],dx=wp.x-position.x,dz=wp.z-position.z,d=Math.hypot(dx,dz);
   if(d<.16){route.shift();continue;}
   const step=Math.min(speed*dt,d),nx=position.x+dx/d*step,nz=position.z+dz/d*step;
   const blocked=gates.some(g=>intersectsBarrier(position,{x:nx,z:nz},g));
   if(!blocked&&circleFits(nx,nz,.40)){
    position.x=nx;position.z=nz;movement=step;
    group.rotation.y=Math.atan2(-dx,-dz);
   }else{route=[];pathTime=100;}
   break;
  }
  steps+=movement;
  group.position.set(position.x,0,position.z);
  const stride=Math.sin(steps*(chasing?11.5:8.5))*(movement?(chasing?.42:.29):.015);
  armL.rotation.x=stride+(chasing?-.19:0);
  armR.rotation.x=-stride+(chasing?-.19:0);
  legL.rotation.x=-stride;legR.rotation.x=stride;
  armL.rotation.z=chasing?-.25:-.1;armR.rotation.z=chasing?.25:.1;
  group.position.y=.035*Math.sin(time*(chasing?3.3:1.25));
  pale.color.setHex(chasing&&Math.sin(time*11)>-.15?0xe5aaa0:0x8b9e9c);
  const now=Math.hypot(player.x-position.x,player.z-position.z);
  const caught=time>=graceUntil&&now<.88&&hasLineOfSight(position,player,[...SIGHT_BLOCKERS,...gates]);
  const spotted=chasing&&!wasChasing;
  const lost=!chasing&&wasChasing;
  wasChasing=chasing;
  return {distance:now,chasing,caught,spotted,lost,visible,location:{...position}};
 }
 function reset(time=0,{alarm=false}={}){
  position={...initial};route=[];pathTime=0;steps=0;
  lastKnown={...initial};huntUntil=-1;graceUntil=time+5;
  // On an alarm checkpoint, the siren has already sounded, so it must not
  // immediately reveal the checkpoint location to the creature.
  alarmHeard=alarm;wasChasing=false;
  group.position.set(position.x,0,position.z);
 }
 group.position.set(position.x,0,position.z);
 return {group,update,reset,position:()=>({...position}),navigation};
}
