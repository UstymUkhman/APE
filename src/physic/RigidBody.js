import { ZERO_MASS } from 'physic/constants';
import { Ammo } from 'core/Ammo';

export default class RigidBody {
  constructor (world) {
    this.world = world;
    this.bodies = [];
  }

  /* eslint-disable new-cap */
  createBox (size, friction, margin) {
    const box = new Ammo.btBoxShape(new Ammo.btVector3(
      size.width / 2.0, size.height / 2.0, size.depth / 2.0
    ));

    this.setMargin(box, margin);
    return box;
  }

  createCylinder (size, friction, margin) {
    const cylinder = new Ammo.btCylinderShape(
      size.width, size.height / 2.0, size.depth / 2.0
    );

    this.setMargin(cylinder, margin);
    return cylinder;
  }

  createCapsule (size, friction, margin) {
    const capsule = new Ammo.btCapsuleShape(
      size.width, size.height / 2.0
    );

    this.setMargin(capsule, margin);
    return capsule;
  }

  createCone (size, friction, margin) {
    const cone = new Ammo.btConeShape(
      size.width, size.height / 2.0
    );

    this.setMargin(cone, margin);
    return cone;
  }

  createSphere (size, friction, margin) {
    const sphere = new Ammo.btSphereShape(size.width / 2.0);
    this.setMargin(sphere, margin);
    return sphere;
  }

  createRigidBody (shape, mass, friction, position, quaternion) {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

    const motion = new Ammo.btDefaultMotionState(transform);
    const inertia = new Ammo.btVector3(0.0, 0.0, 0.0);

    if (mass !== ZERO_MASS) {
      shape.calculateLocalInertia(mass, inertia);
    }

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, inertia));
    // body.setDamping(linearDamping, angularDamping);
    // body.setActivationState(DISABLE_DEACTIVATION);
    // body.setRestitution(restitution);
    body.setFriction(friction);
    return body;
  }
  /* eslint-enable new-cap */

  setMargin (shape, margin) {
    if (margin !== 0.04) {
      shape.setMargin(margin);
    }
  }
}
