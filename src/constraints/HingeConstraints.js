import { Vector3 } from 'three/src/math/Vector3';
import { HINGE_FORCE } from '@/constants';
import Constraint from './Constraint';
import Ammo from 'utils/Ammo';

export default class HingeConstraints extends Constraint {
  constructor (world, events) {
    super(world, 'hinge');

    this.events = events;
    this.force = HINGE_FORCE;
  }

  addBody (bodyMesh, axis, bodyPivot = new Vector3()) {
    this.events.emit('getHingeBody',
      bodyMesh.uuid, {
        bodyPivot: bodyPivot,
        axis: axis
      }
    );

    return this.constraints.length - 1;
  }

  addBodies (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    this.events.emit('getHingeBodies',
      pinMesh.uuid, armMesh.uuid, {
        pinPivot: pinPivot,
        armPivot: armPivot,
        axis: axis
      }
    );

    return this.constraints.length - 1;
  }

  hingeBody (body, position) {
    /* eslint-disable new-cap */
    const hinge = new Ammo.btHingeConstraint(body,
      new Ammo.btVector3(position.bodyPivot.x, position.bodyPivot.y, position.bodyPivot.z),
      new Ammo.btVector3(position.axis.x, position.axis.y, position.axis.z)
    );
    /* eslint-enable new-cap */

    this.world.addConstraint(hinge, true);
    this.constraints.push(hinge);
    hinge.enableFeedback();
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
    this.world.addConstraint(hinge, true);
    this.constraints.push(hinge);
    hinge.enableFeedback();
  }

  update (index, direction) {
    const constraint = this.constraints[index];

    if (constraint) {
      constraint.enableAngularMotor(true, direction, this.force);
    }
  }

  activateAll () {
    for (let c = 0, length = this.constraints.length; c < length; c++) {
      const constraint = this.constraints[c];

      this.world.removeConstraint(constraint);
      this.world.addConstraint(constraint);
      constraint.activate();
    }
  }

  remove (index) {
    const constraint = this.constraints[index];
    if (!constraint) return false;

    this.world.removeConstraint(constraint);
    Ammo.destroy(constraint);

    this.constraints.splice(index, 1);
    return true;
  }
}
