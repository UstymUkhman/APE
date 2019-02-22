// Rope bodies class manager

import { ROPE_MARGIN, DISABLE_DEACTIVATION } from 'physics/constants';
// import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from 'core/Ammo';

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

    config.set_viterations(10);
    config.set_piterations(10);

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
