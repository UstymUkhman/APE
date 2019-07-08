import SoftBody from '@/super/SoftBody';
import { Ammo } from '@/utils';

import {
  ROPE_MARGIN,
  ROPE_PITERATIONS,
  ROPE_VITERATIONS,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class RopeBodies extends SoftBody {
  constructor (world) {
    super(world);

    this.margin = ROPE_MARGIN;
    this.piterations = ROPE_PITERATIONS;
    this.viterations = ROPE_VITERATIONS;
  }

  addBody (props) {
    const segments = props.geometry.attributes.position.array.length / 3 - 2;

    /* eslint-disable new-cap */
    const start = new Ammo.btVector3(props.position.x, props.position.y, props.position.z);
    const end = new Ammo.btVector3(props.position.x, props.position.y + props.length, props.position.z);
    /* eslint-enable new-cap */

    const body = this.helpers.CreateRope(this.world.getWorldInfo(), start, end, segments, 0);
    const bodyConfig = body.get_m_cfg();

    body.setTotalMass(props.mass, false);

    bodyConfig.set_piterations(this.piterations);
    bodyConfig.set_viterations(this.viterations);

    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addSoftBody(body, 1, -1);

    this.bodies.push({
      geometry: props.geometry,
      uuid: props.uuid,
      body: body
    });
  }

  append (props) {
    const body = this.getBodyByUUID(props.uuid).body;
    body.appendAnchor(props.position, props.target, true, props.influence);
  }

  update () {
    const update = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const positions = this.updateBody(i);

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

  updateBody (index) {
    const positions = this.bodies[index].geometry.attributes.position.array;
    const nodes = this.bodies[index].body.get_m_nodes();
    const vertices = positions.length / 3;

    for (let j = 0, p = 0; j < vertices; j++, p += 3) {
      const nodePosition = nodes.at(j).get_m_x();

      positions[p] = nodePosition.x();
      positions[p + 1] = nodePosition.y();
      positions[p + 2] = nodePosition.z();
    }

    return positions;
  }
}
