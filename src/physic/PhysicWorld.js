import KinematicBodies from 'physic/KinematicBodies';
import DynamicBodies from 'physic/DynamicBodies';
import StaticBodies from 'physic/StaticBodies';
import VehicleBody from 'physic/VehicleBody';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from 'physic/constants';
import { Ammo } from 'core/Ammo';

export default class PhysicWorld {
  constructor (soft = false) {
    this.vehicles = [];
    this.clock = new Clock();

    if (soft) this.initSoftWorld();
    else this.initRigidWorld();

    this.static = new StaticBodies(this.world);
    this.dynamic = new DynamicBodies(this.world);
    this.kinematic = new KinematicBodies(this.world);
  }

  initSoftWorld () {
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

  initRigidWorld () {
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

  addVehicle (mesh, mass, controls) {
    const vehicle = new VehicleBody(this.world, controls);
    vehicle.addChassis(mesh, mass);
    this.vehicles.push(vehicle);
    return vehicle;
  }

  update () {
    for (let i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].update();
    }

    this.dynamic.update(this.transform);
    this.kinematic.update(this.transform);

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);
  }
}
