// Kinematic bodies class manager

import RigidBody from 'physics/bodies/RigidBody';

export default class KinematicBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs KinematicBodies
   * @description - Initialize kinematic bodies physics
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (worker) {
    super('kinematic', worker);
    this.bodies = [];
    worker.postMessage({action: 'initKinematicBodies'});
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addBox (mesh) {
    super.addBody('Box', mesh);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCylinder (mesh) {
    super.addBody('Cylinder', mesh);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCapsule (mesh) {
    super.addBody('Capsule', mesh);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCone (mesh) {
    super.addBody('Cone', mesh);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addSphere (mesh) {
    super.addBody('Sphere', mesh);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Update kinematic bodies in requestAnimation loop
   * @param {Object} transform - Ammo.js default btTransform
   */
  update () {
    const bodies = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const mesh = this.bodies[i];

      bodies.push({
        rotation: mesh.quaternion.clone(),
        position: mesh.position.clone(),
        uuid: mesh.uuid
      });
    }

    return bodies;
  }
}
