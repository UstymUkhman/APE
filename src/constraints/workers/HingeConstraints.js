import Constraints from '@/constraints/Constraints';
import { Ammo } from '@/utils';

export default class HingeConstraints extends Constraints {
  constructor (world) {
    super(world, 'Hinge');
  }

  hingeBody (props) {
    /* eslint-disable new-cap */
    const hinge = new Ammo.btHingeConstraint(props.body,
      new Ammo.btVector3(props.pivot.x, props.pivot.y, props.pivot.z),
      new Ammo.btVector3(props.axis.x, props.axis.y, props.axis.z)
    );

    /* eslint-enable new-cap */
    this.uuids.push(props.uuid);
    this.add(hinge);
  }

  hingeBodies (props) {
    /* eslint-disable new-cap */
    const armAxis = new Ammo.btVector3(props.axis.x, props.axis.y, props.axis.z);

    const hinge = new Ammo.btHingeConstraint(
      props.pin, props.arm,
      new Ammo.btVector3(props.pinPivot.x, props.pinPivot.y, props.pinPivot.z),
      new Ammo.btVector3(props.armPivot.x, props.armPivot.y, props.armPivot.z),
      armAxis, armAxis, true
    );

    /* eslint-enable new-cap */
    this.uuids.push(props.uuid);
    this.add(hinge);
  }

  setLimit (props) {
    const constraint = this.getConstraintByUUID(props.uuid);
    constraint.setLimit(props.low, props.high, 0, props.bias, props.relaxation);
  }

  enableMotor (props) {
    const constraint = this.getConstraintByUUID(props.uuid);
    constraint.enableAngularMotor(true, props.velocity, props.acceleration);
  }

  disableMotor (props) {
    const constraint = this.getConstraintByUUID(props.uuid);
    constraint.enableMotor(false);
  }
}
