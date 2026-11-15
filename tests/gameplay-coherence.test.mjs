import assert from 'node:assert/strict';
import {BreuStory,STORY_RADIO} from '../laboratorio/mission.mjs';
import {INTERACTION,STORE_SIGNS,circleFits} from '../laboratorio/layout.mjs';
import {hasLineOfSight,canSee,canHear,reachedExit} from '../laboratorio/perception.mjs';
import {createStalker} from '../laboratorio/stalker.mjs';
import * as THREE from 'three';

// Explain why tasks exist and ensure the radio really identifies the next step.
assert(STORY_RADIO.includes('DENKI'));
assert(STORY_RADIO.includes('ELE ESCUTA'));
const story=new BreuStory();
assert.deepEqual(story.checkpoint,{x:0,z:13});
assert.equal(story.advance('radio'),true);
assert(story.checkpoint.z<0,'Progress must advance the physical respawn point');
assert.equal(story.advance('relay'),true);
assert(story.checkpoint.z<=-20,'Power must save a checkpoint near the next area');
assert.equal(story.advance('panel'),true);
assert(story.checkpoint.x>11,'Alarm checkpoint must be inside the open security room');
assert.equal(story.advance('exit'),true);
assert.equal(story.phase,'done');

assert.equal(canSee({distance:5,visible:false,flashlight:true}),false,'No sight through walls');
assert.equal(canSee({distance:10,visible:true,flashlight:false,sprinting:false}),false,'Darkness should matter');
assert.equal(canSee({distance:10,visible:true,flashlight:true}),true,'Flashlight should reveal player');
assert.equal(canHear({distance:8,sprinting:true}),true,'Running must make audible noise');
assert.equal(canHear({distance:8,sprinting:false,walking:true}),false,'Walking cannot sound like sprinting');

const ramen={x:-5.45,z:-10.9},hallway={x:0,z:-10.9};
assert(hasLineOfSight(hallway,ramen),'The ramen shop must be visibly reachable through its open door');
assert(!hasLineOfSight({x:0,z:-16},{x:-6,z:-16}),'Closed wall must block creature line of sight');
assert(circleFits(INTERACTION.radio.x,INTERACTION.radio.z,.1),'Radio should be physically reachable');
assert(circleFits(INTERACTION.relay.x,INTERACTION.relay.z,.1),'Relay should be physically reachable');
assert(STORE_SIGNS.some(s=>s.type==='ramen'));
assert(STORE_SIGNS.some(s=>s.type==='electronics'));

assert(!reachedExit({x:20.7,z:-51},false),'Closed door cannot complete game');
assert(!reachedExit({x:18.3,z:-51},true),'Approaching the door is not escaping');
assert(reachedExit({x:20.7,z:-51},true),'Crossing open exit must win without a mystery E press');

const stalker=createStalker(new THREE.Scene());
let state=stalker.update(1/60,{x:0,z:-33},false,10,{flashOn:true});
assert(state.chasing&&state.spotted,'Visible player should cause immediate hunt');
stalker.reset(11);
state=stalker.update(1/60,{x:0,z:-33},false,12,{flashOn:true});
assert(!state.chasing&&!state.caught,'Checkpoint respawn must have breathing room');
console.log('PASS: coherent narrative, checkpoints, no wall-hack, light/noise stealth and automatic walk-through escape');
