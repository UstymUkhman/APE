import { GRAVITY, DISABLE_DEACTIVATION } from './constants';
import { Clock } from 'three/src/core/Clock';
import { Ammo } from 'core/Ammo';

// import KinematicBodies from 'physic/KinematicBodies';
import DynamicBodies from 'physic/DynamicBodies';
// import StaticBodies from 'physic/StaticBodies';

export default class PhysicWorld {
  constructor () {
    this.initAmmoWorld();
    this.clock = new Clock();

    // this.static = new StaticBodies();
    this.dynamic = new DynamicBodies(this.world);
    // this.kinematic = new KinematicBodies();
  }

  initAmmoWorld () {
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    this.world.setGravity(new Ammo.btVector3(0.0, GRAVITY, 0.0));
    this.transform = new Ammo.btTransform();
  }

  update () {
    this.dynamic.update(this.transform);

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);
  }
}
