import { SLIDER_ACCELERATION } from '@/constants';
import { Vector3 } from 'three/src/math/Vector3';
import Constraints from '@/workers/Constraints';

export default class SliderConstraints extends Constraints {
  constructor (worker) {
    super('Slider', worker);
  }

  addBody (bodyMesh, axis, position = new Vector3()) {
    return super.add({
      method: 'attachBody',
      body: bodyMesh.uuid,
      position: position,
      axis: axis
    });
  }

  addBodies (body0, body1, axis, position0 = new Vector3(), position1 = new Vector3()) {
    return super.add({
      method: 'attachBodies',
      position0: position0,
      position1: position1,
      body0: body0.uuid,
      body1: body1.uuid,
      axis: axis
    });
  }

  enableAngularMotor (uuid, velocity = 1, acceleration = SLIDER_ACCELERATION) {
    this.worker.postMessage({
      action: 'enableAngularMotor',

      params: {
        acceleration: acceleration,
        velocity: velocity,
        type: this.type,
        uuid: uuid
      }
    });
  }

  enableLinearMotor (uuid, velocity = 1, acceleration = SLIDER_ACCELERATION) {
    this.worker.postMessage({
      action: 'enableLinearMotor',

      params: {
        acceleration: acceleration,
        velocity: velocity,
        type: this.type,
        uuid: uuid
      }
    });
  }

  disableAngularMotor (uuid) {
    this.worker.postMessage({
      action: 'disableAngularMotor',

      params: {
        type: this.type,
        uuid: uuid
      }
    });
  }

  disableLinearMotor (uuid) {
    this.worker.postMessage({
      action: 'disableLinearMotor',

      params: {
        type: this.type,
        uuid: uuid
      }
    });
  }

  setSoftnessLimit (uuid, linear = 0, angular = 0) {
    this.worker.postMessage({
      action: 'setSoftnessLimit',

      params: {
        angular: angular,
        type: this.type,
        linear: linear,
        uuid: uuid
      }
    });
  }

  setAngularLimit (uuid, lower = 0, upper = 0) {
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

  setLinearLimit (uuid, lower = 0, upper = 0) {
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
