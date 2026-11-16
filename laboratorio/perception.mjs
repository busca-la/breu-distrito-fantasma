import {WALLS,PROPS} from './layout.mjs';

// Sight checks use the same solid layout as the actual world. A creature
// must not sense the player through a wall just because it is physically close.
export const SIGHT_BLOCKERS=[
 ...WALLS,
 ...PROPS.filter(p=>p.blocking&&p.h>=1.45),
];
export function intersectsBarrier(a,b,wall){
 const x0=wall.x-wall.w/2, x1=wall.x+wall.w/2;
 const z0=wall.z-wall.d/2, z1=wall.z+wall.d/2;
 const dx=b.x-a.x,dz=b.z-a.z;
 let enter=0,leave=1;
 for(const [origin,dir,min,max] of [[a.x,dx,x0,x1],[a.z,dz,z0,z1]]){
  if(Math.abs(dir)<1e-9){if(origin<=min||origin>=max)return false;continue;}
  const t1=(min-origin)/dir,t2=(max-origin)/dir;
  enter=Math.max(enter,Math.min(t1,t2));
  leave=Math.min(leave,Math.max(t1,t2));
  if(enter>leave)return false;
 }
 return enter<1&&leave>0;
}
export function hasLineOfSight(a,b,blockers=SIGHT_BLOCKERS){
 return !blockers.some(w=>intersectsBarrier(a,b,w));
}
export function canHear({distance,sprinting=false,walking=false}){
 // Running matters; normal walking is only heard at almost contact distance.
 return (sprinting&&distance<9)||(walking&&distance<2.0);
}
export function insideFlashlightBeam(player,target,facing,{range=14,halfAngle=.34}={}){
 if(!player||!target||!facing)return false;
 const dx=target.x-player.x,dz=target.z-player.z,distance=Math.hypot(dx,dz);
 if(distance<=.001||distance>range)return false;
 const dot=(dx*facing.x+dz*facing.z)/distance;
 return dot>=Math.cos(halfAngle);
}
export function canSee({distance,visible=false,flashlight=true,illuminated=flashlight,sprinting=false}){
 return visible&&distance<(flashlight&&illuminated?13:sprinting?9:7);
}
export function reachedExit(pos,open=false){
 return !!open&&pos.x>=20.0&&pos.x<=22.05&&Math.abs(pos.z+51)<=1.6;
}
