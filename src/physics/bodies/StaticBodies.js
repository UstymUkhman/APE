// Static bodies class manager

// import { ZERO_MASS, DISABLE_DEACTIVATION } from 'physics/constants';
// import RigidBody from 'physics/bodies/RigidBody';
// import { Ammo } from 'core/Ammo';

import {
  MARGIN,
  FRICTION,
  ZERO_MASS,
  ONE_VECTOR3,
  RESTITUTION,
  LINEAR_DAMPING,
  ANGULAR_DAMPING,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class StaticBodies {
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = {
      margin: MARGIN,
      friction: FRICTION,
      restitution: RESTITUTION,
      linearFactor: ONE_VECTOR3,
      angularFactor: ONE_VECTOR3,
      linearDamping: LINEAR_DAMPING,
      angularDamping: ANGULAR_DAMPING
    };

    this.worker.postMessage({
      action: 'initStaticBodies'
    });
  }

  set margin (value) {
    this.constants.margin = value;

    this.worker.postMessage({
      action: 'updateStaticConstants',
      params: this.constants
    });
  }

  get margin () {
    return this.margin;
  }

  set friction (value) {
    this.constants.friction = value;

    this.worker.postMessage({
      action: 'updateStaticConstants',
      params: this.constants
    });
  }

  get friction () {
    return this.friction;
  }

  /**
   * @public
   * @description - Add plane-like collider to THREE.js mesh
   *                Used primarily to create ground/walls in physics world
   * @param {Object} mesh - THREE.js mesh with <PlaneBufferGeometry>
   */
  addPlane (mesh) {
    this.worker.postMessage({
      action: 'addStaticPlane',
      params: {
        // Convert X-axis rotation to
        // Z-axis rotation in Ammo.js:
        z: mesh.rotation.x / -Math.PI * 2.0,
        rotation: mesh.quaternion.clone(),
        position: mesh.position.clone(),
        uuid: mesh.uuid
      }
    });
  }

  // /**
  //  * @public
  //  * @description - Add box-like collider to THREE.js mesh
  //  * @param {Object} mesh - THREE.js mesh
  //  */
  // addBox (mesh) {
  //   const size = mesh.geometry.parameters;
  //   const box = super.createBox(size);
  //   this._addStaticBody(box, mesh);
  // }

  // /**
  //  * @public
  //  * @description - Add cylinder-like collider to THREE.js mesh
  //  * @param {Object} mesh - THREE.js mesh
  //  */
  // addCylinder (mesh) {
  //   const size = mesh.geometry.parameters;
  //   const cylinder = super.createCylinder(size);
  //   this._addStaticBody(cylinder, mesh);
  // }

  // /**
  //  * @public
  //  * @description - Add capsule-like collider to THREE.js mesh
  //  * @param {Object} mesh - THREE.js mesh
  //  */
  // addCapsule (mesh) {
  //   const size = mesh.geometry.parameters;
  //   const capsule = super.createCapsule(size);
  //   this._addStaticBody(capsule, mesh);
  // }

  // /**
  //  * @public
  //  * @description - Add cone-like collider to THREE.js mesh
  //  * @param {Object} mesh - THREE.js mesh
  //  */
  // addCone (mesh) {
  //   const size = mesh.geometry.parameters;
  //   const cone = super.createCone(size);
  //   this._addStaticBody(cone, mesh);
  // }

  // /**
  //  * @public
  //  * @description - Add sphere-like collider to THREE.js mesh
  //  * @param {Object} mesh - THREE.js mesh
  //  */
  // addSphere (mesh) {
  //   const size = mesh.geometry.parameters;
  //   const sphere = super.createSphere(size);
  //   this._addStaticBody(sphere, mesh);
  // }

  // /**
  //  * @private
  //  * @description - Create static body and add it to physics world
  //  * @param {Object} shape - Ammo.js shape collider
  //  * @param {Object} mesh - THREE.js mesh
  //  */
  _addStaticBody (shape, mesh) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, ZERO_MASS, position, quaternion);

    body.setActivationState(DISABLE_DEACTIVATION);
    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }
}
