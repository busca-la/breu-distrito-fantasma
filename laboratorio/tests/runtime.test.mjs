import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {STORE_SIGNS,facadePanelAllowed,circleFits,WALLS,CEILINGS,PROPS,WING,INTERACTION} from '../layout.mjs';
import {getNavigation} from '../threat-nav.mjs';

class Color{constructor(value){this.value=value}set(value){this.value=value;return this}}
let nextMaterialId=0;class Material{constructor(opts={}){Object.assign(this,opts);this.color=new Color(opts.color);this.uuid='mock-'+(++nextMaterialId)}clone(){return new Material({...this,color:this.color.value})}}
class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}}
class G{constructor(...v){this.v=v;this.parameters={}}dispose(){}}
class BoxGeom extends G{constructor(w=1,h=1,d=1){super(w,h,d);this.type='BoxGeometry';this.parameters={width:w,height:h,depth:d}}}
class Mesh{constructor(geometry,material){this.geometry=geometry;this.material=material;this.isMesh=true;this.position=new Vector3();this.position.set=(x,y,z)=>{this.position.x=x;this.position.y=y;this.position.z=z};this.rotation={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z},copy(v){this.x=v.x;this.y=v.y;this.z=v.z}};this.scale={x:1,y:1,z:1,set(x,y,z){this.x=x;this.y=y;this.z=z}};this.name=''}}
class Lamp{constructor(color,intensity){this.color=color;this.intensity=intensity;this.position=new Vector3();this.position.set=(x,y,z)=>{this.position.x=x;this.position.y=y;this.position.z=z}}}
class Object3D{constructor(){this.position=new Vector3();this.rotation={x:0,y:0,z:0,copy(v){this.x=v.x;this.y=v.y;this.z=v.z}};this.scale={set(){}};this.matrix={}}updateMatrix(){}}
class InstancedMesh extends Mesh{constructor(geometry,material,count){super(geometry,material);this.count=count;this.isInstancedMesh=true;this.instanceMatrix={needsUpdate:false}}setMatrixAt(){}}
class Group{constructor(){this.children=[];this.position=new Vector3();this.position.set=(x,y,z)=>{this.position.x=x;this.position.y=y;this.position.z=z};this.rotation={y:0}}add(x){this.children.push(x)}}
class Texture{constructor(){this.repeat={set(){}}}}
class Curve{constructor(points){this.points=points}}
const THREE={Color,Mesh,InstancedMesh,Object3D,Group,Vector3,CatmullRomCurve3:Curve,CanvasTexture:Texture,
 MeshStandardMaterial:Material,MeshPhysicalMaterial:Material,MeshBasicMaterial:Material,PlaneGeometry:G,BoxGeometry:BoxGeom,CylinderGeometry:G,SphereGeometry:G,TorusGeometry:G,TubeGeometry:G,CircleGeometry:G,PointLight:Lamp,HemisphereLight:Lamp,
 SRGBColorSpace:'srgb',RepeatWrapping:1,DoubleSide:2};
function canvas(){return {width:0,height:0,getContext(){return new Proxy({createRadialGradient(){return {addColorStop(){}}}}, {get(obj,key){return obj[key]??(()=>{})},set(obj,key,value){obj[key]=value;return true}})}}}
const fakeDoc={createElement(){return canvas()}};
function evaluate(file,api,vars={}){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'');
 return vm.runInNewContext(src+'\n;({'+api+'})',{THREE,document:fakeDoc,window:{navigator:{maxTouchPoints:0}},navigator:{maxTouchPoints:0},STORE_SIGNS,facadePanelAllowed,WALLS,CEILINGS,PROPS,WING,INTERACTION,getNavigation,circleFits,Math,Map,Int32Array,...vars},{timeout:12000});
}
test('new detailed storefronts render without covering open physical entrances',()=>{
 const scene={children:[],add(x){this.children.push(x)}};
 const {addArtPass}=evaluate('detail-pass.mjs','addArtPass');
 const pass=addArtPass(scene,{mobile:true});
 assert(pass.count>120,'Art-pass missing major shop assets');
 assert(scene.children.some(x=>x.name==='aged noren cloth curtain'));
 assert(scene.children.some(x=>x.name==='CRT display reflection'));
 assert(scene.children.some(x=>x.name==='fire exit wall-mounted sign'));
 for(const item of scene.children.filter(x=>x.name==='weathered lower corridor tiles')){
  const side=Math.sign(item.position.x);
  assert(facadePanelAllowed(side,item.position.z,2.43),`Decorative wall closed an opening at ${item.position.x},${item.position.z}`);
 }
 assert.doesNotThrow(()=>pass.update(19,false));
 assert.doesNotThrow(()=>pass.update(45,true));
});

test('the threat model spawns within colliders and moves on actual navigable paths',()=>{
 const scene={children:[],add(o){this.children.push(o)}};
 const {createStalker}=evaluate('stalker.mjs','createStalker');
 const threat=createStalker(scene);
 assert(scene.children.includes(threat.group));
 assert(threat.group.children.length>10,'Threat silhouette incomplete');
 let furthest=0;
 for(let i=0;i<500;i++){
  const p=threat.update(.04,{x:15.5,y:.8,z:-51.4},true,i*.04);
  const at=threat.position();
  assert(circleFits(at.x,at.z,.39),'Threat walked through collision at '+JSON.stringify(at));
  furthest=Math.max(furthest,Math.hypot(at.x-.35,at.z+37.8));
 }
 assert(furthest>2,'Enemy did not advance');
});


test('entire 3D scene constructs coherently and the alarm opens the visible exit',()=>{
 const scene={children:[],add(o){this.children.push(o)}};
 const {addArtPass}=evaluate('detail-pass.mjs','addArtPass');
 const {createLevel}=evaluate('level.mjs','createLevel',{addArtPass});
 const stage=createLevel(scene);
 assert(stage.count>600,'Scene should contain more than a greybox');
 assert(stage.interactive.panel && stage.interactive.exit);
 assert(scene.children.some(o=>o.name==='security desk'));
 assert(scene.children.some(o=>o.name==='ramen counter top'));
 assert(scene.children.some(o=>o.name==='public restroom entrance indicator'));
 assert(scene.children.filter(o=>o.name==='toilet rim').length===3);
 assert(scene.children.some(o=>o.name==='fluorescent translucent diffuser'));
 assert(scene.children.some(o=>o.name==='entrance worn porcelain floor'));
 assert(scene.children.some(o=>o.name==='service stained bare concrete floor'));
 assert.doesNotThrow(()=>stage.update(16,false));
 assert.doesNotThrow(()=>stage.update(44,true));
 stage.openExit();assert.equal(stage.interactive.exit.visible,false);
});


test('phone rendering batches repeated static geometry but keeps the emergency door dynamic',()=>{
 const scene={children:[],add(o){this.children.push(o)},remove(o){this.children=this.children.filter(x=>x!==o)}};
 const mobileWindow={navigator:{maxTouchPoints:2}};
 const {addArtPass}=evaluate('detail-pass.mjs','addArtPass');
 const {createLevel}=evaluate('level.mjs','createLevel',{addArtPass,window:mobileWindow,navigator:mobileWindow.navigator});
 const stage=createLevel(scene);
 assert(stage.batching.groups>3,'No batching groups found');
 assert(stage.batching.instances>70,'Insufficient mobile instancing');
 assert(scene.children.some(x=>x.isInstancedMesh),'No GPU instanced meshes');
 assert(scene.children.includes(stage.interactive.exit),'Exit door was merged into static geometry');
 stage.openExit();assert.equal(stage.interactive.exit.visible,false);
});
