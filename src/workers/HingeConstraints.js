import { Vector3 } from 'three/src/math/Vector3';
import Constraints from '@/workers/Constraints';
import { HINGE_FORCE } from '@/constants';

export default class HingeConstraints extends Constraints {
  constructor (worker) {
    super('Hinge', worker);
    this.constants = { force: HINGE_FORCE };
  }

  addBody (bodyMesh, axis, pivot = new Vector3()) {
    return super.add({
      method: 'hingeBody',
      body: bodyMesh.uuid,
      pivot: pivot,
      axis: axis
    });
  }

  addBodies (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    return super.add({
      method: 'hingeBodies',
      pinPivot: pinPivot,
      armPivot: armPivot,
      pin: pinMesh.uuid,
      arm: armMesh.uuid,
      axis: axis
    });
  }

  setLimit (uuid, low = Math.PI, high = Math.PI, bias = 0, relaxation = 0) {
    this.worker.postMessage({
      action: 'setLimit',

      params: {
        relaxation: relaxation,
        type: this.type,
        uuid: uuid,
        bias: bias,
        high: high,
        low: low
      }
    });
  }

  // update (uuid, direction) {
  //   this.worker.postMessage({
  //     action: 'updateConstraints',

  //     params: {
  //       direction: direction,
  //       type: this.type,
  //       uuid: uuid
  //     }
  //   });
  // }
}
