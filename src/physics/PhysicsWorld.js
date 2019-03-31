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
    if (report.active) {
      report.collisions.forEach((collision) => {
        const body0 = collision.bodies[0];
        const body1 = collision.bodies[1];

        const type0 = body0.type;
        const type1 = body1.type;

        const body0Mesh = this[type0].getBody(body0.uuid);
        const body1Mesh = this[type1].getBody(body1.uuid);

        const hasContactsData = this._fullCollisionReport && !!collision.contacts.length;
        const contacts = !this._fullCollisionReport || hasContactsData ? collision.contacts : null;

        this[type0].updateCollisions(
          { callback: body0.collisionFunction, mesh: body0Mesh },
          { mesh: body1Mesh, type: type1 },
          contacts
        );

        this[type1].updateCollisions(
          { callback: body1.collisionFunction, mesh: body1Mesh },
          { mesh: body0Mesh, type: type0 },
          contacts
        );
      });
    }

    report.lost.forEach((bodies) => {
      const uuid0 = bodies[0].uuid;
      const uuid1 = bodies[1].uuid;

      const type0 = bodies[0].type;
      const type1 = bodies[1].type;

      const body0Mesh = this[type0].getBody(uuid0);
      const body1Mesh = this[type1].getBody(uuid1);

      this[type0].updateCollisions(
        { callback: 'onCollisionEnd', mesh: body0Mesh },
        { mesh: body1Mesh, type: type1 }
      );

      this[type1].updateCollisions(
        { callback: 'onCollisionEnd', mesh: body1Mesh },
        { mesh: body0Mesh, type: type0 }
      );
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
}
