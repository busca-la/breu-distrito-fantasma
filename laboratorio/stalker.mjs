import * as THREE from 'three';
import {circleFits} from './layout.mjs';
import {getNavigation} from './threat-nav.mjs';

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
 let position={x:.35,z:-37.8},route=[],pathTime=0,steps=0;
 let lastPos={...position};const detection=16;
 function recalc(target){route=navigation.route(position,target);if(route.length>1)route.shift();pathTime=0}
 function update(dt,player,alarm,time){
  if(!player)return {distance:999,chasing:false,caught:false};
  const distance=Math.hypot(player.x-position.x,player.z-position.z);
  const chasing=alarm||distance<detection;
  const target=chasing?player:{x:Math.sin(time*.14)*.65,z:-38+Math.sin(time*.21)*7};
  pathTime+=dt;if(pathTime>1.3||!route.length)recalc(target);
  const speed=alarm?2.9:chasing?1.12:.48;
  let movement=0;
  for(let attempts=0;attempts<2&&route.length;attempts++){
   const wp=route[0],dx=wp.x-position.x,dz=wp.z-position.z,d=Math.hypot(dx,dz);
   if(d<.16){route.shift();continue}
   const step=Math.min(speed*dt,d),nx=position.x+dx/d*step,nz=position.z+dz/d*step;
   if(circleFits(nx,nz,.40)){position.x=nx;position.z=nz;movement=step;group.rotation.y=Math.atan2(-dx,-dz);}
   else{route=[];pathTime=100;}
   break;
  }
  steps+=movement;
  group.position.set(position.x,0,position.z);
  const stride=Math.sin(steps*8.5)*(movement?.29:.015);
  armL.rotation.x=stride;armR.rotation.x=-stride;legL.rotation.x=-stride;legR.rotation.x=stride;
  group.position.y=.035*Math.sin(time*1.25);
  const now=Math.hypot(player.x-position.x,player.z-position.z);
  const caught=now<.88;
  lastPos={...position};
  return {distance:now,chasing,caught,location:{...position}};
 }
 group.position.set(position.x,0,position.z);
 return {group,update,position:()=>({...position}),navigation};
}
