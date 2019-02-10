// Kinematic bodies class manager

import RigidBody from 'workers/physics-bodies/RigidBody';
import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

import {
  ZERO_MASS,
  KINEMATIC_COLLISION,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class KinematicBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs KinematicBodies
   * @description - Initialize kinematic bodies physics
   * @param {Object} world - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (world) {
    super();
    this.bodies = [];
    this.world = world;

    /* eslint-disable new-cap */
    this.position = new Ammo.btVector3();
    this.rotation = new Ammo.btQuaternion();
    /* eslint-enable new-cap */
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addBox (props) {
    const box = this.createBox(props.size);
    this._addKinematicBody(props.uuid, box, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCylinder (props) {
    const cylinder = this.createCylinder(props.size);
    this._addKinematicBody(props.uuid, cylinder, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCapsule (props) {
    const capsule = this.createCapsule(props.size);
    this._addKinematicBody(props.uuid, capsule, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCone (props) {
    const cone = this.createCone(props.size);
    this._addKinematicBody(props.uuid, cone, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addSphere (props) {
    const sphere = this.createSphere(props.size.radius);
    this._addKinematicBody(props.uuid, sphere, props.position, props.rotation);
  }

  /**
   * @private
   * @description - Create kinematic body and add it to physics world
   * @param {Object} shape - Ammo.js shape collider
   * @param {Object} mesh - THREE.js mesh
   */
  _addKinematicBody (uuid, shape, position, quaternion) {
    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    body.setActivationState(DISABLE_DEACTIVATION);

    this.bodies.push({uuid: uuid, body: body});
    this.world.addRigidBody(body);
  }

  /**
   * @public
   * @description - Update kinematic bodies in requestAnimation loop
   * @param {Object} transform - Ammo.js default btTransform
   */
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
}
