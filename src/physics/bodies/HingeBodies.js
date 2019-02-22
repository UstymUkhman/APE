// Hinge bodies class manager

import { Vector3 } from 'three/src/math/Vector3';
import { HINGE_FORCE } from 'physics/constants';

export default class HingeBodies {
  /**
   * @constructs HingeBodies
   * @param {Object} worker - web worker used by parent class
   * @description - Initialize default parameters for rope bodies
   */
  constructor (worker) {
    this._bodies = 0;
    this.worker = worker;

    this.constants = { force: HINGE_FORCE };
    worker.postMessage({action: 'initHingeBodies'});
  }

  /**
   * @public
   * @description - Add hinge body collider to THREE.js mesh
   * @param {Object} pinMesh - THREE.js mesh used as pin
   * @param {Object} armMesh - THREE.js mesh used as hinge's arm
   * @param {Object} axis - <Vector3> rotation axes of hinge's arm
   * @param {Object} pinPivot - pin's pivot position
   * @param {Object} armPivot - arm's pivot position
   */
  add (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        collider: 'Bodies',
        pinPivot: pinPivot,
        armPivot: armPivot,
        pin: pinMesh.uuid,
        arm: armMesh.uuid,
        type: 'hinge',
        axis: axis
      }
    });

    return this._bodies++;
  }

  update (bodyIndex, direction) {
    this.worker.postMessage({
      action: 'updateHingeBodies',
      params: {
        direction: direction,
        index: bodyIndex
      }
    });
  }
}
