import ConeTwistConstraints from '@/constraints/ConeTwistConstraints';
import GenericConstraints from '@/constraints/GenericConstraints';
import SliderConstraints from '@/constraints/SliderConstraints';
import HingeConstraints from '@/constraints/HingeConstraints';
import PointConstraints from '@/constraints/PointConstraints';

import KinematicBodies from '@/bodies/KinematicBodies';
import DynamicBodies from '@/bodies/DynamicBodies';
import StaticBodies from '@/bodies/StaticBodies';

import ClothBodies from '@/bodies/ClothBodies';
import SoftBodies from '@/bodies/SoftBodies';
import RopeBodies from '@/bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import * as CONSTANTS from '@/constants';

import Raycaster from '@/Raycaster';
import EventEmitter from 'events';
import { Ammo } from '@/utils';
import find from 'lodash.find';

class APE {
  constructor () {
    this._events = new EventEmitter();
    this._clock = new Clock();
    this.Ammo = Ammo;

    this._collisionReport = false;
    this._fullCollisionReport = false;

    this.initPhysicsEvents();
    Object.assign(this, CONSTANTS);
  }

  init (soft = false, gravity = CONSTANTS.GRAVITY) {
    this._soft = soft;
    this._collisions = 0;
    this._gravity = gravity;

    if (this._soft) {
      this.initSoftWorld();
    } else {
      this.initRigidWorld();
    }

    this.ConeTwist = new ConeTwistConstraints(this._world, this._events);
    this.Generic = new GenericConstraints(this._world, this._events);
    this.Slider = new SliderConstraints(this._world, this._events);
    this.Hinge = new HingeConstraints(this._world, this._events);
    this.Point = new PointConstraints(this._world, this._events);

    this.Kinematic = new KinematicBodies(this._world);
    this.Dynamic = new DynamicBodies(this._world);
    this.Static = new StaticBodies(this._world);

    this.Raycaster = new Raycaster(this._world);

    if (this._soft) {
      this.Cloth = new ClothBodies(this._world, this._events);
      this.Rope = new RopeBodies(this._world, this._events);
      this.Soft = new SoftBodies(this._world);
    }

    return this;
  }

