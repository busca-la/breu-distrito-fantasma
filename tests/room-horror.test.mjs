import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ROOM_ZONES,roomAt,createRoomScenes} from '../laboratorio/room-scenes.mjs';
import {STORE_SIGNS,OPEN_PORTALS} from '../laboratorio/layout.mjs';

assert.equal(ROOM_ZONES.length,9,'Restroom and eight designed interiors must be present');
const names=new Set(ROOM_ZONES.map(x=>x.id));
for(const type of STORE_SIGNS.map(x=>x.type)){
 const id={ramen:'minato',camera:'kino',electronics:'denki',maintenance:'maintenance',
  fashion:'fashion',arcade:'arcade',pharmacy:'pharmacy'}[type];
 assert(names.has(id),type+' must have a distinct interior');
}
assert(names.has('restroom')&&names.has('security'));
for(const room of ROOM_ZONES){
 const c={x:(room.x0+room.x1)/2,z:(room.z0+room.z1)/2};
 assert.equal(roomAt(c),room.id,'Incorrect bounds for room '+room.id);
}
const scene=new THREE.Scene(),world=createRoomScenes(scene,{lowPower:true});
assert(world.batchCount>=4,'Static room props should be instanced to protect mobile FPS');
assert(scene.children.some(o=>o.name.includes('Room detail batched')));
assert(world.turners.length>0,'No animated character inside fashion room');
assert(world.featured.some(x=>x.kind==='falling-bowl'),'MINATO needs a visible physical event');
assert(world.featured.some(x=>x.kind==='denki-screen'),'DENKI needs a real self-starting monitor');
assert(world.featured.filter(x=>x.kind==='arcade-screen').length>=3,'GAME 99 needs multiple booting cabinets');
let time=10,events=[];
for(const p of [
 {x:7,z:5}, {x:-6.4,z:-11},{x:7,z:-8.5}, {x:-6.4,z:-22},
 {x:7,z:-27},{x:-6.4,z:-35},{x:7,z:-39.4},
 {x:-6.5,z:-48},{x:16,z:-51}
]){
 const item=world.update(time,p,{power:true});
 if(item)events.push(item);time+=5;
}
assert.equal(events.length,9,'Every room should have a first-visit authored event');
assert.equal(new Set(events.map(x=>x.room)).size,9);
assert.equal(world.update(70,{x:16,z:-51},{power:true}),null,'Events must not spam repeats');
assert(scene.children.some(x=>x.name==='MINATO recognizable ramen bowl'));
assert(scene.children.some(x=>x.name==='DENKI hanging signal cable'));
assert(scene.children.some(x=>x.name==='GAME 99 cabinet boot screen'));
console.log('PASS: nine distinctive rooms plus hero geometry and visible events in MINATO, DENKI and GAME 99');
