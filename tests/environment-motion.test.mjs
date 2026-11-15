import assert from 'node:assert/strict';
import * as THREE from 'three';
import {BEATS,crossedBeat,createEnvironmentMotion} from '../laboratorio/environment-motion.mjs';

assert.equal(BEATS.length,4);
for(const event of BEATS){
 assert.equal(crossedBeat(event.z+1,event.z-.1,event),true);
 assert.equal(crossedBeat(event.z-1,event.z-2,event),false);
 assert.equal(crossedBeat(event.z+1,event.z+.1,event),false);
}
const scene=new THREE.Scene();
const world=createEnvironmentMotion(scene,{lowPower:true});
assert(scene.children.length>=7,'Missing real animated scene objects');
const p={x:0,z:13};
assert.equal(world.update(.016,0,p,{flashlight:true,alarm:false}),null);
const shots=[{z:4,kind:'metal'},{z:-16,kind:'electric'},{z:-31,kind:'pursuit'},{z:-47,kind:'metal'}];
for(const [i,item] of shots.entries()){
 p.z=item.z;
 const hit=world.update(.016,2+i,p,{flashlight:true,alarm:false});
 assert.equal(hit?.kind,item.kind,'Wrong suspense beat');
 assert.equal(world.state.seen.size,i+1);
 assert.equal(world.update(.016,2.1+i,p,{flashlight:true,alarm:false}),null,'Repeated beat');
}
const before=world.fixtures[3].pivot.rotation.z;
world.update(.016,9,p,{flashlight:true,alarm:false});
assert.notEqual(world.fixtures[3].pivot.rotation.z,before,'Fixtures should visibly sway');
assert.equal(world.update(.016,10,p,{flashlight:true,alarm:true})?.kind,'alarm');
assert.equal(world.update(.016,11,p,{flashlight:true,alarm:true}),null,'Alarm should not repeat');
console.log('PASS: scene motion, 4 distinct exploration beats, one-time alarm and no duplicate events');
