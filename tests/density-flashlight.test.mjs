import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {PROPS,circleFits,solidAt} from '../laboratorio/layout.mjs';
import {createRoomScenes} from '../laboratorio/room-scenes.mjs';
import {BRIGHTNESS_PRESETS} from '../laboratorio/visibility.mjs';

const newProps=PROPS.filter(p=>p.name.startsWith('corridor ')||
 p.name.startsWith('restroom linen')||p.name.startsWith('minato ')||
 p.name.startsWith('kino ')||p.name.startsWith('fashion ')||
 p.name.startsWith('denki ')||p.name.startsWith('arcade ')||
 p.name.startsWith('pharmacy ')||p.name.startsWith('maintenance ')||
 p.name.startsWith('security control')||p.name.startsWith('security supply'));
assert(newProps.length>=21,'Shopping still has too few physical furnishings');
for(const p of newProps){
 assert(p.blocking&&p.material,'New furniture must have a real collider and deliberate material');
 assert(!solidAt(p.x,p.z,.01),'A solid furniture prop intersects an existing wall: '+p.name);
}
for(const z of [12,3,-10,-18,-27,-34,-43,-49,-51]){
 assert(circleFits(0,z,.33),'Furnishings must not block centre evacuation route at z '+z);
}
const scene=new THREE.Scene();
const rooms=createRoomScenes(scene,{lowPower:true});
const totalInstanced=scene.children.filter(x=>x.isInstancedMesh).reduce((n,x)=>n+x.count,0);
assert(totalInstanced>=220,'Rooms still feel sparse on low power devices: '+totalInstanced);
assert(rooms.batchCount>=4,'Props must remain instanced to protect older GPUs');

const html=readFileSync(new URL('../laboratorio/index.html',import.meta.url),'utf8');
const main=readFileSync(new URL('../laboratorio/main.mjs',import.meta.url),'utf8');
const level=readFileSync(new URL('../laboratorio/level.mjs',import.meta.url),'utf8');
assert(html.includes('id="flashlight-mask"'),'Missing local first-person flashlight darkness');
assert(html.includes('body.flashlight-off #flashlight-mask'),'Switching flashlight off should leave the scene dark');
assert(html.includes('body.cinematic-active #flashlight-mask'),'Darkness overlay must not spoil films');
assert(main.includes('Math.PI/11'),'Main spotlight must be physically narrow');
assert(main.includes("document.documentElement.style.setProperty('--beam-edge'"),'Brightness must not flood beam exterior');
assert(level.includes('lightingBoost=.32'),'World fixtures must not overpower aiming cone');
assert(BRIGHTNESS_PRESETS.every(x=>x.ambient<=.25&&x.lighting<=.4),
 'Brightness settings must illuminate only the beam, not the entire mall');
console.log('PASS: 21 physical furnishings, dense GPU-batched stores, clear route and true aim-limited flashlight');
