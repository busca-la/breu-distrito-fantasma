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
 ...Array.from({length:12},(_,i)=>({name:'food court table '+(i+1),x:21.2+(i%3)*3.4,y:BASEMENT_Y+.38,z:-4.5+Math.floor(i/3)*4.7,w:1.1,h:.76,d:1.1})),
 {name:'B1 restroom east wall',x:24.1,y:-2.45,z:14.1,w:.18,h:3.9,d:3.6},
 {name:'B1 restroom front left',x:20.3,y:-2.45,z:12.3,w:2.2,h:3.9,d:.18},
 {name:'B1 restroom front right',x:23.2,y:-2.45,z:12.3,w:1.8,h:3.9,d:.18},
 {name:'B1 restroom sink counter',x:23.65,y:-3.62,z:13.45,w:.58,h:1.05,d:1.65},
 ...[20.55,21.65,22.75].map((x,i)=>({name:'B1 restroom stall divider '+(i+1),x,y:-2.75,z:14.75,w:.10,h:3.1,d:2.1}))
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
 const white=new THREE.MeshStandardMaterial({color:'#aeb8b4',roughness:.42,metalness:.08});
 const glass=new THREE.MeshPhysicalMaterial({color:'#91a9a5',roughness:.17,metalness:.12,transparent:true,opacity:.34,depthWrite:false});
 const items=[];
 const box=(name,x,y,z,w,h,d,mat=concrete)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.name=name;o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=false;scene.add(o);items.push(o);return o};
 // Expanded ground-floor overlook around the stair opening.
 box('upper atrium south ceramic floor',15.1,.01,4.7,8.6,.12,5.2,tile);
 box('upper atrium north ceramic floor',15.1,.01,12.0,8.6,.12,5.2,tile);
 for(const [z,side] of [[7.25,'south'],[9.45,'north']]){
  box('upper atrium '+side+' handrail',15.2,1.0,z,8.1,.08,.08,steel);
  for(let x=11.4;x<19;x+=1.05)box('upper atrium railing post',x,.52,z,.06,1,.06,steel);
 }
 // Wayfinding begins in the original gallery, before the player enters the
 // restroom-side passage. The previous sign was hidden beyond the stair.
 box('B1 FOOD COURT corridor sign',0,3.28,6.5,3.15,.68,.12,dark);
 box('B1 FOOD COURT corridor sign glow',0,3.27,6.42,2.72,.28,.025,warm);
 box('B1 stair doorway left jamb',10.48,1.55,6.62,.32,3.1,.24,steel);
 box('B1 stair doorway right jamb',10.48,1.55,9.38,.32,3.1,.24,steel);
 box('B1 stair doorway lintel',10.48,3.02,8,.32,.22,3.0,steel);
 box('FOOD COURT / B1 hanging sign',13.4,2.65,10.1,3.6,.55,.12,dark);
 box('FOOD COURT sign glow',13.4,2.65,10.02,3.0,.18,.025,warm);
 for(let i=0;i<4;i++){
  const arrow=box('B1 luminous floor arrow',4.8+i*1.55,.075,7.65,.72,.025,.28,warm);
  arrow.rotation.y=i===3?-.25:0;
 }
 const entranceLight=new THREE.PointLight('#d1a477',lowPower?5:10,8,2);
 entranceLight.position.set(8.8,2.35,8);entranceLight.castShadow=false;scene.add(entranceLight);
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
 // Visible shell exactly matches the Rapier boundary; there is no void edge.
 box('food court visible east wall',34.82,-2.2,4,.36,4.4,24,concrete);
 box('food court visible north wall',27,-2.2,15.82,16,4.4,.36,concrete);
 box('food court visible south wall',27,-2.2,-7.82,16,4.4,.36,concrete);
 box('food court visible west wall north',19.18,-2.2,12.65,.36,4.4,6.7,concrete);
 box('food court visible west wall south',19.18,-2.2,-.65,.36,4.4,14.7,concrete);
 for(const [x,z] of [[20,-7.75],[34,-7.75],[20,15.75],[34,15.75]])box('food court structural column',x,-2.2,z,.48,4.4,.48,concrete);
 // Four distinct food counters around a central seating court.
 const counters=[
  {name:'KARAAGE 24',kind:'fryer',x:33.5,z:-4.7,c:warm},{name:'CAFÉ LUMEN',kind:'cafe',x:33.5,z:1.0,c:sick},
  {name:'BENTO LINE',kind:'bento',x:33.5,z:7.0,c:warm},{name:'SWEET VOID',kind:'sweet',x:33.5,z:12.7,c:sick}
 ];
 function labelTexture(title,subtitle,color){
  if(typeof document==='undefined'){
   const data=new Uint8Array([44,58,57,255,126,103,78,255,22,29,31,255,176,151,112,255]);
   const texture=new THREE.DataTexture(data,2,2,THREE.RGBAFormat);texture.needsUpdate=true;return texture;
  }
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const g=canvas.getContext('2d');
  g.fillStyle='#11181b';g.fillRect(0,0,768,192);g.fillStyle=color;g.fillRect(0,0,14,192);
  g.font='700 62px sans-serif';g.fillText(title,38,88);g.font='500 22px sans-serif';g.fillText(subtitle,40,137);
  for(let i=0;i<28;i++){g.fillStyle=i%2?'#1e2829':'#080c0e';g.fillRect((i*97)%760,(i*43)%185,18+i%5*7,3)}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 }
 for(const stall of counters){
  box(stall.name+' service counter',stall.x,-3.72,stall.z,2.15,1.25,3.7,steel);
  box(stall.name+' dark kitchen recess',34.55,-2.15,stall.z,.22,2.15,3.35,dark);
  box(stall.name+' architectural fascia',33.75,-1.10,stall.z,.24,.58,3.5,stall.c);
  const subtitle={fryer:'FRIED CHICKEN / CLOSED',cafe:'COFFEE / LAST ORDER 02:11',bento:'BENTO / COLD STORAGE',sweet:'DESSERTS / POWER FAILURE'}[stall.kind];
  const signMat=new THREE.MeshBasicMaterial({map:labelTexture(stall.name,subtitle,stall.kind==='cafe'?'#9fc8ba':'#d9a176'),side:THREE.DoubleSide});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.15,.78),signMat);sign.name=stall.name+' unique readable sign';sign.position.set(33.58,-1.18,stall.z);sign.rotation.y=-Math.PI/2;scene.add(sign);items.push(sign);
  if(stall.kind==='fryer'){
   box('KARAAGE industrial extraction hood',33.25,-1.95,stall.z,1.1,.35,2.6,steel);
   for(let k=-1;k<=1;k++){box('KARAAGE deep fryer vat',32.92,-3.0,stall.z+k*.72,.72,.42,.55,dark);const basket=box('KARAAGE fryer basket',32.58,-2.72,stall.z+k*.72,.08,.30,.42,steel);basket.rotation.z=-.15;}
  }else if(stall.kind==='cafe'){
   box('CAFE curved wood counter front',32.62,-3.45,stall.z,.42,.82,2.9,wood);
   box('CAFE espresso machine body',32.86,-2.85,stall.z,.72,.62,1.05,white);
   for(const dz of [-.27,.27]){const group=new THREE.Group();group.name='CAFE ceramic cup';const cup=new THREE.Mesh(new THREE.CylinderGeometry(.09,.075,.13,12),white);cup.position.set(32.42,-2.54,stall.z+dz);group.add(cup);scene.add(group);items.push(group)}
  }else if(stall.kind==='bento'){
   box('BENTO refrigerated display',32.55,-3.18,stall.z,.62,.76,2.9,glass);
   for(let k=-1;k<=1;k++)box('BENTO meal tray',32.20,-2.89,stall.z+k*.82,.18,.07,.55,k===0?plastic:white);
   box('BENTO hanging fabric divider',34.35,-2.15,stall.z,.08,1.9,2.4,plastic);
  }else{
   box('SWEET glass cake display',32.55,-3.10,stall.z,.62,.92,2.8,glass);
   for(let k=-1;k<=1;k++){const cake=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.12,14),k===0?plastic:white);cake.name='SWEET abandoned display cake';cake.position.set(32.18,-2.76,stall.z+k*.75);scene.add(cake);items.push(cake)}
   box('SWEET striped canopy',33.20,-1.92,stall.z,.75,.18,3.0,plastic);
  }
 }
 // B1 RESTROOM: enclosed room with a readable door, three stalls, toilets,
 // sinks and mirrors. Every wall/counter has a matching collider above.
 box('B1 restroom east tiled wall',24.1,-2.45,14.1,.18,3.9,3.6,white);
 box('B1 restroom front privacy wall left',20.3,-2.45,12.3,2.2,3.9,.18,white);
 box('B1 restroom front privacy wall right',23.2,-2.45,12.3,1.8,3.9,.18,white);
 box('B1 restroom entrance header',21.75,-.82,12.3,1.25,.34,.22,dark);
 box('B1 RESTROOM illuminated sign',21.75,-.83,12.16,.82,.13,.025,sick);
 box('B1 restroom sink counter',23.65,-3.62,13.45,.58,1.05,1.65,white);
 for(let i=0;i<3;i++){
  const x=20.55+i*1.1;
  box('B1 restroom stall divider',x,-2.75,14.75,.10,3.1,2.1,white);
  const toilet=new THREE.Group();toilet.name='B1 restroom floor-mounted toilet';
  const bowl=new THREE.Mesh(new THREE.TorusGeometry(.22,.075,8,16),white);bowl.rotation.x=Math.PI/2;bowl.position.set(x+.50,BASEMENT_Y+.42,15.08);
  const tank=new THREE.Mesh(new THREE.BoxGeometry(.38,.46,.18),white);tank.position.set(x+.50,BASEMENT_Y+.64,15.56);toilet.add(bowl,tank);scene.add(toilet);items.push(toilet);
 }
 for(let i=0;i<2;i++){
  const z=13.05+i*.76;
  const basin=new THREE.Mesh(new THREE.CylinderGeometry(.22,.17,.13,14),white);basin.name='B1 restroom supported basin';basin.position.set(23.28,BASEMENT_Y+.92,z);basin.rotation.z=Math.PI/2;scene.add(basin);items.push(basin);
  box('B1 restroom stained mirror',23.79,-2.55,z,.025,.72,.56,steel);
 }
 // Tables and chairs are instanced: a populated silhouette at two draw calls.
 const tableGeo=new THREE.CylinderGeometry(.67,.60,.08,14),chairGeo=new THREE.BoxGeometry(.48,.08,.48);
 const tableCount=12,tableMesh=new THREE.InstancedMesh(tableGeo,wood,tableCount);
 const tablePostMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.065,.085,.68,8),steel,tableCount);
 const tableBaseMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.34,.40,.045,12),steel,tableCount);
 const chairMesh=new THREE.InstancedMesh(chairGeo,plastic,tableCount*3);
 const chairBackMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.48,.55,.07),plastic,tableCount*3);
 const chairLegMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.025,.032,.44,6),steel,tableCount*12);
 tableMesh.name='Food court instanced round tables';tablePostMesh.name='Food court table grounded pedestals';tableBaseMesh.name='Food court table floor bases';chairMesh.name='Food court supported chair seats';chairBackMesh.name='Food court chair backs';chairLegMesh.name='Food court chair grounded legs';
 const temp=new THREE.Object3D();let chairIndex=0;
 for(let i=0;i<tableCount;i++){
  const x=21.2+(i%3)*3.4,z=-4.5+Math.floor(i/3)*4.7;
  temp.position.set(x,BASEMENT_Y+.76,z);temp.rotation.set(0,i*.31,0);temp.updateMatrix();tableMesh.setMatrixAt(i,temp.matrix);
  temp.position.set(x,BASEMENT_Y+.38,z);temp.rotation.set(0,0,0);temp.updateMatrix();tablePostMesh.setMatrixAt(i,temp.matrix);
  temp.position.set(x,BASEMENT_Y+.022,z);temp.updateMatrix();tableBaseMesh.setMatrixAt(i,temp.matrix);
  for(let c=0;c<3;c++){
   const a=c*Math.PI*2/3+i*.17,cx=x+Math.cos(a)*1.05,cz=z+Math.sin(a)*1.05;
   temp.position.set(cx,BASEMENT_Y+.49,cz);temp.rotation.set(0,-a,0);temp.updateMatrix();chairMesh.setMatrixAt(chairIndex,temp.matrix);
   temp.position.set(cx+Math.cos(a)*.22,BASEMENT_Y+.76,cz+Math.sin(a)*.22);temp.rotation.set(0,-a,0);temp.updateMatrix();chairBackMesh.setMatrixAt(chairIndex,temp.matrix);
   for(let leg=0;leg<4;leg++){
    const lx=cx+(leg%2?1:-1)*.17,lz=cz+(leg>1?1:-1)*.17;
    temp.position.set(lx,BASEMENT_Y+.22,lz);temp.rotation.set(0,0,0);temp.updateMatrix();chairLegMesh.setMatrixAt(chairIndex*4+leg,temp.matrix);
   }
   chairIndex++;
  }
 }
 for(const batch of [tableMesh,tablePostMesh,tableBaseMesh,chairMesh,chairBackMesh,chairLegMesh]){batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();scene.add(batch);items.push(batch)}
 // Abandonment with a cause: meals and luggage were left mid-use, plants died,
 // and a maintenance barricade points toward the unseen threat route.
 for(const [x,z] of [[20.1,-5.8],[29.7,-2.1],[25.9,10.8]]){
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.32,.25,.42,12),concrete);pot.name='Food court dead planter grounded';pot.position.set(x,BASEMENT_Y+.21,z);scene.add(pot);items.push(pot);
  const branch=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.75,6),wood);branch.name='Food court dead plant';branch.position.set(x,BASEMENT_Y+.78,z);branch.rotation.z=.22;scene.add(branch);items.push(branch);
 }
 for(const [x,z,r] of [[21.2,-4.5,.18],[24.6,.2,-.22],[28,9.6,.31]]){
  const tray=box('Abandoned meal tray',x,BASEMENT_Y+.80,z,.58,.035,.38,dark);tray.rotation.y=r;
  box('Abandoned drink cup',x+.12,BASEMENT_Y+.91,z-.08,.12,.20,.12,white).rotation.y=r;
 }
 // Local pools of light make the lower floor readable without lighting upstairs.
 const lights=[];
 for(const [x,z,color] of [[22,-4,'#d39a72'],[27,1,'#8fb4a9'],[22,7,'#c78c69'],[28,12,'#91aaa0']]){
  const lamp=new THREE.PointLight(color,lowPower?5:9,8,2.2);lamp.position.set(x,-1.05,z);lamp.castShadow=false;scene.add(lamp);lights.push(lamp);
  box('food court pendant shade',x,-.82,z,.72,.12,.72,steel);
 }
 return {items,lights,counters,tableCount,colliders:FOOD_COURT_COLLIDERS};
}
