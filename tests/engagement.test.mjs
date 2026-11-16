import assert from 'node:assert/strict';
import {EngagementDirector} from '../laboratorio/engagement-director.mjs';

const d=new EngagementDirector();
let events=d.update(2,{room:'minato',phase:'radio'});
assert(events.some(x=>x.kind==='discovery')&&d.resolve===12);
d.update(10,{room:'denki',phase:'radio'});
assert.equal(d.chain,2,'Fast exploration should build a discovery chain');
d.update(12,{room:'denki',phase:'relay'});
assert(d.resolve>=45,'Story progress must grant meaningful resolve');
d.update(20,{threat:{chasing:true,distance:1.4},phase:'relay'});
events=d.update(22,{threat:{lost:true,distance:12},phase:'relay'});
assert(events.some(x=>x.kind==='near-miss'||x.kind==='reward-full'));
assert(d.speedMultiplier(23)>1,'Near miss must provide a real gameplay advantage');
assert.equal(d.speedMultiplier(40),1,'Boost must be temporary');
const before=d.resolve;d.update(50,{room:'minato',phase:'relay'});assert.equal(d.resolve,before,'Room rewards cannot be farmed');
console.log('PASS: exploration chains, story rewards and near-miss speed boost create a real risk/reward loop');