  initSoftWorld () {
    /* eslint-disable new-cap */
    const broadphase = new Ammo.btDbvtBroadphase();
    const softSolver = new Ammo.btDefaultSoftBodySolver();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this._world = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softSolver);
    this._world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    this._world.setGravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
  }

  initRigidWorld () {
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this._world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    this._world.setGravity(new Ammo.btVector3(0.0, this._gravity, 0.0));
    /* eslint-enable new-cap */
  }

  initPhysicsEvents () {
    this._events.on('getRopeAnchor', this.getRopeAnchor.bind(this));
    this._events.on('getClothAnchor', this.getClothAnchor.bind(this));

    this._events.on('getPointBody', this.getPointBody.bind(this));
    this._events.on('getPointBodies', this.getPointBodies.bind(this));

    this._events.on('getHingeBody', this.getHingeBody.bind(this));
    this._events.on('getHingeBodies', this.getHingeBodies.bind(this));

    this._events.on('getSliderBody', this.getSliderBody.bind(this));
    this._events.on('getSliderBodies', this.getSliderBodies.bind(this));

    this._events.on('getGenericBody', this.getGenericBody.bind(this));
    this._events.on('getGenericBodies', this.getGenericBodies.bind(this));

    this._events.on('getConeTwistBodies', this.getConeTwistBodies.bind(this));
  }

  getRopeAnchor (targetUUID, rope) {
    let target = this.getBodyByUUID(targetUUID);

    if (!target) {
      target = this.Soft.getBodyByUUID(targetUUID);
    }

    if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your Rope mesh [${targetUUID}]:\n`,
        'Dynamic (recommended), Kinematic, Static or Soft.'
      );
    } else {
      this.Rope.appendAnchor(target.body, rope);
    }
  }

  getClothAnchor (targetUUID, cloth) {
    const clothBody = this.Cloth.getBodyByUUID(cloth.uuid);
    const target = this.getBodyByUUID(targetUUID);

    if (!clothBody) {
      console.error(
        'Cloth body was not found.\n',
        `Make sure your mesh [${cloth.uuid}] has a Cloth collider.`
      );
    } else if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${targetUUID}]:\n`,
        'Dynamic; Kinematic or Static.'
      );
    } else {
      this.Cloth.appendAnchor(target.body, cloth);
    }
  }

  getPointBody (bodyUUID, position) {
    const body = this.getBodyByUUID(bodyUUID);

    if (!body) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${bodyUUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else {
      this.Point.attachBody(body.body, position);
    }
  }

  getPointBodies (body0UUID, body1UUID, positions) {
    const body0 = this.getBodyByUUID(body0UUID);
    const body1 = this.getBodyByUUID(body1UUID);

    if (!body0) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body0UUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else if (!body1) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: Dynamic, Kinematic or Static;\n`,
        'or use \'APE.Point.addBody\' method if you want to constraint only one body.'
      );
    } else {
      this.Point.attachBodies(body0.body, body1.body, positions);
    }
  }

  getHingeBody (bodyUUID, position) {
    const body = this.getBodyByUUID(bodyUUID);

    if (!body) {
      console.error(
        'HingeConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${bodyUUID}]:\n`,
        'Dynamic (recommended), Kinematic or Static.'
      );
    } else {
      this.Hinge.hingeBody(body.body, position);
    }
  }

  getHingeBodies (pinUUID, armUUID, position) {
    const pin = this.getBodyByUUID(pinUUID);
    const arm = this.getBodyByUUID(armUUID);

    if (!pin) {
      console.error(
        'HingeConstraint pin\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${pinUUID}]:\n`,
        'Static (recommended); Kinematic or Dynamic.'
      );
    } else if (!arm) {
      console.error(
        'HingeConstraint arm\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your arm mesh [${armUUID}]: Dynamic (recommended), Kinematic or Static;\n`,
        'or use \'APE.Hinge.addBody\' method if you want to constraint only one body.'
      );
    } else {
      this.Hinge.hingeBodies(pin.body, arm.body, position);
    }
  }

  getSliderBody (bodyUUID, pivot) {
    const body = this.getBodyByUUID(bodyUUID);

    if (!body) {
      console.error(
        'SliderConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${bodyUUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else {
      this.Slider.attachBody(body.body, pivot);
    }
  }

  getSliderBodies (body0UUID, body1UUID, pivot) {
    const body0 = this.getBodyByUUID(body0UUID);
    const body1 = this.getBodyByUUID(body1UUID);

    if (!body0) {
      console.error(
        'SliderConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body0UUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else if (!body1) {
      console.error(
        'SliderConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: Dynamic, Kinematic or Static;\n`,
        'or use \'APE.Slider.addBody\' method if you want to constraint only one body.'
      );
    } else {
      this.Slider.attachBodies(body0.body, body1.body, pivot);
    }
  }

  getGenericBody (bodyUUID, pivot) {
    const body = this.getBodyByUUID(bodyUUID);

    if (!body) {
      console.error(
        'GenericConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${bodyUUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else {
      this.Generic.attachBody(body.body, pivot);
    }
  }

  getGenericBodies (body0UUID, body1UUID, pivot) {
    const body0 = this.getBodyByUUID(body0UUID);
    const body1 = this.getBodyByUUID(body1UUID);

    if (!body0) {
      console.error(
        'GenericConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body0UUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else if (!body1) {
      console.error(
        'GenericConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: Dynamic, Kinematic or Static;\n`,
        'or use \'APE.Generic.addBody\' method if you want to constraint only one body.'
      );
    } else {
      this.Generic.attachBodies(body0.body, body1.body, pivot);
    }
  }

  getConeTwistBodies (body0UUID, body1UUID, pivot) {
    const body0 = this.getBodyByUUID(body0UUID);
    const body1 = this.getBodyByUUID(body1UUID);

    if (!body0) {
      console.error(
        'ConeTwistConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body0UUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else if (!body1) {
      console.error(
        'ConeTwistConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]:\n`,
        'Dynamic, Kinematic or Static.'
      );
    } else {
      this.ConeTwist.attachBodies(body0.body, body1.body, pivot);
    }
  }

  checkCollisions () {
    const dispatcher = this._world.getDispatcher();
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

      this[body0.type].addCollision(body0, body1.uuid);
      this[body1.type].addCollision(body1, body0.uuid);

      collisions[i] = { bodies: [body0, body1] };

      if (this._fullCollisionReport) {
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

      const body0Collisions = find(lastCollisions[body0.type], collision => collision.body.uuid === body0.uuid);
      const body1Collisions = find(lastCollisions[body1.type], collision => collision.body.uuid === body1.uuid);

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

    if (this.onCollisionEnd) {
      for (const type in lastCollisions) {
        const lastCollision = lastCollisions[type];

        for (let lc = 0, cLength = lastCollision.length; lc < cLength; lc++) {
          const collidedBody = lastCollision[lc];
          const uuids = collidedBody.collisions;

          for (let u = 0, uLength = uuids.length; u < uLength; u++) {
            const body1 = this.getBodyByUUID(uuids[u]);

            collisions.push({
              collisionFunction: 'onCollisionEnd',
              bodies: [collidedBody.body, body1],
              contacts: 0
            });
          }
        }
      }
    }

    this._collisions = collisions.length;

    if (this._collisions) {
      this.reportCollisions(collisions);
    }
  }

  reportCollisions (collisions) {
    for (let c = 0, length = collisions.length; c < length; c++) {
      const collision = collisions[c];
      const body0 = collision.bodies[0];
      const body1 = collision.bodies[1];

      if (!body0 || !body1) return;

      const type0 = body0.type;
      const type1 = body1.type;

      const existingBodies = body0.mesh && body1.mesh;
      const collisionFunction = this[collision.collisionFunction];
      const hasContactsData = this._fullCollisionReport && !!this._collisions;
      const contacts = !this._fullCollisionReport || hasContactsData ? collision.contacts : null;

      if (existingBodies && collisionFunction) {
        collisionFunction({
          collisionPoint: body0.collisionPoint,
          bodyPoint: body0.bodyPoint,
          mesh: body0.mesh,
          type: type0
        }, {
          collisionPoint: body1.collisionPoint,
          bodyPoint: body1.bodyPoint,
          mesh: body1.mesh,
          type: type1
        }, contacts);
      }
    }
  }

  getBodyByCollider (collider) {
    let body = this.Dynamic.getBodyByCollider(collider);
    if (body) return body;

    body = this.Kinematic.getBodyByCollider(collider);
    if (body) return body;

    body = this.Static.getBodyByCollider(collider);
    return body;
  }

  getBodyByUUID (uuid) {
    let body = this.Dynamic.getBodyByUUID(uuid);
    if (body) return body;

    body = this.Kinematic.getBodyByUUID(uuid);
    if (body) return body;

    body = this.Static.getBodyByUUID(uuid);
    return body;
  }

  activateBodies () {
    this.ConeTwist.activateAll();
    this.Generic.activateAll();
    this.Dynamic.activateAll();
    this.Slider.activateAll();
    this.Point.activateAll();
    this.Hinge.activateAll();

    if (this._soft) {
      this.Cloth.activateAll();
      this.Soft.activateAll();
      this.Rope.activateAll();
    }
  }

  createGroup (name, index = 1) {
    if (isNaN(index) || index < 1 || index > 5) {
      console.warn(
        'To create a custom group you have to use a string name\n',
        'and an integer value between 1 and 5 included.'
      );

      return null;
    }

    const group = Math.pow(2, 10 + index);
    this[`GROUP_${name.toUpperCase()}`] = group;

    return group;
  }

  update () {
    const delta = this._clock.getDelta();
    this._world.stepSimulation(delta, 10);

    if (this._collisionReport) {
      this.checkCollisions();
    }
  }

  destroy () {
    this._world.__destroy__();

    delete this.ConeTwist;
    delete this.Generic;
    delete this.Slider;
    delete this.Hinge;
    delete this.Point;

    delete this.Kinematic;
    delete this.Dynamic;
    delete this.Static;

    delete this.Raycaster;
    delete this._events;
    delete this._clock;

    if (this._soft) {
      delete this.Cloth;
      delete this.Soft;
      delete this.Rope;
    }
  }

  set collisionReport (report) {
    this._collisionReport = report;
    this._fullCollisionReport = false;
  }

  get collisionReport () {
    return this._collisionReport;
  }

  set fullCollisionReport (report) {
    if (report) {
      console.warn(
        '`fullCollisionReport` can significantly reduce the performance of a web page.\n',
        'Please use this option with caution.'
      );
    }

    this._collisionReport = true;
    this._fullCollisionReport = report;
  }

  get fullCollisionReport () {
    return this._fullCollisionReport;
  }

  get collisions () {
    return this._collisions;
  }

  set gravity (value) {
    this._gravity = value;
    /* eslint-disable new-cap */

    if (this._soft) {
      this._world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, value, 0.0));
    }

    this._world.setGravity(new Ammo.btVector3(0.0, value, 0.0));
    /* eslint-enable new-cap */
    this.activateBodies();
  }

  get gravity () {
    return this._gravity;
  }
}

export default new APE();
