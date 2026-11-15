// Walkable-grid routefinder used by the experimental monster. Uses identical
// solidAt/circleFits geometry as the player, not an invisible bespoke maze.
import {circleFits} from './layout.mjs';
const CELL=.68,MIN_X=-10.45,MAX_X=22.06,MIN_Z=-56.90,MAX_Z=17.67;
export function buildNavigation(){
 const cols=Math.floor((MAX_X-MIN_X)/CELL)+1,rows=Math.floor((MAX_Z-MIN_Z)/CELL)+1;
 const nodes=[],lookup=new Int32Array(cols*rows).fill(-1);
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const x=MIN_X+i*CELL,z=MIN_Z+j*CELL;
  if(!circleFits(x,z,.43))continue;
  lookup[j*cols+i]=nodes.length;nodes.push({x,z,i,j});
 }
 const neighbors=nodes.map(p=>{
  const ids=[];
  for(const [di,dj] of [[1,0],[0,1],[-1,0],[0,-1]]){
   const i=p.i+di,j=p.j+dj;if(i<0||j<0||i>=cols||j>=rows)continue;
   const k=lookup[j*cols+i];if(k>=0)ids.push(k);
  }return ids;
 });
 function closest(x,z){let best=-1,min=Infinity;
  for(let k=0;k<nodes.length;k++){const n=nodes[k],d=(x-n.x)**2+(z-n.z)**2;if(d<min){min=d;best=k}}
  return best;
 }
 function route(a,b){
  if(!nodes.length)return [];
  const start=closest(a.x,a.z),end=closest(b.x,b.z);
  if(start<0||end<0)return [];
  const prev=new Int32Array(nodes.length).fill(-1),queue=[start];prev[start]=start;
  for(let h=0;h<queue.length&&prev[end]<0;h++){
   const current=queue[h];for(const n of neighbors[current])if(prev[n]<0){prev[n]=current;queue.push(n)}
  }
  if(prev[end]<0)return [];
  const indices=[];for(let i=end;i!==start;i=prev[i])indices.push(i);indices.push(start);indices.reverse();
  return indices.map(i=>({x:nodes[i].x,z:nodes[i].z}));
 }
 return {nodes,neighbors,closest,route,cols,rows};
}
let nav;
export function getNavigation(){return nav??(nav=buildNavigation())}
