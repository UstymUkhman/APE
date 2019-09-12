import { GENERIC_VELOCITY, GENERIC_MAX_FORCE } from '@/constants';
import Constraints from '@/constraints/Constraints';
import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from '@/utils';

export default class GenericConstraints extends Constraints {
  constructor (world, events) {
    super(world, 'generic');
    this.events = events;

    /* eslint-disable new-cap */
    this.limit = new Ammo.btVector3();
    /* eslint-enable new-cap */
  }

  addBody (bodyMesh, axis, position = new Vector3()) {
    this.events.emit('getGenericBody',
      bodyMesh.uuid, {
        position: position,
        axis: axis
      }
    );

    return this._uuid;
  }

  addBodies (body0, body1, axis0, axis1, position0 = new Vector3(), position1 = new Vector3()) {
    this.events.emit('getGenericBodies',
      body0.uuid, body1.uuid, {
        positions: [position0, position1],
        axis: [axis0, axis1]
      }
    );

    return this._uuid;
  }

  attachBody (body, pivot) {
    /* eslint-disable new-cap */
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pivot.position.x, pivot.position.y, pivot.position.z));

    const rotation = transform.getRotation();
    // rotation.setEulerZYX(-pivot.axis.z, -pivot.axis.y, -pivot.axis.x);
    rotation.setEulerZYX(pivot.axis.z, pivot.axis.y, pivot.axis.x);
    transform.setRotation(rotation);

    const generic = new Ammo.btGeneric6DofConstraint(
      body, transform, true
    );

    /* eslint-enable new-cap */
    Ammo.destroy(transform);
    this.add(generic);
  }

  attachBodies (body0, body1, pivot) {
    /* eslint-disable new-cap */
    const transform0 = new Ammo.btTransform();
    const transform1 = new Ammo.btTransform();

    transform0.setIdentity();
    transform1.setIdentity();

    transform0.setOrigin(new Ammo.btVector3(pivot.positions[0].x, pivot.positions[0].y, pivot.positions[0].z));
    let rotation = transform0.getRotation();

    // rotation.setEulerZYX(-pivot.axis[0].z, -pivot.axis[0].y, -pivot.axis[0].x);
    rotation.setEulerZYX(pivot.axis[0].z, pivot.axis[0].y, pivot.axis[0].x);
    transform0.setRotation(rotation);

    transform1.setOrigin(new Ammo.btVector3(pivot.positions[1].x, pivot.positions[1].y, pivot.positions[1].z));
    rotation = transform1.getRotation();

    // rotation.setEulerZYX(-pivot.axis[1].z, -pivot.axis[1].y, -pivot.axis[1].x);
    rotation.setEulerZYX(pivot.axis[1].z, pivot.axis[1].y, pivot.axis[1].x);
    transform1.setRotation(rotation);

    const generic = new Ammo.btGeneric6DofConstraint(
      body0, body1, transform0, transform1, true
    );

    /* eslint-enable new-cap */
    Ammo.destroy(transform0);
    Ammo.destroy(transform1);
    this.add(generic);
  }

  setAngularMotor (uuid, index, lowLimit = 0, highLimit = 0, velocity = GENERIC_VELOCITY, maxForce = GENERIC_MAX_FORCE) {
    const constraint = this.getConstraintByUUID(uuid);
    const motor = constraint.getRotationalLimitMotor(index);

    motor.set_m_targetVelocity(velocity);
    motor.set_m_maxMotorForce(maxForce);

    motor.set_m_hiLimit(highLimit);
    motor.set_m_loLimit(lowLimit);
  }

  enableAngularMotor (uuid, index) {
    const constraint = this.getConstraintByUUID(uuid);
    constraint.getRotationalLimitMotor(index).set_m_enableMotor(true);
  }

  disableAngularMotor (uuid, index) {
    const constraint = this.getConstraintByUUID(uuid);
    constraint.getRotationalLimitMotor(index).set_m_enableMotor(false);
  }

  setAngularLimit (uuid, lower = new Vector3(), upper = new Vector3()) {
    const constraint = this.getConstraintByUUID(uuid);

    this.limit.setValue(lower.x, lower.y, lower.z);
    constraint.setAngularLowerLimit(this.limit);

    this.limit.setValue(upper.x, upper.y, upper.z);
    constraint.setAngularUpperLimit(this.limit);
  }

  setLinearLimit (uuid, lower = new Vector3(), upper = new Vector3()) {
    const constraint = this.getConstraintByUUID(uuid);

    this.limit.setValue(lower.x, lower.y, lower.z);
    constraint.setLinearLowerLimit(this.limit);

    this.limit.setValue(upper.x, upper.y, upper.z);
    constraint.setLinearUpperLimit(this.limit);
  }
}
