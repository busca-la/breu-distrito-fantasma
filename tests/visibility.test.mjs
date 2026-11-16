import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BRIGHTNESS_PRESETS,DEFAULT_BRIGHTNESS,normalizeBrightness,getVisibilityPreset} from '../laboratorio/visibility.mjs';

assert.equal(BRIGHTNESS_PRESETS.length,4);
assert.equal(DEFAULT_BRIGHTNESS,2,'Default must be the readable Claro profile');
for(const invalid of [null,undefined,'',NaN,'garbage']){
 assert.equal(normalizeBrightness(invalid),DEFAULT_BRIGHTNESS,'Invalid or missing setting must not start pitch black');
}
assert.equal(normalizeBrightness(-5),0);
assert.equal(normalizeBrightness(99),3);
for(let i=1;i<BRIGHTNESS_PRESETS.length;i++){
 const prev=BRIGHTNESS_PRESETS[i-1],curr=BRIGHTNESS_PRESETS[i];
 assert(curr.exposure>prev.exposure,'Brightness must increase exposure');
 assert(curr.ambient>prev.ambient,'Brightness must raise real scene ambient lighting');
 assert(curr.flashlight>prev.flashlight,'Flashlight must brighten with the preset');
 assert(curr.lighting>=prev.lighting,'Corridor lighting cannot get darker');
 assert(curr.fog<prev.fog,'Higher brightness must reduce excessive fog');
 assert(curr.vignette<prev.vignette,'Higher brightness must reduce dark corners');
}
assert.equal(getVisibilityPreset('2').name,'Claro');
const html=readFileSync(new URL('../laboratorio/index.html',import.meta.url),'utf8');
const main=readFileSync(new URL('../laboratorio/main.mjs',import.meta.url),'utf8');
const level=readFileSync(new URL('../laboratorio/level.mjs',import.meta.url),'utf8');
assert(html.includes('id="brightness-slider"')&&html.includes('id="brightness-value"'));
assert(html.includes('var(--vignette-edge,.39)'),'Dark vignette must be adjustable');
assert(main.includes("localStorage.setItem('breu.brightness.v1'"),'Settings must persist');
assert(main.includes("'input',e=>setBrightness(e.target.value)"),'Slider must update the live scene');
assert(main.includes('stage?.setVisibility(preset)'),'Lighting must change, not just a CSS overlay');
assert(level.includes('lightingBoost'),'Brightness must adjust real practical lighting');
console.log('PASS: 4 perceptually distinct brightness presets, readable default, persisted live slider and scene-light controls');
