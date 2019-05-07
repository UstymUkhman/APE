import { Vector3 } from 'three/src/math/Vector3';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';
import Ammo from 'core/Ammo';

import {
  ROPE_MARGIN,
  ROPE_VITERATIONS,
  ROPE_PITERATIONS,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class RopeBodies {
  constructor (world, events) {
    this.bodies = [];
    this.world = world;
    this.events = events;

    this.margin = ROPE_MARGIN;
    this.viterations = ROPE_VITERATIONS;
    this.piterations = ROPE_PITERATIONS;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  addBody (mesh, length, mass, position = new Vector3()) {
    const segments = mesh.geometry.attributes.position.array.length / 3 - 2;

    /* eslint-disable new-cap */
    const start = new Ammo.btVector3(position.x, position.y, position.z);
    const end = new Ammo.btVector3(position.x, position.y + length, position.z);
    /* eslint-enable new-cap */

    const body = this.helpers.CreateRope(this.world.getWorldInfo(), start, end, segments, 0);
    const config = body.get_m_cfg();

    body.setTotalMass(mass, false);

    config.set_viterations(this.viterations);
    config.set_piterations(this.piterations);

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
    const body = find(this.bodies, { uuid: rope.uuid }).body;
    body.appendAnchor(rope.position, target, true, rope.influence);
  }

  update () {
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

      this.bodies[i].geometry.attributes.position.needsUpdate = true;
    }
  }

  activateAll () {
    this.bodies.forEach((collider) => {
      this.world.removeSoftBody(collider.body);
      this.world.addSoftBody(collider.body);
      collider.body.activate();
    });
  }

  remove (uuid) {
    const index = findIndex(this.bodies, { uuid: uuid });

    if (index > -1) {
      const mesh = this.bodies[index];

      this.world.removeSoftBody(mesh.body);
      Ammo.destroy(mesh.body);
      delete mesh.geometry;

      this.bodies.splice(index, 1);
      return true;
    }

    return false;
  }
}
