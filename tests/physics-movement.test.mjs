import assert from 'node:assert/strict';
import {BreuPhysics} from '../laboratorio/physics.mjs';

// Validate the actual Rapier-based engine, not the deprecated WebGL version.
const physics=await BreuPhysics.create();
const start={...physics.position()};
for(let n=0;n<80;n++)physics.step({forward:1,strafe:0,sprint:false},0,false);
const after={...physics.position()};
assert(after.z<start.z-3.5,'WASD forward must visibly move the player');
assert(Math.abs(after.x-start.x)<1.0,'Forward motion must stay in the corridor');
for(let n=0;n<30;n++)physics.step({forward:0,strafe:0,sprint:false},0,false);
const grounded=physics.position().y;
physics.step({forward:0,strafe:0,sprint:false},0,true);
assert(physics.position().y>grounded+.035,'Space must trigger actual capsule jump');
console.log('PASS: real Rapier motor moves the camera capsule with WASD and jumps');
