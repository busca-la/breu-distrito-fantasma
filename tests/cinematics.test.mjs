import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStalker} from '../laboratorio/stalker.mjs';
import {createCinematicDirector,SHOTS} from '../laboratorio/cinematics.mjs';

const scene=new THREE.Scene(),stalker=createStalker(scene);
const camera=new THREE.PerspectiveCamera(76,1.75,.035,125);
camera.position.set(0,1.6,-35);
const director=createCinematicDirector(camera,stalker);
assert(SHOTS.capture.seconds>=6,'The grab must unfold over multiple seconds');
for(const kind of ['power','exit','reveal','capture']){
 assert(SHOTS[kind].seconds>=4.5,kind+' still too short');
 assert(SHOTS[kind].beats.length>=3,kind+' must have multiple timed events');
}
assert(director.begin('power',0));
assert(!director.begin('exit',0),'Do not interrupt an active cinematic');
let shot=director.update(1);
assert(shot.kind==='power'&&!shot.finished&&shot.caption);
assert(camera.position.x>7&&camera.position.x<11,'Film the actual power gate');
shot=director.update(3);
assert(shot.beat>=1&&shot.cue,'Gate scene should advance a second sound/narrative beat');
shot=director.update(6);
assert(shot.finished&&!director.active);
assert(Math.abs(camera.position.x)<.001,'Cinematic should restore first-person camera');

stalker.update(1/60,{x:-6,z:-35},false,12,{flashOn:true});
assert(director.begin('reveal',7));
shot=director.update(9);
assert(shot.progress>.1&&shot.progress<1);
shot=director.update(12);
assert(shot.finished&&!director.active);

assert(director.begin('exit',13));
shot=director.update(16);
assert(camera.position.x>15&&camera.position.x<19,'Exit scene must film real gate');
shot=director.update(19);
assert(shot.finished);

assert(director.begin('capture',20));
shot=director.update(24.1);
assert(shot.progress>.5&&shot.progress<1);
assert(camera.fov>78,'First-person capture must move the actual camera');
assert(stalker.group.visible,'The monster must be physically shown');
const mouth=stalker.group.children.find(x=>x.name==='dark open mouth');
assert(mouth?.scale.y>1,'Monster mouth must actually animate');
const hands=stalker.group.children.filter(x=>x.name==='reaching glove');
assert.equal(hands.length,2);
assert(hands.every(x=>x.position.y>1.1&&x.position.z<-.3),'Creature must visibly grab camera');
shot=director.update(27);
assert(shot.finished&&!director.active);
console.log('PASS: 5-7s cinematic sequences, timed captions/sound beats, real gates and complete grab-to-mouth shot');
