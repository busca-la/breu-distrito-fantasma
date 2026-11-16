import * as THREE from 'three';
import {INTERACTION} from './layout.mjs';
import {hasLineOfSight} from './perception.mjs';

// A small, diegetic wayfinding label only appears near the actual object.
// The player should not need to guess which unmarked rectangle to press E on.
const DISPLAY={
 radio:['MINATO / COZINHA','RÁDIO DE SOCORRO'],
 relay:['DENKI / ENERGIA','DISJUNTOR AUXILIAR'],
 panel:['SEGURANÇA / B2','COMANDO DO PORTÃO'],
 exit:['SAÍDA DE INCÊNDIO','ATRAVESSE A ABERTURA'],
};
export function guideVisibility(player,at,phase,active){
 if(!active||!player||!at)return false;
 const d=Math.hypot(player.x-at.x,player.z-at.z);
 return d<12.5&&d>0.1&&hasLineOfSight(player,at);
}
function texture(lines){
 const canvas=document.createElement('canvas');
 canvas.width=512;canvas.height=136;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='rgba(12,20,23,.9)';ctx.fillRect(0,0,512,136);
 ctx.fillStyle='#ab9385';ctx.fillRect(0,0,5,136);
 ctx.strokeStyle='#6b7875';ctx.lineWidth=2;ctx.strokeRect(1,1,510,134);
 ctx.textBaseline='middle';
 ctx.fillStyle='#b1b7b0';ctx.font='600 22px sans-serif';
 ctx.fillText(lines[0],26,37,462);
 ctx.fillStyle='#e8e8df';ctx.font='bold 33px sans-serif';
 ctx.fillText(lines[1],25,90,468);
 const result=new THREE.CanvasTexture(canvas);
 result.colorSpace=THREE.SRGBColorSpace;
 return result;
}
export function createMissionGuide(scene){
 const records={};
 const ringGeometry=new THREE.RingGeometry(.39,.51,24);
 for(const [phase,lines] of Object.entries(DISPLAY)){
  const at=INTERACTION[phase];
  const material=new THREE.SpriteMaterial({map:texture(lines),transparent:true,depthTest:true,depthWrite:false,opacity:1});
  const label=new THREE.Sprite(material);
  label.name='Mission instruction / '+phase;
  label.position.set(at.x,Math.max(2.35,at.y+1.35),at.z);
  label.scale.set(3.15,.84,1);
  label.visible=false;scene.add(label);
  const ringMat=new THREE.MeshBasicMaterial({color:'#b5cfc5',transparent:true,opacity:.52,side:THREE.DoubleSide,depthWrite:false});
  const ring=new THREE.Mesh(ringGeometry,ringMat);
  ring.name='Floor marker / '+phase;ring.rotation.x=-Math.PI/2;
  ring.position.set(at.x,.048,at.z);ring.visible=false;scene.add(ring);
  records[phase]={label,ring,at};
 }
 function update(pos,phase,time){
  for(const [key,visual] of Object.entries(records)){
   const visible=guideVisibility(pos,visual.at,key,key===phase);
   visual.label.visible=visible;
   visual.ring.visible=visible;
   if(visible){
    visual.label.position.y=Math.max(2.35,visual.at.y+1.35)+Math.sin(time*2.5)*.06;
    visual.ring.scale.setScalar(1+.07*Math.sin(time*3.1));
    visual.ring.material.opacity=.50+.12*Math.sin(time*3.1);
   }
  }
 }
 return {update,records};
}
