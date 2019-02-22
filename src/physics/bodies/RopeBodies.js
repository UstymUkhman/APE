// Rope bodies class manager

import { Vector3 } from 'three/src/math/Vector3';
import { MARGIN } from 'physics/constants';

export default class RopeBodies {
  /**
   * @constructs RopeBodies
   * @param {Object} worker - web worker used by parent class
   * @description - Initialize default parameters for rope bodies
   */
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = { margin: MARGIN };
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
    for (let i = 0; i < this.bodies.length; i++) {
      if (this.bodies[i].uuid === mesh.uuid) {
        const ropeTop = mesh.geometry.attributes.position.array.length / 3 - 1;

        this.bodies[i].userData.physicsBody.appendAnchor(
          top ? ropeTop : 0,
          target.userData.physicsBody,
          true, influence
        );
      }
    }
  }

  /**
   * @public
   * @description - Update rope bodies in requestAnimation loop
   */
  update () {
    for (let i = 0; i < this.bodies.length; i++) {
      const positions = this.bodies[i].geometry.attributes.position.array;
      const body = this.bodies[i].userData.physicsBody;
      const vertices = positions.length / 3;
      const nodes = body.get_m_nodes();

      for (let j = 0, index = 0; j < vertices; j++, index += 3) {
        const node = nodes.at(j);
        const nodePosition = node.get_m_x();

        positions[index] = nodePosition.x();
        positions[index + 1] = nodePosition.y();
        positions[index + 2] = nodePosition.z();
      }

      this.bodies[i].geometry.attributes.position.needsUpdate = true;
    }
  }
}
