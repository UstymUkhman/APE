import KinematicBodies from './bodies/KinematicBodies';
import DynamicBodies from './bodies/DynamicBodies';
import StaticBodies from './bodies/StaticBodies';
// import HingeBodies from './bodies/HingeBodies';

// import ClothBodies from './bodies/ClothBodies';
// import SoftBodies from './bodies/SoftBodies';
// import RopeBodies from './bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from 'physics/constants';
import Ammo from 'core/Ammo';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    this.clock = new Clock();
    this._gravity = gravity;

    if (soft) {
      this.initSoftWorld();
    } else {
      this.initRigidWorld();
    }

    this.kinematic = new KinematicBodies(this.world);
    this.dynamic = new DynamicBodies(this.world);
    this.static = new StaticBodies(this.world);
  }

  initSoftWorld () {
    /* eslint-disable new-cap */
    const broadphase = new Ammo.btDbvtBroadphase();
    const softSolver = new Ammo.btDefaultSoftBodySolver();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softSolver);
    this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    this.world.setGravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    this.transform = new Ammo.btTransform();
    /* eslint-enable new-cap */
  }

  initRigidWorld () {
    /* eslint-disable new-cap */
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    this.world.setGravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    this.transform = new Ammo.btTransform();
    /* eslint-enable new-cap */
  }

  update () {
    this.kinematic.update(this.transform);
    this.dynamic.update(this.transform);

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);
  }

  // destroy () {
  //   delete this.kinematic;
  //   delete this.dynamic;
  //   delete this.static;
  //   delete this.hinge;

  //   delete this.cloth;
  //   delete this.soft;
  //   delete this.rope;

  //   delete this.worker;
  //   delete this.clock;
  // }
}
