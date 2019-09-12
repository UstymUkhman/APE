import { GENERIC_VELOCITY, GENERIC_MAX_FORCE } from '@/constants';
import { Vector3 } from 'three/src/math/Vector3';
import Constraints from '@/workers/Constraints';

export default class GenericConstraints extends Constraints {
  constructor (worker) {
    super('Generic', worker);
  }

  addBody (bodyMesh, axis, position = new Vector3()) {
    return super.add({
      method: 'attachBody',
      body: bodyMesh.uuid,
      position: position,
      axis: axis
    });
  }

  addBodies (body0, body1, axis0, axis1, position0 = new Vector3(), position1 = new Vector3()) {
    return super.add({
      method: 'attachBodies',
      position0: position0,
      position1: position1,
      body0: body0.uuid,
      body1: body1.uuid,
      axis0: axis0,
      axis1: axis1
    });
  }

  setAngularMotor (uuid, index, lowLimit = 0, highLimit = 0, velocity = GENERIC_VELOCITY, maxForce = GENERIC_MAX_FORCE) {
    this.worker.postMessage({
      action: 'setAngularMotor',

      params: {
        highLimit: highLimit,
        lowLimit: lowLimit,
        velocity: velocity,
        maxForce: maxForce,
        type: this.type,
        index: index,
        uuid: uuid
      }
    });
  }

  enableAngularMotor (uuid, index) {
    this.worker.postMessage({
      action: 'enableAngularMotor',

      params: {
        type: this.type,
        index: index,
        uuid: uuid
      }
    });
  }

  disableAngularMotor (uuid, index) {
    this.worker.postMessage({
      action: 'disableAngularMotor',

      params: {
        type: this.type,
        index: index,
        uuid: uuid
      }
    });
  }

  setAngularLimit (uuid, lower = new Vector3(), upper = new Vector3()) {
    this.worker.postMessage({
      action: 'setAngularLimit',

      params: {
        type: this.type,
        lower: lower,
        upper: upper,
        uuid: uuid
      }
    });
  }

  setLinearLimit (uuid, lower = new Vector3(), upper = new Vector3()) {
    this.worker.postMessage({
      action: 'setLinearLimit',

      params: {
        type: this.type,
        lower: lower,
        upper: upper,
        uuid: uuid
      }
    });
  }
}
