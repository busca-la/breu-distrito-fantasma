import * as THREE from 'three';

const mesh=(geometry,material,name)=>{const o=new THREE.Mesh(geometry,material);o.name=name;o.castShadow=true;o.receiveShadow=true;return o};

export function createHeroRoomModels(scene,{lowPower=false}={}){
 const steel=new THREE.MeshStandardMaterial({color:'#687174',metalness:.72,roughness:.34});
 const black=new THREE.MeshStandardMaterial({color:'#11181b',metalness:.25,roughness:.78});
 const enamel=new THREE.MeshPhysicalMaterial({color:'#b5b1a4',metalness:.08,roughness:.38,clearcoat:.25,clearcoatRoughness:.55});
 const grease=new THREE.MeshStandardMaterial({color:'#322b26',metalness:.18,roughness:.94});
 const wood=new THREE.MeshStandardMaterial({color:'#694a37',roughness:.83});
 const pcb=new THREE.MeshStandardMaterial({color:'#294f42',metalness:.36,roughness:.58});
 const glass=new THREE.MeshPhysicalMaterial({color:'#73a7a8',emissive:'#315f65',emissiveIntensity:.32,metalness:.16,roughness:.18,clearcoat:.65});
 const redGlass=glass.clone();redGlass.color.set('#a94e61');redGlass.emissive.set('#612433');
 const cloth=new THREE.MeshStandardMaterial({color:'#8c473e',roughness:1,side:THREE.DoubleSide});
 const groups=[];
 const minato=new THREE.Group();minato.name='MINATO hero kitchen assembly';
 const counter=mesh(new THREE.BoxGeometry(2.55,.82,.72),steel,'MINATO stainless cooking range');counter.position.set(0,.46,0);minato.add(counter);
 for(let i=-1;i<=1;i++){
  const burner=mesh(new THREE.TorusGeometry(.21,.027,8,20),black,'MINATO cast iron burner');burner.rotation.x=Math.PI/2;burner.position.set(i*.70,.89,0);minato.add(burner);
  const pot=mesh(new THREE.CylinderGeometry(.24,.20,.25,16),i===0?enamel:steel,'MINATO stock pot');pot.position.set(i*.70,1.02,0);minato.add(pot);
  const rim=mesh(new THREE.TorusGeometry(.235,.018,7,18),black,'MINATO pot rim');rim.rotation.x=Math.PI/2;rim.position.set(i*.70,1.15,0);minato.add(rim);
 }
 const backsplash=mesh(new THREE.BoxGeometry(2.65,.72,.055),grease,'MINATO grease-stained backsplash');backsplash.position.set(0,1.22,.36);minato.add(backsplash);
 const duct=mesh(new THREE.CylinderGeometry(.19,.24,1.05,10),steel,'MINATO extractor duct');duct.position.set(0,2.25,.24);minato.add(duct);
 minato.position.set(-8.15,0,-14.18);scene.add(minato);groups.push(minato);
 const noren=new THREE.Group();noren.name='MINATO layered noren entrance';
 for(let i=0;i<5;i++){const panel=mesh(new THREE.PlaneGeometry(.44,1.12,1,3),cloth,'MINATO cloth noren panel');panel.position.set(0,2.27,-.96+i*.48);panel.rotation.y=Math.PI/2;panel.rotation.z=(i-2)*.025;noren.add(panel)}
 noren.position.set(-3.84,0,-10.9);
 scene.add(noren);groups.push(noren);
 const denki=new THREE.Group();denki.name='DENKI hero repair bench';
 const bench=mesh(new THREE.BoxGeometry(2.75,.15,.78),wood,'DENKI worn technician bench');bench.position.y=.82;denki.add(bench);
 for(const x of [-1.08,1.08]){const leg=mesh(new THREE.CylinderGeometry(.055,.07,.78,8),steel,'DENKI tubular bench leg');leg.position.set(x,.41,0);denki.add(leg)}
 for(let i=0;i<2;i++){
  const scope=mesh(new THREE.BoxGeometry(.78,.62,.61),black,'DENKI oscilloscope chassis');scope.position.set(-.65+i*1.30,1.20,0);denki.add(scope);
  const screen=mesh(new THREE.PlaneGeometry(.43,.31),i?redGlass:glass,'DENKI curved oscilloscope glass');screen.position.set(-.65+i*1.30,1.27,-.311);denki.add(screen);
  for(let k=0;k<3;k++){const knob=mesh(new THREE.CylinderGeometry(.035,.035,.04,10),steel,'DENKI instrument knob');knob.rotation.x=Math.PI/2;knob.position.set(-.84+i*1.30+k*.18,1.00,-.33);denki.add(knob)}
 }
 for(let i=0;i<(lowPower?2:4);i++){
  const board=mesh(new THREE.BoxGeometry(.48,.035,.31),pcb,'DENKI exposed circuit board');board.position.set(-.95+i*.62,.94,-.46);board.rotation.y=(i-1.5)*.12;denki.add(board);
  for(let k=0;k<4;k++){const capacitor=mesh(new THREE.CylinderGeometry(.018,.018,.09,6),k%2?redGlass:black,'DENKI board capacitor');capacitor.position.set(board.position.x-.15+k*.1,1.01,board.position.z);denki.add(capacitor)}
 }
 denki.position.set(8.25,0,-24.65);scene.add(denki);groups.push(denki);
 const arcade=new THREE.Group();arcade.name='GAME 99 hero machine island';
 const profile=new THREE.Shape();profile.moveTo(-.52,0);profile.lineTo(.52,0);profile.lineTo(.52,1.38);profile.lineTo(.34,2.0);profile.lineTo(-.42,2.0);profile.lineTo(-.52,1.55);profile.closePath();
 const shell=mesh(new THREE.ExtrudeGeometry(profile,{depth:.78,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:2}),black,'GAME 99 bevelled rhythm cabinet');shell.rotation.y=Math.PI/2;arcade.add(shell);
 const display=mesh(new THREE.PlaneGeometry(.72,.57),redGlass,'GAME 99 large curved display');display.position.set(.395,1.53,.04);display.rotation.y=Math.PI/2;arcade.add(display);
 const deck=mesh(new THREE.BoxGeometry(.46,.13,.72),steel,'GAME 99 sloped control deck');deck.position.set(.47,.92,.04);deck.rotation.z=-.16;arcade.add(deck);
 for(const z of [-.22,0,.22]){const button=mesh(new THREE.CylinderGeometry(.052,.052,.035,12),z===0?glass:redGlass,'GAME 99 illuminated action button');button.rotation.z=Math.PI/2;button.position.set(.72,.99,z+.04);arcade.add(button)}
 const speaker=mesh(new THREE.TorusGeometry(.22,.045,8,20),steel,'GAME 99 speaker grille');speaker.rotation.y=Math.PI/2;speaker.position.set(.43,.47,.04);arcade.add(speaker);
 arcade.position.set(-8.05,.04,-31.45);scene.add(arcade);groups.push(arcade);
 const prize=new THREE.Group();prize.name='GAME 99 prize crane machine';
 const base=mesh(new THREE.BoxGeometry(1.05,.58,.82),steel,'GAME 99 crane base');base.position.y=.31;prize.add(base);
 const transparentGlass=glass.clone();transparentGlass.transparent=true;transparentGlass.opacity=.29;transparentGlass.depthWrite=false;
 const caseGlass=mesh(new THREE.BoxGeometry(.92,1.13,.70),transparentGlass,'GAME 99 crane glass enclosure');caseGlass.position.y=1.15;prize.add(caseGlass);
 const claw=mesh(new THREE.TorusGeometry(.10,.018,5,10),steel,'GAME 99 hanging crane claw');claw.position.set(0,1.52,0);claw.rotation.x=Math.PI/2;prize.add(claw);
 prize.position.set(-8.38,0,-38.30);scene.add(prize);groups.push(prize);
 function updateVisibility(player){
  if(!player)return;
  for(const group of groups){
   const distance=Math.hypot(group.position.x-player.x,group.position.z-player.z);
   group.visible=distance<24;
  }
 }
 return {groups,count:groups.reduce((n,g)=>n+g.children.length,0),updateVisibility};
}
