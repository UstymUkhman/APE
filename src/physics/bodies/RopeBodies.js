import { MARGIN, DISABLE_DEACTIVATION } from 'physics/constants';
import { Ammo } from 'core/Ammo';

export default class RopeBodies {
  constructor (physicWorld) {
    this.bodies = [];
    this.world = physicWorld;
    this.margin = MARGIN * 3;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  addBody (mesh, length, mass) {
    const position = mesh.geometry.attributes.position.array;
    const segments = position.length / 3 - 2;

    /* eslint-disable new-cap */
    const start = new Ammo.btVector3(position.x, position.y, position.z);
    const end = new Ammo.btVector3(position.x, position.y + length, position.z);
    /* eslint-enable new-cap */

    const body = this.helpers.CreateRope(this.world.getWorldInfo(), start, end, segments, 0);
    const config = body.get_m_cfg();

    body.setTotalMass(mass, false);

    config.set_viterations(10);
    config.set_piterations(10);

    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);
    body.setActivationState(DISABLE_DEACTIVATION);

    this.world.addSoftBody(body, 1, -1);
    mesh.userData.physicsBody = body;
    this.bodies.push(mesh);
  }

  append (mesh, target, top = true, influence = 1) {
    for (let i = 0; i < this.bodies.length; i++) {
      if (this.bodies[i].uuid === mesh.uuid) {
        const ropeTop = mesh.geometry.attributes.position.array.length / 3 - 1;

        mesh.userData.physicsBody.appendAnchor(
          top ? ropeTop : 0,
          target.userData.physicsBody,
          true, influence
        );
      }
    }
  }

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

      // this.bodies[i].geometry.attributes.position.needsUpdate = true;
    }
  }
}
