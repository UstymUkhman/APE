// Rigid bodies class manager

import RigidBody from 'physics/bodies/RigidBody';
// import find from 'lodash/find';

export default class DynamicBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs DynamicBodies
   * @description - Initialize rigid bodies physics
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (worker) {
    super('dynamic', worker);
    this.bodies = [];

    worker.postMessage({
      action: 'initBodies',
      params: 'dynamic'
    });
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addBox (mesh, mass) {
    super.addBody('Box', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCylinder (mesh, mass) {
    super.addBody('Cylinder', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCapsule (mesh, mass) {
    super.addBody('Capsule', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCone (mesh, mass) {
    super.addBody('Cone', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addSphere (mesh, mass) {
    super.addBody('Sphere', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Update dynamic bodies in requestAnimation loop
   * @param {Object} transform - Ammo.js default btTransform
   */
  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      // const position = bodies[i].position;
      // const quaternion = bodies[i].quaternion;
      const mesh = find(this.bodies, { uuid: bodies[i].uuid });

      // // console.log(position.x, position.y, position.z);
      // // console.log(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

      // // mesh.userData.physicsBody = bodies[i].body;
      // mesh.position.set(position.x, position.y, position.z);
      // mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

      const motionState = bodies[i].body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(bodies[i].transform);

        const origin = bodies[i].transform.getOrigin();
        const rotation = bodies[i].transform.getRotation();

        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }
  }
}
