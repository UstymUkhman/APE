import { Vector3 } from 'three/src/math/Vector3';
import { HINGE_FORCE } from 'physics/constants';
import Ammo from 'core/Ammo';

export default class HingeBodies {
  constructor (world, events) {
    this.bodies = [];
    this.world = world;
    this.events = events;
    this.force = HINGE_FORCE;
  }

  add (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    this.events.emit('getHingeComponents',
      pinMesh.uuid, armMesh.uuid, {
        axis: axis,
        pinPivot: pinPivot,
        armPivot: armPivot
      }
    );

    return this.bodies.length - 1;
  }

  addBodies (pin, arm, position) {
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
    this.bodies.push(hinge);
  }

  update (index, direction) {
    const body = this.bodies[index];

    if (body) {
      console.log(index, direction, this.force);
      body.enableAngularMotor(true, direction, this.force);
    }
  }

  remove (index) {
    const body = this.bodies[index];

    if (!body) return false;

    this.world.removeRigidBody(body);
    Ammo.destroy(body);

    this.bodies.splice(index, 1);
    return true;
  }

  activateAll () {
    this.bodies.forEach((body) => {
      this.world.removeConstraint(body);
      this.world.addConstraint(body);
      body.activate();
    });
  }
}
