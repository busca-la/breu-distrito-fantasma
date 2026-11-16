import * as THREE from 'three';

export const FLASHLIGHT_STATES=Object.freeze(['normal','interference','blinking','failure','repair','recovery']);
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};

export class FlashlightFaultMachine{
 constructor({firstFault=24,interval=38}={}){
  this.state='normal';this.started=0;this.nextFault=firstFault;this.interval=interval;
  this.manualOn=true;this.cycle=0;this.hit=0;
 }
 setManual(on){this.manualOn=!!on;return this.manualOn}
 update(time){
  const events=[];
  if(this.state==='normal'&&time>=this.nextFault&&this.manualOn){
   this.state='interference';this.started=time;this.cycle++;events.push('flashlight-static');
  }
  let age=time-this.started;
  const advance=(after,next,event)=>{if(this.state===next)return; if(age>=after){this.state=next;this.started=time;age=0;if(event)events.push(event)}};
  if(this.state==='interference')advance(1.8,'blinking','flashlight-flicker');
  else if(this.state==='blinking')advance(2.15,'failure','flashlight-fail');
  else if(this.state==='failure')advance(1.15,'repair','flashlight-repair');
  else if(this.state==='repair'){
   if(this.hit===0&&age>=.72){this.hit=1;events.push('flashlight-hit')}
   if(this.hit===1&&age>=1.24){this.hit=2;events.push('flashlight-hit')}
   advance(1.75,'recovery','flashlight-restart');
  }else if(this.state==='recovery'&&age>=1.55){
   this.state='normal';this.started=time;this.hit=0;
   this.nextFault=time+this.interval+(this.cycle%3)*7.3;events.push('flashlight-stable');
  }
  age=time-this.started;
  let output=1,repair=0;
  if(this.state==='interference')output=.92-.18*smooth(age/1.8)+Math.sin(time*41)*.055;
  else if(this.state==='blinking')output=Math.sin(time*31+Math.sin(time*7)*2)>.05?.76:.025;
  else if(this.state==='failure')output=0;
  else if(this.state==='repair'){
   repair=clamp(age/1.75);
   output=age<.72?0:age<.82?.55:age<1.24?.04:age<1.34?.72:.06;
  }else if(this.state==='recovery')output=(Math.sin(time*38)>-.35?.45+.55*smooth(age/1.55):.04);
  if(!this.manualOn)output=0;
  return {state:this.state,output:this.manualOn?clamp(output):0,repair,events,manualOn:this.manualOn};
 }
}

export function createFlashlightRig(camera,options={}){
 const machine=new FlashlightFaultMachine(options);
 const rig=new THREE.Group();rig.name='First-person held flashlight rig';rig.renderOrder=30;
 const metal=new THREE.MeshStandardMaterial({color:'#30383a',metalness:.78,roughness:.31});
 const rubber=new THREE.MeshStandardMaterial({color:'#101719',metalness:.08,roughness:.92});
 const glove=new THREE.MeshStandardMaterial({color:'#414a49',roughness:.9});
 const sleeve=new THREE.MeshStandardMaterial({color:'#263136',roughness:.96});
 const lens=new THREE.MeshPhysicalMaterial({color:'#d9d2bb',emissive:'#625b49',emissiveIntensity:.18,roughness:.2,metalness:.05});
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.055,.068,.34,12),metal);body.rotation.z=Math.PI/2;body.name='Held flashlight metal body';rig.add(body);
 const head=new THREE.Mesh(new THREE.CylinderGeometry(.098,.063,.105,14),metal);head.rotation.z=Math.PI/2;head.position.x=-.20;rig.add(head);
 const glass=new THREE.Mesh(new THREE.CircleGeometry(.082,16),lens);glass.rotation.y=-Math.PI/2;glass.position.x=-.256;rig.add(glass);
 for(const x of [-.08,.02,.12]){const grip=new THREE.Mesh(new THREE.TorusGeometry(.062,.008,6,12),rubber);grip.rotation.y=Math.PI/2;grip.position.x=x;rig.add(grip)}
 const holding=new THREE.Group();holding.name='Hand holding own flashlight';
 const palm=new THREE.Mesh(new THREE.BoxGeometry(.15,.19,.12),glove);holding.add(palm);
 const forearm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.42,8),sleeve);forearm.position.set(.11,-.27,.08);forearm.rotation.z=-.34;holding.add(forearm);
 holding.position.set(.09,-.09,.02);rig.add(holding);
 const striking=new THREE.Group();striking.name='Automatic striking hand';
 const strikePalm=new THREE.Mesh(new THREE.BoxGeometry(.17,.20,.11),glove);striking.add(strikePalm);
 const strikeArm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.125,.48,8),sleeve);strikeArm.position.set(.15,-.29,.06);strikeArm.rotation.z=-.42;striking.add(strikeArm);
 for(let i=0;i<4;i++){const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.019,.10,3,5),glove);finger.position.set(-.058+i*.039,.13,-.045);finger.rotation.x=.28;striking.add(finger)}
 striking.visible=false;rig.add(striking);
 rig.position.set(.31,-.28,-.58);rig.rotation.set(-.12,-.12,.04);camera.add(rig);
 function update(time,manualOn=true){
  machine.setManual(manualOn);
  const status=machine.update(time),u=status.repair;
  striking.visible=status.state==='repair';
  if(striking.visible){
   const swing=(u<.41?smooth(u/.41):u<.53?1-smooth((u-.41)/.12):u<.70?smooth((u-.53)/.17):1-smooth((u-.70)/.30));
   striking.position.set(-.47+swing*.39,-.15+swing*.16,.13-swing*.20);
   striking.rotation.set(-.2-swing*.55,.08,.42-swing*.31);
   rig.rotation.z=.04+Math.sin(u*42)*.035*swing;
  }else rig.rotation.z+=(.04-rig.rotation.z)*.22;
  lens.emissiveIntensity=.04+status.output*.28;
  return status;
 }
 return {rig,machine,holding,striking,update,setManual:on=>machine.setManual(on)};
}
