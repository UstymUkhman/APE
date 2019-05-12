import KinematicBodies from './bodies/KinematicBodies';
import DynamicBodies from './bodies/DynamicBodies';
import StaticBodies from './bodies/StaticBodies';
import HingeBodies from './bodies/HingeBodies';

import ClothBodies from './bodies/ClothBodies';
import SoftBodies from './bodies/SoftBodies';
import RopeBodies from './bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from 'physics/constants';

import EventEmitter from 'events';
import Logger from 'utils/Logger';
import find from 'lodash/find';
import Ammo from 'core/Ammo';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    const eventEmitter = new EventEmitter();

    this._soft = soft;
    this._collisions = 0;
    this._gravity = gravity;
    this.clock = new Clock();

    this._collisionReport = false;
    this._fullCollisionReport = false;

    if (soft) {
      this.initSoftWorld();
    } else {
      this.initRigidWorld();
    }

    this.hinge = new HingeBodies(this.world, eventEmitter);
    this.cloth = new ClothBodies(this.world, eventEmitter);
    this.rope = new RopeBodies(this.world, eventEmitter);

    this.kinematic = new KinematicBodies(this.world);
    this.dynamic = new DynamicBodies(this.world);
    this.static = new StaticBodies(this.world);
    this.soft = new SoftBodies(this.world);

    eventEmitter.on('getHingeComponents', (pinUUID, armUUID, position) => {
      let arm = this.dynamic.getBodyByUUID(armUUID);
      let pin = this.static.getBodyByUUID(pinUUID);

      if (!pin) {
        pin = this.kinematic.getBodyByUUID(pinUUID);
      }

      if (!pin) {
        pin = this.dynamic.getBodyByUUID(pinUUID);
      }

      if (!pin) {
        Logger.error(
          'Hinge pin\'s collider was not found.',
          `Make sure to add one of the following bodies to your pin mesh [${pinUUID}]:`,
          'static (recommended); kinematic or dynamic.'
        );
      }

      if (!arm) {
        Logger.error(
          'Hinge arm\'s collider was not found.',
          `Make sure to add a dynamic body to your arm mesh [${armUUID}].`
        );
      }

      this.hinge.addBodies(pin.body, arm.body, position);
    });

    eventEmitter.on('getClothAnchor', (targetUUID, cloth) => {
      const clothBody = this.cloth.getBodyByUUID(cloth.uuid);
      let target = this.dynamic.getBodyByUUID(targetUUID);

      if (!target) {
        target = this.kinematic.getBodyByUUID(targetUUID);
      }

      if (!target) {
        target = this.static.getBodyByUUID(targetUUID);
      }

      if (!target) {
        target = this.soft.getBodyByUUID(targetUUID);
      }

      if (!clothBody) {
        Logger.error(
          'Cloth body was not found.',
          `Make sure your mesh [${cloth.uuid}] has a cloth collider.`
        );
      }

      if (!target) {
        Logger.error(
          'Target body was not found.',
          `Make sure to add one of the following bodies to your pin mesh [${targetUUID}]:`,
          'dynamic (recommended); kinematic; static or soft.'
        );
      }

      this.cloth.appendAnchor(target.body, cloth);
    });

    eventEmitter.on('getRopeAnchor', (targetUUID, rope) => {
      let target = this.dynamic.getBodyByUUID(targetUUID);

      if (!target) {
        target = this.kinematic.getBodyByUUID(targetUUID);
      }

      if (!target) {
        target = this.static.getBodyByUUID(targetUUID);
      }

      if (!target) {
        target = this.soft.getBodyByUUID(targetUUID);
      }

      if (!target) {
        Logger.error(
          'Target body was not found.',
          `Make sure to add one of the following bodies to your rope mesh [${targetUUID}]:`,
          'dynamic (recommended); kinematic; static or soft.'
        );
      }

      this.rope.appendAnchor(target.body, rope);
    });
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

  activateBodies () {
    this.soft.activateAll();
    this.rope.activateAll();
    this.hinge.activateAll();
    this.cloth.activateAll();
    this.dynamic.activateAll();
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
    });

    for (const type in lastCollisions) {
      lastCollisions[type].forEach((body) => {
        body.collisions.forEach((uuid) => {
          const body1 = this.getBodyByUUID(uuid);

          collisions.push({
            collisionFunction: 'onCollisionEnd',
            bodies: [body.body, body1],
            contacts: 0
          });
        });
      });
    }

    this._collisions = collisions.length;

    if (this._collisions) {
      this.reportCollisions(collisions);
    }
  }

  reportCollisions (collisions) {
    collisions.forEach((collision) => {
      const body0 = collision.bodies[0];
      const body1 = collision.bodies[1];

      if (!body0 || !body1) return;

      const type0 = body0.type;
      const type1 = body1.type;

      const existingBodies = body0.mesh && body1.mesh;
      const hasContactsData = this._fullCollisionReport && !!this._collisions;
      const contacts = !this._fullCollisionReport || hasContactsData ? collision.contacts : null;

      if (existingBodies) {
        this[collision.collisionFunction]({
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
    });
  }

  onCollisionStart (thisObject, otherObject, contacts) { }

  onCollision (thisObject, otherObject, contacts) { }

  onCollisionEnd (thisObject, otherObject, contacts) { }

  getBodyByCollider (collider) {
    let body = this.dynamic.getBodyByCollider(collider);
    if (body) return body;

    body = this.kinematic.getBodyByCollider(collider);
    if (body) return body;

    body = this.static.getBodyByCollider(collider);
    return body;
  }

  getBodyByUUID (uuid) {
    let body = this.dynamic.getBodyByUUID(uuid);
    if (body) return body;

    body = this.kinematic.getBodyByUUID(uuid);
    if (body) return body;

    body = this.static.getBodyByUUID(uuid);
    return body;
  }

  update () {
    this.kinematic.update(this.transform);
    this.dynamic.update(this.transform);

    if (this._soft) {
      this.cloth.update();
      this.soft.update();
      this.rope.update();
    }

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);

    if (this._collisionReport) {
      this.checkCollisions();
    }
  }

  destroy () {
    delete this.kinematic;
    delete this.dynamic;
    delete this.static;
    delete this.hinge;

    delete this.cloth;
    delete this.soft;
    delete this.rope;

    delete this.clock;
  }

  set collisionReport (report) {
    this._collisionReport = report;
    this._fullCollisionReport = false;
  }

  get collisionReport () {
    return this._collisionReport;
  }

  set fullCollisionReport (report) {
    this._collisionReport = true;
    this._fullCollisionReport = report;
  }

  get fullCollisionReport () {
    return this._fullCollisionReport;
  }

  set gravity (value) {
    this._gravity = value;
    /* eslint-disable new-cap */

    if (this._soft) {
      this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, value, 0.0));
    }

    this.world.setGravity(new Ammo.btVector3(0.0, value, 0.0));
    /* eslint-enable new-cap */
    this.activateBodies();
  }

  get gravity () {
    return this._gravity;
  }

  get collisions () {
    return this._collisions;
  }
}
