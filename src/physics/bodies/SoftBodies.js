import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Geometry } from 'three/src/core/Geometry';

import { equalBufferVertices } from 'utils/equalBufferVertices';
import { Ammo } from 'core/Ammo';

import {
  MARGIN,
  POWER16,
  FRICTION,
  STIFFNESS,
  VITERATIONS,
  PITERATIONS,
  SOFT_DAMPING,
  SOFT_COLLISION,
  DISABLE_DEACTIVATION
} from 'physics/constants';

export default class SoftBodies {
  constructor (physicWorld) {
    this.margin = MARGIN;
    this.friction = FRICTION;
    this.stiffness = STIFFNESS;
    this.damping = SOFT_DAMPING;
    this.viterations = VITERATIONS;
    this.piterations = PITERATIONS;
    this.collisions = SOFT_COLLISION;

    this.bodies = [];
    this.world = physicWorld;

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  createSoftBody (mesh, mass, pressure) {
    this.initGeometry(mesh.geometry);

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

    if (this.margin !== MARGIN) {
      Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);
    }

    body.get_m_materials().at(0).set_m_kLST(this.stiffness);
    body.get_m_materials().at(0).set_m_kAST(this.stiffness);

    body.setActivationState(DISABLE_DEACTIVATION);
    body.setTotalMass(mass, false);

    this.world.addSoftBody(body, 1, -1);
    mesh.userData.physicsBody = body;
    this.bodies.push(body);
  }

  initGeometry (bufferGeometry) {
    const geometry = new Geometry().fromBufferGeometry(bufferGeometry);
    geometry.mergeVertices();

    const indexedBufferGeometry = this.createIndexedBufferGeometry(geometry);
    const indexedVertices = indexedBufferGeometry.attributes.position.array;
    const vertices = bufferGeometry.attributes.position.array;
    const indices = indexedBufferGeometry.index.array;

    const _indexedVertices = indexedVertices.length / 3;
    const _vertices = vertices.length / 3;

    bufferGeometry.ammoVertices = indexedVertices;
    bufferGeometry.ammoIndexAssociation = [];
    bufferGeometry.ammoIndices = indices;

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

  createIndexedBufferGeometry (geometry) {
    const _vertices = geometry.vertices.length;
    const _faces = geometry.faces.length;
    const _faces3 = _faces * 3;

    const bufferGeometry = new BufferGeometry();
    const vertices = new Float32Array(_vertices * 3);
    const indices = new (_faces3 > POWER16 ? Uint32Array : Uint16Array)(_faces3);

    for (let v = 0; v < _vertices; v++) {
      const v3 = v * 3;
      const vertex = geometry.vertices[v];

      vertices[v3] = vertex.x;
      vertices[v3 + 1] = vertex.y;
      vertices[v3 + 2] = vertex.z;
    }

    for (let f = 0; f < _faces; f++) {
      const f3 = f * 3;
      const face = geometry.faces[f];

      indices[f3] = face.a;
      indices[f3 + 1] = face.b;
      indices[f3 + 2] = face.c;
    }

    bufferGeometry.addAttribute('position', new BufferAttribute(vertices, 3));
    bufferGeometry.setIndex(new BufferAttribute(indices, 1));
    return bufferGeometry;
  }
}
