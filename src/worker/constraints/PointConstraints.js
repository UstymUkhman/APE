import { Vector3 } from 'three/src/math/Vector3';

export default class PointConstraints {
  constructor (worker) {
    this.worker = worker;
    this._constraints = 0;

    worker.postMessage({action: 'initPointConstraints'});
  }

  addBody (bodyMesh, position = new Vector3()) {
    this.worker.postMessage({
      action: 'addConstraint',

      params: {
        method: 'attachBody',
        body: bodyMesh.uuid,
        position: position,
        type: 'point'
      }
    });

    return this._constraints++;
  }

  addBodies (body0, body1, position0 = new Vector3(), position1 = new Vector3()) {
    this.worker.postMessage({
      action: 'addConstraint',

      params: {
        method: 'attachBodies',
        position0: position0,
        position1: position1,
        body0: body0.uuid,
        body1: body1.uuid,
        type: 'point'
      }
    });

    return this._constraints++;
  }

  remove (index) {
    this.worker.postMessage({
      action: 'removeConstraint',

      params: {
        index: index,
        type: 'point'
      }
    });
  }
}
