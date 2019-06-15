import WorldManager from 'worker-loader!workers/WorldManager.js';

import KinematicBodies from './bodies/KinematicBodies';
import DynamicBodies from './bodies/DynamicBodies';
import StaticBodies from './bodies/StaticBodies';
import HingeBodies from './bodies/HingeBodies';

import ClothBodies from './bodies/ClothBodies';
import SoftBodies from './bodies/SoftBodies';
import RopeBodies from './bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import { GRAVITY } from '../constants';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    this.worker = new WorldManager();
    this.clock = new Clock();

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

    if (soft) {
      this.cloth = new ClothBodies(this.worker);
      this.rope = new RopeBodies(this.worker);
      this.soft = new SoftBodies(this.worker);
    }
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
    const collisions = report.collisions;

    for (let c = 0, length = collisions.length; c < length; c++) {
      const collision = collisions[c];
      const body0 = collision.bodies[0];
      const body1 = collision.bodies[1];

      if (!body0 || !body1) return;

      const type0 = body0.type;
      const type1 = body1.type;

      const body0Mesh = this[type0].getBody(body0.uuid);
      const body1Mesh = this[type1].getBody(body1.uuid);

      const existingBodies = body0Mesh && body1Mesh;
      const collisionFunction = this[collision.collisionFunction];
      const hasContactsData = this._fullCollisionReport && !!this._collisions;
      const contacts = !this._fullCollisionReport || hasContactsData ? collision.contacts : null;

      if (existingBodies && collisionFunction) {
        collisionFunction({
          collisionPoint: body0.collisionPoint,
          bodyPoint: body0.bodyPoint,
          mesh: body0Mesh,
          type: type0
        }, {
          collisionPoint: body1.collisionPoint,
          bodyPoint: body1.bodyPoint,
          mesh: body1Mesh,
          type: type1
        }, contacts);
      }
    }
  }

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
