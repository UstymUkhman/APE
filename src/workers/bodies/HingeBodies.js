import { HINGE_FORCE } from 'physics/constants';
import Ammo from 'core/Ammo';

export default class HingeBodies {
  constructor (world) {
    this.bodies = [];
    this.world = world;
    this.force = HINGE_FORCE;
  }

  addBodies (props) {
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
    this.bodies.push(hinge);
  }

  activateAll () {
    this.bodies.forEach((body) => {
      this.world.removeConstraint(body);
      this.world.addConstraint(body);
      body.activate();
    });
  }

  update (params) {
    const body = this.bodies[params.index];

    if (body) {
      body.enableAngularMotor(true, params.direction, this.force);
    }
  }

  remove (props) {
    const body = this.bodies[props.index];

    if (!body) return false;

    this.world.removeRigidBody(body);
    Ammo.destroy(body);

    this.bodies.splice(props.index, 1);
    return true;
  }
}
