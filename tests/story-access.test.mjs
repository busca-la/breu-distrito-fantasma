import assert from 'node:assert/strict';
import {BreuStory,STORY_STEPS} from '../laboratorio/mission.mjs';
import {OPEN_PORTALS,STORE_SIGNS,INTERACTION,circleFits} from '../laboratorio/layout.mjs';
import {BreuPhysics} from '../laboratorio/physics.mjs';

const steps=new BreuStory();
assert.deepEqual(['radio','relay','panel','exit'],['radio','relay','security','escape'].map(p=>STORY_STEPS[p].target));
assert.equal(steps.phase,'radio');
assert.equal(steps.advance('relay'),false,'Player must learn the power failure first');
assert.equal(steps.advance('radio'),true);
assert.equal(steps.phase,'relay');
assert.equal(steps.advance('panel'),false,'Do not skip the auxiliary circuit');
assert.equal(steps.advance('relay'),true);
assert.equal(steps.advance('panel'),true);
assert.equal(steps.phase,'escape');
assert.equal(steps.advance('exit'),true);
assert.equal(steps.phase,'done');
assert.equal(steps.advance('exit'),false,'Only one successful escape');

const shops=[
 ['camera',1,-8.5],['fashion',-1,-22],['arcade',-1,-34.6],
 ['pharmacy',1,-39.4],['ramen',-1,-10.9],['electronics',1,-27.3],['maintenance',-1,-47.5],
];
for(const [type,side,z] of shops){
 assert(STORE_SIGNS.some(s=>s.type===type));
 assert(OPEN_PORTALS.some(p=>p.side===side&&z>p.zMin+.5&&z<p.zMax-.5),
  type+' has no architectural opening');
 for(const x of [side*2.9,side*3.65,side*4.35]){
  assert(circleFits(x,z,.32),type+' doorway is blocked at '+x+','+z);
 }
}
for(const [id,x,z] of [['radio',-4.35,-10.4],['relay',5.45,-26.1],['panel',14.6,-51.4]]){
 const target=INTERACTION[id];
 assert(circleFits(x,z,.31),id+' has no space to stand in front of the equipment');
 assert(Math.hypot(x-target.x,z-target.z)<target.r,id+' cannot be interacted with from the available standing space');
}
const physics=await BreuPhysics.create();
function approach(x,z,seconds=1.2){
 physics.body.setTranslation({x,y:.87,z},true);
 physics.body.setLinvel({x:0,y:0,z:0},true);
 const count=Math.floor(seconds*60);
 for(let i=0;i<count;i++)physics.step({forward:0,strafe:1,sprint:false},0,false);
 return physics.position().x;
}
// Only the SECURITY gate is initially closed. A powered circuit raises it.
const lockedSecurity=approach(10.1,-51.25,1.4);
assert(lockedSecurity<11.4,'Walked through closed security shutter');
physics.unlockSecurityGate();
const openSecurity=approach(10.1,-51.25,1.4);
assert(openSecurity>12.2,'Could not enter security room after restoring power');
// The final exit remains locked until the security room activates its motor.
const lockedExit=approach(17.4,-51.0,1.35);
assert(lockedExit<19.1,'Walked through closed emergency exit');
physics.unlockExit();
const openExit=approach(17.4,-51.0,1.35);
assert(openExit>20.2,'Could not escape through raised emergency door');
console.log('PASS: story progression, seven shop portals, radio and relay reachability, physical powered gate and exit');
