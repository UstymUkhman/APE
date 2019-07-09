import PointConstraints from './constraints/PointConstraints';
import HingeConstraints from './constraints/HingeConstraints';

import KinematicBodies from './bodies/KinematicBodies';
import DynamicBodies from './bodies/DynamicBodies';
import StaticBodies from './bodies/StaticBodies';

import ClothBodies from './bodies/ClothBodies';
import RopeBodies from './bodies/RopeBodies';
import SoftBodies from '@/bodies/SoftBodies';

import { Ammo } from '@/utils';
import find from 'lodash.find';

let physics = null;

class PhysicsWorker {
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

  initPointConstraints () {
    this.point = new PointConstraints(this.world);
  }

  initHingeConstraints () {
    this.hinge = new HingeConstraints(this.world);
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
      props.size = { ...props.size, depth: 0.25 };
      props.type = 'kinematic';
      staticType = false;

      console.warn(
        'You\'re using a static plane in a soft world. It may not work as expected.\n',
        'Kinematic box collider was used automatically as fallback for a PlaneGeometry.'
      );
    } else if (staticType && plane) {
      console.warn(
        'You\'re using a static plane which may have some issues with\n',
        '\'Concave\' and \'Convex\' rigid bodies and collisions detection.\n',
        'It\'s recommended to use a BoxGeometry with static box collider instead.'
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

    if (boxFallback) {
      this.kinematic.constants = constants;
    }
  }

  addConstraint (props) {
    if (props.method === 'attachBodies') {
      this.setPointBodies(props);
    }

    if (props.method === 'attachBody') {
      this.setPointBody(props);
    }

    if (props.method === 'hingeBodies') {
      this.setHingeBodies(props);
    }

    if (props.method === 'hingeBody') {
      this.setHingeBody(props);
    }

    this[props.type][props.method](props);
  }

  setPointBodies (props) {
    const body0 = this.kinematic.getBodyByUUID(props.body0) ||
                  this.dynamic.getBodyByUUID(props.body0) ||
                  this.static.getBodyByUUID(props.body0);

    const body1 = this.kinematic.getBodyByUUID(props.body1) ||
                  this.dynamic.getBodyByUUID(props.body1) ||
                  this.static.getBodyByUUID(props.body1);

    if (!body0) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${props.body0}]:\n`,
        'dynamic, kinematic or static.'
      );
    } else if (!body1) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${props.body1}]: dynamic, kinematic or static;\n`,
        'or use \'PhysicsWorld.point.addBody\' method if you want to constraint only one body.'
      );
    } else {
      props.body0 = body0.body;
      props.body1 = body1.body;
    }
  }

  setPointBody (props) {
    const body = this.kinematic.getBodyByUUID(props.body) ||
                 this.dynamic.getBodyByUUID(props.body) ||
                 this.static.getBodyByUUID(props.body);

    if (!body) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${props.body}]:\n`,
        'dynamic, kinematic or static.'
      );
    } else {
      props.body = body.body;
    }
  }

  setHingeBodies (props) {
    const pin = this.kinematic.getBodyByUUID(props.pin) ||
                this.dynamic.getBodyByUUID(props.pin) ||
                this.static.getBodyByUUID(props.pin);

    const arm = this.kinematic.getBodyByUUID(props.arm) ||
                this.dynamic.getBodyByUUID(props.arm) ||
                this.static.getBodyByUUID(props.arm);

    if (!pin) {
      console.error(
        'HingeConstraint pin\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${props.pin}]:\n`,
        'static (recommended), kinematic or dynamic.'
      );
    } else if (!arm) {
      console.error(
        'HingeConstraint arm\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your arm mesh [${props.arm}]: dynamic (recommended), kinematic or static;\n`,
        'or use \'PhysicsWorld.hinge.addBody\' method if you want to constraint only one body.'
      );
    } else {
      props.pin = pin.body;
      props.arm = arm.body;
    }
  }

  setHingeBody (props) {
    const body = this.kinematic.getBodyByUUID(props.body) ||
                 this.dynamic.getBodyByUUID(props.body) ||
                 this.static.getBodyByUUID(props.body);

    if (!body) {
      console.error(
        'HingeConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${props.body}]:\n`,
        'dynamic (recommended), kinematic or static.'
      );
    } else {
      props.body = body.body;
    }
  }

  appendRope (props) {
    const target = this.kinematic.getBodyByUUID(props.target) ||
                   this.dynamic.getBodyByUUID(props.target) ||
                   this.static.getBodyByUUID(props.target) ||
                   this.soft.getBodyByUUID(props.target);

    if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your rope mesh [${props.target}]:\n`,
        'dynamic (recommended), kinematic, static or soft.'
      );
    } else {
      props.target = target.body;
      this.rope.append(props);
    }
  }

  appendCloth (props) {
    const cloth = this.cloth.getBodyByUUID(props.uuid);
    const target = this.static.getBodyByUUID(props.target) ||
                   this.dynamic.getBodyByUUID(props.target) ||
                   this.kinematic.getBodyByUUID(props.target);

    if (!cloth) {
      console.error(
        'Cloth body was not found.\n',
        `Make sure your mesh [${props.uuid}] has a cloth collider.`
      );
    } else if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${props.target}]:\n`,
        'dynamic, kinematic or static.'
      );
    } else {
      props.target = target.body;
      this.cloth.append(props);
    }
  }

  updateBodies (props) {
    this.world.stepSimulation(props.delta, 10);
    this[props.type].update(this.transform, props.bodies);

    if (this._reportCollisions) {
      this.checkCollisions();
    }
  }

  updateConstraints (props) {
    this[props.type].update(props);
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
        const pointDistance = point.getDistance();

        if (pointDistance > 0) {
          collisions[i].contacts[j] = null;
          continue;
        }

        const impulse = point.getAppliedImpulse();
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

    for (let c = 0, length = collisions.length; c < length; c++) {
      let started = false;
      const collision = collisions[c];
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
    }

    for (const type in lastCollisions) {
      const lastCollision = lastCollisions[type];

      for (let lc = 0, length = lastCollision.length; lc < length; lc++) {
        const collidedBody = lastCollision[lc];
        const uuids = collidedBody.collisions;

        for (let u = 0, length = uuids.length; u < length; u++) {
          const uuid = uuids[u];

          const body0 = this.getBodyByUUID(collidedBody.uuid);
          const body1 = this.getBodyByUUID(uuid);

          collisions.push({
            collisionFunction: 'onCollisionEnd',
            bodies: [body0, body1],
            contacts: 0
          });
        }
      }
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

  activateBodies () {
    this.dynamic.activateAll();
    this.point.activateAll();
    this.hinge.activateAll();

    if (this._soft) {
      this.cloth.activateAll();
      this.soft.activateAll();
      this.rope.activateAll();
    }
  }

  removeBody (props) {
    const found = this[props.type].remove(props);

    if (!found) {
      console.warn(
        `There\'s no \'${props.type}\' collider attached to your mesh [${props.uuid}].`
      );
    }
  }

  removeConstraint (props) {
    const found = this[props.type].remove(props.index);

    if (!found) {
      console.warn(
        `There\'s no \'${props.type}\' constraint with index \'${props.index}\'.`
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

  setLinearFactor (props) {
    this[props.type].setLinearFactor(props.uuid, props.factor);
  }

  setAngularFactor (props) {
    this[props.type].setAngularFactor(props.uuid, props.factor);
  }

  setLinearVelocity (props) {
    this[props.type].setLinearVelocity(props.uuid, props.velocity);
  }

  setAngularVelocity (props) {
    this[props.type].setAngularVelocity(props.uuid, props.velocity);
  }

  applyTorque (props) {
    this[props.type].applyTorque(props.uuid, props.torque);
  }

  applyForce (props) {
    this[props.type].applyForce(props.uuid, props.force, props.offset);
  }

  applyCentralForce (props) {
    this[props.type].applyCentralForce(props.uuid, props.force);
  }

  applyImpulse (props) {
    this[props.type].applyImpulse(props.uuid, props.impulse, props.offset);
  }

  applyCentralImpulse (props) {
    this[props.type].applyCentralImpulse(props.uuid, props.impulse);
  }

  setCcdSweptSphereRadius (props) {
    this[props.type].setCcdSweptSphereRadius(props.uuid, props.radius);
  }

  setCcdMotionThreshold (props) {
    this[props.type].setCcdMotionThreshold(props.uuid, props.threshold);
  }

  setRestitution (props) {
    this[props.type].setRestitution(props.uuid, props.restitution);
  }

  setFriction (props) {
    this[props.type].setFriction(props.uuid, props.friction);
  }

  setDamping (props) {
    this[props.type].setDamping(props.uuid, props.linear, props.angular);
  }

  setPiterations (props) {
    this[props.type].setPiterations(props);
  }

  setViterations (props) {
    this[props.type].setViterations(props);
  }

  setCollisions (props) {
    this[props.type].setCollisions(props);
  }

  setPressure (props) {
    this[props.type].setPressure(props);
  }

  setFriction (props) {
    this[props.type].setFriction(props);
  }

  setDamping (props) {
    this[props.type].setDamping(props);
  }

  enableBody (props) {
    this[props.type].enable(props);
  }

  disableBody (props) {
    this[props.type].disable(props);
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

    console.error(
      `Cannot call \'PhysicsWorld.${action}(${args})\'\n`,
      'Physics is not initialized.'
    );
  }
});
