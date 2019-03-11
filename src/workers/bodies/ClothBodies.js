import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

import {
  FRICTION,
  CLOTH_MARGIN,
  CLOTH_DAMPING,
  SOFT_COLLISION,
  CLOTH_STIFFNESS,
  CLOTH_VITERATIONS,
  CLOTH_PITERATIONS,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class ClothBodies {
  constructor (world) {
    this.bodies = [];
    this.world = world;

    this.friction = FRICTION;
    this.margin = CLOTH_MARGIN;
    this.damping = CLOTH_DAMPING;
    this.stiffness = CLOTH_STIFFNESS;
    this.collisions = SOFT_COLLISION;
    this.viterations = CLOTH_VITERATIONS;
    this.piterations = CLOTH_PITERATIONS;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

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

    const bodyConfig = body.get_m_cfg();

    bodyConfig.set_viterations(this.viterations);
    bodyConfig.set_piterations(this.piterations);
    bodyConfig.set_collisions(this.collisions);

    bodyConfig.set_kDF(this.friction);
    bodyConfig.set_kDP(this.damping);

    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);
    body.get_m_materials().at(0).set_m_kLST(this.stiffness);
    body.get_m_materials().at(0).set_m_kAST(this.stiffness);

    body.setActivationState(DISABLE_DEACTIVATION);
    body.setTotalMass(props.mass, false);
    this.world.addSoftBody(body, 1, -1);

    this.bodies.push({
      geometry: props.geometry,
      uuid: props.uuid,
      body: body
    });
  }

  append (props) {
    const body = find(this.bodies, { uuid: props.uuid }).body;
    body.appendAnchor(props.point, props.target, false, props.influence);
  }

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
