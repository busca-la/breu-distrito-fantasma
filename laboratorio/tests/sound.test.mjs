import test from 'node:test';
import assert from 'node:assert/strict';
import {BreuSound} from '../ambient-audio.mjs';
const old=globalThis.window;
class Param{setValueAtTime(){} exponentialRampToValueAtTime(){} linearRampToValueAtTime(){} setTargetAtTime(){} }
class Node{constructor(){this.gain=new Param();this.frequency=new Param()}connect(){}start(){}stop(){} }
class AudioCtx{constructor(){this.sampleRate=8000;this.currentTime=12;this.destination=new Node()}
 createGain(){return new Node()}createOscillator(){return new Node()}createBiquadFilter(){return new Node()}
 createBuffer(n,count){return {getChannelData:()=>new Float32Array(count)}}createBufferSource(){return new Node()}
 resume(){return Promise.resolve()}close(){return Promise.resolve()}
}
test('Web Audio ambience starts from an explicit user interaction and handles mute/pause',async()=>{
 const sound=new BreuSound({AudioContext:AudioCtx});
 await sound.start();assert(sound.playing);
 sound.tick(10,{walking:true,alarm:true});
 sound.setPaused(true);assert(!sound.playing);
 sound.setPaused(false);assert(sound.playing);
 assert.equal(await sound.toggle(),false);assert(!sound.playing);
 assert.equal(await sound.toggle(),true);assert(sound.playing);
 sound.destroy();assert.equal(sound.playing,false);
});
