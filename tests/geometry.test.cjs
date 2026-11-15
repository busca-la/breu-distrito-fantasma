// node tests/geometry.test.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
function chunk(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i);return html.slice(i,j)}
const code="'use strict'; class Mesh{cube(){} cylinder(){} quad(){} tri(){}} const color=x=>x;\n"+
 chunk('const pathDefs=[','const staticMesh=')+chunk('const navGrid=','let navDistances=')+
 ';({roomDefs,connectors,walkable,floorHeight,ceilingHeightAt,shaftRects,constructedSlabs,navGrid,nearestNode,securityDesk,escapePanel})';
const g=vm.runInNewContext(code,{Math,Map,Int16Array},{timeout:30000});
assert.equal(g.connectors.length,3);assert.equal(g.roomDefs.length,13);
for(const slab of g.constructedSlabs)if(['lower-ceiling','upper-floor'].includes(slab.kind))
 for(const shaft of g.shaftRects)
  assert(!(Math.min(slab.bx,shaft.maxX)-Math.max(slab.ax,shaft.minX)>1e-5&&Math.min(slab.bz,shaft.maxZ)-Math.max(slab.az,shaft.minZ)>1e-5),'Stair shaft blocked: '+shaft.name);
for(const c of g.connectors){
 assert(g.walkable(c.x,c.z0,0)&&g.walkable(c.x,c.z1,1));
 assert(Math.abs(g.floorHeight(c.x,c.z0,0))<1e-5);
 assert(Math.abs(g.floorHeight(c.x,c.z1,1)-4.8)<1e-5);
 assert.equal(g.ceilingHeightAt(c.x,(c.z0+c.z1)/2,0),Infinity);
}
assert(!g.walkable(88,0,0)&&!g.walkable(0,190,0));
assert(g.ceilingHeightAt(-31,-14,0)<3.1);
const nav=g.navGrid,start=g.nearestNode(0,73,0),seen=new Set([start]),queue=[start];
for(let i=0;i<queue.length;i++)for(const next of nav.adj[queue[i]])if(!seen.has(next)){seen.add(next);queue.push(next)}
for(const r of g.roomDefs)assert(nav.positions.some((p,i)=>seen.has(i)&&p.level===r.level&&Math.abs(p.x-r.x)<r.w/2&&Math.abs(p.z-r.z)<r.d/2),r.name+' unreachable');
for(const point of [g.securityDesk,g.escapePanel])assert(seen.has(g.nearestNode(point.x,point.z,0)),'Objective unreachable');
console.log('PASS: clear shafts, collision ceilings, sealed bounds, all rooms and escape route connected');
