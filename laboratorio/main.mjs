import * as THREE from 'three';
import {BreuPhysics} from './physics.mjs';
import {createLevel} from './level.mjs';
import {BreuSound} from './ambient-audio.mjs';
import {createStalker} from './stalker.mjs';
import {EscapeSequence,BreuStory,STORY_RADIO} from './mission.mjs';
import {createMissionGuide} from './mission-guide.mjs';
import {hasLineOfSight,reachedExit} from './perception.mjs';
import {createEnvironmentMotion} from './environment-motion.mjs';
import {createLiveEncounters} from './live-encounters.mjs';
import {WING, WALLS, INTERACTION, STORE_SIGNS} from './layout.mjs';
import {DEFAULT_BRIGHTNESS,normalizeBrightness,getVisibilityPreset} from './visibility.mjs';
import {createRoomScenes} from './room-scenes.mjs';
import {createCinematicDirector} from './cinematics.mjs';

const $=s=>document.querySelector(s);
const canvas=$('#world'),status=$('#loading-status'),intro=$('#intro'),hud=$('#hud');
const objective=$('#objective'),distanceValue=$('#distance-value'),hint=$('#hint'),actionButton=$('#action-btn');
const mapCanvas=$('#map'),mapCtx=mapCanvas.getContext('2d');
const touch='ontouchstart' in window||navigator.maxTouchPoints>0;
const lowPowerDevice=touch||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
const quality={ratio:1,min:touch?.62:.72,max:1,seconds:0,frames:0,goodWindows:0};
let scene,renderer,camera,physics,stage,flashlight,stalker,motion,encounters,missionGuide,roomScenes,director;
let started=false,paused=true,alarm=false,escaped=false,defeated=false,clock=0,walkBob=0;
const escapeSequence=new EscapeSequence(12),story=new BreuStory();let exitOpen=false;
let yaw=0,pitch=0,flashOn=true,interactHeld=false,requestJump=false;
let joystick={x:0,y:0};
const keys=new Set();
const sound=new BreuSound();
const vec=(x,y,z)=>new THREE.Vector3(x,y,z);
function savedBrightness(){
 try{const raw=localStorage.getItem('breu.brightness.v1');return normalizeBrightness(raw);}catch{return DEFAULT_BRIGHTNESS;}
}
let brightnessLevel=savedBrightness();
function setBrightness(value){
 brightnessLevel=normalizeBrightness(value);
 const preset=getVisibilityPreset(brightnessLevel);
 if(renderer)renderer.toneMappingExposure=preset.exposure;
 if(scene?.fog)scene.fog.density=preset.fog;
 if(flashlight)flashlight.intensity=preset.flashlight;
 stage?.setVisibility(preset);
 document.documentElement.style.setProperty('--vignette-edge',String(preset.vignette));
 const slider=$('#brightness-slider'),caption=$('#brightness-value');
 if(slider)slider.value=String(brightnessLevel);
 if(caption)caption.textContent=preset.name;
 try{localStorage.setItem('breu.brightness.v1',String(brightnessLevel));}catch{}
}
function showError(err){console.error(err);status.textContent='Falha ao iniciar o motor: '+String(err?.message||err);status.style.color='#ff9a90';$('#play').disabled=false;$('#play').textContent='RECARREGAR E TENTAR NOVAMENTE';}
function renderSetup(){
 const gl=canvas.getContext('webgl2',{antialias:!lowPowerDevice,alpha:false,powerPreference:'high-performance'});
 if(!gl)throw new Error('O navegador precisa de WebGL2 para abrir esta versão.');
 renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:!lowPowerDevice,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.38;
 quality.max=Math.min(devicePixelRatio||1,touch?1.15:lowPowerDevice?1.3:1.55);
 quality.min=Math.min(quality.max,quality.min);
 quality.ratio=Math.min(quality.max,touch?.95:lowPowerDevice?1.10:1.32);
 renderer.setPixelRatio(quality.ratio);
 renderer.setSize(innerWidth,innerHeight,false);
 renderer.shadowMap.enabled=!lowPowerDevice;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=new THREE.Color('#151e21');scene.fog=new THREE.FogExp2('#141b1e',.019);
 camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.035,125);
 camera.rotation.order='YXZ';
 stage=createLevel(scene);stalker=createStalker(scene);
 motion=createEnvironmentMotion(scene,{lowPower:lowPowerDevice});
 encounters=createLiveEncounters(scene);
 missionGuide=createMissionGuide(scene);
 roomScenes=createRoomScenes(scene,{lowPower:lowPowerDevice});
 director=createCinematicDirector(camera,stalker);
 // Focused beam, not a second omnidirectional shopping-mall floodlight.
 const light=new THREE.SpotLight('#f4eadd',43,15.5,Math.PI/10,.36,2);
 flashlight=light;scene.add(light);scene.add(light.target);
 light.castShadow=!lowPowerDevice;light.shadow.mapSize.set(512,512);light.shadow.camera.near=.15;light.shadow.camera.far=18;light.shadow.bias=-.0002;
 const fill=new THREE.SpotLight('#d0d5ce',2,9,Math.PI/2,.8,2);
 fill.position.set(0,1.6,12);fill.target.position.set(0,1,-1);scene.add(fill,fill.target);
 setBrightness(brightnessLevel);
 camera.position.set(0,1.62,13);scene.add(camera);
 window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
}
function start(){
 if(!physics){location.reload();return;}
 if(escaped){location.reload();return;}
 if(defeated){
  defeated=false;
  physics.reset(story.checkpoint);
  stalker.reset(clock,{alarm});
  keys.clear();interactHeld=false;requestJump=false;joystick.x=joystick.y=0;
 }
 started=true;paused=false;intro.classList.add('hide');hud.classList.remove('hide');
 void sound.start().then(()=>sound.setPaused(false)).catch(e=>console.warn('Audio unavailable:',e));
 $('#mobile-controls').classList.toggle('hide',!touch);
 $('#pause').textContent='II';
 if(!touch&&canvas.requestPointerLock)canvas.requestPointerLock();
}
function beginScene(kind){
 if(!director?.begin(kind,clock))return false;
 const overlay=$('#cinematic'),subtitle=$('#cinematic-caption');
 overlay?.classList.add('show');
 overlay?.classList.toggle('capturing',kind==='capture');
 if(subtitle)subtitle.textContent={capture:'ELE TE PEGOU.',reveal:'ALGO ESTAVA ESPERANDO AQUI.',power:'ENERGIA RESTAURADA · GRADE ABRINDO',exit:'PORTÃO DE INCÊNDIO · ABRINDO'}[kind]||'';
 keys.clear();requestJump=false;interactHeld=false;
 return true;
}
function renderSceneFrame(){
 const shot=director.update(clock);
 if(!shot)return;
 const overlay=$('#cinematic');
 if(overlay){
  overlay.classList.toggle('final-blackout',shot.kind==='capture'&&shot.progress>.87);
  overlay.classList.toggle('show',!shot.finished);
 }
 stage?.update(clock,alarm);
 if(stage?.isSecurityPassable()&&!physics?.securityGateUnlocked)physics.unlockSecurityGate();
 if(exitOpen&&stage?.isExitPassable()&&!physics?.exitUnlocked)physics.unlockExit();
 flashlight.visible=flashOn&&shot.kind!=='capture';
 flashlight.position.copy(camera.position);
 flashlight.target.position.copy(camera.position).add(new THREE.Vector3(0,0,-12).applyQuaternion(camera.quaternion));
 renderer.render(scene,camera);
 if(shot.finished){
  overlay?.classList.remove('show','capturing','final-blackout');
  if(shot.kind==='capture')onCaught();
 }
}
function pause(){if(!started||director?.active)return;paused=!paused;sound.setPaused(paused);$('#pause').textContent=paused?'▶':'II';$('#pause-screen').classList.toggle('hide',!paused);if(paused&&document.pointerLockElement)document.exitPointerLock();}
function inputSetup(){
 window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if(e.code==='Space'&&!e.repeat)requestJump=true;
  if(e.code==='KeyF'&&!e.repeat)flashOn=!flashOn;
  if(e.code==='KeyE'&&!e.repeat)interactHeld=true;
  if(e.code==='Escape'&&started&&!paused&&!director?.active)pause();
 });
 window.addEventListener('keyup',e=>keys.delete(e.code));
 document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&!paused){yaw-=e.movementX*.004;pitch=Math.max(-1.25,Math.min(1.25,pitch-e.movementY*.0036));}});
 canvas.addEventListener('click',()=>{if(started&&!paused&&!touch&&document.pointerLockElement!==canvas)canvas.requestPointerLock()});
 $('#play').addEventListener('click',start);
 $('#pause').addEventListener('click',pause);
 $('#resume').addEventListener('click',()=>{pause();if(!touch)canvas.requestPointerLock()});
 $('#flash-btn').addEventListener('click',()=>flashOn=!flashOn);
 $('#sound-btn').addEventListener('click',async()=>{const on=await sound.toggle();if(paused)sound.setPaused(true);$('#sound-btn').textContent=on?'SOM: LIGADO':'SOM: DESLIGADO'});
 $('#brightness-slider').addEventListener('input',e=>setBrightness(e.target.value));
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
 defeated=true;paused=true;sound.setPaused(true);
 intro.classList.remove('hide');hud.classList.add('hide');
 $('#intro-headline').textContent='ELE TE ENCONTROU.';
 $('#intro-copy').textContent='A criatura alcançou você. Apagar a lanterna e não correr perto dela ajuda a despistá-la. Seu progresso foi preservado.';
 $('#play').textContent='RETOMAR DO ÚLTIMO PONTO';
 if(document.pointerLockElement)document.exitPointerLock();
}
function finishEscape(){
 if(!escapeSequence.finish())return;
 story.advance('exit');
 escaped=true;paused=true;sound.setPaused(true);
 intro.classList.remove('hide');hud.classList.add('hide');
 $('#intro-headline').textContent='VOCÊ ESCAPOU.';
 $('#intro-copy').textContent=`Você recuperou a energia, abriu o portão e deixou o Shopping 09. Tempo: ${Math.round(clock)} segundos. Mas o funcionário que correu no início nunca respondeu ao rádio.`;
 $('#play').textContent='JOGAR DE NOVO';
 if(document.pointerLockElement)document.exitPointerLock();
}
function updateObjective(pos){
 // Nothing is collected for its own sake: radio explains the power failure,
 // power unlocks the guard post, guard post starts the actual exit motor.
 if(alarm&&!exitOpen&&escapeSequence.update(clock)){
  exitOpen=true;stage.openExit(clock);beginScene('exit');
  environmentCue({kind:'alarm',text:'PORTÃO DE INCÊNDIO: MECANISMO ACIONADO. AGUENTE MAIS UM POUCO.'},4200);
 }
 const task=story.current;
 const progress=$('#story-progress');
 if(progress)progress.textContent='ETAPA '+({radio:1,relay:2,security:3,escape:4,done:4}[story.phase])+' / 4';
 objective.textContent=task.title;
 const detail=$('#mission-detail');
 if(detail)detail.textContent=task.detail;
 const target=INTERACTION[task.target];
 if(!target)return;
 const distance=Math.hypot(pos.x-target.x,pos.z-target.z);
 distanceValue.textContent=`${Math.round(distance)} m`;
 const near=distance<target.r;
 if(story.phase==='escape'){
  hint.classList.add('hide');
  actionButton.classList.add('hide');
  if(alarm&&!stage.isExitPassable()){
   objective.textContent=exitOpen?'PORTÃO SUBINDO — ENCONTRE COBERTURA':'PORTÃO ABRE EM '+Math.ceil(escapeSequence.remaining(clock))+' S';
  }
  if(reachedExit(pos,stage.isExitPassable()))finishEscape();
 }else{
  const waiting=story.phase==='security'&&!stage.isSecurityPassable();
  const canUse=near&&!waiting&&hasLineOfSight(pos,target);
  hint.classList.toggle('hide',!canUse);
  actionButton.classList.toggle('hide',!canUse||!touch);
  if(canUse)hint.textContent=(touch?'TOQUE EM INTERAGIR':'[E]')+' · '+task.action;
  if(interactHeld){
   interactHeld=false;
   if(waiting&&near){
    environmentCue({kind:'metal',text:'A GRADE ESTÁ SUBINDO. ENTRE QUANDO ABRIR.'});
   }else if(canUse){
    if(story.phase==='radio'){
     story.advance('radio');
     sound.radioSpeech();
     environmentCue({kind:'radio',text:STORY_RADIO},6800);
    }else if(story.phase==='relay'){
     story.advance('relay');
     stage.restorePower(clock);
     beginScene('power');
     environmentCue({kind:'electric',text:'DISJUNTOR ATIVO: LUZES DA ALA VOLTARAM. A GRADE DA SEGURANÇA ESTÁ SUBINDO.'},4500);
    }else if(story.phase==='security'){
     story.advance('panel');
     alarm=true;escapeSequence.activate(clock);
     environmentCue({kind:'alarm',text:'ALARME DE EVACUAÇÃO: PORTÃO ABRE EM 12 SEGUNDOS. A CRIATURA OUVIU.'},4600);
    }
   }
  }
 }
 const bearing=Math.atan2(-(target.x-pos.x),-(target.z-pos.z));
 const angle=((bearing-yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
 $('#needle').style.transform=`rotate(${-angle}rad)`;
}
function drawMap(pos){
 const c=mapCtx,w=mapCanvas.width,h=mapCanvas.height;c.clearRect(0,0,w,h);c.fillStyle='rgba(5,10,12,.9)';c.fillRect(0,0,w,h);
 const sx=x=>(x+12)/34*w,sy=z=>(z+59)/80*h;
 c.fillStyle='#202d31';c.fillRect(sx(-10.9),sy(-57.5),sx(21.6)-sx(0),sy(75.5)-sy(0));
 c.strokeStyle='#607276';c.lineWidth=2;c.beginPath();
 for(const o of WALLS)c.strokeRect(sx(o.x-o.w/2),sy(o.z-o.d/2),o.w*w/34,o.d*h/80);c.stroke();
 c.fillStyle=alarm?'#f1b2a3':'#c9d4cf';const target=INTERACTION[story.target]||INTERACTION.exit;c.beginPath();c.arc(sx(target.x),sy(target.z),4,0,Math.PI*2);c.fill();
 c.fillStyle='#d9e9ee';c.beginPath();c.arc(sx(pos.x),sy(pos.z),3,0,Math.PI*2);c.fill();
}
function environmentCue(event,duration=2400){
 if(!event)return;
 sound.cue(event.kind);
 // Keep the cinematic message short and never block player input.
 const label=$('#notice');
 label.textContent=event.text;label.classList.toggle('danger',event.kind==='alarm'||event.kind==='pursuit');label.classList.add('show');
 clearTimeout(environmentCue.timeout);
 environmentCue.timeout=setTimeout(()=>label.classList.remove('show'),duration);
}
const fps={last:0,acc:0,second:0,frames:0};
// Change resolution only every few seconds to avoid constantly reallocating
// the framebuffer. The scene geometry, textures and collision stay untouched.
function adjustQuality(elapsed){
 if(!started||paused||document.hidden||!renderer)return;
 quality.seconds+=Math.min(.25,elapsed);quality.frames++;
 if(quality.seconds<2.5)return;
 const frameMs=quality.seconds/quality.frames*1000;
 quality.seconds=0;quality.frames=0;
 let next=quality.ratio;
 if(frameMs>28){next=Math.max(quality.min,next-.10);quality.goodWindows=0;}
 else if(frameMs<18){if(++quality.goodWindows>=3){next=Math.min(quality.max,next+.05);quality.goodWindows=0;}}
 else quality.goodWindows=0;
 if(Math.abs(next-quality.ratio)>.015){
  quality.ratio=next;
  renderer.setPixelRatio(quality.ratio);
  renderer.setSize(innerWidth,innerHeight,false);
 }
}
function frame(t){requestAnimationFrame(frame);if(!renderer)return;
 const elapsed=fps.last?Math.min(.25,(t-fps.last)/1000):1/60;
 const dt=Math.min(.05,elapsed);fps.last=t;clock+=(!paused?dt:0);
 if(director?.active){renderSceneFrame();return;}
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
   camera.rotation.set(pitch,yaw,-Math.max(-.024,Math.min(.024,strafe*.013)));
   const targetFov=sprint&&Math.abs(forward)+Math.abs(strafe)>.2?80:76;
   camera.fov+=(targetFov-camera.fov)*Math.min(1,dt*7);
   if(Math.abs(targetFov-camera.fov)>.08)camera.updateProjectionMatrix();
   sound.tick(clock,{walking:Math.abs(forward)+Math.abs(strafe)>.12,sprinting:sprint,alarm,zone:Math.max(0,Math.min(5,Math.floor((13-p.z)/14)))});
   const walking=Math.abs(forward)+Math.abs(strafe)>.12;
   const actuallySprinting=sprint&&walking;
   const result=stalker?.update(dt,p,alarm,clock,{
    sprinting:actuallySprinting,walking,flashOn,
    securityOpen:physics.securityGateUnlocked,exitOpen:physics.exitUnlocked,
    facing:{x:-Math.sin(yaw),z:-Math.cos(yaw)}
   });
   const threat=$('#threat-state'),noise=$('#noise-state');
   if(threat)threat.textContent=result?.chasing?'DETECTADO · DESPISTE-O':result?.distance<16?'ALGUÉM ESTÁ PERTO':'AMEAÇA NÃO DETECTADA';
   if(noise)noise.textContent=actuallySprinting?'RUÍDO ALTO · CORRENDO':walking?'RUÍDO BAIXO · ANDANDO':'SILENCIOSO';
   if(result?.ambush){beginScene('reveal');environmentCue({kind:'pursuit',text:'ALGO SAIU DAS SOMBRAS. CORRA OU ESCONDA-SE!'},2800);}
   else if(result?.spotted)environmentCue({kind:'pursuit',text:'ELE OUVIU OU VIU VOCÊ. QUEBRE A LINHA DE VISÃO!'},3000);
   if(result?.lost)environmentCue({kind:'metal',text:'VOCÊ DESPISTOU A CRIATURA. USE AS LOJAS PARA SE ESCONDER.'},3000);
   $('#danger').style.opacity=String(result?Math.max(0,Math.min(.67,(12-result.distance)/17)):0);
   if(result?.caught){beginScene('capture');return;}
   updateObjective(p);
   environmentCue(motion?.update(dt,clock,p,{flashlight:flashOn,alarm}));
   const roomEvent=roomScenes?.update(clock,p,{power:story.phase!=='radio'&&story.phase!=='relay'});
   if(roomEvent)environmentCue(roomEvent,2400);
   missionGuide?.update(p,story.target,clock);
   for(const event of encounters?.update(clock,p)||[])environmentCue(event);
   fps.frames++;fps.second+=elapsed;adjustQuality(elapsed);
   if(fps.second>=1){$('#fps').textContent=`${Math.round(fps.frames/fps.second)} FPS`;fps.frames=0;fps.second=0;drawMap(p)}
  }else if(!started){
   camera.position.set(Math.sin(t*.00015)*.10,1.62,13);camera.rotation.set(Math.sin(t*.00019)*-.025,Math.sin(t*.0001)*.035,0);
  }
 }
 flashlight.visible=flashOn;
 flashlight.position.copy(camera.position);const direction=vec(0,0,-1).applyEuler(camera.rotation);flashlight.target.position.copy(camera.position).add(direction.multiplyScalar(13));
 stage?.update(clock,alarm);
 if(stage?.isSecurityPassable()&&!physics?.securityGateUnlocked)physics.unlockSecurityGate();
 if(exitOpen&&stage?.isExitPassable()&&!physics?.exitUnlocked)physics.unlockExit();
 renderer.render(scene,camera);
}
async function boot(){
 try{renderSetup();inputSetup();requestAnimationFrame(frame);
  status.textContent='Carregando física Rapier (WASM)…';
  physics=await BreuPhysics.create();
  const n=physics.staticBodies.length;
  status.textContent=`ALA 03 PRONTA · ${n} corpos físicos · Three.js + Rapier`;
  $('#play').disabled=false;
  window.__breuReady=true;
 }catch(e){showError(e)}
}
window.addEventListener('blur',()=>{if(started&&!paused)pause();keys.clear();joystick.x=joystick.y=0});
boot();
