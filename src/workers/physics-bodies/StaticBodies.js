// Static bodies class manager

import { ZERO_MASS, DISABLE_DEACTIVATION } from 'physics/constants';
import RigidBody from 'workers/physics-bodies/RigidBody';
import { Ammo } from 'core/Ammo';

export default class StaticBodies extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs StaticBodies
   * @description - Initialize static bodies physics
   * @param {Object} world - Ammo.js soft/rigid or discrete dynamics world
   */
  constructor (world) {
    super();
    this.world = world;
  }

  /**
   * @public
   * @description - Add plane-like collider to THREE.js mesh
   *                Used primarily to create ground/walls in physics world
   */
  addPlane (props) {
    /* eslint-disable new-cap */
    const rotation = new Ammo.btVector3(0.0, 0.0, props.z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);
    /* eslint-enable new-cap */

    this._checkBodyMargin(plane);
    this._addStaticBody(props.uuid, plane, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add box-like collider to THREE.js mesh
   */
  addBox (props) {
    const box = this.createBox(props.size);
    this._addStaticBody(props.uuid, box, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   */
  addCylinder (props) {
    const cylinder = this.createCylinder(props.size);
    this._addStaticBody(props.uuid, cylinder, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   */
  addCapsule (props) {
    const capsule = this.createCapsule(props.size);
    this._addStaticBody(props.uuid, capsule, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   */
  addCone (props) {
    const cone = this.createCone(props.size);
    this._addStaticBody(props.uuid, cone, props.position, props.rotation);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   */
  addSphere (props) {
    const sphere = this.createSphere(props.size);
    this._addStaticBody(props.uuid, sphere, props.position, props.rotation);
  }

  /**
   * @private
   * @description - Create static body and add it to physics world
   * @param {Object} shape - Ammo.js shape collider
   * @param {Object} mesh - THREE.js mesh
   */
  _addStaticBody (uuid, shape, position, quaternion) {
    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body);

    self.postMessage({
      action: 'addBody',
      type: 'static',
      uuid: uuid,
      body: body
    });
  }
}
