// Uses REAL Rapier WASM; run from lab with npm install && npm run test:physics.
import assert from 'node:assert/strict';
import * as RAPIER from '@dimforge/rapier3d-compat';
import {createPhysicsClass} from '../physics-world.mjs';
const Physics=createPhysicsClass(RAPIER),physics=await Physics.create();
const sim=(n,move={forward:0,strafe:0,sprint:false},yaw=0,jump=false)=>{
 for(let i=0;i<n;i++)physics.step(move,yaw,jump&&i===0);
 return physics.position();
};
sim(70);assert(physics.position().y>.75&&physics.position().y<.86,'Player fell through floor');
let raised=sim(18,{forward:0,strafe:0,sprint:false},0,true).y;
assert(raised>1.10,'Jump did not lift player');
sim(135);assert(physics.position().y<.86,'Player did not land');
physics.reset();sim(70);
let p=sim(270,{forward:1,strafe:0,sprint:true},Math.PI/2);
assert(p.x>-3.5,'Player crossed shop wall: x='+p.x);
physics.body.setTranslation({x:18.0,y:1.0,z:-51},true);physics.body.setLinvel({x:0,y:0,z:0},true);sim(70);
p=sim(80,{forward:1,strafe:0,sprint:false},-Math.PI/2);
assert(p.x<18.9,'Closed door allowed passage: x='+p.x);
physics.unlockExit();p=sim(80,{forward:1,strafe:0,sprint:false},-Math.PI/2);
assert(p.x>19.5&&p.x<22.15,'Unlocked passage not traversable or world is open: x='+p.x);
physics.body.setTranslation({x:0,y:1,z:-53},true);physics.body.setLinvel({x:0,y:0,z:0},true);sim(80);
p=sim(600,{forward:1,strafe:0,sprint:true},0);
assert(p.z>-56.8,'Player left world from southern boundary '+p.z);
console.log('PASS: Rapier WASM floor, jump, landing, wall, locked/unlocked door, sealed boundary');
