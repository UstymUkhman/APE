import KinematicBodies from 'workers/bodies/KinematicBodies';
import DynamicBodies from 'workers/bodies/DynamicBodies';
import StaticBodies from 'workers/bodies/StaticBodies';
import HingeBodies from 'workers/bodies/HingeBodies';

import ClothBodies from 'workers/bodies/ClothBodies';
import SoftBodies from 'workers/bodies/SoftBodies';
import RopeBodies from 'workers/bodies/RopeBodies';

import { GRAVITY } from 'physics/constants';
import assign from 'lodash/assign';
import Logger from 'utils/Logger';
import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

let physics = null;

class PhysicsWorker {
  constructor (soft) {
    this._soft = soft;

    if (soft) {
      this.initSoftWorld();
    } else {
      this.initRigidWorld();
    }
  }

  initSoftWorld () {
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

  initRigidWorld () {
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
    let staticType = props.type === 'static';
    const plane = props.collider === 'Plane';

    const boxFallback = this._soft && staticType && plane;
    const method = boxFallback ? 'addBox' : `add${props.collider}`;
    const constants = boxFallback ? this.kinematic.constants : null;

    if (boxFallback) {
      this.kinematic.constants = this.static.constants;
      assign(props.size, { depth: 0.25 });
      props.type = 'kinematic';
      staticType = false;

      Logger.warn(
        'You\'re using a static plane in a soft world. It may not work as expected.',
        'Kinematic box collider was used automatically as fallback for a PlaneGeometry.'
      );
    }

    if (props.type === 'hinge') {
      this.updateHingeProps(props);
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

    if (boxFallback) {
      this.kinematic.constants = constants;
    }
  }

  appendRope (props) {
    let target = find(this.dynamic.bodies, { uuid: props.target });

    if (!target) {
      target = find(this.kinematic.bodies, { uuid: props.target });
    }

    if (!target) {
      target = find(this.static.bodies, { uuid: props.target });
    }

    if (!target) {
      target = find(this.soft.bodies, { uuid: props.target });
    }

    if (!target) {
      Logger.error(
        'Target body was not found.',
        `Make sure to add one of the following bodies to your rope mesh [${props.target}]:`,
        'dynamic (recommended); kinematic; static or soft.'
      );
    }

    props.target = target.body;
    this.rope.append(props);
  }

  appendCloth (props) {
    let target = find(this.dynamic.bodies, { uuid: props.target });
    const cloth = find(this.cloth.bodies, { uuid: props.uuid });

    if (!target) {
      target = find(this.kinematic.bodies, { uuid: props.target });
    }

    if (!target) {
      target = find(this.static.bodies, { uuid: props.target });
    }

    if (!target) {
      target = find(this.soft.bodies, { uuid: props.target });
    }

    if (!cloth) {
      Logger.error(
        'Cloth body was not found.',
        `Make sure your mesh [${props.uuid}] has a cloth collider.`
      );
    }

    if (!target) {
      Logger.error(
        'Target body was not found.',
        `Make sure to add one of the following bodies to your pin mesh [${props.target}]:`,
        'dynamic (recommended); kinematic; static or soft.'
      );
    }

    props.target = target.body;
    this.cloth.append(props);
  }

  updateBodies (props) {
    this[props.type].update(this.transform, props.bodies);
    this.world.stepSimulation(props.delta, 10);
  }

  updateConstants (props) {
    const constants = props.constants;

    for (const constant in constants) {
      this[props.type][constant] = constants[constant];
    }
  }

  updateHingeProps (props) {
    let arm = find(this.dynamic.bodies, { uuid: props.arm });
    let pin = find(this.static.bodies, { uuid: props.pin });

    if (!pin) {
      pin = find(this.kinematic.bodies, { uuid: props.pin });
    }

    if (!pin) {
      pin = find(this.dynamic.bodies, { uuid: props.pin });
    }

    if (!pin) {
      Logger.error(
        'Hinge pin\'s collider was not found.',
        `Make sure to add one of the following bodies to your pin mesh [${props.pin}]:`,
        'static (recommended); kinematic or dynamic.'
      );
    }

    if (!arm) {
      Logger.error(
        'Hinge arm\'s collider was not found.',
        `Make sure to add a dynamic body to your arm mesh [${props.arm}].`
      );
    }

    props.pin = pin.body;
    props.arm = arm.body;
  }

  updateHingeBodies (props) {
    this.hinge.update(props);
  }

  removeBody (props) {
    const found = this[props.type].remove(props);

    if (!found) {
      Logger.warn(
        `There\'s no \'${props.type}\' collider attached to your mesh [${props.uuid}].`
      );
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
