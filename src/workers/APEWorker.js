import ConeTwistConstraints from '@/constraints/workers/ConeTwistConstraints';
import GenericConstraints from '@/constraints/workers/GenericConstraints';
import SliderConstraints from '@/constraints/workers/SliderConstraints';
import HingeConstraints from '@/constraints/workers/HingeConstraints';
import PointConstraints from '@/constraints/workers/PointConstraints';

import KinematicBodies from '@/bodies/workers/KinematicBodies';
import DynamicBodies from '@/bodies/workers/DynamicBodies';
import StaticBodies from '@/bodies/workers/StaticBodies';

import ClothBodies from '@/bodies/workers/ClothBodies';
import RopeBodies from '@/bodies/workers/RopeBodies';
import SoftBodies from '@/bodies/SoftBodies';

import Raycaster from '@/Raycaster';
import { Ammo } from '@/utils';
import find from 'lodash.find';

let physics = null;

class APEWorker {
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

  initRaycaster () {
    this.Raycaster = new Raycaster(this.world);
  }

  initSoftBodies () {
    this.Soft = new SoftBodies(this.world);
  }

  initRopeBodies () {
    this.Rope = new RopeBodies(this.world);
  }

  initClothBodies () {
    this.Cloth = new ClothBodies(this.world);
  }

  initStaticBodies () {
    this.Static = new StaticBodies(this.world);
  }

  initDynamicBodies () {
    this.Dynamic = new DynamicBodies(this.world);
  }

  initKinematicBodies () {
    this.Kinematic = new KinematicBodies(this.world);
  }

  initPointConstraints () {
    this.Point = new PointConstraints(this.world);
  }

  initHingeConstraints () {
    this.Hinge = new HingeConstraints(this.world);
  }

  initSliderConstraints () {
    this.Slider = new SliderConstraints(this.world);
  }

  initGenericConstraints () {
    this.Generic = new GenericConstraints(this.world);
  }

  initConeTwistConstraints () {
    this.ConeTwist = new ConeTwistConstraints(this.world);
  }

  addBody (props) {
    let staticType = props.type === 'Static';
    const plane = props.collider === 'Plane';

    const boxFallback = this._soft && staticType && plane;
    const method = boxFallback ? 'addBox' : `add${props.collider}`;
    const constants = boxFallback ? this.Kinematic.constants : null;

    if (boxFallback) {
      this.Kinematic.constants = this.Static.constants;
      props.size = { ...props.size, depth: 0.25 };
      props.type = 'Kinematic';
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
      this.Kinematic.constants = constants;
    }
  }

  addConstraint (props) {
    if (props.method === 'attachBodies') {
      this.setConstraintBodies(props);
    }

    if (props.method === 'attachBody') {
      this.setConstraintBody(props);
    }

    if (props.method === 'hingeBodies') {
      this.setHingeBodies(props);
    }

    if (props.method === 'hingeBody') {
      this.setHingeBody(props);
    }

    this[props.type][props.method](props);
  }

  setConstraintBodies (props) {
    const type = props.type.charAt(0).toUpperCase() + props.type.slice(1);
    const body0 = this.getRigidBody(props.body0);
    const body1 = this.getRigidBody(props.body1);

    if (!body0) {
      console.error(
        `${type}Constraint body\'s collider was not found.\n`,
        `Make sure to add one of the following bodies to your mesh [${props.body0}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else if (!body1) {
      console.error(
        `${type}Constraint body\'s collider was not found.\n`,
        `Make sure to add one of the following bodies to your mesh [${props.body1}]: Dynamic, Kinematic or Static;\n`,
        `or use \'APE.${props.type}.addBody\' method if you want to constraint only one body.`
      );
    } else {
      props.body0 = body0.body;
      props.body1 = body1.body;
    }
  }

  setConstraintBody (props) {
    const type = props.type.charAt(0).toUpperCase() + props.type.slice(1);
    const body = this.getRigidBody(props.body);

    if (!body) {
      console.error(
        `${type}Constraint body\'s collider was not found.\n`,
        `Make sure to add one of the following bodies to your mesh [${props.body}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else {
      props.body = body.body;
    }
  }

  setHingeBodies (props) {
    const pin = this.getRigidBody(props.pin);
    const arm = this.getRigidBody(props.arm);

    if (!pin) {
      console.error(
        'HingeConstraint pin\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${props.pin}]:\n`,
        'Static (recommended), Kinematic or Dynamic.'
      );
    } else if (!arm) {
      console.error(
        'HingeConstraint arm\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your arm mesh [${props.arm}]: Dynamic (recommended), Kinematic or Static;\n`,
        'or use \'APE.Hinge.addBody\' method if you want to constraint only one body.'
      );
    } else {
      props.pin = pin.body;
      props.arm = arm.body;
    }
  }

  setHingeBody (props) {
    const body = this.getRigidBody(props.body);

    if (!body) {
      console.error(
        'HingeConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${props.body}]:\n`,
        'Dynamic (recommended), Kinematic or Static.'
      );
    } else {
      props.body = body.body;
    }
  }

