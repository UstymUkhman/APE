import PhysicsWorker from 'worker-loader!workers/PhysicsWorker.js';

import KinematicBodies from 'physics/bodies/KinematicBodies';
import DynamicBodies from 'physics/bodies/DynamicBodies';
import StaticBodies from 'physics/bodies/StaticBodies';
import HingeBodies from 'physics/bodies/HingeBodies';

import ClothBodies from 'physics/bodies/ClothBodies';
import SoftBodies from 'physics/bodies/SoftBodies';
import RopeBodies from 'physics/bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from 'physics/constants';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    this.clock = new Clock();
    this.worker = new PhysicsWorker();

    this._collisionReport = false;
    this._fullCollisionReport = false;

    this._onMessage = this.onWorkerMessage.bind(this);
    this.worker.addEventListener('message', this._onMessage);

    this.worker.postMessage({
      params: [soft, gravity],
      action: 'init'
    });

    this.kinematic = new KinematicBodies(this.worker);
    this.dynamic = new DynamicBodies(this.worker);
    this.static = new StaticBodies(this.worker);
    this.hinge = new HingeBodies(this.worker);

    this.cloth = new ClothBodies(this.worker);
    this.rope = new RopeBodies(this.worker);
    this.soft = new SoftBodies(this.worker);
  }

  onWorkerMessage (event) {
    const action = event.data.action;
    this[action].call(this, event.data);
  }

  updateBodies (data) {
    const delta = this.clock.getDelta();
    const bodies = this[data.type].update(data.bodies);

    this.worker.postMessage({
      action: 'updateBodies',
      params: {
        type: `${data.type}`,
        bodies: bodies,
        delta: delta
      }
    });
  }

  setCollisionReport (report, fullReport = false) {
    this.worker.postMessage({
      params: [report, fullReport],
      action: 'reportCollisions'
    });
  }

  updateCollisionReport (report) {
    this._collisionReport = report.params[0];
    this._fullCollisionReport = report.params[1];
  }

  reportCollisions (report) {
    // console.log(report);

    // if (this._fullCollisionReport) {
    //   // report.contacts
    //   // report.bodies[0]
    //   // report.bodies[1]

    //   report.forEach((data) => {
    //     // console.log(data.bodies[0], data.bodies[1]);
    //   });
    // } else {
    //   // report.contacts
    //   // report.bodies[0]
    //   // report.bodies[1]
    //   console.log(report.bodies[0], report.bodies[1]);
    // }

    if (report.active) {
      report.collisions.forEach((collision) => {
        // collision.contacts
        // collision.bodies[0]
        // collision.bodies[1]
      });
    }

    // this.static.updateCollisions(report.bodies, { contacts: report.contacts });
    // this.dynamic.updateCollisions(report.bodies, { contacts: report.contacts });
    // this.kinematic.updateCollisions(report.bodies, { contacts: report.contacts });
  }

  /* addVehicle (mesh, mass, controls, moto = false) {
    const vehicle = new VehicleBody(this.world, controls, moto);
    vehicle.addChassis(mesh, mass);
    this.vehicles.push(vehicle);
    return vehicle;
  } */

  /* update () {
    for (let i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].update();
    }
  } */

  destroy () {
    this.worker.removeEventListener('message', this._onMessage);

    delete this.kinematic;
    delete this.dynamic;
    delete this.static;
    delete this.hinge;

    delete this.cloth;
    delete this.soft;
    delete this.rope;

    delete this.worker;
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
}
