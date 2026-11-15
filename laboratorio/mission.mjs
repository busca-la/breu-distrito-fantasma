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
 radio:{target:'radio',title:'DESCUBRA POR QUE AS SAÍDAS TRAVARAM',detail:'Um funcionário correu para o MINATO, à esquerda. Há um rádio de emergência na bancada. Descubra o que aconteceu.',action:'OUVIR TRANSMISSÃO'},
 relay:{target:'relay',title:'RESTABELEÇA O CIRCUITO DAS SAÍDAS',detail:'O rádio explicou a pane: entre na loja DENKI, à direita, e religue o disjuntor para liberar a central.',action:'RELIGAR ENERGIA'},
 security:{target:'panel',title:'ACIONE O PORTÃO PELA CENTRAL',detail:'O disjuntor iluminou a ala e levantou a grade. Entre na sala de segurança ao fim do corredor.',action:'ABRIR SAÍDA'},
 escape:{target:'exit',title:'FUJA ENQUANTO O PORTÃO SE ABRE',detail:'O alarme atraiu a criatura. Corra e ATRAVESSE a abertura de incêndio assim que o portão subir.',action:'ATRAVESSAR PORTÃO'},
 done:{target:null,title:'VOCÊ ESCAPOU',detail:'',action:''}
});
export const STORY_RADIO='TRANSMISSÃO 03: o apagão travou todas as saídas. O circuito auxiliar fica na DENKI. NÃO SIGA UNIFORMES NA ESCURIDÃO. ELE ESCUTA PASSOS.';
export const CHECKPOINTS=Object.freeze({
 radio:{x:0,z:13},
 relay:{x:0,z:-8},
 security:{x:0,z:-23},
 escape:{x:14.1,z:-51.1},
 done:{x:20.7,z:-51}
});
export class BreuStory {
 constructor(){this.phase='radio';this.visited=new Set();}
 get current(){return STORY_STEPS[this.phase];}
 get target(){return this.current.target;}
 get checkpoint(){return CHECKPOINTS[this.phase];}
 advance(action){
  const next={radio:'relay',relay:'security',security:'escape',escape:'done'};
  const accepted={radio:'radio',relay:'relay',security:'panel',escape:'exit'};
  if(accepted[this.phase]!==action)return false;
  this.visited.add(action);
  this.phase=next[this.phase];
  return true;
 }
}
