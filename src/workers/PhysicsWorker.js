// import KinematicBodies from 'workers/physics-bodies/KinematicBodies';
// import DynamicBodies from 'workers/physics-bodies/DynamicBodies';
import StaticBodies from 'workers/physics-bodies/StaticBodies';
// import HingeBodies from 'workers/physics-bodies/HingeBodies';
// import VehicleBody from 'workers/physics-bodies/VehicleBody';

// import ClothBodies from 'workers/physics-bodies/ClothBodies';
// import SoftBodies from 'workers/physics-bodies/SoftBodies';
// import RopeBodies from 'workers/physics-bodies/RopeBodies';

import { GRAVITY } from 'physics/constants';

import Logger from 'utils/Logger';
import { Ammo } from 'core/Ammo';

let physics = null;

class PhysicsWorker {
  constructor (soft) {
    this.vehicles = [];
    this.softWorld = soft;

    if (soft) {
      this._initSoftWorld();
    } else {
      this._initRigidWorld();
    }

    // this.soft = new SoftBodies(this.world);
    // this.rope = new RopeBodies(this.world);
    // this.cloth = new ClothBodies(this.world);

    // this.hinge = new HingeBodies(this.world);

    // this.dynamic = new DynamicBodies(this.world);
    // this.kinematic = new KinematicBodies(this.world);
  }

  /**
   * @private
   * @description - Initialize dynamics world with soft/rigid bodies
   */
  _initSoftWorld () {
    /* eslint-disable new-cap */
    const broadphase = new Ammo.btDbvtBroadphase();
    const softSolver = new Ammo.btDefaultSoftBodySolver();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softSolver);
    this.world.setGravity(new Ammo.btVector3(0.0, GRAVITY, 0.0));
    this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, GRAVITY, 0.0));
    this.transform = new Ammo.btTransform();
    /* eslint-enable new-cap */
  }

  /**
   * @private
   * @description - Initialize discrete dynamics world with rigid bodies
   */
  _initRigidWorld () {
    /* eslint-disable new-cap */
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    this.world.setGravity(new Ammo.btVector3(0.0, GRAVITY, 0.0));
    this.transform = new Ammo.btTransform();
    /* eslint-enable new-cap */
  }

  initStaticBodies () {
    this.static = new StaticBodies(this.world);
  }

  addStaticPlane (props) {
    this.static.addPlane(props);
  }

  updateStaticConstants (constants) {
    for (const constant in constants) {
      this.static[constant] = constants[constant];
    }
  }
}

self.addEventListener('message', (event) => {
  const action = event.data.action;
  const params = event.data.params;

  // console.log(params);

  if (physics) {
    physics[action](params);
  } else if (action === 'init') {
    physics = new PhysicsWorker(params[0]);
  } else {
    Logger.error('PhysicsWorker is not initialized.');
  }
});

// self.postMessage({ foo: 'foo' });
