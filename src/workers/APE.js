import PhysicsWorker from 'worker-loader?name=worker.js!workers/PhysicsWorker.js';

import ConeTwistConstraints from '@/workers/ConeTwistConstraints';
import GenericConstraints from '@/workers/GenericConstraints';
import SliderConstraints from '@/workers/SliderConstraints';
import HingeConstraints from '@/workers/HingeConstraints';
import PointConstraints from '@/workers/PointConstraints';

import KinematicBodies from '@/workers/KinematicBodies';
import DynamicBodies from '@/workers/DynamicBodies';
import StaticBodies from '@/workers/StaticBodies';

import ClothBodies from '@/workers/ClothBodies';
import SoftBodies from '@/workers/SoftBodies';
import RopeBodies from '@/workers/RopeBodies';

import PhysicsRay from '@/workers/PhysicsRay';
import { Clock } from 'three/src/core/Clock';
import * as CONSTANTS from '@/constants';

class APE {
  constructor () {
    this.worker = new PhysicsWorker();
    this._clock = new Clock();

    this._collisionReport = false;
    this._fullCollisionReport = false;

    this._onMessage = this.onWorkerMessage.bind(this);
    this.worker.addEventListener('message', this._onMessage);

    for (const constant in CONSTANTS) {
      const value = CONSTANTS[constant];

      if (!constant.indexOf('MASK_')) {
        this[constant] = value;
      }
    }
  }

  init (soft = false, gravity = CONSTANTS.GRAVITY) {
    this._soft = soft;
    this._collisions = 0;
    this._gravity = gravity;

    this.worker.postMessage({
      params: [soft, gravity],
      action: 'init'
    });

    this.ConeTwist = new ConeTwistConstraints(this.worker);
    this.Generic = new GenericConstraints(this.worker);
    this.Slider = new SliderConstraints(this.worker);
    this.Hinge = new HingeConstraints(this.worker);
    this.Point = new PointConstraints(this.worker);

    this.Kinematic = new KinematicBodies(this.worker);
    this.Dynamic = new DynamicBodies(this.worker);
    this.Raycaster = new PhysicsRay(this.worker);
    this.Static = new StaticBodies(this.worker);

    if (this._soft) {
      this.Cloth = new ClothBodies(this.worker);
      this.Rope = new RopeBodies(this.worker);
      this.Soft = new SoftBodies(this.worker);
    }

    return this;
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
    this.Raycaster.setResult(data);
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
    this.worker.postMessage({ action: 'destroy' });

    delete this.ConeTwist;
    delete this.Generic;
    delete this.Slider;
    delete this.Hinge;
    delete this.Point;

    delete this.Kinematic;
    delete this.Dynamic;
    delete this.Static;

    delete this.Raycaster;
    delete this.worker;
    delete this._clock;

    if (this._soft) {
      delete this.Cloth;
      delete this.Soft;
      delete this.Rope;
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

export default new APE();
