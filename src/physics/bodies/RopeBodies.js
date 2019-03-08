// Rope bodies class manager

import { Vector3 } from 'three/src/math/Vector3';
import find from 'lodash/find';

import {
  ROPE_MARGIN,
  ROPE_VITERATIONS,
  ROPE_PITERATIONS
} from 'physics/constants';

export default class RopeBodies {
  /**
   * @constructs RopeBodies
   * @param {Object} worker - web worker used by parent class
   * @description - Initialize default parameters for rope bodies
   */
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = {
      margin: ROPE_MARGIN,
      viterations: ROPE_VITERATIONS,
      piterations: ROPE_PITERATIONS
    };

    worker.postMessage({action: 'initRopeBodies'});
  }

  /**
   * @public
   * @description - Add rope body collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh of <LineSegments> type
   * @param {Number} length - rope's length
   * @param {Number} mass - rope's mass
   * @param {Object} position - rope's position in scene
   */
  addBody (mesh, length, mass, position = new Vector3()) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        geometry: mesh.geometry,
        position: position,
        collider: 'Body',
        uuid: mesh.uuid,
        length: length,
        type: 'rope',
        mass: mass
      }
    });

    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Add THREE.js mesh the far end of the rope
   * @param {Object} mesh - THREE.js rope mesh
   * @param {Object} target - THREE.js mesh to append
   * @param {Boolean} top - append mesh on the top of the rope if <true>
   * @param {Number} influence - mesh's physic influence to the rope
   */
  append (mesh, target, top = true, influence = 1) {
    const ropeTop = mesh.geometry.attributes.position.array.length / 3 - 1;

    this.worker.postMessage({
      action: 'appendRope',
      params: {
        position: top ? ropeTop : 0.0,
        influence: influence,
        target: target.uuid,
        uuid: mesh.uuid
      }
    });
  }

  /**
   * @public
   * @description - Update rope bodies in requestAnimation loop
   */
  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = find(this.bodies, { uuid: bodies[i].uuid });
      const position = body.geometry.attributes.position;

      position.array = bodies[i].positions;
      position.needsUpdate = true;
    }
  }

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: 'rope'
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

  set viterations (value) {
    this.constants.viterations = value;
    this._updateConstants();
  }

  get viterations () {
    return this.constants.viterations;
  }

  set piterations (value) {
    this.constants.piterations = value;
    this._updateConstants();
  }

  get piterations () {
    return this.constants.piterations;
  }
}
