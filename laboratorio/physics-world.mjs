import {WALLS, PROPS, CEILINGS, WING, PLAYER_RADIUS} from './layout.mjs';
import {FOOD_COURT_COLLIDERS} from './food-court.mjs';

export function createPhysicsClass(RAPIER){
return class BreuPhysics {
  static async create() {
    await RAPIER.init();
    return new BreuPhysics();
  }
  constructor(){
    this.world=new RAPIER.World({x:0,y:-17.5,z:0});
    this.staticBodies=[];
    this.addFixed('ground',0,-.3,-19.5,22,.6,75.5);
    this.addFixed('service ground',11.6,-.3,-51.7,16,.6,11);
    this.addFixed('emergency vestibule ground',20.8,-.3,-51.0,3.6,.6,4.6);
    for(const w of WALLS)this.addFixed(w.name,w.x,w.h/2,w.z,w.w,w.h,w.d);
    for(const c of CEILINGS)this.addFixed(c.name,c.x,c.h+.13,c.z,c.w,.26,c.d);
    for(const prop of PROPS.filter(p=>p.blocking))this.addFixed(prop.name,prop.x,prop.h/2,prop.z,prop.w,prop.h,prop.d);
    for(const part of FOOD_COURT_COLLIDERS)this.addFixed(part.name,part.x,part.y,part.z,part.w,part.h,part.d);
    this.exitBody=this.addFixed('sealed exit door',19.03,1.62,-51, .28,3.24,3.45);
    // The security office initially has no electricity. Both its physical
    // gate and the visible shutter rise when the auxiliary breaker is used.
    this.securityGateBody=this.addFixed('powered security grille',11.45,1.53,-51.25,.24,3.04,3.38);
    this.securityGateUnlocked=false;
    this.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(WING.entrance.x,.84,WING.entrance.z).lockRotations().setLinearDamping(.4).setCcdEnabled(true));
    this.playerCollider=this.world.createCollider(RAPIER.ColliderDesc.capsule(.45,PLAYER_RADIUS).setFriction(0).setRestitution(0),this.body);
    this.timeStep=1/60;
    this.grounded=false;
    this.exitUnlocked=false;
  }
  addFixed(name,x,y,z,w,h,d){
    const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setFriction(.9),body);
    this.staticBodies.push({name,body});return body;
  }
  position(){return this.body.translation();}
  velocity(){return this.body.linvel();}
  step(move, yaw, jump){
    const velocity=this.body.linvel();
    const speed=(move.sprint?5.6:3.35)*Math.max(1,Math.min(1.22,move.boost||1));
    // Forward in local camera yaw is (-sin(yaw), 0, -cos(yaw)).
    const dx=move.strafe*Math.cos(yaw)-move.forward*Math.sin(yaw);
    const dz=-move.strafe*Math.sin(yaw)-move.forward*Math.cos(yaw);
    const mag=Math.hypot(dx,dz)||1;
    const pos=this.body.translation();
    this.grounded=pos.y<=.81&&Math.abs(velocity.y)<.55;
    this.body.setLinvel({x:dx/mag*speed,y:(jump&&this.grounded?7.25:velocity.y),z:dz/mag*speed},true);
    this.world.timestep=this.timeStep;
    this.world.step();
    return this.body.translation();
  }
  unlockSecurityGate(){
    if(this.securityGateUnlocked)return;
    this.securityGateUnlocked=true;
    this.world.removeRigidBody(this.securityGateBody);
  }
  unlockExit(){
    if(this.exitUnlocked)return;
    this.exitUnlocked=true;
    this.world.removeRigidBody(this.exitBody);
  }
  reset({x=WING.entrance.x,z=WING.entrance.z}={}){
    this.body.setTranslation({x,y:.88,z},true);
    this.body.setLinvel({x:0,y:0,z:0},true);
  }
}

}
