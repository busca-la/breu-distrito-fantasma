const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
function part(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a+' missing');return html.slice(i,j)}
const src="class Mesh{cube(){} quad(){} tri(){} cylinder(){}} const color=x=>x;"+
part('const pathDefs=[','const staticWorld=')+part('const BODY_FOOTPRINT=','let navDistances=null')+
"const p={x:0,z:73,level:0,jumpY:0,vy:0};"+part('function collisionAt(','function jump(){')+
part('function moveAxis(dx,dz)','function movement(dt)')+
"({p,moveAxis,navGrid,nearestNode,roomDefs,securityDesk,escapePanel})";
const g=vm.runInNewContext(src,{Math,Map,Set,Int16Array},{timeout:60000}),nodes=g.navGrid.positions,edges=g.navGrid.adj;
const spawn=g.nearestNode(0,73,0);
function route(target){let q=[spawn],parents=new Int32Array(nodes.length).fill(-1);parents[spawn]=spawn;
 for(let i=0;i<q.length;i++){if(q[i]===target)break;for(const x of edges[q[i]])if(parents[x]<0){parents[x]=q[i];q.push(x)}}
 if(parents[target]<0)return null;let path=[];for(let x=target;x!==spawn;x=parents[x])path.push(x);path.push(spawn);return path.reverse()}
let reached=[];
for(const r of [...g.roomDefs,{name:'CENTRAL',x:g.securityDesk.x,z:g.securityDesk.z,w:10,d:10,level:0},{name:'DOCA',x:g.escapePanel.x,z:g.escapePanel.z,w:10,d:10,level:0}]){
 let targets=nodes.map((p,i)=>({...p,id:i})).filter(p=>p.level===r.level&&Math.abs(p.x-r.x)<r.w/2-.2&&Math.abs(p.z-r.z)<r.d/2-.2);
 targets.sort((a,b)=>(a.x-r.x)**2+(a.z-r.z)**2-(b.x-r.x)**2-(b.z-r.z)**2);
 let path=null;for(const t of targets){path=route(t.id);if(path)break}assert(path,r.name+' disconnected');
 g.p.x=0;g.p.z=73;g.p.level=0;g.p.jumpY=0;
 for(const id of path.slice(1)){const t=nodes[id],dx=t.x-g.p.x,dz=t.z-g.p.z,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.075));
  for(let j=0;j<steps;j++)g.moveAxis(dx/steps,dz/steps);
  assert(Math.hypot(g.p.x-t.x,g.p.z-t.z)<.16,r.name+' blocked at node '+id);}
 assert.equal(g.p.level,r.level,r.name+' wrong floor');reached.push(r.name);
}
console.log('PASS: real movement reached '+reached.length+' targets including all 13 rooms');