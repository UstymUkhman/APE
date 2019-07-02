import { Vector3 } from 'three/src/math/Vector3';
import findIndex from 'lodash/findIndex';

import { Ammo } from '@/utils';
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
} from '@/constants';

export default class ClothBodies {
  constructor (world, events) {
    this.bodies = [];
    this.world = world;
    this.events = events;

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
    body.setTotalMass(mass, false);
    this.world.addSoftBody(body, 1, -1);

    this.bodies.push({
      geometry: mesh.geometry,
      uuid: mesh.uuid,
      body: body
    });
  }

  append (mesh, point, target, influence = 0.5) {
    this.events.emit('getClothAnchor', target.uuid, {
      influence: influence,
      uuid: mesh.uuid,
      point: point
    });
  }

  appendAnchor (target, cloth) {
    const body = this.getBodyByUUID(cloth.uuid).body;
    body.appendAnchor(cloth.point, target, false, cloth.influence);
  }

  getBodyByUUID (uuid) {
    return find(this.bodies, { uuid: uuid });
  }

  update () {
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

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.normal.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }

  activateAll () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const collider = this.bodies[b];

      this.world.removeSoftBody(collider.body);
      this.world.addSoftBody(collider.body);
      collider.body.activate();
    }
  }

  remove (body) {
    const index = findIndex(this.bodies, { uuid: body.uuid });

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
