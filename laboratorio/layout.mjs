// BREU laboratory level: one authored shopping wing. Measurements are meters.
// The collision shell and visual shell are generated from the SAME structures.
export const WING = Object.freeze({ entrance: {x:0,z:13}, exit:{x:20.8,z:-51}, panel:{x:15.5,z:-51.4}, ceiling:4.35 });
const wall=(name,x,z,w,d,h=4.35,material='concrete')=>({name,x,z,w,d,h,material});
export const WALLS = [
  wall('north seal',0,18,21.6,.55),
  wall('west outer',-10.8,-19, .55,75),
  wall('east outer upper',10.8,-14.2,.55,64.4),
  wall('south seal',0,-57.2,21.6,.6),
  wall('north divider left',-3.65,7, .28,21.5,4.35,'tile'),
  wall('left shutter A',-3.65,-6.5,.32,5.0,4.35,'tile'),
  wall('left divider B',-3.65,-18.7,.32,11.7,4.35,'tile'),
  wall('left divider C',-3.65,-36.0,.32,22.3,4.35,'tile'),
  wall('left room north',-7.3,-7.8,6.6,.28),
  wall('left room south',-7.3,-15.35,6.6,.28),
  wall('left arcade north',-7.3,-30.2,6.6,.28),
  wall('left arcade south',-7.3,-39.6,6.6,.28),
  wall('right divider A north of restroom',3.65,13.05,.32,9.9,4.35,'tile'),
  wall('right divider A south of restroom',3.65,-5.8,.32,21.2,4.35,'tile'),
  // Public restroom is an actual room behind a 3.3 m entrance on the east side.
  wall('restroom far wall',7.2,10.0,6.65,.25,4.35,'tile'),
  wall('restroom near wall',7.2,1.8,6.65,.25,4.35,'tile'),
  wall('restroom stall partition 1',9.22,4.38,2.52,.11,2.35,'tile'),
  wall('restroom stall partition 2',9.22,7.48,2.52,.11,2.35,'tile'),
  wall('right divider B',3.65,-22.1,.32,9.0,4.35,'tile'),
  wall('right divider C',3.65,-38.1,.32,16.5,4.35,'tile'),
  wall('right room north',7.2,-23.55,6.8,.28),
  wall('right room south',7.2,-31.25,6.8,.28),
  // South-east service wing. No open horizon at the connection.
  wall('east service upper',11.65,-46.6,14.9,.45),
  wall('east service lower',11.65,-56.9,14.9,.45),
  wall('service gate north',19.3,-47.8,.48,2.6),
  wall('service gate south',19.3,-55.0,.48,4.2),
  wall('exit vestibule back',22.3,-51.0,.48,4.6),
  wall('exit vestibule north',20.75,-48.85,3.5,.38),
  wall('exit vestibule south',20.75,-53.15,3.5,.38),
  wall('right end main',7.35,-55.15,7.0,.5),
  wall('security north',15.45,-48.1,7.6,.25),
  wall('security south',15.45,-54.6,7.6,.25),
  wall('security west A',11.45,-48.85,.25,1.4),
  wall('security west B',11.45,-53.7,.25,1.45),
];
export const CEILINGS=[
 {name:'gallery roof',x:0,z:-19.6,w:21.55,d:75.4,h:4.35},
 {name:'service roof',x:11.55,z:-51.65,w:15.85,d:10.7,h:4.35},
];
export const STORE_SIGNS=[
 {name:'みなと食堂',sub:'MINATO · NOODLES',type:'ramen',side:-1,z:-10.9,accent:'#e59c73',lit:true},
 {name:'KINO',sub:'USED CAMERAS',type:'camera',side:1,z:-8.5,accent:'#b1d0c1',lit:false},
 {name:'A-07',sub:'ARCHIVE / WEAR',type:'fashion',side:-1,z:-22,accent:'#a9b6c4',lit:false},
 {name:'DENKI',sub:'ELECTRONICS',type:'electronics',side:1,z:-26.8,accent:'#9bc4d4',lit:true},
 {name:'薬局',sub:'PHARMACY',type:'pharmacy',side:1,z:-39.4,accent:'#b6c3a9',lit:false},
 {name:'GAME 99',sub:'ARCADE HALL',type:'arcade',side:-1,z:-34.6,accent:'#bd7c93',lit:true},
 {name:'STAFF ONLY',sub:'MAINTENANCE',type:'maintenance',side:-1,z:-47.5,accent:'#d4b77d',lit:false},
];
export const RESTROOM=Object.freeze({door:{x:3.65,z:6.42},centre:{x:5.85,z:6.0},stallCount:3});
export const INTERACTION={panel:{x:15.5,y:1.37,z:-51.4,r:1.75},exit:{x:21.05,y:1.45,z:-51.0,r:1.12}};
export const PROPS = [
 {name:'restroom sink bank',x:5.25,z:2.52,w:1.6,d:.64,h:.89,blocking:true},
 {name:'restroom supply trolley',x:5.3,z:8.75,w:.66,d:.68,h:1.25,blocking:true},
 {name:'restroom toilet cubicle 1',x:9.40,z:3.06,w:.65,d:.74,h:.51,blocking:true},
 {name:'restroom toilet cubicle 2',x:9.40,z:6.02,w:.65,d:.74,h:.51,blocking:true},
 {name:'restroom toilet cubicle 3',x:9.40,z:8.82,w:.65,d:.74,h:.51,blocking:true},
 {name:'sealed west renovation',x:-2.20,z:-18.6,w:2.70,d:1.65,h:2.85,blocking:true},
 {name:'sealed east renovation',x:2.20,z:-18.6,w:2.70,d:1.65,h:2.32,blocking:true},
 {name:'fallen rack',x:-1.70,z:-3.0,w:1.25,d:.55,h:.8,blocking:true},
 {name:'electric cabinet',x:2.70,z:-16.4,w:.6,d:1.1,h:1.8,blocking:true},
 {name:'collapsed kiosk',x:-1.9,z:-24.0,w:1.65,d:1.2,h:1.15,blocking:true},
 {name:'stacked crates',x:2.45,z:-37.0,w:.9,d:1.2,h:1.24,blocking:true},
 {name:'trolley',x:-1.9,z:-43.3,w:1.35,d:.7,h:.95,blocking:true},
 {name:'ramen counter',x:-7,z:-13.3,w:3.2,d:.85,h:1.07,blocking:true},
 {name:'electronics counter',x:7,z:-29.0,w:3,d:.85,h:1.2,blocking:true},
 {name:'security desk',x:16.2,z:-53.6,w:2.15,d:.6,h:1.04,blocking:true}
];
// Openings on the inner corridor must stay clear of purely visual wall panels.
// The geometry and visual decoration read the same portal definitions.
export const OPEN_PORTALS=[
 {name:'public restroom entrance',side:1,zMin:4.82,zMax:8.08},
 {name:'ramen access',side:-1,zMin:-12.84,zMax:-9.02},
 {name:'electronics access',side:1,zMin:-29.84,zMax:-26.61},
 {name:'service junction',side:1,zMin:-55.0,zMax:-46.37},
];
export function facadePanelAllowed(side,z,halfLength=2.43){
 return !OPEN_PORTALS.some(p=>p.side===side&&z+halfLength>p.zMin&&z-halfLength<p.zMax);
}
export const PLAYER_RADIUS=.33;
export function solidAt(x,z,r=PLAYER_RADIUS, items=WALLS){return items.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);}
export function circleFits(x,z,r=PLAYER_RADIUS){return !solidAt(x,z,r) && !PROPS.filter(p=>p.blocking).some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);}
export function corridorTestPath(){return [[0,13],[0,-5],[0,-18],[0,-34],[0,-51],[5,-51],[11,-51],[15.5,-51.4],[18,-51],[20.8,-51]];}
