import KinematicBodies from './bodies/KinematicBodies';
import DynamicBodies from './bodies/DynamicBodies';
import StaticBodies from './bodies/StaticBodies';
import HingeBodies from './bodies/HingeBodies';

import ClothBodies from './bodies/ClothBodies';
import SoftBodies from './bodies/SoftBodies';
import RopeBodies from './bodies/RopeBodies';

import assign from 'lodash/assign';
import Logger from 'utils/Logger';
import find from 'lodash/find';
import Ammo from 'core/Ammo';

let physics = null;

class Physics {
  constructor (soft, gravity) {
    this._soft = soft;
    this._gravity = gravity;

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
    let target = this.dynamic.getBodyByUUID(props.target);

    if (!target) {
      target = this.kinematic.getBodyByUUID(props.target);
    }

    if (!target) {
      target = this.static.getBodyByUUID(props.target);
    }

    if (!target) {
      target = this.soft.getBodyByUUID(props.target);
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
    let target = this.dynamic.getBodyByUUID(props.target);
    const cloth = this.cloth.getBodyByUUID(props.uuid);

    if (!target) {
      target = this.kinematic.getBodyByUUID(props.target);
    }

    if (!target) {
      target = this.static.getBodyByUUID(props.target);
    }

    if (!target) {
      target = this.soft.getBodyByUUID(props.target);
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

    const lastCollisions = {
      kinematic: this.kinematic.getCollisions(),
      dynamic: this.dynamic.getCollisions(),
      static: this.static.getCollisions()
    };

    const collisions = new Array(manifolds);

    this.kinematic.resetCollisions();
    this.dynamic.resetCollisions();
    this.static.resetCollisions();

    for (let i = 0; i < manifolds; i++) {
      const manifold = dispatcher.getManifoldByIndexInternal(i);
      const collisionContacts = manifold.getNumContacts();

      let body = manifold.getBody0();
      const body0 = this.getBodyByCollider(body);

      body = manifold.getBody1();
      const body1 = this.getBodyByCollider(body);

      this[body0.type].addCollision(body0.uuid, body1.uuid);
      this[body1.type].addCollision(body1.uuid, body0.uuid);

      collisions[i] = { bodies: [body0, body1] };

      if (this._fullReport) {
        collisions[i].contacts = new Array(collisionContacts);
      } else {
        collisions[i].contacts = collisionContacts;
        continue;
      }

      for (let j = 0; j < collisionContacts; j++) {
        const point = manifold.getContactPoint(j);
        const impulse = point.getAppliedImpulse();
        const pointDistance = point.getDistance();

        const normal = point.get_m_normalWorldOnB();
        const collisionNormal = { x: normal.x(), y: normal.y(), z: normal.z() };

        let bodyPoint = point.get_m_localPointA();
        let collisionPoint = point.get_m_positionWorldOnA();

        const body0Point = { x: bodyPoint.x(), y: bodyPoint.y(), z: bodyPoint.z() };
        const collisionPoint0 = { x: collisionPoint.x(), y: collisionPoint.y(), z: collisionPoint.z() };

        bodyPoint = point.get_m_localPointB();
        collisionPoint = point.get_m_positionWorldOnB();

        const body1Point = { x: bodyPoint.x(), y: bodyPoint.y(), z: bodyPoint.z() };
        const collisionPoint1 = { x: collisionPoint.x(), y: collisionPoint.y(), z: collisionPoint.z() };

        collisions[i].bodies[0].collisionPoint = collisionPoint0;
        collisions[i].bodies[1].collisionPoint = collisionPoint1;

        collisions[i].bodies[0].bodyPoint = body0Point;
        collisions[i].bodies[1].bodyPoint = body1Point;

        collisions[i].contacts[j] = {
          distance: pointDistance,
          normal: collisionNormal,
          impulse: impulse
        };
      }
    }

    collisions.forEach((collision) => {
      let started = false;
      const body0 = collision.bodies[0];
      const body1 = collision.bodies[1];

      const body0Collisions = find(lastCollisions[body0.type], { uuid: body0.uuid });
      const body1Collisions = find(lastCollisions[body1.type], { uuid: body1.uuid });

      if (body0Collisions) {
        const body0CollisionIndex = body0Collisions.collisions.indexOf(body1.uuid);

        if (body0CollisionIndex > -1) {
          body0Collisions.collisions.splice(body0CollisionIndex, 1);
          started = true;
        }
      }

      if (body1Collisions) {
        const body1CollisionIndex = body1Collisions.collisions.indexOf(body0.uuid);

        if (body1CollisionIndex > -1) {
          body1Collisions.collisions.splice(body1CollisionIndex, 1);
        }
      }

      collision.collisionFunction = started ? 'onCollision' : 'onCollisionStart';
    });

    for (const type in lastCollisions) {
      lastCollisions[type].forEach((body) => {
        body.collisions.forEach((uuid) => {
          const body0 = this.getBodyByUUID(body.uuid);
          const body1 = this.getBodyByUUID(uuid);

          collisions.push({
            collisionFunction: 'onCollisionEnd',
            bodies: [body0, body1],
            contacts: 0
          });
        });
      });
    }

    self.postMessage({
      action: 'reportCollisions',
      count: collisions.length,
      collisions: collisions
    });
  }

  getBodyByCollider (collider) {
    let body = this.dynamic.getBodyInfo(collider, '');
    if (body) return body;

    body = this.kinematic.getBodyInfo(collider, '');
    if (body) return body;

    body = this.static.getBodyInfo(collider, '');
    return body;
  }

  getBodyByUUID (uuid) {
    let body = this.dynamic.getBodyInfo(null, uuid);
    if (body) return body;

    body = this.kinematic.getBodyInfo(null, uuid);
    if (body) return body;

    body = this.static.getBodyInfo(null, uuid);
    return body;
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
    let arm = this.dynamic.getBodyByUUID(props.arm);
    let pin = this.static.getBodyByUUID(props.pin);

    if (!pin) {
      pin = this.kinematic.getBodyByUUID(props.pin);
    }

    if (!pin) {
      pin = this.dynamic.getBodyByUUID(props.pin);
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

  activateBodies () {
    this.soft.activateAll();
    this.rope.activateAll();
    this.hinge.activateAll();
    this.cloth.activateAll();
    this.dynamic.activateAll();
  }

  removeBody (props) {
    const found = this[props.type].remove(props);

    if (!found) {
      Logger.warn(
        `There\'s no \'${props.type}\' collider attached to your mesh [${props.uuid}].`
      );
    }
  }

  setGravity (props) {
    /* eslint-disable new-cap */
    this._gravity = props.gravity;

    if (this._soft) {
      this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    }

    this.world.setGravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    /* eslint-enable new-cap */
    this.activateBodies();
  }

  setAngularVelocity (props) {
    this[props.type].setAngularVelocity(props.uuid, props.velocity);
  }

  setLinearVelocity (props) {
    this[props.type].setLinearVelocity(props.uuid, props.velocity);
  }
}

self.addEventListener('message', (event) => {
  const action = event.data.action;
  const params = event.data.params;

  if (physics) {
    physics[action](params);
  } else if (action === 'init') {
    physics = new Physics(params[0], params[1]);
  } else {
    const array = typeof params === 'object';
    const args = params.length && array ? params.join(', ') : !array ? params : '';

    Logger.error(
      `Cannot call Physics.${action}(${args})`,
      'Physics is not initialized.'
    );
  }
});
