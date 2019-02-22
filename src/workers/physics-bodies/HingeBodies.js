// Hinge bodies class manager

import { HINGE_FORCE } from 'physics/constants';
import { Ammo } from 'core/Ammo';

export default class HingeBodies {
  /**
   * @constructs HingeBodies
   * @param {Object} world - Ammo.js soft/rigid dynamics world
   * @description - Initialize default parameters for cloth bodies
   */
  constructor (world) {
    this.bodies = [];
    this.world = world;
    this.force = HINGE_FORCE;
  }

  /**
   * @public
   * @description - Add hinge body collider to THREE.js mesh
   * @param {Object} pinMesh - THREE.js mesh used as pin
   * @param {Object} armMesh - THREE.js mesh used as hinge's arm
   * @param {Object} axis - <Vector3> rotation axes of hinge's arm
   * @param {Object} pinPivot - pin's pivot position
   * @param {Object} armPivot - arm's pivot position
   */
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

  /**
   * @public
   * @description - Update hinge bodies in requestAnimation loop
   * @param {Number} direction - arm's movement amount along it's rotation axis/axes
   */
  update (params) {
    const body = this.bodies[params.index];

    if (body) {
      body.enableAngularMotor(true, params.direction, this.force);
    }
  }
}
