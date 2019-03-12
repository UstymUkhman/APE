import { Vector3 } from 'three/src/math/Vector3';
import { HINGE_FORCE } from 'physics/constants';

export default class HingeBodies {
  constructor (worker) {
    this._bodies = 0;
    this.worker = worker;

    this.constants = { force: HINGE_FORCE };
    worker.postMessage({action: 'initHingeBodies'});
  }

  add (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        collider: 'Bodies',
        pinPivot: pinPivot,
        armPivot: armPivot,
        pin: pinMesh.uuid,
        arm: armMesh.uuid,
        type: 'hinge',
        axis: axis
      }
    });

    return this._bodies++;
  }

  update (bodyIndex, direction) {
    this.worker.postMessage({
      action: 'updateHingeBodies',
      params: {
        direction: direction,
        index: bodyIndex
      }
    });
  }

  remove (bodyIndex) {
    this.worker.postMessage({
      action: 'removeBody',

      params: {
        index: bodyIndex,
        type: 'hinge'
      }
    });
  }
}
