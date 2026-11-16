import {build} from 'esbuild';
import {readFile,writeFile,copyFile,mkdir,rm,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const file=p=>resolve(root,p);
for(const test of ['tests/geometry.test.cjs','tests/playthrough.test.cjs','tests/enemy.test.cjs','tests/environment-motion.test.mjs','tests/live-encounters.test.mjs','tests/physics-movement.test.mjs','tests/story-access.test.mjs','tests/gameplay-coherence.test.mjs','tests/visibility.test.mjs']){
 execFileSync(process.execPath,[file(test)],{cwd:root,stdio:'inherit',timeout:90000});
}

await rm(file('dist'),{recursive:true,force:true});
await mkdir(file('dist/laboratorio'),{recursive:true});
await copyFile(file('index.html'),file('dist/index.html'));
for(const filename of ['favicon.ico','favicon.svg','vp-mark.svg']){
  try{await stat(file(filename));await copyFile(file(filename),file('dist/'+filename))}catch{}
}
const html=await readFile(file('laboratorio/index.html'),'utf8');
if(!html.includes('src="./game.js"'))throw Error('Laboratory page must use bundled game.js');
await writeFile(file('dist/laboratorio/index.html'),html);
await build({
 entryPoints:[file('laboratorio/main.mjs')],
 outfile:file('dist/laboratorio/game.js'),
 bundle:true,format:'esm',platform:'browser',target:['es2020'],
 minify:true,legalComments:'none',logLevel:'warning',
});
const js=await readFile(file('dist/laboratorio/game.js'),'utf8');
if(js.length<250000)throw Error('Bundle unexpectedly small: '+js.length);
if(/from\s*["']https?:\/\//.test(js))throw Error('Remote module import detected in built output');
console.log('BREU: generated dist/index.html, dist/laboratorio/index.html, bundled game.js ('+Math.round(js.length/1024)+' KiB).');
