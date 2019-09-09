import PhysicsWorker from 'worker-loader!worker/PhysicsWorker.js';

import ConeTwistConstraints from './web/constraints/ConeTwistConstraints';
import SliderConstraints from './web/constraints/SliderConstraints';
import HingeConstraints from './web/constraints/HingeConstraints';
import PointConstraints from './web/constraints/PointConstraints';

import KinematicBodies from './web/bodies/KinematicBodies';
import DynamicBodies from './web/bodies/DynamicBodies';
import StaticBodies from './web/bodies/StaticBodies';

import ClothBodies from './web/bodies/ClothBodies';
import SoftBodies from './web/bodies/SoftBodies';
import RopeBodies from './web/bodies/RopeBodies';

import { Clock } from 'three/src/core/Clock';
import PhysicsRay from './web/PhysicsRay';
import { GRAVITY } from '@/constants';

export default class PhysicsWorld {
  constructor (soft = false, gravity = GRAVITY) {
    this.worker = new PhysicsWorker();
    this._clock = new Clock();

    this._soft = soft;
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

    this.coneTwist = new ConeTwistConstraints(this.worker);
    this.slider = new SliderConstraints(this.worker);
    this.hinge = new HingeConstraints(this.worker);
    this.point = new PointConstraints(this.worker);

    this.kinematic = new KinematicBodies(this.worker);
    this.dynamic = new DynamicBodies(this.worker);
    this.static = new StaticBodies(this.worker);

    this.ray = new PhysicsRay(this.worker);

    if (this._soft) {
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
    const bodies = this[data.type].update(data.bodies);
    const delta = this._clock.getDelta();

    this.worker.postMessage({
      action: 'updateBodies',
      params: {
        type: `${data.type}`,
        bodies: bodies,
        delta: delta
      }
    });
  }

  setRayResult (data) {
    this.ray.setResult(data);
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

    delete this.coneTwist;
    delete this.slider;
    delete this.hinge;
    delete this.point;

    delete this.kinematic;
    delete this.dynamic;
    delete this.static;

    delete this.worker;
    delete this._clock;
    delete this.ray;

    if (this._soft) {
      delete this.cloth;
      delete this.soft;
      delete this.rope;
    }
  }

  set collisionReport (report) {
    this.setCollisionReport(report);
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

  get collisions () {
    return this._collisions;
  }

  get gravity () {
    return this._gravity;
  }
}
