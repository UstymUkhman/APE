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

    this._collisions = 0;
    this._gravity = gravity;
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
    this._collisions = report.count;

    report.collisions.forEach((collision) => {
      const body0 = collision.bodies[0];
      const body1 = collision.bodies[1];

      const type0 = body0.type;
      const type1 = body1.type;

      const body0Mesh = this[type0].getBody(body0.uuid);
      const body1Mesh = this[type1].getBody(body1.uuid);

      const hasContactsData = this._fullCollisionReport && !!collision.contacts.length;
      const contacts = !this._fullCollisionReport || hasContactsData ? collision.contacts : null;

      if (body0.collisionFunction) {
        this[type0].updateCollisions(
          { mesh: body0Mesh, type: type0, callback: body0.collisionFunction },
          { mesh: body1Mesh, type: type1 },
          contacts
        );
      }

      if (body1.collisionFunction) {
        this[type1].updateCollisions(
          { mesh: body1Mesh, type: type1, callback: body1.collisionFunction },
          { mesh: body0Mesh, type: type0 },
          contacts
        );
      }
    });
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

  set gravity (value) {
    this._gravity = value;

    this.worker.postMessage({
      params: { gravity: value },
      action: 'setGravity'
    });
  }

  get gravity () {
    return this._gravity;
  }

  get collisions () {
    return this._collisions;
  }
}
