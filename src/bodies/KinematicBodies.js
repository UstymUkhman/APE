import RigidBody from '@/super/RigidBody';
import { Ammo } from '@/utils';

import {
  ZERO_MASS,
  KINEMATIC_COLLISION,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class KinematicBodies extends RigidBody {
  constructor (world) {
    super(world, 'kinematic');

    /* eslint-disable new-cap */
    this.rotation = new Ammo.btQuaternion();
    /* eslint-enable new-cap */
  }

  addBox (mesh) {
    const size = mesh.geometry.parameters;
    const box = this.createBox(size);
    this._addKinematicBody(mesh, box);
  }

  addCylinder (mesh) {
    const size = mesh.geometry.parameters;
    const cylinder = this.createCylinder(size);
    this._addKinematicBody(mesh, cylinder);
  }

  addCapsule (mesh) {
    const size = mesh.geometry.parameters;
    const capsule = this.createCapsule(size);
    this._addKinematicBody(mesh, capsule);
  }

  addCone (mesh) {
    const size = mesh.geometry.parameters;
    const cone = this.createCone(size);
    this._addKinematicBody(mesh, cone);
  }

  addSphere (mesh) {
    const radius = mesh.geometry.parameters.radius;
    const sphere = this.createSphere(radius);
    this._addKinematicBody(mesh, sphere);
  }

  _addKinematicBody (mesh, shape) {
    const position = mesh.position.clone();
    const quaternion = mesh.quaternion.clone();

    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body);

    this.bodies.push({
      type: 'kinematic',
      uuid: mesh.uuid,
      collisions: [],
      mesh: mesh,
      body: body
    });
  }

  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const mesh = this.bodies[i].mesh;
      const body = this.bodies[i].body;

      const motionState = body.getMotionState();

      this.rotation.setValue(mesh.quaternion._x, mesh.quaternion._y, mesh.quaternion._z, mesh.quaternion._w);
      transform.getOrigin().setValue(mesh.position.x, mesh.position.y, mesh.position.z);
      transform.setRotation(this.rotation);

      if (motionState) {
        motionState.setWorldTransform(transform);
      }
    }
  }
}
