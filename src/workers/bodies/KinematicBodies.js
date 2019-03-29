import RigidBody from 'workers/bodies/RigidBody';
import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

import {
  ZERO_MASS,
  KINEMATIC_COLLISION,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class KinematicBodies extends RigidBody {
  constructor (world) {
    super();
    this.bodies = [];
    this.world = world;

    /* eslint-disable new-cap */
    this.position = new Ammo.btVector3();
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

  getCollisionStatus (body) {
    const collider = find(this.bodies, { body: body });

    if (collider) {
      const status = super.getCollisionStatus(collider.colliding);
      collider.colliding = true;

      return {
        uuid: collider.uuid,
        colliding: status,
        type: 'kinematic'
      };
    }

    return null;
  }

  _addKinematicBody (uuid, shape, position, quaternion) {
    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    this.bodies.push({uuid: uuid, body: body, colliding: false});
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body);
  }

  resetCollision (uuid) {
    const body = find(this.bodies, { uuid: uuid });
    body.colliding = false;
  }

  update (transform, bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const mesh = bodies[i];
      const body = find(this.bodies, { uuid: mesh.uuid }).body;

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
      type: 'kinematic'
    });
  }

  remove (props) {
    const mesh = find(this.bodies, { uuid: props.uuid });
    const index = this.bodies.indexOf(mesh);

    if (mesh === -1) return false;

    this.world.removeRigidBody(mesh.body);
    Ammo.destroy(mesh.body);

    this.bodies.splice(index, 1);
    return true;
  }
}
