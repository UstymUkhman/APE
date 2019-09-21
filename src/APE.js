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
import { GRAVITY } from '@/constants';

import Raycaster from '@/Raycaster';
import EventEmitter from 'events';
import { Ammo } from '@/utils';
import find from 'lodash.find';

export default class APE {
  constructor (soft = false, gravity = GRAVITY) {
    this._soft = soft;
    this._collisions = 0;
    this._gravity = gravity;

    this._clock = new Clock();
    this._events = new EventEmitter();

    this._collisionReport = false;
    this._fullCollisionReport = false;

    if (this._soft) {
      this.initSoftWorld();
    } else {
      this.initRigidWorld();
    }

    this.ConeTwist = new ConeTwistConstraints(this.world, this._events);
    this.Generic = new GenericConstraints(this.world, this._events);
    this.Slider = new SliderConstraints(this.world, this._events);
    this.Hinge = new HingeConstraints(this.world, this._events);
    this.Point = new PointConstraints(this.world, this._events);

    this.Kinematic = new KinematicBodies(this.world);
    this.Dynamic = new DynamicBodies(this.world);
    this.Static = new StaticBodies(this.world);

    this.Raycaster = new Raycaster(this.world);

    if (this._soft) {
      this.Cloth = new ClothBodies(this.world, this._events);
      this.Rope = new RopeBodies(this.world, this._events);
      this.Soft = new SoftBodies(this.world);
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
  }

  initRigidWorld () {
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
        `Make sure to add one of the following bodies to your rope mesh [${targetUUID}]:\n`,
        'dynamic (recommended), kinematic, static or soft.'
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
        `Make sure your mesh [${cloth.uuid}] has a cloth collider.`
      );
    } else if (!target) {
      console.error(
        'Target body was not found.\n',
        `Make sure to add one of the following bodies to your pin mesh [${targetUUID}]:\n`,
        'dynamic; kinematic or static.'
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
        'dynamic, kinematic or static.'
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
        'dynamic, kinematic or static.'
      );
    } else if (!body1) {
      console.error(
        'PointConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: dynamic, kinematic or static;\n`,
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
        'dynamic (recommended), kinematic or static.'
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
        'static (recommended); kinematic or dynamic.'
      );
    } else if (!arm) {
      console.error(
        'HingeConstraint arm\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your arm mesh [${armUUID}]: dynamic (recommended), kinematic or static;\n`,
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
        'dynamic, kinematic or static.'
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
        'dynamic, kinematic or static.'
      );
    } else if (!body1) {
      console.error(
        'SliderConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: dynamic, kinematic or static;\n`,
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
        'dynamic, kinematic or static.'
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
        'dynamic, kinematic or static.'
      );
    } else if (!body1) {
      console.error(
        'GenericConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]: dynamic, kinematic or static;\n`,
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
        'dynamic, kinematic or static.'
      );
    } else if (!body1) {
      console.error(
        'ConeTwistConstraint body\'s collider was not found.\n',
        `Make sure to add one of the following bodies to your mesh [${body1UUID}]:\n`,
        'dynamic, kinematic or static.'
      );
    } else {
      this.ConeTwist.attachBodies(body0.body, body1.body, pivot);
    }
  }

  checkCollisions () {
    const dispatcher = this.world.getDispatcher();
    const manifolds = dispatcher.getNumManifolds();

    const lastCollisions = {
      kinematic: this.Kinematic.getCollisions(),
      dynamic: this.Dynamic.getCollisions(),
      static: this.Static.getCollisions()
    };

    const collisions = new Array(manifolds);

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

  update () {
    const delta = this._clock.getDelta();
    this.world.stepSimulation(delta, 10);

    this.Kinematic.update(this.transform);
    this.Dynamic.update(this.transform);

    if (this._soft) {
      this.Cloth.update();
      this.Soft.update();
      this.Rope.update();
    }

    if (this._collisionReport) {
      this.checkCollisions();
    }
  }

  destroy () {
    this.world.__destroy__();

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
