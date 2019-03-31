import KinematicBodies from 'workers/bodies/KinematicBodies';
import DynamicBodies from 'workers/bodies/DynamicBodies';
import StaticBodies from 'workers/bodies/StaticBodies';
import HingeBodies from 'workers/bodies/HingeBodies';

import ClothBodies from 'workers/bodies/ClothBodies';
import SoftBodies from 'workers/bodies/SoftBodies';
import RopeBodies from 'workers/bodies/RopeBodies';

import { Vector3 } from 'three/src/math/Vector3';
import differenceBy from 'lodash/differenceBy';

import assign from 'lodash/assign';
import Logger from 'utils/Logger';
import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

let physics = null;

class PhysicsWorker {
  constructor (soft, gravity) {
    this._soft = soft;
    this._gravity = gravity;
    this._collidedBodies = [];

    this._fullReport = false;
    this._reportCollisions = false;

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
    } else if (staticType && plane) {
      Logger.warn(
        'You\'re using a static plane which may have some issues with',
        '\'Concave\' and \'Convex\' rigid bodies and collisions detection.',
        'It\'s recommended to use a BoxGeometry with static box collider instead.'
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

    if (this._reportCollisions) {
      this.checkCollisions();
    }
  }

  checkCollisions () {
    const dispatcher = this.world.getDispatcher();
    const manifolds = dispatcher.getNumManifolds();

    const collisions = new Array(manifolds);
    const collidedBodies = [];

    for (let i = 0; i < manifolds; i++) {
      const manifold = dispatcher.getManifoldByIndexInternal(i);
      const collisionContacts = manifold.getNumContacts();

      let body = manifold.getBody0();
      const body0 = this.getCollisionData(body);

      body = manifold.getBody1();
      const body1 = this.getCollisionData(body);

      collidedBodies.push({ uuid: body0.uuid, type: body0.type, otherUUID: body1.uuid, otherType: body1.type });
      collidedBodies.push({ uuid: body1.uuid, type: body1.type, otherUUID: body0.uuid, otherType: body0.type });

      collisions[i] = { bodies: [body0, body1] };

      if (this._fullReport) {
        collisions[i].contacts = new Array(collisionContacts);
      } else {
        collisions[i].contacts = collisionContacts;
        continue;
      }

      for (let j = 0; j < collisionContacts; j++) {
        const point = manifold.getContactPoint(j);
        const pointDistance = point.getDistance();

        const normal = point.get_m_normalWorldOnB();
        const collisionNormal = new Vector3(normal.x(), normal.y(), normal.z());

        let bodyPoint = point.get_m_localPointA();
        let collisionPoint = point.get_m_positionWorldOnA();
        const body0Point = new Vector3(bodyPoint.x(), bodyPoint.y(), bodyPoint.z());
        const collisionPoint0 = new Vector3(collisionPoint.x(), collisionPoint.y(), collisionPoint.z());

        bodyPoint = point.get_m_localPointB();
        collisionPoint = point.get_m_positionWorldOnB();
        const body1Point = new Vector3(bodyPoint.x(), bodyPoint.y(), bodyPoint.z());
        const collisionPoint1 = new Vector3(collisionPoint.x(), collisionPoint.y(), collisionPoint.z());

        collisions[i].bodies[0].collisionPoint = collisionPoint0;
        collisions[i].bodies[1].collisionPoint = collisionPoint1;

        collisions[i].bodies[0].bodyPoint = body0Point;
        collisions[i].bodies[1].bodyPoint = body1Point;

        collisions[i].contacts[j] = {
          distance: pointDistance,
          normal: collisionNormal
        };
      }
    }

    const lastCollided = differenceBy(this._collidedBodies, collidedBodies, 'uuid');
    this._collidedBodies = collidedBodies;
    const lostCollisions = [];

    lastCollided.forEach((body) => {
      this[body.type].resetCollision(body.uuid);

      lostCollisions.push([{
        uuid: body.otherUUID,
        type: body.otherType
      }, {
        uuid: body.uuid,
        type: body.type
      }]);
    });

    self.postMessage({
      active: !!collisions.length,
      action: 'reportCollisions',
      collisions: collisions,
      lost: lostCollisions
    });
  }

  getCollisionData (body) {
    let data = this.dynamic.getCollisionStatus(body);
    data = this.kinematic.getCollisionStatus(body) || data;
    data = this.static.getCollisionStatus(body) || data;
    return data;
  }

  reportCollisions (report) {
    this._reportCollisions = report[0];
    this._fullReport = report[1];

    self.postMessage({
      action: 'updateCollisionReport',
      params: report
    });
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
    physics = new PhysicsWorker(params[0], params[1]);
  } else {
    const array = typeof params === 'object';
    const args = params.length && array ? params.join(', ') : !array ? params : '';

    Logger.error(
      `Cannot call PhysicsWorker.${action}(${args})`,
      'PhysicsWorker is not initialized.'
    );
  }
});
