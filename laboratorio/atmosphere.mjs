import * as THREE from 'three';

// Authored, reproducible faults, not random full-screen flashes. Player progress
// and Rapier colliders are untouched. Important LEDs use local emissive meshes;
// only three small fill lights are active (no extra shadows).
export const LED_SITES=Object.freeze([
 {x:-3.35,z:-10.8,c:'#b77457',label:'MINATO'},
 {x:3.36,z:-8.4,c:'#8bb4aa',label:'KINO'},
 {x:-3.34,z:-22.0,c:'#7c9ab1',label:'A-07'},
 {x:3.36,z:-27.2,c:'#79b8c9',label:'DENKI'},
 {x:-3.35,z:-34.7,c:'#d07a93',label:'GAME 99'},
 {x:3.35,z:-39.3,c:'#95b29d',label:'PHARMACY'},
 {x:-3.35,z:-47.2,c:'#cca06e',label:'MAINTENANCE'},
 {x:11.42,z:-51.2,c:'#d0bba2',label:'SECURITY'},
 {x:-2.86,z:6.9,c:'#b9c5bb',label:'GALLERY ENTRY'},
 {x:2.82,z:-2.8,c:'#97b4ad',label:'GALLERY CROSSING'},
 {x:2.78,z:-18.0,c:'#a4b9b6',label:'RETAIL JUNCTION'},
 {x:-2.82,z:-43.5,c:'#9eaaa6',label:'SERVICE GALLERY'}
]);
export const SMOKE_ZONES=Object.freeze([
 {x:-7.4,z:-12.8,sx:1.0,sz:.85,kind:'kitchen steam'},
 {x:2.6,z:-17.8,sx:.75,sz:1.3,kind:'ceiling condensation'},
 {x:-7.0,z:-35.2,sx:1.3,sz:1.5,kind:'dusty arcade'},
 {x:6.9,z:-40.3,sx:.75,sz:1.1,kind:'pharmacy vapour'},
 {x:-7.7,z:-48.0,sx:1.0,sz:1.3,kind:'pipe leak'}
]);
export function faultIntensity(time,seed=0){
 const cycle=(time+seed*6.73)%17.9;
 // 0–11 s works; 11–13 s strains; a brief low-power failure; then restart.
 if(cycle<10.8)return .90+.045*Math.sin(time*1.21+seed);
 if(cycle<12.0)return (Math.sin(time*17.7+seed)>-.4?.88:.23);
 if(cycle<12.7)return .065;
 if(cycle<13.7)return Math.sin(time*26+seed)>-.08?1:.12;
 return .85+.07*Math.sin(time*2+seed);
}
function smokeTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=(x+0.5-size/2)/(size/2),dy=(y+0.5-size/2)/(size/2);
  const radial=Math.max(0,1-dx*dx-dy*dy);
  const a=Math.pow(radial,2.6);
  const i=(y*size+x)*4;
  data[i]=184;data[i+1]=195;data[i+2]=194;data[i+3]=Math.round(a*255);
 }
 const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 t.needsUpdate=true;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;
 return t;
}
export function createAtmosphere(scene,{lowPower=false}={}){
 const darkMetal=new THREE.MeshStandardMaterial({color:'#344147',metalness:.65,roughness:.4});
 const ledGeometry=new THREE.BoxGeometry(.12,.1,1);
 const lampGeometry=new THREE.BoxGeometry(.52,.16,.32);
 const leds=[],faults=[],tinyLights=[];
 for(const [index,site] of LED_SITES.entries()){
  const mat=new THREE.MeshStandardMaterial({color:site.c,emissive:new THREE.Color(site.c),emissiveIntensity:.48,metalness:.1,roughness:.32});
  const led=new THREE.Mesh(ledGeometry,mat);
  led.name='Storefront damaged LED / '+site.label;
  led.position.set(site.x,2.55,site.z);
  led.scale.set(1,1,2.15);
  scene.add(led);
  const collar=new THREE.Mesh(lampGeometry,darkMetal);
  // Set the steel housing behind the visible diodes, never over the glow.
  collar.position.set(site.x+Math.sign(site.x)*.16,2.58,site.z);
  collar.scale.set(.62,.8,4.6);scene.add(collar);
  leds.push({led,mat,index,site});
 }
 // Only a few authentic point sources: emissive strips communicate the rest.
 for(const p of [LED_SITES[0],LED_SITES[3],LED_SITES[4]]){
  const light=new THREE.PointLight(p.c,1.15,4.8,2);
  light.position.set(p.x-Math.sign(p.x)*.5,2.40,p.z);
  light.castShadow=false;scene.add(light);
  tinyLights.push({light,site:p});
 }
 // Thin wet patches are instanced surface detail, not furniture or colliders.
 const waterGeo=new THREE.CircleGeometry(1,20);
 const waterMat=new THREE.MeshStandardMaterial({
  color:'#354448',roughness:.19,metalness:.51,transparent:true,opacity:.33,
  depthWrite:false,side:THREE.DoubleSide
 });
 const wetPlaces=[[-2.1,10],[1.7,3.2],[1.9,-7],[-1.55,-12.8],[-2.2,-22.6],
  [1.6,-26.2],[-2.1,-33.5],[2.1,-38.8],[-1.9,-45.7],[2.0,-50.2]];
 const water=new THREE.InstancedMesh(waterGeo,waterMat,wetPlaces.length);
 water.name='Subtle wet floor patches';
 const temp=new THREE.Object3D();
 wetPlaces.forEach(([x,z],i)=>{temp.position.set(x,.053,z);temp.rotation.x=-Math.PI/2;
  temp.rotation.z=i*.33;temp.scale.set(.36+(i%3)*.14,.54+(i%4)*.12,1);
  temp.updateMatrix();water.setMatrixAt(i,temp.matrix);
 });
 water.instanceMatrix.needsUpdate=true;water.computeBoundingSphere();scene.add(water);
 // Billboards use a soft 64px DataTexture. No GPU particle simulation,
 // shadows, depth-writing or full-screen postprocessing.
 const smokeMap=smokeTexture(),clouds=[];
 const smokeCount=lowPower?10:23;
 for(let z=0;z<SMOKE_ZONES.length;z++){
  const zone=SMOKE_ZONES[z],seeds=[];
  const positions=new Float32Array(smokeCount*3);
  for(let j=0;j<smokeCount;j++)seeds.push({u:((j*41+z*23)%101)/101,
    v:((j*67+z*17)%97)/97,velocity:.06+j%7*.013,drift:Math.sin((j+1)*19.17)*.26});
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.PointsMaterial({
   map:smokeMap,color:'#a3b3b0',size:lowPower?1.08:1.27,transparent:true,
   alphaTest:.012,opacity:lowPower?.095:.12,depthWrite:false,depthTest:true,
   sizeAttenuation:true,blending:THREE.NormalBlending
  });
  const plume=new THREE.Points(geo,material);
  plume.name='Localized volumetric-style smoke '+zone.kind;
  plume.frustumCulled=false;scene.add(plume);clouds.push({zone,seeds,positions,geo,material,plume});
 }
 let lastBuzz=-100,lastSteam=-100;
 function update(time,player,{active=true}={}){
  if(!active)return [];
  const events=[];
  for(const {mat,index} of leds)mat.emissiveIntensity=.40*faultIntensity(time,index+1);
  for(let i=0;i<tinyLights.length;i++){
   const light=tinyLights[i].light;
   light.intensity=1.05*faultIntensity(time,i+1);
  }
  const visible=!!player;
  for(const c of clouds){
   const d=visible?Math.hypot(player.x-c.zone.x,player.z-c.zone.z):999;
   c.plume.visible=d<(lowPower?10:14);
   if(!c.plume.visible)continue;
   for(let j=0;j<c.seeds.length;j++){
    const q=c.seeds[j],at=j*3;
    const rise=(q.v+time*q.velocity*.16)%1;
    c.positions[at]=c.zone.x+Math.sin(j*4.91)*c.zone.sx*.5+q.drift*Math.sin(time*.35+j);
    c.positions[at+1]=.16+rise*2.65;
    c.positions[at+2]=c.zone.z+Math.cos(j*2.73)*c.zone.sz*.46+Math.sin(time*.22+j)*.11;
   }
   c.geo.attributes.position.needsUpdate=true;
   c.material.opacity=.12*(1-Math.min(1,d/16)*.62);
  }
  if(visible){
   if(time-lastBuzz>11&&Math.abs(player.z+18)<9){
    lastBuzz=time;events.push({kind:'ballast',text:'O REATOR DA LUMINÁRIA ESTÁ FALHANDO.'});
   }else if(time-lastSteam>17&&SMOKE_ZONES.some(z=>Math.hypot(player.x-z.x,player.z-z.z)<4)){
    lastSteam=time;events.push({kind:'steam',text:'VAPOR SAI DE UMA TUBULAÇÃO AVARIADA.'});
   }
  }
  return events;
 }
 return {update,clouds,leds,tinyLights};
}
