import PointConstraints from './constraints/PointConstraints';
import HingeConstraints from './constraints/HingeConstraints';

import KinematicBodies from './bodies/KinematicBodies';
import DynamicBodies from './bodies/DynamicBodies';
import StaticBodies from './bodies/StaticBodies';

import ClothBodies from './bodies/ClothBodies';
import SoftBodies from './bodies/SoftBodies';
import RopeBodies from './bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from '@/constants';

import EventEmitter from 'events';
import { Ammo } from '@/utils';
import find from 'lodash/find';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    this._soft = soft;
    this._collisions = 0;
    this._gravity = gravity;

    this.clock = new Clock();
    this._events = new EventEmitter();

    this._collisionReport = false;
    this._fullCollisionReport = false;

    if (this._soft) {
      this.initSoftWorld();
    } else {
      this.initRigidWorld();
    }

    this.point = new PointConstraints(this.world, this._events);
    this.hinge = new HingeConstraints(this.world, this._events);

    this.kinematic = new KinematicBodies(this.world);
    this.dynamic = new DynamicBodies(this.world);
    this.static = new StaticBodies(this.world);

    if (this._soft) {
      this.cloth = new ClothBodies(this.world, this._events);
      this.rope = new RopeBodies(this.world, this._events);
      this.soft = new SoftBodies(this.world);
    }

    this.initPhysicsEvents();
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

  initPhysicsEvents () {
    this._events.on('getRopeAnchor', this.getRopeAnchor.bind(this));
    this._events.on('getClothAnchor', this.getClothAnchor.bind(this));

    this._events.on('getPointBody', this.getPointBody.bind(this));
    this._events.on('getPointBodies', this.getPointBodies.bind(this));

    this._events.on('getHingeBody', this.getHingeBody.bind(this));
    this._events.on('getHingeBodies', this.getHingeBodies.bind(this));
  }

  getRopeAnchor (targetUUID, rope) {
    const target = this.kinematic.getBodyByUUID(targetUUID) ||
                   this.dynamic.getBodyByUUID(targetUUID) ||
                   this.static.getBodyByUUID(targetUUID) ||
                   this.soft.getBodyByUUID(targetUUID);

    if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your rope mesh [${targetUUID}]:\n`,
        'dynamic (recommended), kinematic, static or soft.'
      );
    } else {
      this.rope.appendAnchor(target.body, rope);
    }
  }

  getClothAnchor (targetUUID, cloth) {
    const clothBody = this.cloth.getBodyByUUID(cloth.uuid);
    const target = this.kinematic.getBodyByUUID(targetUUID) ||
                   this.dynamic.getBodyByUUID(targetUUID) ||
                   this.static.getBodyByUUID(targetUUID);

    if (!clothBody) {
      console.error(
        'Cloth body was not found.\n',
        `Make sure your mesh [${cloth.uuid}] has a cloth collider.`
      );
    } else if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${targetUUID}]:\n`,
        'dynamic; kinematic or static.'
      );
    } else {
      this.cloth.appendAnchor(target.body, cloth);
    }
  }

  getPointBody (bodyUUID, position) {
    const body = this.kinematic.getBodyByUUID(bodyUUID) ||
                 this.dynamic.getBodyByUUID(bodyUUID) ||
                 this.static.getBodyByUUID(bodyUUID);

    if (!body) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${bodyUUID}]:\n`,
        'dynamic, kinematic or static.'
      );
    } else {
      this.point.attachBody(body.body, position);
    }
  }

  getPointBodies (body0UUID, body1UUID, positions) {
    const body0 = this.kinematic.getBodyByUUID(body0UUID) ||
                  this.dynamic.getBodyByUUID(body0UUID) ||
                  this.static.getBodyByUUID(body0UUID);

    const body1 = this.kinematic.getBodyByUUID(body1UUID) ||
                  this.dynamic.getBodyByUUID(body1UUID) ||
                  this.static.getBodyByUUID(body1UUID);

    if (!body0) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body0UUID}]:\n`,
        'dynamic, kinematic or static.'
      );
    } else if (!body1) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: dynamic, kinematic or static;\n`,
        'or use \'PhysicsWorld.point.addBody\' method if you want to constraint only one body.'
      );
    } else {
      this.point.attachBodies(body0.body, body1.body, positions);
    }
  }

  getHingeBody (bodyUUID, position) {
    const body = this.kinematic.getBodyByUUID(bodyUUID) ||
                 this.dynamic.getBodyByUUID(bodyUUID) ||
                 this.static.getBodyByUUID(bodyUUID);

    if (!body) {
      console.error(
        'HingeConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${bodyUUID}]:\n`,
        'dynamic (recommended), kinematic or static.'
      );
    } else {
      this.hinge.hingeBody(body.body, position);
    }
  }

  getHingeBodies (pinUUID, armUUID, position) {
    const pin = this.kinematic.getBodyByUUID(pinUUID) ||
                this.dynamic.getBodyByUUID(pinUUID) ||
                this.static.getBodyByUUID(pinUUID);

    const arm = this.kinematic.getBodyByUUID(armUUID) ||
                this.dynamic.getBodyByUUID(armUUID) ||
                this.static.getBodyByUUID(armUUID);

    if (!pin) {
      console.error(
        'HingeConstraint pin\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${pinUUID}]:\n`,
        'static (recommended); kinematic or dynamic.'
      );
    } else if (!arm) {
      console.error(
        'HingeConstraint arm\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your arm mesh [${armUUID}]: dynamic (recommended), kinematic or static;\n`,
        'or use \'PhysicsWorld.hinge.addBody\' method if you want to constraint only one body.'
      );
    } else {
      this.hinge.hingeBodies(pin.body, arm.body, position);
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

  update () {
    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);

    this.kinematic.update(this.transform);
    this.dynamic.update(this.transform);

    if (this._soft) {
      this.cloth.update();
      this.soft.update();
      this.rope.update();
    }

    if (this._collisionReport) {
      this.checkCollisions();
    }
  }

  destroy () {
    delete this.kinematic;
    delete this.dynamic;
    delete this.static;
    delete this.hinge;

    delete this.clock;

    if (this._soft) {
      delete this.cloth;
      delete this.soft;
      delete this.rope;
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
      this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0.0, value, 0.0));
    }

    this.world.setGravity(new Ammo.btVector3(0.0, value, 0.0));
    /* eslint-enable new-cap */
    this.activateBodies();
  }

  get gravity () {
    return this._gravity;
  }
}
