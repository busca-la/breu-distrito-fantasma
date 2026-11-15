// Deterministic alarm/escape state. No timer APIs; pauses freeze game time.
export class EscapeSequence {
 constructor(seconds=12){
  if(!(seconds>0))throw new Error('Exit unlocking time must be positive');
  this.delay=seconds;this.triggerTime=null;this.open=false;this.escaped=false;
 }
 activate(time){
  if(this.triggerTime!==null)return false;
  if(!Number.isFinite(time))throw new Error('Invalid game time');
  this.triggerTime=time;return true;
 }
 get active(){return this.triggerTime!==null}
 remaining(time){
  if(!this.active)return this.delay;
  return Math.max(0,this.delay-(time-this.triggerTime));
 }
 update(time){
  if(!this.active||this.open)return false;
  if(this.remaining(time)>0)return false;
  this.open=true;return true;
 }
 finish(){if(!this.open||this.escaped)return false;this.escaped=true;return true}
}

// Real cause-and-effect sequence; no meaningless collectible objects.
// The first broadcast explains why power is missing, and each subsequent
// action changes the geometry or state of the shopping wing.
export const STORY_STEPS=Object.freeze({
 radio:{target:'radio',title:'OUÇA A ÚLTIMA TRANSMISSÃO',detail:'Siga o funcionário até o restaurante MINATO. O rádio está ligado.',action:'OUVIR RÁDIO'},
 relay:{target:'relay',title:'RELIGUE A ENERGIA DE EMERGÊNCIA',detail:'O rádio indicou o disjuntor na loja DENKI, à direita do corredor.',action:'LIGAR DISJUNTOR'},
 security:{target:'panel',title:'ABRA O PORTÃO PELA SEGURANÇA',detail:'A grade da central subiu. Entre e acione a abertura de emergência.',action:'ACIONAR ABERTURA'},
 escape:{target:'exit',title:'FUJA PELO PORTÃO DE INCÊNDIO',detail:'O alarme atraiu a criatura. Atravesse a saída no fim da ala.',action:'SAIR DO SHOPPING'},
 done:{target:null,title:'VOCÊ ESCAPOU',detail:'',action:''}
});
export class BreuStory {
 constructor(){this.phase='radio';this.visited=new Set();}
 get current(){return STORY_STEPS[this.phase];}
 get target(){return this.current.target;}
 advance(action){
  const next={radio:'relay',relay:'security',security:'escape',escape:'done'};
  const accepted={radio:'radio',relay:'relay',security:'panel',escape:'exit'};
  if(accepted[this.phase]!==action)return false;
  this.visited.add(action);
  this.phase=next[this.phase];
  return true;
 }
}
