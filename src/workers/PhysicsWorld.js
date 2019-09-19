import { Clock } from 'three/src/core/Clock';

export default class PhysicsWorld {
  constructor (soft, gravity, worker) {
    this._fullCollisionReport = false;
    this._collisionReport = false;

    this._clock = new Clock();
    this._gravity = gravity;
    this._worker = worker;
    this._collisions = 0;
    this._soft = soft;

    this._onMessage = this.onWorkerMessage.bind(this);
    this._worker.addEventListener('message', this._onMessage);

    this._worker.postMessage({
      params: [soft, gravity],
      action: 'init'
    });
  }

  onWorkerMessage (event) {
    const action = event.data.action;
    this[action].call(this, event.data);
  }

  updateBodies (data) {
    const bodies = this[data.type].update(data.bodies);
    const delta = this._clock.getDelta();

    this._worker.postMessage({
      action: 'updateBodies',
      params: {
        type: `${data.type}`,
        bodies: bodies,
        delta: delta
      }
    });
  }

  setCollisionReport (report, fullReport = false) {
    this._worker.postMessage({
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

  setPhysicsRay (raycaster) {
    this.ray = raycaster;
  }

  setRayResult (data) {
    this.ray.setResult(data);
  }

  setBodyType (type, bodies) {
    this[type] = bodies;
  }

  /* destroy () {
    this._worker.removeEventListener('message', this._onMessage);
  } */

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

    this._worker.postMessage({
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
