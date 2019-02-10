// Rigid bodies class manager

import RigidBody from 'workers/physics-bodies/RigidBody';
import { ZERO_MASS } from 'physics/constants';

export default class DynamicBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs DynamicBodies
   * @description - Initialize rigid bodies physics
   * @param {Object} world - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (world) {
    super();
    this.bodies = [];
    this.world = world;
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addBox (props) {
    console.log('props', props);
    const box = this.createBox(props.size);
    this._addDynamicBody(props.uuid, box, props.position, props.rotation, props.mass);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCylinder (props) {
    const cylinder = this.createCylinder(props.size);
    this._addDynamicBody(props.uuid, cylinder, props.position, props.rotation, props.mass);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCapsule (props) {
    const capsule = this.createCapsule(props.size);
    this._addDynamicBody(props.uuid, capsule, props.position, props.rotation, props.mass);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addCone (props) {
    const cone = this.createCone(props.size);
    this._addDynamicBody(props.uuid, cone, props.position, props.rotation, props.mass);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  addSphere (props) {
    const sphere = this.createSphere(props.size.radius);
    this._addDynamicBody(props.uuid, sphere, props.position, props.rotation, props.mass);
  }

  /**
   * @private
   * @description - Create rigid body and add it to physics world
   * @param {Object} shape - Ammo.js shape collider
   * @param {Object} mesh - THREE.js mesh
   * @param {Number} mass - THREE.js mesh's mass
   */
  _addDynamicBody (uuid, shape, position, quaternion, mass = ZERO_MASS) {
    const body = this.createRigidBody(shape, mass, position, quaternion);
    this.bodies.push({uuid: uuid, body: body});
    this.world.addRigidBody(body);

    console.log(body.getMotionState);
    debugger;

    self.postMessage({
      action: 'addBody',
      type: 'dynamic',
      uuid: uuid,
      body: body
    });
  }

  /**
   * @public
   * @description - Update dynamic bodies in requestAnimation loop
   * @param {Object} transform - Ammo.js default btTransform
   */
  update (transform) {
    const update = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const motionState = this.bodies[i].body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(transform);

        const origin = transform.getOrigin();
        const rotation = transform.getRotation();

        // console.log(origin.x(), origin.y(), origin.z());
        // console.log(rotation.x(), rotation.y(), rotation.z(), rotation.w());

        update.push({
          quaternion: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() },
          position: { x: origin.x(), y: origin.y(), z: origin.z() },
          body: this.bodies[i].body,
          uuid: this.bodies[i].uuid,
          transform: transform
        });
      }
    }

    self.postMessage({
      action: 'updateBodies',
      type: 'dynamic',
      bodies: update
    });
  }
}
