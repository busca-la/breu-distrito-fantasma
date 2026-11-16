import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ROOM_ZONES,roomAt,createRoomScenes} from '../laboratorio/room-scenes.mjs';
import {STORE_SIGNS,OPEN_PORTALS} from '../laboratorio/layout.mjs';

assert.equal(ROOM_ZONES.length,10,'Food court, restroom and eight designed interiors must be present');
const names=new Set(ROOM_ZONES.map(x=>x.id));
for(const type of STORE_SIGNS.map(x=>x.type)){
 const id={ramen:'minato',camera:'kino',electronics:'denki',maintenance:'maintenance',
  fashion:'fashion',arcade:'arcade',pharmacy:'pharmacy'}[type];
 assert(names.has(id),type+' must have a distinct interior');
}
assert(names.has('restroom')&&names.has('security'));
assert.equal(roomAt({x:27,y:-3.8,z:4}),'foodcourt');
assert.notEqual(roomAt({x:19.2,y:.8,z:8}),'foodcourt','Upper atrium cannot count as basement exploration');
for(const room of ROOM_ZONES){
 const c={x:(room.x0+room.x1)/2,z:(room.z0+room.z1)/2};
 if(room.yMax!==undefined)c.y=room.yMax-.5;
 assert.equal(roomAt(c),room.id,'Incorrect bounds for room '+room.id);
}
const scene=new THREE.Scene(),world=createRoomScenes(scene,{lowPower:true});
assert(world.batchCount>=4,'Static room props should be instanced to protect mobile FPS');
assert(scene.children.some(o=>o.name.includes('Room detail batched')));
assert(world.turners.length>0,'No animated character inside fashion room');
assert(world.featured.some(x=>x.kind==='falling-bowl'),'MINATO needs a visible physical event');
assert(world.featured.some(x=>x.kind==='denki-screen'),'DENKI needs a real self-starting monitor');
assert(world.featured.filter(x=>x.kind==='arcade-screen').length>=3,'GAME 99 needs multiple booting cabinets');
assert(world.hero.count>=35,'Priority rooms need detailed hero models, not box dressing');
for(const name of ['MINATO hero kitchen assembly','DENKI hero repair bench','GAME 99 hero machine island'])
 assert(scene.children.some(x=>x.name===name),'Missing high-detail model: '+name);
world.hero.updateVisibility({x:0,z:13});
assert(world.hero.groups.some(x=>!x.visible),'Distant hero assets should be culled');
world.hero.updateVisibility({x:-6,z:-35});
assert(scene.children.find(x=>x.name==='GAME 99 hero machine island').visible,'Nearby hero model must retain full quality');
let time=10,events=[];
for(const p of [
 {x:7,z:5}, {x:-6.4,z:-11},{x:7,z:-8.5}, {x:-6.4,z:-22},
 {x:7,z:-27},{x:-6.4,z:-35},{x:7,z:-39.4},
 {x:-6.5,z:-48},{x:16,z:-51}
 ,{x:27,y:-3.8,z:4}
]){
 const item=world.update(time,p,{power:true});
 if(item)events.push(item);time+=5;
}
assert.equal(events.length,10,'Every room should have a first-visit authored event');
assert.equal(new Set(events.map(x=>x.room)).size,10);
assert.equal(world.update(70,{x:16,z:-51},{power:true}),null,'Events must not spam repeats');
assert(scene.children.some(x=>x.name==='MINATO recognizable ramen bowl'));
assert(scene.children.some(x=>x.name==='DENKI hanging signal cable'));
assert(scene.children.some(x=>x.name==='GAME 99 cabinet boot screen'));
console.log('PASS: ten distinctive spaces including B1 plus hero geometry and visible priority-room events');
