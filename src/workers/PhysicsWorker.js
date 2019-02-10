import KinematicBodies from 'workers/physics-bodies/KinematicBodies';
import DynamicBodies from 'workers/physics-bodies/DynamicBodies';
import StaticBodies from 'workers/physics-bodies/StaticBodies';
import HingeBodies from 'workers/physics-bodies/HingeBodies';
// import VehicleBody from 'workers/physics-bodies/VehicleBody';

import ClothBodies from 'workers/physics-bodies/ClothBodies';
import SoftBodies from 'workers/physics-bodies/SoftBodies';
import RopeBodies from 'workers/physics-bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from 'physics/constants';
import Logger from 'utils/Logger';
import { Ammo } from 'core/Ammo';

const capitalize = (string) => {
  return `${string.charAt(0).toUpperCase()}${string.toLowerCase().slice(1)}`;
};

let physics = null;

class PhysicsWorker {
  constructor (soft) {
    this.clock = new Clock();
    // this.vehicles = [];

    if (soft) {
      this._initSoftWorld();
    } else {
      this._initRigidWorld();
    }
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

  initBodies (type) {
    this[`_init${capitalize(type)}Bodies`]();

    if (!this.clock) {
      this.clock = new Clock();
      requestAnimationFrame(this._startSimulation.bind(this));
    }
  }

  _startSimulation () {
    console.log(':D');
    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);
    requestAnimationFrame(this._startSimulation.bind(this));
  }

  _initSoftBodies () {
    this.soft = new SoftBodies(this.world);
  }

  _initRopeBodies () {
    this.rope = new RopeBodies(this.world);
  }

  _initHingeBodies () {
    this.hinge = new HingeBodies(this.world);
  }

  _initClothBodies () {
    this.cloth = new ClothBodies(this.world);
  }

  _initStaticBodies () {
    this.static = new StaticBodies(this.world);
  }

  _initDynamicBodies () {
    this.dynamic = new DynamicBodies(this.world);
  }

  _initKinematicBodies () {
    this.kinematic = new KinematicBodies(this.world);
  }

  addBody (props) {
    const method = `add${props.collider}`;
    this[props.type][method](props);

    const hasBody = this[props.type].bodies && this[props.type].bodies.length === 1;
    const isStatic = typeof this[props.type].update === undefined;

    if (!isStatic && hasBody) {
      this[props.type].update(this.transform);
    }
  }

  updateBodies (type) {
    this[type].update(this.transform);
  }

  updateConstants (props) {
    const constants = props.constants;

    for (const constant in constants) {
      this[props.type][constant] = constants[constant];
    }
  }
}

self.addEventListener('message', (event) => {
  const action = event.data.action;
  const params = event.data.params;

  if (physics) {
    physics[action](params);
  } else if (action === 'init') {
    physics = new PhysicsWorker(params[0]);
  } else {
    const array = typeof params === 'object';
    const args = params.length && array ? params.join(', ') : !array ? params : '';

    Logger.error(
      `Cannot call PhysicsWorker.${action}(${args})`,
      'PhysicsWorker is not initialized.'
    );
  }
});
