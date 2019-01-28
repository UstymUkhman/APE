// Cloth bodies class manager

import { SOFT_MARGIN, DISABLE_DEACTIVATION } from 'physics/constants';
import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from 'core/Ammo';

export default class ClothBodies {
  /**
   * @constructs ClothBodies
   * @description - Initialize default parameters for cloth bodies
   * @param {Object} physicWorld - Ammo.js soft/rigid dynamics world
   */
  constructor (physicWorld) {
    this.bodies = [];
    this.world = physicWorld;
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
  addBody (mesh, mass, position = new Vector3(0, 0, 0)) {
    const heightSegments = mesh.geometry.parameters.heightSegments;
    const widthSegments = mesh.geometry.parameters.widthSegments;

    const height = mesh.geometry.parameters.height;
    const width = mesh.geometry.parameters.width;

    /* eslint-disable new-cap */
    const clothCorner00 = new Ammo.btVector3(position.x, position.y + height, position.z);
    const clothCorner01 = new Ammo.btVector3(position.x, position.y + height, position.z - width);
    const clothCorner10 = new Ammo.btVector3(position.x, position.y, position.z);
    const clothCorner11 = new Ammo.btVector3(position.x, position.y, position.z - width);
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

    body.setTotalMass(mass, false);
    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin * 3);

    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addSoftBody(body, 1, -1);
    mesh.userData.physicsBody = body;
    this.bodies.push(mesh);
  }

  /**
   * @public
   * @description - Update cloth bodies in requestAnimation loop
   */
  update () {
    for (let i = 0; i < this.bodies.length; i++) {
      const cloth = this.bodies[i];
      const body = cloth.userData.physicsBody;
      const positions = cloth.geometry.attributes.position.array;

      const vertices = positions.length / 3;
      const nodes = body.get_m_nodes();

      for (let j = 0, index = 0; j < vertices; j++, index += 3) {
        const nodePosition = nodes.at(j).get_m_x();

        positions[index] = nodePosition.x();
        positions[index + 1] = nodePosition.y();
        positions[index + 2] = nodePosition.z();
      }

      cloth.geometry.attributes.position.needsUpdate = true;
      cloth.geometry.attributes.normal.needsUpdate = true;
      cloth.geometry.computeVertexNormals();
    }
  }
}
