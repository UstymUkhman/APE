import { HINGE_ACCELERATION } from '@/constants';
import { Vector3 } from 'three/src/math/Vector3';
import Constraints from '@/workers/Constraints';

export default class HingeConstraints extends Constraints {
  constructor (worker) {
    super('Hinge', worker);
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

  enableMotor (uuid, velocity = 1, acceleration = HINGE_ACCELERATION) {
    this.worker.postMessage({
      action: 'enableMotor',

      params: {
        acceleration: acceleration,
        velocity: velocity,
        type: this.type,
        uuid: uuid
      }
    });
  }

  disableMotor (uuid) {
    this.worker.postMessage({
      action: 'disableMotor',

      params: {
        type: this.type,
        uuid: uuid
      }
    });
  }
}
