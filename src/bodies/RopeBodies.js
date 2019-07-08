import { Vector3 } from 'three/src/math/Vector3';
import SoftBody from '@/super/SoftBody';
import { Ammo } from '@/utils';

import {
  ROPE_MARGIN,
  ROPE_PITERATIONS,
  ROPE_VITERATIONS,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class RopeBodies extends SoftBody {
  constructor (world, events) {
    super(world);
    this.events = events;

    this.margin = ROPE_MARGIN;
    this.piterations = ROPE_PITERATIONS;
    this.viterations = ROPE_VITERATIONS;
  }

  addBody (mesh, mass, length, position = new Vector3()) {
    const segments = mesh.geometry.attributes.position.array.length / 3 - 2;

    /* eslint-disable new-cap */
    const start = new Ammo.btVector3(position.x, position.y, position.z);
    const end = new Ammo.btVector3(position.x, position.y + length, position.z);
    /* eslint-enable new-cap */

    const body = this.helpers.CreateRope(this.world.getWorldInfo(), start, end, segments, 0);
    const bodyConfig = body.get_m_cfg();

    body.setTotalMass(mass, false);

    bodyConfig.set_piterations(this.piterations);
    bodyConfig.set_viterations(this.viterations);

    Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addSoftBody(body, 1, -1);

    this.bodies.push({
      geometry: mesh.geometry,
      uuid: mesh.uuid,
      body: body
    });
  }

  append (mesh, target, top = true, influence = 1) {
    const ropeTop = mesh.geometry.attributes.position.array.length / 3 - 1;

    this.events.emit('getRopeAnchor', target.uuid, {
      position: top ? ropeTop : 0.0,
      influence: influence,
      uuid: mesh.uuid
    });
  }

  appendAnchor (target, rope) {
    const body = this.getBodyByUUID(rope.uuid).body;
    body.appendAnchor(rope.position, target, true, rope.influence);
  }

  update () {
    for (let i = 0; i < this.bodies.length; i++) {
      this.updateBody(i);
    }
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

    this.bodies[index].geometry.attributes.position.needsUpdate = true;
  }
}
