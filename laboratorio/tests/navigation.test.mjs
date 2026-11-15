import test from 'node:test';
import assert from 'node:assert/strict';
import {circleFits,OPEN_PORTALS,facadePanelAllowed,WALLS,PROPS} from '../layout.mjs';
import {buildNavigation} from '../threat-nav.mjs';
const nav=buildNavigation();

test('monster can travel from storefronts to service area without walking through walls',()=>{
 const destinations=[[0,13],[0,-33],[0,-51],[15.5,-51.4],[20.8,-51]];
 assert(nav.nodes.length>1000);
 for(const [x,z] of destinations)assert(circleFits(x,z,.4),`Point obstructed: ${x},${z}`);
 for(const [ax,az] of destinations)for(const [bx,bz] of destinations){
  const path=nav.route({x:ax,z:az},{x:bx,z:bz});
  assert(path.length>0,`No path between ${ax},${az} and ${bx},${bz}`);
  for(const p of path)assert(circleFits(p.x,p.z,.41),`Nav crossed collider at ${p.x},${p.z}`);
  for(let i=1;i<path.length;i++)assert(Math.hypot(path[i].x-path[i-1].x,path[i].z-path[i-1].z)<.72,'Navigation jumped over an obstacle');
 }
});

test('visual wall-cladding does not hide an accessible storefront',()=>{
 assert.equal(OPEN_PORTALS.length,3);
 for(const portal of OPEN_PORTALS){
  const middle=(portal.zMin+portal.zMax)/2;
  assert(!facadePanelAllowed(portal.side,middle,.3),`${portal.name} covered by wall panel`);
  assert(facadePanelAllowed(-portal.side,middle,.05)||OPEN_PORTALS.some(p=>p.side===-portal.side&&p.zMin<middle&&p.zMax>middle),'Unexpected opposite opening');
 }
});

test('all map boundaries have physical walls and gameplay props are not phantom',()=>{
 assert(WALLS.some(w=>w.name==='west outer'));
 assert(WALLS.some(w=>w.name==='exit vestibule back'));
 assert(PROPS.every(p=>!p.blocking||p.w>0&&p.h>0&&p.d>0));
 for(let z=-55;z<15;z+=2){assert(!circleFits(-11,z,.32),`West shell breached at ${z}`)}
});
