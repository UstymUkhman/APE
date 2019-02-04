// Static bodies class manager

import RigidBody from 'physics/bodies/RigidBody';
import assign from 'lodash/assign';

export default class StaticBodies extends RigidBody {
  constructor (worker) {
    super('Static', worker);
    this.worker = worker;
    this.bodies = [];

    this.worker.postMessage({
      action: 'initStaticBodies'
    });
  }

  /**
   * @public
   * @description - Add plane-like collider to THREE.js mesh
   *                Used primarily to create ground/walls in physics world
   * @param {Object} mesh - THREE.js mesh with <PlaneBufferGeometry>
   */
  addPlane (mesh) {
    this._addBody('Plane', mesh, {
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
    this._addBody('Box', mesh);
  }

  /**
   * @public
   * @description - Add cylinder-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCylinder (mesh) {
    this._addBody('Cylinder', mesh);
  }

  /**
   * @public
   * @description - Add capsule-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCapsule (mesh) {
    this._addBody('Capsule', mesh);
  }

  /**
   * @public
   * @description - Add cone-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addCone (mesh) {
    this._addBody('Cone', mesh);
  }

  /**
   * @public
   * @description - Add sphere-like collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh
   */
  addSphere (mesh) {
    this._addBody('Sphere', mesh);
  }

  /**
   * @private
   * @description - Use web worker to add collider
   */
  _addBody (collider, mesh, additionalParams) {
    const params = {
      rotation: mesh.quaternion.clone(),
      position: mesh.position.clone(),
      size: mesh.geometry.parameters,
      uuid: mesh.uuid
    };

    const props = {
      collider: collider,
      type: 'static'
    };

    assign(props, params, additionalParams);
    this.bodies.push(mesh);

    this.worker.postMessage({
      action: 'addBody',
      params: props
    });
  }
}