  appendRope (props) {
    let target = this.getRigidBody(props.target);

    if (!target) {
      target = this.Soft.getBodyByUUID(props.target);
    }

    if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your Rope mesh [${props.target}]:\n`,
        'Dynamic (recommended), Kinematic, Static or Soft.'
      );
    } else {
      props.target = target.body;
      this.Rope.append(props);
    }
  }

  appendCloth (props) {
    const cloth = this.Cloth.getBodyByUUID(props.uuid);
    const target = this.getRigidBody(props.target);

    if (!cloth) {
      console.error(
        'Cloth body was not found.\n',
        `Make sure your mesh [${props.uuid}] has a Cloth collider.`
      );
    } else if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${props.target}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else {
      props.target = target.body;
      this.Cloth.append(props);
    }
  }

  updateBodies (props) {
    this.world.stepSimulation(props.delta, 10);
    this[props.type].update(this.transform, props.bodies);

    if (this._reportCollisions) {
      this.checkCollisions();
    }
  }

  checkCollisions () {
    const dispatcher = this.world.getDispatcher();
    const manifolds = dispatcher.getNumManifolds();
    const collisions = new Array(manifolds);

    const lastCollisions = {
      Kinematic: this.Kinematic.getCollisions(),
      Dynamic: this.Dynamic.getCollisions(),
      Static: this.Static.getCollisions()
    };

    this.Kinematic.resetCollisions();
    this.Dynamic.resetCollisions();
    this.Static.resetCollisions();

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
    let body = this.Dynamic.getBodyInfo(collider, '');
    if (body) return body;

    body = this.Kinematic.getBodyInfo(collider, '');
    if (body) return body;

    body = this.Static.getBodyInfo(collider, '');
    return body;
  }

  getBodyByUUID (uuid) {
    let body = this.Dynamic.getBodyInfo(null, uuid);
    if (body) return body;

    body = this.Kinematic.getBodyInfo(null, uuid);
    if (body) return body;

    body = this.Static.getBodyInfo(null, uuid);
    return body;
  }

  getRigidBody (uuid) {
    let body = this.Dynamic.getBodyByUUID(uuid);
    if (body) return body;

    body = this.Kinematic.getBodyByUUID(uuid);
    if (body) return body;

    body = this.Static.getBodyByUUID(uuid);
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
    this.ConeTwist.activateAll();
    this.Dynamic.activateAll();
    this.Generic.activateAll();
    this.Slider.activateAll();
    this.Hinge.activateAll();
    this.Point.activateAll();

    if (this._soft) {
      this.Cloth.activateAll();
      this.Soft.activateAll();
      this.Rope.activateAll();
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
    this[props.type].remove(props.uuid);
  }

  setCollisionFilterGroup (props) {
    this.Raycaster.setCollisionFilterGroup(props.filterGroup);
  }

  setCollisionFilterMask (props) {
    this.Raycaster.setCollisionFilterMask(props.filterMask);
  }

  setClosestHitFraction (props) {
    this.Raycaster.setClosestHitFraction(props.hitFraction);
  }

  castRay (props) {
    this.Raycaster.cast(props.origin, props.target, props.hitPoint, props.hitNormal);
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

  setBreakingImpulseThreshold (props) {
    this[props.type].setBreakingImpulseThreshold(props.uuid, props.threshold);
  }

  setCcdSweptSphereRadius (props) {
    this[props.type].setCcdSweptSphereRadius(props.uuid, props.radius);
  }

  setCcdMotionThreshold (props) {
    this[props.type].setCcdMotionThreshold(props.uuid, props.threshold);
  }

  setMaxMotorImpulse (props) {
    this[props.type].setMaxMotorImpulse(props);
  }

  setSoftnessLimit (props) {
    this[props.type].setSoftnessLimit(props);
  }

  setAngularMotor (props) {
    this[props.type].setAngularMotor(props);
  }

  setAngularLimit (props) {
    this[props.type].setAngularLimit(props);
  }

  setLinearLimit (props) {
    this[props.type].setLinearLimit(props);
  }

  setMotorTarget (props) {
    this[props.type].setMotorTarget(props);
  }

  setRestitution (props) {
    this[props.type].setRestitution(props.uuid, props.restitution);
  }

  setFriction (props) {
    if (props.type !== 'Cloth' && props.type !== 'Rope') {
      this[props.type].setFriction(props.uuid, props.friction);
    } else {
      this[props.type].setFriction(props);
    }
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

  setStiffness (props) {
    this[props.type].setStiffness(props);
  }

  setPressure (props) {
    this[props.type].setPressure(props);
  }

  setDamping (props) {
    this[props.type].setDamping(props);
  }

  setMargin (props) {
    this[props.type].setMargin(props);
  }

  setLimit (props) {
    this[props.type].setLimit(props);
  }

  enableAngularMotor (props) {
    this[props.type].enableAngularMotor(props);
  }

  enableLinearMotor (props) {
    this[props.type].enableLinearMotor(props);
  }

  disableAngularMotor (props) {
    this[props.type].disableAngularMotor(props);
  }

  disableLinearMotor (props) {
    this[props.type].disableLinearMotor(props);
  }

  disableMotor (props) {
    this[props.type].disableMotor(props);
  }

  enableMotor (props) {
    this[props.type].enableMotor(props);
  }

  enableBody (props) {
    this[props.type].enable(props);
  }

  disableBody (props) {
    this[props.type].disable(props);
  }

  destroy () {
    // eslint-disable-next-line no-use-before-define
    self.removeEventListener('message', onMessage);
    this.world.__destroy__();
  }
}

function onMessage (event) {
  const action = event.data.action;
  const params = event.data.params;

  if (physics) {
    physics[action](params);
  } else if (action === 'init') {
    physics = new APEWorker(params[0], params[1]);
  } else {
    const array = typeof params === 'object';
    const args = params.length && array ? params.join(', ') : !array ? params : '';

    console.error(
      `Cannot call \'APE.${action}(${args})\'\n`,
      'Physics is not initialized.'
    );
  }
}

self.addEventListener('message', onMessage);
