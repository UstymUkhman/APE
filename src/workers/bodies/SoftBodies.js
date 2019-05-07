import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Geometry } from 'three/src/core/Geometry';

import { equalBufferVertices } from 'utils/Buffer';
import find from 'lodash/find';
import Ammo from 'core/Ammo';

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
} from 'physics/constants';

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

  addBody (props) {
    this._initGeometry(props.geometry);

    const body = this.helpers.CreateFromTriMesh(
      this.world.getWorldInfo(),
      props.geometry.ammoVertices,
      props.geometry.ammoIndices,
      props.geometry.ammoIndices.length / 3,
      true
    );

    const bodyConfig = body.get_m_cfg();

    bodyConfig.set_viterations(this.viterations);
    bodyConfig.set_piterations(this.piterations);
    bodyConfig.set_collisions(this.collisions);

    bodyConfig.set_kPR(props.pressure);
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

  update () {
    const update = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const geometry = this.bodies[i].geometry;
      const nodes = this.bodies[i].body.get_m_nodes();

      const association = geometry.ammoIndexAssociation;
      const volumeNormals = geometry.attributes.normal.array;
      const volumePositions = geometry.attributes.position.array;

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

          volumeNormals[ivX] = nX;
          volumeNormals[ivY] = nY;
          volumeNormals[ivZ] = nZ;

          volumePositions[ivX] = pX;
          volumePositions[ivY] = pY;
          volumePositions[ivZ] = pZ;
        }
      }

      update.push({
        positions: volumePositions,
        uuid: this.bodies[i].uuid,
        normals: volumeNormals
      });
    }

    self.postMessage({
      action: 'updateBodies',
      bodies: update,
      type: 'soft'
    });
  }

  activateAll () {
    this.bodies.forEach((collider) => {
      this.world.removeSoftBody(collider.body);
      this.world.addSoftBody(collider.body);
      collider.body.activate();
    });
  }

  remove (props) {
    const mesh = find(this.bodies, { uuid: props.uuid });
    const index = this.bodies.indexOf(mesh);

    if (mesh === -1) return false;

    this.world.removeSoftBody(mesh.body);
    Ammo.destroy(mesh.body);
    delete mesh.geometry;

    this.bodies.splice(index, 1);
    return true;
  }

  getBodyByUUID (uuid) {
    return find(this.bodies, { uuid: uuid });
  }
}
