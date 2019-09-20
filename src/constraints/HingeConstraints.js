import Constraints from '@/constraints/Constraints';
import { HINGE_ACCELERATION } from '@/constants';
import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from '@/utils';

export default class HingeConstraints extends Constraints {
  constructor (world, events) {
    super(world, 'Hinge');
    this.events = events;
  }

  addBody (bodyMesh, axis, pivot = new Vector3()) {
    this.events.emit('getHingeBody',
      bodyMesh.uuid, {
        pivot: pivot,
        axis: axis
      }
    );

    return this._uuid;
  }

  addBodies (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    this.events.emit('getHingeBodies',
      pinMesh.uuid, armMesh.uuid, {
        pinPivot: pinPivot,
        armPivot: armPivot,
        axis: axis
      }
    );

    return this._uuid;
  }

  hingeBody (body, position) {
    /* eslint-disable new-cap */
    const hinge = new Ammo.btHingeConstraint(body,
      new Ammo.btVector3(position.pivot.x, position.pivot.y, position.pivot.z),
      new Ammo.btVector3(position.axis.x, position.axis.y, position.axis.z)
    );

    /* eslint-enable new-cap */
    this.add(hinge);
  }

  hingeBodies (pin, arm, position) {
    /* eslint-disable new-cap */
    const armAxis = new Ammo.btVector3(position.axis.x, position.axis.y, position.axis.z);

    const hinge = new Ammo.btHingeConstraint(
      pin, arm,
      new Ammo.btVector3(position.pinPivot.x, position.pinPivot.y, position.pinPivot.z),
      new Ammo.btVector3(position.armPivot.x, position.armPivot.y, position.armPivot.z),
      armAxis, armAxis, true
    );

    /* eslint-enable new-cap */
    this.add(hinge);
  }

  setLimit (uuid, low = Math.PI, high = Math.PI, bias = 0, relaxation = 0) {
    const constraint = this.getConstraintByUUID(uuid);
    constraint.setLimit(low, high, 0, bias, relaxation);
  }

  enableMotor (uuid, velocity = 1, acceleration = HINGE_ACCELERATION) {
    const constraint = this.getConstraintByUUID(uuid);
    constraint.enableAngularMotor(true, velocity, acceleration);
  }

  disableMotor (uuid) {
    const constraint = this.getConstraintByUUID(uuid);
    constraint.enableMotor(false);
  }
}
