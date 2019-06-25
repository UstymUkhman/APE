import { Vector3 } from 'three/src/math/Vector3';
import { HINGE_FORCE } from '@/constants';

export default class HingeConstraints {
  constructor (worker) {
    this._bodies = 0;
    this.worker = worker;

    this.constants = { force: HINGE_FORCE };
    worker.postMessage({action: 'initHingeConstraints'});
  }

  addBody (bodyMesh, axis, bodyPivot = new Vector3()) {
    this.worker.postMessage({
      action: 'addConstraint',

      params: {
        bodyPivot: bodyPivot,
        method: 'hingeBody',
        body: bodyMesh.uuid,
        type: 'hinge',
        axis: axis
      }
    });

    return this._bodies++;
  }

  addBodies (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    this.worker.postMessage({
      action: 'addConstraint',

      params: {
        method: 'hingeBodies',
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

  update (index, direction) {
    this.worker.postMessage({
      action: 'updateConstraints',
      params: {
        direction: direction,
        index: index,
        type: 'hinge'
      }
    });
  }

  remove (index) {
    this.worker.postMessage({
      action: 'removeConstraint',

      params: {
        index: index,
        type: 'hinge'
      }
    });
  }
}
