import KinematicBodies from 'workers/physics-bodies/KinematicBodies';
import DynamicBodies from 'workers/physics-bodies/DynamicBodies';
import StaticBodies from 'workers/physics-bodies/StaticBodies';
import HingeBodies from 'workers/physics-bodies/HingeBodies';
// import VehicleBody from 'workers/physics-bodies/VehicleBody';

import ClothBodies from 'workers/physics-bodies/ClothBodies';
import SoftBodies from 'workers/physics-bodies/SoftBodies';
import RopeBodies from 'workers/physics-bodies/RopeBodies';

import { GRAVITY } from 'physics/constants';
import assign from 'lodash/assign';
import Logger from 'utils/Logger';
import { Ammo } from 'core/Ammo';

let physics = null;

class PhysicsWorker {
  constructor (soft) {
    this._soft = soft;
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

  initSoftBodies () {
    this.soft = new SoftBodies(this.world);
  }

  initRopeBodies () {
    this.rope = new RopeBodies(this.world);
  }

  initHingeBodies () {
    this.hinge = new HingeBodies(this.world);
  }

  initClothBodies () {
    this.cloth = new ClothBodies(this.world);
  }

  initStaticBodies () {
    this.static = new StaticBodies(this.world);
  }

  initDynamicBodies () {
    this.dynamic = new DynamicBodies(this.world);
  }

  initKinematicBodies () {
    this.kinematic = new KinematicBodies(this.world);
  }

  addBody (props) {
    const plane = props.collider === 'Plane';
    const staticType = props.type === 'static';
    const boxFallback = this._soft && staticType && plane;
    const method = boxFallback ? 'addBox' : `add${props.collider}`;

    if (boxFallback) {
      assign(props.size, { depth: 1.0 });
      Logger.warn(
        'You\'re using a static plane in a soft world. It may not work as expected.',
        'Static box collider was used automatically as fallback for a PlaneGeometry.'
      );
    }

    this[props.type][method](props);
    const hasBody = this[props.type].bodies && this[props.type].bodies.length === 1;

    if (!staticType && hasBody) {
      this[props.type].update(this.transform, [{
        position: props.position,
        rotation: props.rotation,
        uuid: props.uuid
      }]);
    }
  }

  updateBodies (params) {
    this[params.type].update(this.transform, params.bodies);
    this.world.stepSimulation(params.delta, 10);
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
