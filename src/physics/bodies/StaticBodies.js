// Static bodies class manager

import { ZERO_MASS, DISABLE_DEACTIVATION } from 'physics/constants';
import RigidBody from 'physics/bodies/RigidBody';
import { Ammo } from 'core/Ammo';

export default class StaticBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs StaticBodies
   * @description - Initialize static bodies physics
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (physicWorld) {
    super();

    this.bodies = [];
    this.world = physicWorld;
  }

  /**
   * @public
   * @description - Add plane-like collider to THREE.js mesh
   *                Used primarily to create ground/walls in physics world
   * @param {Object} mesh - THREE.js mesh with PlaneBufferGeometry
   */
  addPlane (mesh) {
    // Convert X-axis rotation from
    // THREE.js to Z-axis rotation in Ammo.js:
    const z = mesh.rotation.x / -Math.PI * 2.0;

    /* eslint-disable new-cap */
    const rotation = new Ammo.btVector3(0.0, 0.0, z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);
    /* eslint-enable new-cap */

    this.checkBodyMargin(plane);
    this._addStaticBody(plane, mesh);
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addBox (mesh) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size);
    this._addStaticBody(box, mesh);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCylinder (mesh) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size);
    this._addStaticBody(cylinder, mesh);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCapsule (mesh) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size);
    this._addStaticBody(capsule, mesh);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCone (mesh) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size);
    this._addStaticBody(cone, mesh);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addSphere (mesh) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size);
    this._addStaticBody(sphere, mesh);
  }

  /**
   * @private
   * @description - Create static body and add it to physics world
   * @param {Object} shape - Ammo.js shape collider
   * @param {Object} mesh - THREE.js mesh
   */
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
