// Rigid bodies class manager

import RigidBody from 'physics/bodies/RigidBody';

export default class DynamicBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs DynamicBodies
   * @description - Initialize rigid bodies physics
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (physicWorld) {
    super();

    this.bodies = [];
    this.world = physicWorld;
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addBox (mesh, mass) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size);
    this._addDynamicBody(box, mesh, mass);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCylinder (mesh, mass) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size);
    this._addDynamicBody(cylinder, mesh, mass);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCapsule (mesh, mass) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size);
    this._addDynamicBody(capsule, mesh, mass);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCone (mesh, mass) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size);
    this._addDynamicBody(cone, mesh, mass);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addSphere (mesh, mass) {
    const radius = mesh.geometry.parameters.radius;
    const sphere = super.createSphere(radius);
    this._addDynamicBody(sphere, mesh, mass);
  }

  /**
   * @private
   * @description - Create rigid body and add it to physics world
   * @param {Object} shape - Ammo.js shape collider
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  _addDynamicBody (shape, mesh, mass) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, mass, position, quaternion);

    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Update dynamic bodies in requestAnimation loop
   * @param {Object} transform - Ammo.js default btTransform
   */
  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].userData.physicsBody;
      const motionState = body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(transform);

        const origin = transform.getOrigin();
        const rotation = transform.getRotation();

        this.bodies[i].position.set(origin.x(), origin.y(), origin.z());
        this.bodies[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }
  }
}
