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
