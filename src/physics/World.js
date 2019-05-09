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
import Ammo from 'core/Ammo';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    const eventEmitter = new EventEmitter();

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

  update () {
    this.kinematic.update(this.transform);
    this.dynamic.update(this.transform);

    this.cloth.update();
    this.soft.update();
    this.rope.update();

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);
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
    this.setCollisionReport(report);
  }

  get collisionReport () {
    return this._collisionReport;
  }

  set fullCollisionReport (report) {
    this.setCollisionReport(true, report);
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
