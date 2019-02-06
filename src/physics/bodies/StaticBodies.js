// Static bodies class manager

import RigidBody from 'physics/bodies/RigidBody';

export default class StaticBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs DynamicBodies
   * @description - Initialize rigid bodies physics
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (worker) {
    super('static', worker);

    worker.postMessage({
      action: 'initBodies',
      params: 'static'
    });
  }

  /**
   * @public
   * @description - Add plane-like collider to THREE.js mesh
   *                Used primarily to create ground/walls in physics world
   * @param {Object} mesh - THREE.js mesh with <PlaneBufferGeometry>
   */
  addPlane (mesh) {
    super.addBody('Plane', mesh, {
      // Convert X-axis rotation to
      // Z-axis rotation in Ammo.js:
      z: mesh.rotation.x / -Math.PI * 2.0
    });
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addBox (mesh) {
    super.addBody('Box', mesh);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCylinder (mesh) {
    super.addBody('Cylinder', mesh);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCapsule (mesh) {
    super.addBody('Capsule', mesh);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCone (mesh) {
    super.addBody('Cone', mesh);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addSphere (mesh) {
    super.addBody('Sphere', mesh);
  }
}
