// BREU soundscape: all sound is original procedural synthesis in Web Audio.
// No third-party sounds, downloads, accounts, microphone or streaming needed.
export class BreuSound {
 constructor(win=window){
  this.win=win;this.ctx=null;this.master=null;this.enabled=true;
  this.playing=false;this.lastFootstep=-1;this.lastDrip=-1;
  this.lastVent=-1;this.lastAlarm=-1;this.lastCreak=-1;this.lastRattle=-1;this.noiseBuffer=null;this.oscillators=[];
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
  // Degraded wiring and sheet-metal movement respond to the part of the wing.
  // Sparse one-shots prevent constant noisy looping that masks jumpscares.
  if(zone>=1&&time-this.lastCreak>10.8+zone*.65){
   this.lastCreak=time;
   this.tone(68+zone*7,.48,.018,'sawtooth',now);
   this.tone(91+zone*8,.38,.012,'triangle',now+.16);
   this.filteredNoise(.24,.030,290,now+.11);
  }
  if(zone>=2&&time-this.lastRattle>14.1+zone*.58){
   this.lastRattle=time;
   this.cue('ballast');
  }
  if(alarm&&time-this.lastAlarm>1.8){
   this.lastAlarm=time;this.tone(620,.45,.045,'triangle',now);this.tone(420,.65,.04,'triangle',now+.5);
  }
 }
 // Short spatially implied cues: one-shot synthesis, never a looping sound file.
 cue(kind){
  if(!this.ctx||!this.playing)return;
  const now=this.ctx.currentTime;
  if(kind==='ballast'){
   // Worn fluorescent choke: stuttering high-frequency whine and a click.
   this.tone(1540,.17,.036,'sawtooth',now);
   this.filteredNoise(.16,.045,1650,now+.05);
   this.tone(880,.045,.028,'square',now+.24);
   this.tone(1320,.12,.021,'sawtooth',now+.42);
  }else if(kind==='flashlight-static'||kind==='flashlight-flicker'){
   this.filteredNoise(kind==='flashlight-static'?.7:.32,.075,2100,now);
   this.tone(1320,.11,.028,'sawtooth',now+.06);
   if(kind==='flashlight-flicker')this.tone(610,.045,.04,'square',now+.22);
  }else if(kind==='flashlight-fail'){
   this.tone(970,.07,.05,'square',now);this.tone(210,.24,.035,'sawtooth',now+.06);
  }else if(kind==='flashlight-repair'){
   this.filteredNoise(.30,.048,520,now);
  }else if(kind==='flashlight-hit'){
   this.filteredNoise(.12,.21,330,now);this.tone(118,.27,.14,'triangle',now);
   this.tone(480,.19,.04,'sine',now+.035);
  }else if(kind==='flashlight-restart'||kind==='flashlight-stable'){
   this.tone(920,.08,.04,'square',now);this.filteredNoise(.20,.055,1700,now+.07);
  }else if(kind==='cloth'){
   this.filteredNoise(.24,.043,510,now);
   this.filteredNoise(.18,.028,690,now+.23);
  }else if(kind==='lamp-hit'){
   // Actual gloved strike: soft impact followed by a resonant steel cage.
   this.filteredNoise(.15,.24,390,now);
   this.tone(105,.35,.18,'triangle',now);
   this.tone(410,.48,.052,'sawtooth',now+.042);
   this.tone(610,.28,.035,'sine',now+.12);
  }else if(kind==='lamp-restart'){
   this.tone(1040,.09,.042,'square',now);
   this.filteredNoise(.26,.085,1900,now+.08);
   this.tone(740,.10,.023,'triangle',now+.24);
   this.tone(1310,.19,.023,'sine',now+.32);
  }else if(kind==='steam'){
   this.filteredNoise(1.28,.068,730,now);
   this.filteredNoise(.42,.028,1600,now+.35);
  }else if(kind==='capture'){
   this.tone(48,1.6,.22,'sine',now);
   this.filteredNoise(.68,.19,390,now+.12);
   this.tone(72,.58,.09,'sawtooth',now+.42);
   this.filteredNoise(.9,.14,120,now+1.0);
   this.tone(42,.84,.18,'triangle',now+1.12);
  }else if(kind==='ambush'){
   this.filteredNoise(.38,.15,840,now);
   this.tone(64,.57,.15,'sine',now);
   this.tone(116,.15,.06,'sawtooth',now+.17);
  }else if(kind==='discovery'||kind==='objective-reward'){
   this.tone(330,.10,.025,'sine',now);this.tone(495,.16,.032,'triangle',now+.09);
   this.tone(660,.22,.021,'sine',now+.21);
  }else if(kind==='near-miss'||kind==='reward-full'){
   this.tone(92,.30,.08,'sine',now);this.tone(440,.12,.035,'triangle',now+.08);
   this.tone(660,.18,.038,'triangle',now+.18);this.tone(880,.26,.026,'sine',now+.31);
  }else if(kind==='radio'){
   this.filteredNoise(.95,.12,2400,now);
   this.tone(790,.17,.045,'square',now);
   this.tone(540,.11,.025,'triangle',now+.29);
  }else if(kind==='metal'){
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
 // Device-native speech is optional. Subtitles remain the source of truth
 // where browsers do not expose Portuguese voices or block speech playback.
 radioSpeech(){
  if(!this.enabled||!this.playing)return false;
  const synth=this.win.speechSynthesis,Constructor=this.win.SpeechSynthesisUtterance;
  if(!synth||!Constructor)return false;
  try{
   const u=new Constructor('Portões travados. O disjuntor auxiliar fica na loja Denki. Não siga os uniformes. Não corra. Ele escuta.');
   u.lang='pt-BR';u.rate=.94;u.pitch=.82;u.volume=.75;
   const pt=synth.getVoices?.().find(v=>v.lang?.toLowerCase().startsWith('pt'));
   if(pt)u.voice=pt;
   synth.cancel();
   synth.speak(u);
   return true;
  }catch{return false;}
 }
 setPaused(paused){if(paused)try{this.win.speechSynthesis?.cancel();}catch{}
  if(!this.ctx)return;this.playing=!paused&&this.enabled;
  this.master.gain.setTargetAtTime(paused?.0001:.27,this.ctx.currentTime,.12);
 }
 async toggle(){
  this.enabled=!this.enabled;
  if(this.enabled){await this.start();this.setPaused(false)}
  else if(this.ctx){this.playing=false;try{this.win.speechSynthesis?.cancel();}catch{}this.master.gain.setTargetAtTime(.0001,this.ctx.currentTime,.09)}
  return this.enabled;
 }
 destroy(){for(const o of this.oscillators)o.stop();this.ctx?.close();this.ctx=null;this.oscillators=[];this.playing=false}
}
