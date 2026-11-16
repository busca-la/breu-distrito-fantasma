// BREU visibility presets: consistent across exposure, fog, practical lights
// and the screen vignette. Scene complexity stays exactly the same.
export const BRIGHTNESS_PRESETS=Object.freeze([
 Object.freeze({name:'Escuro',exposure:1.12,fog:.029,ambient:.60,lighting:1.07,flashlight:34,vignette:.57}),
 Object.freeze({name:'Padrão',exposure:1.25,fog:.024,ambient:.71,lighting:1.14,flashlight:38,vignette:.49}),
 Object.freeze({name:'Claro',exposure:1.38,fog:.019,ambient:.83,lighting:1.20,flashlight:43,vignette:.39}),
 Object.freeze({name:'Muito claro',exposure:1.53,fog:.014,ambient:.97,lighting:1.28,flashlight:48,vignette:.29}),
]);
export const DEFAULT_BRIGHTNESS=2;
export function normalizeBrightness(value){
 if(value===null||value===undefined||value==='')return DEFAULT_BRIGHTNESS;
 const number=Number(value);
 if(!Number.isFinite(number))return DEFAULT_BRIGHTNESS;
 return Math.max(0,Math.min(BRIGHTNESS_PRESETS.length-1,Math.round(number)));
}
export function getVisibilityPreset(value){
 return BRIGHTNESS_PRESETS[normalizeBrightness(value)];
}
