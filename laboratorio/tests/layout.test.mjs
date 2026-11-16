import assert from 'node:assert/strict';
import {WALLS, CEILINGS, PROPS, WING, circleFits, corridorTestPath, INTERACTION,STORE_SIGNS} from '../layout.mjs';
assert(WALLS.length>=20,'Missing wall segments');
assert(CEILINGS.length===2,'All ceilings must be documented');
assert(STORE_SIGNS.length===7,'Store identity regression');
assert(PROPS.filter(p=>p.blocking).length>=8,'Collidable set missing');
const perimeterNames=['north seal','west outer','east outer north','east outer south','south seal','east service upper','east service lower','service gate north','service gate south','exit vestibule back'];
for(const name of perimeterNames)assert(WALLS.some(w=>w.name===name),`Open outer boundary: ${name}`);
// Cross section must be sealed by roof (no see-through to void).
for(let z=-56;z<=17;z+=1)for(let x=-10;x<=10;x+=1){
  assert(CEILINGS.some(c=>Math.abs(x-c.x)<c.w/2&&Math.abs(z-c.z)<c.d/2),`Roof gap at ${x},${z}`);
}
for(const [x,z] of corridorTestPath())assert(circleFits(x,z,.30),`Intended route obstructed at ${x},${z}`);
assert(circleFits(INTERACTION.panel.x,INTERACTION.panel.z,.24),'Control panel blocked');
assert(circleFits(INTERACTION.exit.x,INTERACTION.exit.z,.24),'Exit blocked');
assert(circleFits(19.3,-51,.26),'Emergency door aperture sealed by outer walls');
for(let z=-55;z<16;z+=2){assert(!circleFits(-10.8,z,.32),'West wall leak '+z)}
for(const p of PROPS)assert(WALLS.every(w=>!(Math.abs(p.x-w.x)<(p.w+w.w)/2-.1&&Math.abs(p.z-w.z)<(p.d+w.d)/2-.1)),`Prop clips wall: ${p.name}`);
console.log('PASS: roof coverage, sealed perimeter, 7 distinct shops, 8 solids, intended corridor and objective paths');
