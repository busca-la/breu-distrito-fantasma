import test from 'node:test';
import assert from 'node:assert/strict';
import {EscapeSequence} from '../mission.mjs';
import fs from 'node:fs';

test('alarm opens real escape only after continuous game time',()=>{
 const mission=new EscapeSequence(12);
 assert.equal(mission.active,false);assert.equal(mission.finish(),false);
 assert.equal(mission.update(30),false);
 assert.equal(mission.activate(30),true);assert.equal(mission.activate(31),false);
 assert.equal(mission.update(35),false);assert.equal(mission.remaining(35),7);
 assert.equal(mission.update(41.99),false);assert.equal(mission.update(42),true);
 assert.equal(mission.update(43),false);assert.equal(mission.finish(),true);
 assert.equal(mission.finish(),false);
});

test('objective UI keeps compass needle when distance value changes',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const main=fs.readFileSync(new URL('../main.mjs',import.meta.url),'utf8');
 assert(html.includes('id="needle"')&&html.includes('id="distance-value"'));
 assert(main.includes('distanceValue.textContent='));
 assert(!main.includes('distance.textContent='));
 assert(main.includes('escapeSequence.update(clock)'));
 assert(main.includes('physics.unlockExit()'));
 assert(main.includes('if(!physics){location.reload();return;}'));
 assert(main.includes('RECARREGAR E TENTAR NOVAMENTE'));
});

test('game HUD activates alarm, delays the physical exit and then finishes escape',async()=>{
 const vm=await import('node:vm');
 const code=fs.readFileSync(new URL('../main.mjs',import.meta.url),'utf8');
 const first=code.indexOf('function updateObjective(pos){'),last=code.indexOf('function drawMap(pos){',first);
 assert(first>0&&last>first);
 const fn=code.slice(first,last);
 const elements=new Map();
 const make=()=>({textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},disabled:false});
 const $=id=>{if(!elements.has(id))elements.set(id,make());return elements.get(id)};
 let state={alarm:false,exitOpen:false,escaped:false,interactHeld:false,paused:false,clock:0},openCalls=0,physCalls=0;
 const env={
  Math,setTimeout(){},document:{pointerLockElement:null,exitPointerLock(){}},
  $,objective:$('#objective'),distanceValue:$('#distance-value'),
  hint:$('#hint'),actionButton:$('#action-btn'),intro:make(),hud:make(),
  sound:{setPaused(){}},physics:{unlockExit(){physCalls++}},stage:{openExit(){openCalls++}},
  escapeSequence:new EscapeSequence(12),INTERACTION:{panel:{x:15.5,z:-51.4,r:1.75},exit:{x:21.05,z:-51,r:1.12}},
  touch:false,yaw:0,alarm:false,exitOpen:false,interactHeld:false,escaped:false,paused:false,clock:0
 };
 const app=vm.runInNewContext(fn+'\n;({run(pos,time,pressed=false){clock=time;interactHeld=pressed;updateObjective(pos)},state(){return {alarm,exitOpen,escaped}},turn(radians){yaw=radians}})',env);
 app.run({x:0,z:-51.4},0,false);
 const eastAngle=parseFloat($('#needle').style.transform.match(/rotate\(([-.0-9]+)rad\)/)?.[1]);
 assert(eastAngle>1.4&&eastAngle<1.7,'Compass should point east when looking north');
 app.turn(-Math.PI/2);app.run({x:0,z:-51.4},0,false);
 const ahead=parseFloat($('#needle').style.transform.match(/rotate\(([-.0-9]+)rad\)/)?.[1]);
 assert(Math.abs(ahead)<.05,'Compass should point forward when facing objective');
 app.turn(0);app.run({x:15.5,z:-51.4},2,true);
 assert.equal(app.state().alarm,true);assert.equal(physCalls,0);
 app.run({x:20,z:-51},13.99);
 assert.equal(physCalls,0);assert.equal(app.state().exitOpen,false);
 app.run({x:20,z:-51},14);
 assert.equal(openCalls,1);assert.equal(physCalls,1);
 app.run({x:21.05,z:-51},14.2,true);
 assert.equal(app.state().escaped,true);
 assert.equal($('#distance-value').textContent,'0 m');
 assert(typeof $('#needle').style.transform==='string');
});
