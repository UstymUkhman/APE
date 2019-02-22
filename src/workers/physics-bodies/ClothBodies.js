// Cloth bodies class manager

import { SOFT_MARGIN, DISABLE_DEACTIVATION } from 'physics/constants';
import { Ammo } from 'core/Ammo';

export default class ClothBodies {
  /**
   * @constructs ClothBodies
   * @param {Object} world - Ammo.js soft/rigid dynamics world
   * @description - Initialize default parameters for cloth bodies
   */
  constructor (world) {
    this.bodies = [];
    this.world = world;
    this.margin = SOFT_MARGIN;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  /**
   * @public
   * @description - Add cloth body collider to THREE.js mesh
   * @param {Object} mesh - THREE.js mesh with <PlaneBufferGeometry> type
   * @param {Number} mass - THREE.js mesh's mass
   * @param {Object} position - mesh's position in scene
   */
  addBody (props) {
    const heightSegments = props.geometry.parameters.heightSegments;
    const widthSegments = props.geometry.parameters.widthSegments;

    const height = props.geometry.parameters.height;
    const width = props.geometry.parameters.width;

    /* eslint-disable new-cap */
    const clothCorner00 = new Ammo.btVector3(props.position.x, props.position.y + height, props.position.z);
    const clothCorner01 = new Ammo.btVector3(props.position.x, props.position.y + height, props.position.z - width);
    const clothCorner10 = new Ammo.btVector3(props.position.x, props.position.y, props.position.z);
    const clothCorner11 = new Ammo.btVector3(props.position.x, props.position.y, props.position.z - width);
    /* eslint-enable new-cap */

    const body = this.helpers.CreatePatch(
      this.world.getWorldInfo(),
      clothCorner00, clothCorner01,
      clothCorner10, clothCorner11,
      widthSegments + 1, heightSegments + 1,
      0, true
    );

    const sbConfig = body.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);

    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin * 3);
    body.setActivationState(DISABLE_DEACTIVATION);
    body.setTotalMass(props.mass, false);
    this.world.addSoftBody(body, 1, -1);

    this.bodies.push({
      geometry: props.geometry,
      uuid: props.uuid,
      body: body
    });
  }

  /**
   * @public
   * @description - Update cloth bodies in requestAnimation loop
   */
  update () {
    const update = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].body;
      const geometry = this.bodies[i].geometry;
      const positions = geometry.attributes.position.array;

      const vertices = positions.length / 3;
      const nodes = body.get_m_nodes();

      for (let j = 0, index = 0; j < vertices; j++, index += 3) {
        const nodePosition = nodes.at(j).get_m_x();

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
      type: 'cloth'
    });
  }
}
