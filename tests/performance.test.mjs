import assert from 'node:assert/strict';
import {AdaptivePerformance} from '../laboratorio/adaptive-performance.mjs';

const slow=new AdaptivePerformance({min:.58,max:1.4,initial:1.25});
let decision;
for(let i=0;i<70;i++)decision=slow.sample(31)||decision;
assert(decision.ratio<1.25&&decision.profile==='performance');
assert(decision.shadowStride>=3,'Slow devices must amortize flashlight shadow rendering');
for(let i=0;i<1000;i++)slow.sample(40);
assert(slow.ratio>=.58,'Resolution must remain bounded and legible');
const fast=new AdaptivePerformance({min:.7,max:1.5,initial:1});
for(let i=0;i<700;i++)fast.sample(8);
assert(fast.ratio>1,'Fast displays should spend headroom on image quality');
assert.equal(fast.shadowStride,1);
console.log('PASS: adaptive frame budget preserves quality on fast displays and scales safely on slow devices');
