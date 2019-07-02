import { HINGE_FORCE } from '@/constants';
import Constraint from './Constraint';
import { Ammo } from '@/utils';

export default class HingeConstraints extends Constraint {
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
    this.add(hinge);
  }

  update (params) {
    const constraint = this.constraints[params.index];

    if (constraint) {
      constraint.enableAngularMotor(true, params.direction, this.force);
    }
  }
}
