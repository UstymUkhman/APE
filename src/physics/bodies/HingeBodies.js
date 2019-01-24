import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from 'core/Ammo';

export default class HingeBodies {
  constructor (physicWorld) {
    this.bodies = [];
    this.world = physicWorld;
  }

  add (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    /* eslint-disable new-cap */
    const armAxis = new Ammo.btVector3(axis.x, axis.y, axis.z);

    const hinge = new Ammo.btHingeConstraint(
      pinMesh.userData.physicsBody, armMesh.userData.physicsBody,
      new Ammo.btVector3(pinPivot.x, pinPivot.y, pinPivot.z),
      new Ammo.btVector3(armPivot.x, armPivot.y, armPivot.z),
      armAxis, armAxis, true
    );

    /* eslint-enable new-cap */
    this.world.addConstraint(hinge, true);
    this.bodies.push(hinge);
  }

  update (move) {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].enableAngularMotor(true, 1.5 * move, 50);
    }
  }
}
