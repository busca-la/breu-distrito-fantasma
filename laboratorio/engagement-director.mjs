export class EngagementDirector{
 constructor(){
  this.resolve=0;this.visited=new Set();this.chain=0;this.lastDiscovery=-100;
  this.lastPhase='radio';this.nearMiss=false;this.closest=999;this.boostUntil=0;this.fullAwarded=false;
 }
 addResolve(amount,time){
  this.resolve=Math.min(100,this.resolve+amount);
  if(this.resolve>=100&&!this.fullAwarded){this.fullAwarded=true;this.boostUntil=Math.max(this.boostUntil,time+9);return true}
  return false;
 }
 update(time,{room=null,phase='radio',threat=null,flashState='normal'}={}){
  const events=[];
  if(room&&!this.visited.has(room)){
   this.visited.add(room);
   this.chain=time-this.lastDiscovery<24?Math.min(4,this.chain+1):1;
   this.lastDiscovery=time;
   const full=this.addResolve(9+this.chain*3,time);
   events.push({kind:full?'reward-full':'discovery',text:full?'FOCO TOTAL — VOCÊ RECUPEROU O FÔLEGO.':`DESCOBERTA ${this.chain}× — ${room.toUpperCase()} REVELADO.`});
  }
  if(phase!==this.lastPhase){
   this.lastPhase=phase;
   const full=this.addResolve(18,time);
   events.push({kind:full?'reward-full':'objective-reward',text:full?'FOCO TOTAL — CORRA ENQUANTO CONSEGUE.':'PROGRESSO REALIZADO — SUA CORAGEM AUMENTOU.'});
  }
  if(threat?.chasing&&threat.distance<4.5){this.nearMiss=true;this.closest=Math.min(this.closest,threat.distance)}
  if(threat?.lost&&this.nearMiss){
   const bonus=this.closest<1.8?28:this.closest<3?22:16;
   const full=this.addResolve(bonus,time);
   this.boostUntil=Math.max(this.boostUntil,time+(this.closest<2.2?7:5));
   events.push({kind:full?'reward-full':'near-miss',text:this.closest<2.2?'ESCAPOU POR UM FIO — FÔLEGO EXTRA!':'VOCÊ DESPISTOU A CRIATURA — CONTINUE EM MOVIMENTO.'});
   this.nearMiss=false;this.closest=999;
  }
  if(flashState==='recovery'&&this.resolve<100)this.resolve=Math.min(100,this.resolve+.025);
  return events;
 }
 speedMultiplier(time){return time<this.boostUntil?1.18:1}
 snapshot(time){return {resolve:Math.round(this.resolve),chain:this.chain,boosting:time<this.boostUntil,boostRemaining:Math.max(0,this.boostUntil-time),visited:this.visited.size}}
}
