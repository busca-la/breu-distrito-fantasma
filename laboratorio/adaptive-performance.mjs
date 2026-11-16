// Keeps detail near the player and spends resolution/shadow work only when the
// device has frame-time headroom. It targets the display cadence; browsers
// cannot render above requestAnimationFrame's refresh-rate ceiling.
export class AdaptivePerformance{
 constructor({min=.58,max=1.4,initial=1,lowPower=false}={}){
  this.min=Math.min(min,max);this.max=max;this.ratio=Math.max(this.min,Math.min(max,initial));
  this.lowPower=lowPower;this.ema=16.7;this.elapsed=0;this.good=0;this.frames=0;
  this.profile=lowPower?'balanced':'quality';this.shadowStride=lowPower?3:1;
 }
 sample(frameMs){
  if(!Number.isFinite(frameMs)||frameMs<=0||frameMs>250)return null;
  this.ema=this.ema*.91+frameMs*.09;this.elapsed+=frameMs;this.frames++;
  if(this.elapsed<1100)return null;
  this.elapsed=0;
  let next=this.ratio;
  if(this.ema>25){next-=.14;this.good=0;this.profile='performance';this.shadowStride=4;}
  else if(this.ema>19){next-=.07;this.good=0;this.profile='balanced';this.shadowStride=this.lowPower?3:2;}
  else if(this.ema<15.3){
   if(++this.good>=3){next+=.055;this.good=0;}
   this.profile='quality';this.shadowStride=this.lowPower?2:1;
  }else{this.good=0;this.profile='quality';this.shadowStride=this.lowPower?2:1;}
  next=Math.max(this.min,Math.min(this.max,next));
  const changed=Math.abs(next-this.ratio)>.012;this.ratio=next;
  return {ratio:this.ratio,changed,profile:this.profile,shadowStride:this.shadowStride,frameMs:this.ema};
 }
 shouldUpdateShadow(frame){return frame%this.shadowStride===0}
}
