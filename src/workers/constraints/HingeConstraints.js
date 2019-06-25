import { HINGE_FORCE } from '@/constants';
import Constraint from './Constraint';
import Ammo from 'utils/Ammo';

export default class HingeConstraints extends Constraint {
  constructor (world) {
    super(world, 'hinge');
    this.force = HINGE_FORCE;
  }

  hingeBody (props) {
    /* eslint-disable new-cap */
    const hinge = new Ammo.btHingeConstraint(props.body,
      new Ammo.btVector3(props.bodyPivot.x, props.bodyPivot.y, props.bodyPivot.z),
      new Ammo.btVector3(props.axis.x, props.axis.y, props.axis.z)
    );
    /* eslint-enable new-cap */

    this.world.addConstraint(hinge, true);
    this.constraints.push(hinge);
    hinge.enableFeedback();
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
    this.world.addConstraint(hinge, true);
    this.constraints.push(hinge);
    hinge.enableFeedback();
  }

  update (params) {
    const constraint = this.constraints[params.index];

    if (constraint) {
      constraint.enableAngularMotor(true, params.direction, this.force);
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
