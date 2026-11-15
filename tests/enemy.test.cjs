const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
function part(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a+' missing');return html.slice(i,j)}
const src="class Mesh{cube(){} quad(){} tri(){} cylinder(){}} const color=x=>x;"+
part('const pathDefs=[','const staticMesh=')+part('const BODY_FOOTPRINT=','let navDistances=null')+
"const p={x:-20,z:-27,level:1,jumpY:0,vy:0};"+
part('function collisionAt(','function jump(){')+
"let monster={x:0,z:-16,level:0,heading:0,phase:0};let onlineMode='solo',alarmActive=true,time=0;const friends=new Map();"+
part('let navDistances=null','function threats(dt)')+
"({p,monster,step(dt){time+=dt;enemyStep(dt)}})";
const game=vm.runInNewContext(src,{Math,Map,Set,Int16Array,Int32Array},{timeout:60000});
let climbed=false;
for(let i=0;i<1200;i++){game.step(.04);if(game.monster.level===1)climbed=true}
assert(climbed,'Monster did not reach upper floor');
assert(Math.hypot(game.monster.x-game.p.x,game.monster.z-game.p.z)<8,'Monster lost target on upper floor');
console.log('PASS: monster navigates to second floor and approaches player');