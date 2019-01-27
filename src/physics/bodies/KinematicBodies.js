// Kinematic bodies class manager

import RigidBody from 'physics/bodies/RigidBody';
import { Ammo } from 'core/Ammo';

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
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (physicWorld) {
    super();

    this.bodies = [];
    this.world = physicWorld;

    /* eslint-disable new-cap */
    this.rotation = new Ammo.btQuaternion();
    /* eslint-enable new-cap */
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addBox (mesh) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size);
    this._addKinematicBody(box, mesh);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCylinder (mesh) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size);
    this._addKinematicBody(cylinder, mesh);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCapsule (mesh) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size);
    this._addKinematicBody(capsule, mesh);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCone (mesh) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size);
    this._addKinematicBody(cone, mesh);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addSphere (mesh) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size);
    this._addKinematicBody(sphere, mesh);
  }

  /**
   * @private
   * @description - Create kinematic body and add it to physics world
   * @param {Object} shape - Ammo.js shape collider
   * @param {Object} mesh - THREE.js mesh
   */
  _addKinematicBody (shape, mesh) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, ZERO_MASS, position, quaternion);

    body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    body.setActivationState(DISABLE_DEACTIVATION);

    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Update kinematic bodies in requestAnimation loop
   * @param {Object} transform - Ammo.js default btTransform
   */
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
