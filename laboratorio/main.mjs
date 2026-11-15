import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {BreuPhysics} from './physics.mjs';
import {createLevel} from './level.mjs';
import {BreuSound} from './ambient-audio.mjs';
import {createStalker} from './stalker.mjs';
import {EscapeSequence} from './mission.mjs';
import {WING, WALLS, INTERACTION, STORE_SIGNS} from './layout.mjs';

const $=s=>document.querySelector(s);
const canvas=$('#world'),status=$('#loading-status'),intro=$('#intro'),hud=$('#hud');
const objective=$('#objective'),distanceValue=$('#distance-value'),hint=$('#hint'),actionButton=$('#action-btn');
const mapCanvas=$('#map'),mapCtx=mapCanvas.getContext('2d');
const touch='ontouchstart' in window||navigator.maxTouchPoints>0;
let scene,renderer,camera,physics,stage,flashlight,stalker;
let started=false,paused=true,alarm=false,escaped=false,defeated=false,clock=0,walkBob=0;
const escapeSequence=new EscapeSequence(12);let exitOpen=false;
let yaw=0,pitch=0,flashOn=true,interactHeld=false,requestJump=false;
let joystick={x:0,y:0};
const keys=new Set();
const sound=new BreuSound();
const vec=(x,y,z)=>new THREE.Vector3(x,y,z);
function showError(err){console.error(err);status.textContent='Falha ao iniciar o motor: '+String(err?.message||err);status.style.color='#ff9a90';$('#play').disabled=false;$('#play').textContent='RECARREGAR E TENTAR NOVAMENTE';}
function renderSetup(){
 const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
 if(!gl)throw new Error('O navegador precisa de WebGL2 para abrir esta versão.');
 renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.06;
 renderer.setPixelRatio(Math.min(devicePixelRatio,touch?1.25:1.6));
 renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=!touch;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=new THREE.Color('#0b1014');scene.fog=new THREE.FogExp2('#091015',.034);
 camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.035,125);
 camera.rotation.order='YXZ';
 stage=createLevel(scene);stalker=createStalker(scene);
 const light=new THREE.SpotLight('#e7ddd1',25,19,Math.PI/7,.78,1.6);
 flashlight=light;scene.add(light);scene.add(light.target);
 light.castShadow=!touch;light.shadow.mapSize.set(512,512);light.shadow.camera.near=.15;light.shadow.camera.far=18;light.shadow.bias=-.0002;
 const fill=new THREE.SpotLight('#d0d5ce',2,9,Math.PI/2,.8,2);
 fill.position.set(0,1.6,12);fill.target.position.set(0,1,-1);scene.add(fill,fill.target);
 camera.position.set(0,1.62,13);scene.add(camera);
 window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
}
function start(){
 if(!physics){location.reload();return;}
 if(escaped||defeated){location.reload();return;}
 started=true;paused=false;intro.classList.add('hide');hud.classList.remove('hide');
 void sound.start().catch(e=>console.warn('Audio unavailable:',e));
 $('#mobile-controls').classList.toggle('hide',!touch);
 $('#pause').textContent='II';
 if(!touch&&canvas.requestPointerLock)canvas.requestPointerLock();
}
function pause(){if(!started)return;paused=!paused;sound.setPaused(paused);$('#pause').textContent=paused?'▶':'II';$('#pause-screen').classList.toggle('hide',!paused);if(paused&&document.pointerLockElement)document.exitPointerLock();}
function inputSetup(){
 window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if(e.code==='Space'&&!e.repeat)requestJump=true;
  if(e.code==='KeyF'&&!e.repeat)flashOn=!flashOn;
  if(e.code==='KeyE'&&!e.repeat)interactHeld=true;
  if(e.code==='Escape'&&started&&!paused)pause();
 });
 window.addEventListener('keyup',e=>keys.delete(e.code));
 document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&!paused){yaw-=e.movementX*.00215;pitch=Math.max(-1.25,Math.min(1.25,pitch-e.movementY*.00195));}});
 canvas.addEventListener('click',()=>{if(started&&!paused&&!touch&&document.pointerLockElement!==canvas)canvas.requestPointerLock()});
 $('#play').addEventListener('click',start);
 $('#pause').addEventListener('click',pause);
 $('#resume').addEventListener('click',()=>{pause();if(!touch)canvas.requestPointerLock()});
 $('#flash-btn').addEventListener('click',()=>flashOn=!flashOn);
 $('#sound-btn').addEventListener('click',async()=>{const on=await sound.toggle();if(paused)sound.setPaused(true);$('#sound-btn').textContent=on?'SOM: LIGADO':'SOM: DESLIGADO'});
 $('#jump-btn').addEventListener('pointerdown',e=>{e.preventDefault();requestJump=true});
 actionButton.addEventListener('pointerdown',e=>{e.preventDefault();interactHeld=true});
 const joy=$('#joystick'),knob=$('#joystick-knob');let joystickId=null;
 joy.addEventListener('pointerdown',e=>{joystickId=e.pointerId;joy.setPointerCapture(e.pointerId);dragJoy(e)});
 joy.addEventListener('pointermove',e=>{if(e.pointerId===joystickId)dragJoy(e)});
 const end=()=>{joystickId=null;joystick.x=0;joystick.y=0;knob.style.transform='translate(-50%,-50%)'};
 joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);
 function dragJoy(e){const r=joy.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const d=Math.max(1,Math.hypot(x,y)),s=Math.min(1,d/(r.width*.40));joystick.x=x/d*s;joystick.y=y/d*s;const max=r.width*.29;knob.style.transform=`translate(calc(-50% + ${joystick.x*max}px),calc(-50% + ${joystick.y*max}px))`;}
 const look=$('#look-area');let lx=null,ly=null,lookId=null;
 look.addEventListener('pointerdown',e=>{if(!touch)return;lookId=e.pointerId;look.setPointerCapture(e.pointerId);lx=e.clientX;ly=e.clientY});
 look.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||paused)return;yaw-=(e.clientX-lx)*.0042;pitch=Math.max(-1.15,Math.min(1.15,pitch-(e.clientY-ly)*.0038));lx=e.clientX;ly=e.clientY});
 const clear=()=>{lookId=null;lx=null;ly=null};look.addEventListener('pointerup',clear);look.addEventListener('pointercancel',clear);
}
function onCaught(){
 defeated=true;paused=true;sound.setPaused(true);intro.classList.remove('hide');hud.classList.add('hide');
 $('#intro-headline').textContent='ELE TE VIU.';$('#intro-copy').textContent='O corredor ficou em silêncio. Você demorou demais entre as vitrines.';
 $('#play').textContent='TENTAR NOVAMENTE';if(document.pointerLockElement)document.exitPointerLock();
}
function updateObjective(pos){
 if(alarm&&!exitOpen){
  if(escapeSequence.update(clock)){
   exitOpen=true;stage.openExit();physics.unlockExit();
   $('#notice').textContent='PORTÃO DE INCÊNDIO LIBERADO';$('#notice').classList.add('show');
   setTimeout(()=>$('#notice').classList.remove('show'),2300);
  }else objective.textContent=`PORTÃO ABRE EM ${Math.ceil(escapeSequence.remaining(clock))} S`;
 }
 if(alarm&&exitOpen)objective.textContent='CORRA PARA A SAÍDA DE INCÊNDIO';
 const dest=alarm?INTERACTION.exit:INTERACTION.panel;
 const d=Math.hypot(pos.x-dest.x,pos.z-dest.z);
 distanceValue.textContent=`${Math.round(d)} m`;
 const near=d<(alarm?INTERACTION.exit.r:INTERACTION.panel.r);
 hint.classList.toggle('hide',!near||(alarm&&!exitOpen));
 if(near&&(!alarm||exitOpen)){hint.textContent=alarm?'PRESSIONE E / TOQUE EM ABRIR':'PRESSIONE E / TOQUE EM ATIVAR';actionButton.classList.toggle('hide',!touch)}
 else actionButton.classList.add('hide');
 if(near&&interactHeld){interactHeld=false;if(!alarm){
  alarm=true;escapeSequence.activate(clock);
  objective.textContent='SOBREVIVA ATÉ O PORTÃO DESTRAVAR';
  $('#notice').textContent='ALARME DISPARADO — NÃO FIQUE PARADO';$('#notice').classList.add('show');
  setTimeout(()=>$('#notice').classList.remove('show'),2500);
 }
 else if(exitOpen&&escapeSequence.finish()){
  escaped=true;paused=true;sound.setPaused(true);intro.classList.remove('hide');hud.classList.add('hide');
  $('#intro-headline').textContent='VOCÊ ESCAPOU.';
  $('#intro-copy').textContent=`Ala 03 atravessada em ${Math.round(clock)} segundos. O resto do shopping continua em silêncio.`;
  $('#play').textContent='REINICIAR EXPEDIÇÃO';if(document.pointerLockElement)document.exitPointerLock();
 }}
 else interactHeld=false;
 const bearing=Math.atan2(dest.x-pos.x,-(dest.z-pos.z));const angle=((bearing-yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
 $('#needle').style.transform=`rotate(${-angle}rad)`;
}
function drawMap(pos){
 const c=mapCtx,w=mapCanvas.width,h=mapCanvas.height;c.clearRect(0,0,w,h);c.fillStyle='rgba(5,10,12,.9)';c.fillRect(0,0,w,h);
 const sx=x=>(x+12)/34*w,sy=z=>(z+59)/80*h;
 c.fillStyle='#202d31';c.fillRect(sx(-10.9),sy(-57.5),sx(21.6)-sx(0),sy(75.5)-sy(0));
 c.strokeStyle='#607276';c.lineWidth=2;c.beginPath();
 for(const o of WALLS)c.strokeRect(sx(o.x-o.w/2),sy(o.z-o.d/2),o.w*w/34,o.d*h/80);c.stroke();
 c.fillStyle=alarm?'#f1b2a3':'#c9d4cf';const target=alarm?INTERACTION.exit:INTERACTION.panel;c.beginPath();c.arc(sx(target.x),sy(target.z),4,0,Math.PI*2);c.fill();
 c.fillStyle='#d9e9ee';c.beginPath();c.arc(sx(pos.x),sy(pos.z),3,0,Math.PI*2);c.fill();
}
const fps={last:0,delta:0,acc:0,second:0,frames:0};
function frame(t){requestAnimationFrame(frame);if(!renderer)return;
 const dt=Math.min(.05,(t-fps.last)/1000||0);fps.last=t;clock+=(!paused?dt:0);
 if(physics){
  if(started&&!paused){
   const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joystick.y;
   const strafe=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
   const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight')||Math.hypot(joystick.x,joystick.y)>.92;
   fps.acc=Math.min(fps.acc+dt,.13);
   while(fps.acc>=1/60){physics.step({forward,strafe,sprint},yaw,requestJump);requestJump=false;fps.acc-=1/60}
   const p=physics.position();
   walkBob+=(Math.abs(forward)+Math.abs(strafe))*.035;
   camera.position.set(p.x,p.y+.64+Math.sin(walkBob)*Math.min(.024,Math.hypot(strafe,forward)*.015),p.z);
   camera.rotation.set(pitch,yaw,0);
   sound.tick(clock,{walking:Math.abs(forward)+Math.abs(strafe)>.12,sprinting:sprint,alarm,zone:Math.max(0,Math.min(5,Math.floor((13-p.z)/14)))});
   const result=stalker?.update(dt,p,alarm,clock);
   $('#danger').style.opacity=String(result?Math.max(0,Math.min(.67,(12-result.distance)/17)):0);
   if(result?.caught){onCaught();return;}
   updateObjective(p);
   fps.frames++;fps.second+=dt;
   if(fps.second>=1){$('#fps').textContent=`${Math.round(fps.frames/fps.second)} FPS`;fps.frames=0;fps.second=0;drawMap(p)}
  }else if(!started){
   camera.position.set(Math.sin(t*.00015)*.10,1.62,13);camera.rotation.set(Math.sin(t*.00019)*-.025,Math.sin(t*.0001)*.035,0);
  }
 }
 flashlight.visible=flashOn;
 flashlight.position.copy(camera.position);const direction=vec(0,0,-1).applyEuler(camera.rotation);flashlight.target.position.copy(camera.position).add(direction.multiplyScalar(8));
 stage?.update(t/1000,alarm);
 renderer.render(scene,camera);
}
async function boot(){
 try{renderSetup();inputSetup();requestAnimationFrame(frame);
  status.textContent='Carregando física Rapier (WASM)…';
  physics=await BreuPhysics.create();
  const n=physics.staticBodies.length;
  status.textContent=`ALA 03 PRONTA · ${n} corpos físicos · Three.js + Rapier`;
  $('#play').disabled=false;
 }catch(e){showError(e)}
}
window.addEventListener('blur',()=>{if(started&&!paused)pause();keys.clear();joystick.x=joystick.y=0});
boot();
