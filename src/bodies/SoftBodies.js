import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Geometry } from 'three/src/core/Geometry';

import { Ammo, equalBufferVertices } from '@/utils';
import findIndex from 'lodash/findIndex';

import {
  POWER16,
  FRICTION,
  SOFT_MARGIN,
  SOFT_DAMPING,
  SOFT_COLLISION,
  SOFT_STIFFNESS,
  SOFT_VITERATIONS,
  SOFT_PITERATIONS,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class SoftBodies {
  constructor (world) {
    this.bodies = [];
    this.world = world;

    this.friction = FRICTION;
    this.margin = SOFT_MARGIN;
    this.damping = SOFT_DAMPING;
    this.stiffness = SOFT_STIFFNESS;
    this.collisions = SOFT_COLLISION;
    this.viterations = SOFT_VITERATIONS;
    this.piterations = SOFT_PITERATIONS;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  _initGeometry (bufferGeometry) {
    const geometry = new Geometry().fromBufferGeometry(bufferGeometry);
    geometry.mergeVertices();

    const indexedBufferGeometry = this._createIndexedBufferGeometry(geometry);
    const indexedVertices = indexedBufferGeometry.attributes.position.array;
    const vertices = bufferGeometry.attributes.position.array;

    const _indexedVertices = indexedVertices.length / 3;
    const _vertices = vertices.length / 3;

    bufferGeometry.ammoIndices = indexedBufferGeometry.index.array;
    bufferGeometry.ammoVertices = indexedVertices;
    bufferGeometry.ammoIndexAssociation = [];

    for (let i = 0; i < _indexedVertices; i++) {
      const i3 = i * 3;
      const association = [];

      for (let j = 0; j < _vertices; j++) {
        const j3 = j * 3;

        if (equalBufferVertices(indexedVertices, i3, vertices, j3)) {
          association.push(j3);
        }
      }

      bufferGeometry.ammoIndexAssociation.push(association);
    }
  }

  _createIndexedBufferGeometry (geometry) {
    const _vertices = geometry.vertices.length;
    const _faces = geometry.faces.length;
    const _faces3 = _faces * 3;

    const bufferGeometry = new BufferGeometry();
    const vertices = new Float32Array(_vertices * 3);
    const indices = new (_faces3 > POWER16 ? Uint32Array : Uint16Array)(_faces3);

    for (let i = 0; i < _vertices; i++) {
      const i3 = i * 3;
      const vertex = geometry.vertices[i];

      vertices[i3] = vertex.x;
      vertices[i3 + 1] = vertex.y;
      vertices[i3 + 2] = vertex.z;
    }

    for (let i = 0; i < _faces; i++) {
      const i3 = i * 3;
      const face = geometry.faces[i];

      indices[i3] = face.a;
      indices[i3 + 1] = face.b;
      indices[i3 + 2] = face.c;
    }

    bufferGeometry.addAttribute('position', new BufferAttribute(vertices, 3));
    bufferGeometry.setIndex(new BufferAttribute(indices, 1));
    return bufferGeometry;
  }

  addBody (mesh, mass, pressure) {
    this._initGeometry(mesh.geometry);

    const body = this.helpers.CreateFromTriMesh(
      this.world.getWorldInfo(),
      mesh.geometry.ammoVertices,
      mesh.geometry.ammoIndices,
      mesh.geometry.ammoIndices.length / 3,
      true
    );

    const bodyConfig = body.get_m_cfg();

    bodyConfig.set_viterations(this.viterations);
    bodyConfig.set_piterations(this.piterations);
    bodyConfig.set_collisions(this.collisions);

    bodyConfig.set_kDF(this.friction);
    bodyConfig.set_kDP(this.damping);
    bodyConfig.set_kPR(pressure);

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

  getBodyByUUID (uuid) {
    const index = findIndex(this.bodies, { uuid: uuid });
    return index > -1 ? this.bodies[index] : null;
  }

  update () {
    for (let i = 0; i < this.bodies.length; i++) {
      const geometry = this.bodies[i].geometry;
      const nodes = this.bodies[i].body.get_m_nodes();

      const normals = geometry.attributes.normal.array;
      const association = geometry.ammoIndexAssociation;
      const positions = geometry.attributes.position.array;

      for (let j = 0; j < association.length; j++) {
        const node = nodes.at(j);
        const nodeNormal = node.get_m_n();
        const nodePosition = node.get_m_x();

        const nX = nodeNormal.x();
        const nY = nodeNormal.y();
        const nZ = nodeNormal.z();

        const pX = nodePosition.x();
        const pY = nodePosition.y();
        const pZ = nodePosition.z();

        for (let k = 0; k < association[j].length; k++) {
          const ivX = association[j][k];
          const ivY = ivX + 1;
          const ivZ = ivY + 1;

          positions[ivX] = pX;
          positions[ivY] = pY;
          positions[ivZ] = pZ;

          normals[ivX] = nX;
          normals[ivY] = nY;
          normals[ivZ] = nZ;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.normal.needsUpdate = true;
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
