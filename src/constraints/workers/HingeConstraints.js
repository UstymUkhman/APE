import Constraints from '@/constraints/Constraints';
import { HINGE_FORCE } from '@/constants';
import { Ammo } from '@/utils';

export default class HingeConstraints extends Constraints {
  constructor (world) {
    super(world, 'hinge');
    this.force = HINGE_FORCE;
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

  // Will be replaced with
  // more generic methods:
  update (uuid, direction) {
    const constraint = this.getConstraintByUUID(uuid);

    if (constraint) {
      constraint.enableAngularMotor(true, direction, this.force);
    } else {
      console.warn(
        `There\'s no \'${this.type}\' constraint with \'${uuid}\' UUID.`
      );
    }
  }
}
