// Darkness belongs to the world; the flashlight should dominate the player's view.
// Brightness increases useful detail INSIDE the beam, not flood the whole shopping mall.
export const BRIGHTNESS_PRESETS=Object.freeze([
 Object.freeze({name:'Escuro',exposure:1.13,fog:.027,ambient:.11,lighting:.22,flashlight:47,vignette:.58,edge:.94}),
 Object.freeze({name:'Padrão',exposure:1.28,fog:.023,ambient:.14,lighting:.27,flashlight:55,vignette:.53,edge:.91}),
 Object.freeze({name:'Claro',exposure:1.42,fog:.019,ambient:.18,lighting:.32,flashlight:63,vignette:.48,edge:.87}),
 Object.freeze({name:'Muito claro',exposure:1.56,fog:.015,ambient:.24,lighting:.39,flashlight:71,vignette:.42,edge:.82}),
]);
export const DEFAULT_BRIGHTNESS=2;
export function normalizeBrightness(value){
 if(value===null||value===undefined||value==='')return DEFAULT_BRIGHTNESS;
 const number=Number(value);
 if(!Number.isFinite(number))return DEFAULT_BRIGHTNESS;
 return Math.max(0,Math.min(BRIGHTNESS_PRESETS.length-1,Math.round(number)));
}
export function getVisibilityPreset(value){return BRIGHTNESS_PRESETS[normalizeBrightness(value)];}
