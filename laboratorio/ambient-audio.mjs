// BREU soundscape: all sound is original procedural synthesis in Web Audio.
// No third-party sounds, downloads, accounts, microphone or streaming needed.
export class BreuSound {
 constructor(win=window){
  this.win=win;this.ctx=null;this.master=null;this.enabled=true;
  this.playing=false;this.lastFootstep=-1;this.lastDrip=-1;
  this.lastVent=-1;this.lastAlarm=-1;this.noiseBuffer=null;this.oscillators=[];
 }
 async start(){
  if(!this.enabled)return;
  if(this.ctx){await this.ctx.resume();this.playing=true;return;}
  const Ctx=this.win.AudioContext||this.win.webkitAudioContext;
  if(!Ctx)return;
  this.ctx=new Ctx();this.master=this.ctx.createGain();this.master.gain.value=.27;
  this.master.connect(this.ctx.destination);
  const createHum=(freq,gain)=>{
   const osc=this.ctx.createOscillator(),g=this.ctx.createGain();
   osc.type='sine';osc.frequency.value=freq;g.gain.value=gain;
   osc.connect(g);g.connect(this.master);osc.start();this.oscillators.push(osc);
  };
  createHum(47,.028);createHum(53,.015);createHum(102,.009);
  this.noiseBuffer=this.makeNoise(2.5);
  const lfo=this.ctx.createOscillator(),lfoGain=this.ctx.createGain();lfo.frequency.value=.14;lfoGain.gain.value=.008;
  lfo.connect(lfoGain);lfoGain.connect(this.master.gain);lfo.start();this.oscillators.push(lfo);
  this.playing=true;
 }
 makeNoise(seconds=1){
  const sampleRate=this.ctx.sampleRate,n=Math.floor(seconds*sampleRate),b=this.ctx.createBuffer(1,n,sampleRate),v=b.getChannelData(0);
  // Seeded broadband texture. Avoid random bursts during quiet passages.
  let seed=29093;for(let i=0;i<n;i++){seed=(1664525*seed+1013904223)>>>0;v[i]=((seed/4294967296)*2-1)*.24;}
  return b;
 }
 tone(freq,duration,volume,type='sine',when=this.ctx?.currentTime||0){
  if(!this.playing||!this.ctx)return;
  const osc=this.ctx.createOscillator(),g=this.ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,when);g.gain.setValueAtTime(.0001,when);
  g.gain.exponentialRampToValueAtTime(Math.max(.0003,volume),when+.012);
  g.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(g);g.connect(this.master);osc.start(when);osc.stop(when+duration+.01);
 }
 filteredNoise(duration,volume,frequency=420,when=this.ctx?.currentTime||0){
  if(!this.playing||!this.ctx)return;
  const src=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
  src.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=frequency;
  g.gain.setValueAtTime(.0001,when);g.gain.linearRampToValueAtTime(volume,when+.018);
  g.gain.exponentialRampToValueAtTime(.0001,when+duration);
  src.connect(filter);filter.connect(g);g.connect(this.master);
  src.start(when,0,Math.min(2.5,duration+.04));src.stop(when+duration+.03);
 }
 tick(time,{walking=false,sprinting=false,alarm=false,paused=false,zone=0}={}){
  if(!this.playing||paused||!this.ctx)return;
  const now=this.ctx.currentTime;
  if(walking&&time-this.lastFootstep>(sprinting?.27:.44)){
   this.lastFootstep=time;
   this.filteredNoise(.11,sprinting?.14:.085,200+zone*14,now);
   this.tone(74,.09,.015,'sine',now);
  }
  // Distant drain drops, rhythmic fan rattles and intermittent electrical buzz.
  if(time-this.lastDrip>4.8+zone*.39){this.lastDrip=time;this.tone(320+zone*36,.32,.023,'sine',now)}
  if(time-this.lastVent>8.2){this.lastVent=time;this.filteredNoise(1.65,.037,330,now)}
  if(alarm&&time-this.lastAlarm>1.8){
   this.lastAlarm=time;this.tone(620,.45,.045,'triangle',now);this.tone(420,.65,.04,'triangle',now+.5);
  }
 }
 // Short spatially implied cues: one-shot synthesis, never a looping sound file.
 cue(kind){
  if(!this.ctx||!this.playing)return;
  const now=this.ctx.currentTime;
  if(kind==='metal'){
   this.filteredNoise(.32,.16,780,now);
   this.tone(126,.34,.072,'sawtooth',now);
   this.tone(73,.55,.032,'triangle',now+.12);
  }else if(kind==='electric'){
   this.filteredNoise(.27,.11,2500,now);
   this.tone(1200,.12,.08,'square',now);
   this.tone(920,.08,.042,'sawtooth',now+.21);
  }else if(kind==='pursuit'){
   this.tone(55,.62,.12,'sine',now);
   this.tone(67,.48,.085,'triangle',now+.24);
   this.filteredNoise(.45,.06,270,now+.19);
  }else if(kind==='alarm'){
   this.tone(830,.24,.072,'triangle',now);
   this.tone(520,.32,.065,'triangle',now+.27);
  }
 }
 setPaused(paused){if(!this.ctx)return;this.playing=!paused&&this.enabled;
  this.master.gain.setTargetAtTime(paused?.0001:.27,this.ctx.currentTime,.12);
 }
 async toggle(){
  this.enabled=!this.enabled;
  if(this.enabled){await this.start();this.setPaused(false)}
  else if(this.ctx){this.playing=false;this.master.gain.setTargetAtTime(.0001,this.ctx.currentTime,.09)}
  return this.enabled;
 }
 destroy(){for(const o of this.oscillators)o.stop();this.ctx?.close();this.ctx=null;this.oscillators=[];this.playing=false}
}
