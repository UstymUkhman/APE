// Cloth bodies class manager

import { Vector3 } from 'three/src/math/Vector3';
import { SOFT_MARGIN } from 'physics/constants';
import find from 'lodash/find';

export default class ClothBodies {
  /**
   * @constructs ClothBodies
   * @param {Object} worker - web worker used by parent class
   * @description - Initialize default parameters for cloth bodies
   */
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = { margin: SOFT_MARGIN };
    worker.postMessage({action: 'initClothBodies'});
  }

  /**
   * @public
   * @description - Add cloth body collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh with <PlaneBufferGeometry> type
   * @param {Number} mass - THREE.js mesh's mass
   * @param {Object} position - mesh's position in scene
   */
  addBody (mesh, mass, position = new Vector3(0, 0, 0)) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        geometry: mesh.geometry,
        position: position,
        collider: 'Body',
        uuid: mesh.uuid,
        type: 'cloth',
        mass: mass
      }
    });

    this.bodies.push(mesh);
  }

  append (mesh, point, target, influence = 0.5) {
    this.worker.postMessage({
      action: 'appendCloth',

      params: {
        influence: influence,
        target: target.uuid,
        collider: 'Body',
        uuid: mesh.uuid,
        point: point
      }
    });
  }

  /**
   * @public
   * @description - Update cloth bodies in requestAnimation loop
   */
  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = find(this.bodies, { uuid: bodies[i].uuid });
      const position = body.geometry.attributes.position;
      const normal = body.geometry.attributes.normal;

      position.array = bodies[i].positions;
      position.needsUpdate = true;
      normal.needsUpdate = true;

      body.geometry.computeVertexNormals();
    }
  }

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: 'cloth'
      }
    });
  }

  set margin (value) {
    this.constants.margin = value;
    this._updateConstants();
  }

  get margin () {
    return this.constants.margin;
  }
}
