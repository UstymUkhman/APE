// Rope bodies class manager

import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

import {
  ROPE_MARGIN,
  ROPE_VITERATIONS,
  ROPE_PITERATIONS,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class RopeBodies {
  /**
   * @constructs RopeBodies
   * @param {Object} world - Ammo.js soft/rigid dynamics world
   * @description - Initialize default parameters for rope bodies
   */
  constructor (world) {
    this.bodies = [];
    this.world = world;

    this.margin = ROPE_MARGIN;
    this.viterations = ROPE_VITERATIONS;
    this.piterations = ROPE_PITERATIONS;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  /**
   * @public
   * @description - Add rope body collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh of <LineSegments> type
   * @param {Number} length - rope's length
   * @param {Number} mass - rope's mass
   * @param {Object} position - rope's position in scene
   */
  addBody (props) {
    const segments = props.geometry.attributes.position.array.length / 3 - 2;

    /* eslint-disable new-cap */
    const start = new Ammo.btVector3(props.position.x, props.position.y, props.position.z);
    const end = new Ammo.btVector3(props.position.x, props.position.y + props.length, props.position.z);
    /* eslint-enable new-cap */

    const body = this.helpers.CreateRope(this.world.getWorldInfo(), start, end, segments, 0);
    const config = body.get_m_cfg();

    body.setTotalMass(props.mass, false);

    config.set_viterations(this.viterations);
    config.set_piterations(this.piterations);

    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addSoftBody(body, 1, -1);

    this.bodies.push({
      geometry: props.geometry,
      uuid: props.uuid,
      body: body
    });
  }

  /**
   * @public
   * @description - Add THREE.js mesh the far end of the rope
   * @param {Object} mesh - THREE.js rope mesh
   * @param {Object} target - THREE.js mesh to append
   * @param {Boolean} top - append mesh on the top of the rope if <true>
   * @param {Number} influence - mesh's physic influence to the rope
   */
  append (props) {
    const body = find(this.bodies, { uuid: props.uuid }).body;
    body.appendAnchor(props.position, props.target, true, props.influence);
  }

  /**
   * @public
   * @description - Update rope bodies in requestAnimation loop
   */
  update () {
    const update = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const positions = this.bodies[i].geometry.attributes.position.array;
      const vertices = positions.length / 3;

      const body = this.bodies[i].body;
      const nodes = body.get_m_nodes();

      for (let j = 0, index = 0; j < vertices; j++, index += 3) {
        const node = nodes.at(j);
        const nodePosition = node.get_m_x();

        positions[index] = nodePosition.x();
        positions[index + 1] = nodePosition.y();
        positions[index + 2] = nodePosition.z();
      }

      update.push({
        uuid: this.bodies[i].uuid,
        positions: positions
      });
    }

    self.postMessage({
      action: 'updateBodies',
      bodies: update,
      type: 'rope'
    });
  }
}
