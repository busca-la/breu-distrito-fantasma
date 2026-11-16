import assert from 'node:assert/strict';
import * as THREE from 'three';
import {BASEMENT_Y,FOOD_COURT_COLLIDERS,createFoodCourt} from '../laboratorio/food-court.mjs';
import {circleFits} from '../laboratorio/layout.mjs';
import {BreuPhysics} from '../laboratorio/physics.mjs';

assert(FOOD_COURT_COLLIDERS.some(x=>x.name==='food court floor'&&x.y< -4));
assert.equal(FOOD_COURT_COLLIDERS.filter(x=>x.name.startsWith('food court stair ')).length,13);
assert.equal(FOOD_COURT_COLLIDERS.filter(x=>x.name.startsWith('food court table ')).length,12);
assert.equal(FOOD_COURT_COLLIDERS.filter(x=>x.name.startsWith('food vendor counter ')).length,4);
assert(circleFits(10.8,8,.25),'The original east wall must have a real atrium opening');
for(const [x,z] of [[3.7,6.45],[6.1,6.4],[8.2,6.85],[10.8,6.9]])
 assert(circleFits(x,z,.24),`B1 wayfinding route is physically blocked at ${x},${z}`);
const scene=new THREE.Scene(),court=createFoodCourt(scene,{lowPower:true});
assert(court.counters.length===4,'Food court needs four distinct vendors');
assert(court.tableCount>=8&&scene.children.some(x=>x.name==='Food court instanced chairs'));
assert(scene.children.some(x=>x.name==='FOOD COURT / B1 hanging sign'));
assert(scene.children.some(x=>x.name==='B1 FOOD COURT corridor sign'),'Wayfinding must be visible before the stair entrance');
assert.equal(scene.children.filter(x=>x.name==='B1 luminous floor arrow').length,4);
const physics=await BreuPhysics.create();
physics.reset({x:9.7,z:8});
let minimumY=99,maximumX=0;
for(let i=0;i<260;i++){
 const p=physics.step({forward:1,strafe:0,sprint:false},-Math.PI/2,false);
 minimumY=Math.min(minimumY,p.y);maximumX=Math.max(maximumX,p.x);
}
assert(maximumX>20,'Player could not cross the atrium stairs into B1');
assert(minimumY<BASEMENT_Y+1.2,'Player did not physically descend to the food court');
console.log('PASS: expanded upper atrium, physical 13-step descent and populated B1 food court');
