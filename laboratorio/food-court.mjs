import * as THREE from 'three';

export const BASEMENT_Y=-4.4;
export const FOOD_COURT_COLLIDERS=Object.freeze([
 {name:'upper atrium south floor',x:15.1,y:-.28,z:4.7,w:8.6,h:.56,d:5.2},
 {name:'upper atrium north floor',x:15.1,y:-.28,z:12.0,w:8.6,h:.56,d:5.2},
 {name:'food court floor',x:27,y:-4.68,z:4,w:16,h:.56,d:24},
 {name:'food court east wall',x:35,y:-2.2,z:4,w:.5,h:4.4,d:24},
 {name:'food court north wall',x:27,y:-2.2,z:16,w:16,h:4.4,d:.5},
 {name:'food court south wall',x:27,y:-2.2,z:-8,w:16,h:4.4,d:.5},
 {name:'food court west wall north',x:19,y:-2.2,z:12.65,w:.5,h:4.4,d:6.7},
 {name:'food court west wall south',x:19,y:-2.2,z:-.65,w:.5,h:4.4,d:14.7},
 {name:'upper atrium south railing',x:15.2,y:.5,z:7.25,w:8.1,h:1,d:.08},
 {name:'upper atrium north railing',x:15.2,y:.5,z:9.45,w:8.1,h:1,d:.08},
 ...Array.from({length:13},(_,i)=>({name:'food court stair '+(i+1),x:11.25+i*.62,y:-.14-i*.35,z:8,w:.66,h:.28,d:2.45})),
 ...[-4.7,1,7,12.7].map((z,i)=>({name:'food vendor counter '+(i+1),x:33.5,y:-3.72,z,w:2.15,h:1.25,d:3.7})),
 ...Array.from({length:12},(_,i)=>({name:'food court table '+(i+1),x:21.2+(i%3)*3.4,y:BASEMENT_Y+.38,z:-4.5+Math.floor(i/3)*4.7,w:1.1,h:.76,d:1.1}))
]);

