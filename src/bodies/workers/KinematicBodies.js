import RigidBodies from '@/bodies/RigidBodies';
import { Ammo } from '@/utils';

import {
  ZERO_MASS,
  KINEMATIC_COLLISION,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class KinematicBodies extends RigidBodies {
  constructor (world) {
    super(world, 'Kinematic');

    /* eslint-disable new-cap */
    this.rotation = new Ammo.btQuaternion();
    /* eslint-enable new-cap */
  }

  addBox (props) {
    const box = this.createBox(props.size);
    this._addKinematicBody(props.uuid, box, props.position, props.rotation);
  }

  addCylinder (props) {
    const cylinder = this.createCylinder(props.size);
    this._addKinematicBody(props.uuid, cylinder, props.position, props.rotation);
  }

  addCapsule (props) {
    const capsule = this.createCapsule(props.size);
    this._addKinematicBody(props.uuid, capsule, props.position, props.rotation);
  }

  addCone (props) {
    const cone = this.createCone(props.size);
    this._addKinematicBody(props.uuid, cone, props.position, props.rotation);
  }

  addSphere (props) {
    const sphere = this.createSphere(props.size.radius);
    this._addKinematicBody(props.uuid, sphere, props.position, props.rotation);
  }

  _addKinematicBody (uuid, shape, position, quaternion) {
    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    this.bodies.push({uuid: uuid, body: body, collisions: []});
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body, this.group, this.mask);
  }

  update (transform, bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const mesh = bodies[i];
      const body = this.getBodyByUUID(mesh.uuid).body;

      const motionState = body.getMotionState();

      this.rotation.setValue(mesh.rotation._x, mesh.rotation._y, mesh.rotation._z, mesh.rotation._w);
      transform.getOrigin().setValue(mesh.position.x, mesh.position.y, mesh.position.z);
      transform.setRotation(this.rotation);

      if (motionState) {
        motionState.setWorldTransform(transform);
      }
    }

    self.postMessage({
      action: 'updateBodies',
      type: 'Kinematic'
    });
  }
}
