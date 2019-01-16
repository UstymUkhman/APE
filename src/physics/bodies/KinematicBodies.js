import RigidBody from 'physics/bodies/RigidBody';
import { Ammo } from 'core/Ammo';

import {
  ZERO_MASS,
  KINEMATIC_COLLISION,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class KinematicBodies extends RigidBody {
  constructor (physicWorld) {
    super();

    this.bodies = [];
    this.world = physicWorld;

    /* eslint-disable new-cap */
    this.rotation = new Ammo.btQuaternion();
    /* eslint-enable new-cap */
  }

  addBox (mesh) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size);
    this.addKinematicBody(box, mesh);
  }

  addCylinder (mesh) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size);
    this.addKinematicBody(cylinder, mesh);
  }

  addCapsule (mesh) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size);
    this.addKinematicBody(capsule, mesh);
  }

  addCone (mesh) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size);
    this.addKinematicBody(cone, mesh);
  }

  addSphere (mesh) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size);
    this.addKinematicBody(sphere, mesh);
  }

  addKinematicBody (shape, mesh) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, ZERO_MASS, position, quaternion);

    body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    body.setActivationState(DISABLE_DEACTIVATION);

    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }

  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const position = this.bodies[i].position;
      const quaternion = this.bodies[i].quaternion;
      const motionState = this.bodies[i].userData.physicsBody.getMotionState();

      transform.getOrigin().setValue(position.x, position.y, position.z);
      this.rotation.setValue(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      transform.setRotation(this.rotation);

      if (motionState) {
        motionState.setWorldTransform(transform);
      }
    }
  }
}