export function createFoodCourt(scene,{lowPower=false}={}){
 const concrete=new THREE.MeshStandardMaterial({color:'#4f5858',roughness:.96});
 const tile=new THREE.MeshStandardMaterial({color:'#777b73',roughness:.52,metalness:.08});
 const steel=new THREE.MeshStandardMaterial({color:'#4d595c',roughness:.48,metalness:.68});
 const wood=new THREE.MeshStandardMaterial({color:'#644839',roughness:.84});
 const plastic=new THREE.MeshStandardMaterial({color:'#6b3435',roughness:.74});
 const dark=new THREE.MeshStandardMaterial({color:'#182124',roughness:.9});
 const warm=new THREE.MeshStandardMaterial({color:'#d1a477',emissive:'#6e3d25',emissiveIntensity:.48,roughness:.4});
 const sick=new THREE.MeshStandardMaterial({color:'#91aaa0',emissive:'#38564f',emissiveIntensity:.35,roughness:.38});
 const items=[];
 const box=(name,x,y,z,w,h,d,mat=concrete)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.name=name;o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=false;scene.add(o);items.push(o);return o};
 // Expanded ground-floor overlook around the stair opening.
 box('upper atrium south ceramic floor',15.1,.01,4.7,8.6,.12,5.2,tile);
 box('upper atrium north ceramic floor',15.1,.01,12.0,8.6,.12,5.2,tile);
 for(const [z,side] of [[7.25,'south'],[9.45,'north']]){
  box('upper atrium '+side+' handrail',15.2,1.0,z,8.1,.08,.08,steel);
  for(let x=11.4;x<19;x+=1.05)box('upper atrium railing post',x,.52,z,.06,1,.06,steel);
 }
 box('FOOD COURT / B1 hanging sign',13.4,2.65,10.1,3.6,.55,.12,dark);
 box('FOOD COURT sign glow',13.4,2.65,10.02,3.0,.18,.025,warm);
 // Physical staircase and side rails use the same measurements as Rapier.
 for(let i=0;i<13;i++){
  const x=11.25+i*.62,top=-i*.35;
  box('food court visible stair',x,top-.14,8,.66,.28,2.45,tile);
 }
 for(const z of [6.72,9.28]){
  const rail=box('food court stair rail',15.0,-1.52,z,8.4,.07,.07,steel);rail.rotation.z=-Math.atan2(4.2,7.45);
 }
 // Lower floor shell, ceiling and columns.
 box('food court lower terrazzo',27,BASEMENT_Y-.06,4,16,.12,24,tile);
 box('food court lower ceiling',27,-.12,4,16,.18,24,dark);
 for(const [x,z] of [[20,-7.75],[34,-7.75],[20,15.75],[34,15.75]])box('food court structural column',x,-2.2,z,.48,4.4,.48,concrete);
 // Four distinct food counters around a central seating court.
 const counters=[
  {name:'KARAAGE 24',x:33.5,z:-4.7,c:warm},{name:'CAFÉ LUMEN',x:33.5,z:1.0,c:sick},
  {name:'BENTO LINE',x:33.5,z:7.0,c:warm},{name:'SWEET VOID',x:33.5,z:12.7,c:sick}
 ];
 for(const stall of counters){
  box(stall.name+' service counter',stall.x,-3.72,stall.z,2.15,1.25,3.7,steel);
  box(stall.name+' dark kitchen recess',34.55,-2.15,stall.z,.22,2.15,3.35,dark);
  box(stall.name+' illuminated fascia',33.75,-1.10,stall.z,.24,.48,3.5,stall.c);
  for(let k=-1;k<=1;k++)box(stall.name+' menu panel',33.57,-2.12,stall.z+k*.92,.05,.72,.64,k===0?stall.c:dark);
 }
 // Tables and chairs are instanced: a populated silhouette at two draw calls.
 const tableGeo=new THREE.CylinderGeometry(.67,.60,.08,14),chairGeo=new THREE.BoxGeometry(.48,.08,.48);
 const tableCount=12,tableMesh=new THREE.InstancedMesh(tableGeo,wood,tableCount);
 const chairMesh=new THREE.InstancedMesh(chairGeo,plastic,tableCount*3);tableMesh.name='Food court instanced round tables';chairMesh.name='Food court instanced chairs';
 const temp=new THREE.Object3D();let chairIndex=0;
 for(let i=0;i<tableCount;i++){
  const x=21.2+(i%3)*3.4,z=-4.5+Math.floor(i/3)*4.7;
  temp.position.set(x,BASEMENT_Y+.76,z);temp.rotation.set(0,i*.31,0);temp.updateMatrix();tableMesh.setMatrixAt(i,temp.matrix);
  for(let c=0;c<3;c++){const a=c*Math.PI*2/3+i*.17;temp.position.set(x+Math.cos(a)*1.05,BASEMENT_Y+.49,z+Math.sin(a)*1.05);temp.rotation.set(0,-a,0);temp.updateMatrix();chairMesh.setMatrixAt(chairIndex++,temp.matrix)}
 }
 tableMesh.instanceMatrix.needsUpdate=true;chairMesh.instanceMatrix.needsUpdate=true;tableMesh.computeBoundingSphere();chairMesh.computeBoundingSphere();scene.add(tableMesh,chairMesh);items.push(tableMesh,chairMesh);
 // Local pools of light make the lower floor readable without lighting upstairs.
 const lights=[];
 for(const [x,z,color] of [[22,-4,'#d39a72'],[27,1,'#8fb4a9'],[22,7,'#c78c69'],[28,12,'#91aaa0']]){
  const lamp=new THREE.PointLight(color,lowPower?5:9,8,2.2);lamp.position.set(x,-1.05,z);lamp.castShadow=false;scene.add(lamp);lights.push(lamp);
  box('food court pendant shade',x,-.82,z,.72,.12,.72,steel);
 }
 return {items,lights,counters,tableCount,colliders:FOOD_COURT_COLLIDERS};
}
