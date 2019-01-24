// Physics bodies class manager

import KinematicBodies from 'physics/bodies/KinematicBodies';
import DynamicBodies from 'physics/bodies/DynamicBodies';
import StaticBodies from 'physics/bodies/StaticBodies';
import HingeBodies from 'physics/bodies/HingeBodies';
import VehicleBody from 'physics/bodies/VehicleBody';

import ClothBodies from 'physics/bodies/ClothBodies';
import SoftBodies from 'physics/bodies/SoftBodies';
import RopeBodies from 'physics/bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from 'physics/constants';
import { Ammo } from 'core/Ammo';

export default class PhysicWorld {
  /**
   * @constructs PhysicWorld
   * @description - Initialize physics for soft and rigid bodies
   * @param {bool} [soft] - if <true> creates soft/rigid dynamics world or discrete dynamics world otherwise
   */
  constructor (soft = false) {
    this.vehicles = [];
    this.softWorld = soft;
    this.clock = new Clock();

    if (soft) {
      this._initSoftWorld();
    } else {
      this._initRigidWorld();
    }

    this.soft = new SoftBodies(this.world);
    this.rope = new RopeBodies(this.world);
    this.cloth = new ClothBodies(this.world);

    this.hinge = new HingeBodies(this.world);
    this.static = new StaticBodies(this.world);
    this.dynamic = new DynamicBodies(this.world);
    this.kinematic = new KinematicBodies(this.world);
  }

  /**
   * @private
   * @description - Initialize dynamics world with soft/rigid bodies
   */
  _initSoftWorld () {
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

  /**
   * @private
   * @description - Initialize discrete dynamics world with rigid bodies
   */
  _initRigidWorld () {
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

  /**
   * @public
   * @description - Initialize and adds a vehicle body
   * @param {Object} mesh - vehicle chassis mesh
   * @param {number} mass - vehicle mass
   * @param {Object} controls - vehicle key codes controls
   * @returns {Object} - vehicle body
   */
  addVehicle (mesh, mass, controls) {
    const vehicle = new VehicleBody(this.world, controls);
    vehicle.addChassis(mesh, mass);
    this.vehicles.push(vehicle);
    return vehicle;
  }

  /**
   * @public
   * @description - Update physics world and bodies in requestAnimation loop
   */
  update () {
    for (let i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].update();
    }

    this.kinematic.update(this.transform);
    this.dynamic.update(this.transform);

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);

    if (this.softWorld) {
      this.cloth.update();
      this.soft.update();
      this.rope.update();
    }
  }
}
