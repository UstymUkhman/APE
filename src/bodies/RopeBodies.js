import { Vector3 } from 'three/src/math/Vector3';
import findIndex from 'lodash/findIndex';
import { Ammo } from '@/utils';

import {
  ACTIVE_TAG,
  ROPE_MARGIN,
  ROPE_PITERATIONS,
  ROPE_VITERATIONS,
  DISABLE_SIMULATION,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class RopeBodies {
  constructor (world, events) {
    this.bodies = [];
    this.world = world;
    this.events = events;

    this.margin = ROPE_MARGIN;
    this.piterations = ROPE_PITERATIONS;
    this.viterations = ROPE_VITERATIONS;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  addBody (mesh, mass, length, position = new Vector3()) {
    const segments = mesh.geometry.attributes.position.array.length / 3 - 2;

    /* eslint-disable new-cap */
    const start = new Ammo.btVector3(position.x, position.y, position.z);
    const end = new Ammo.btVector3(position.x, position.y + length, position.z);
    /* eslint-enable new-cap */

    const body = this.helpers.CreateRope(this.world.getWorldInfo(), start, end, segments, 0);
    const config = body.get_m_cfg();

    body.setTotalMass(mass, false);

    config.set_piterations(this.piterations);
    config.set_viterations(this.viterations);

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

  getBodyByUUID (uuid) {
    const index = findIndex(this.bodies, { uuid: uuid });
    return index > -1 ? this.bodies[index] : null;
  }

  update () {
    for (let i = 0; i < this.bodies.length; i++) {
      this.updateBody(i);
    }
  }

  updateBody (index) {
    const positions = this.bodies[index].geometry.attributes.position.array;
    const vertices = positions.length / 3;

    const body = this.bodies[index].body;
    const nodes = body.get_m_nodes();

    for (let j = 0, p = 0; j < vertices; j++, p += 3) {
      const node = nodes.at(j);
      const nodePosition = node.get_m_x();

      positions[p] = nodePosition.x();
      positions[p + 1] = nodePosition.y();
      positions[p + 2] = nodePosition.z();
    }

    this.bodies[index].geometry.attributes.position.needsUpdate = true;
  }

  activateAll () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const collider = this.bodies[b];

      this.world.removeSoftBody(collider.body);
      this.world.addSoftBody(collider.body, 1, -1);
      collider.body.activate();
    }
  }

  enable (mesh) {
    const index = findIndex(this.bodies, { uuid: mesh.uuid });

    if (index > -1) {
      const body = this.bodies[index].body;

      body.forceActivationState(ACTIVE_TAG);
      this.world.addSoftBody(body, 1, -1);

      this.updateBody(index);
      body.activate();
    }
  }

  disable (mesh) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      body.body.forceActivationState(DISABLE_SIMULATION);
      this.world.removeSoftBody(body.body);
    }
  }

  remove (mesh) {
    const index = findIndex(this.bodies, { uuid: mesh.uuid });

    if (index > -1) {
      const body = this.bodies[index];

      body.body.forceActivationState(DISABLE_SIMULATION);
      this.world.removeSoftBody(body.body);

      Ammo.destroy(body.body);
      delete body.geometry;

      this.bodies.splice(index, 1);
      return true;
    }

    return false;
  }
}
