import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Geometry } from 'three/src/core/Geometry';

import { equalBufferVertices } from 'utils/equalBufferVertices';
import { Ammo } from 'core/Ammo';

import {
  MARGIN,
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

    body.get_m_materials().at(0).set_m_kLST(this.stiffness);
    body.get_m_materials().at(0).set_m_kAST(this.stiffness);

    body.setTotalMass(mass, false);
    // Ammo.castObject(body, Ammo.btCollisionObject).getCollisionShape().setMargin(this.margin);

    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addSoftBody(body, 1, -1);
    mesh.userData.physicsBody = body;
    this.bodies.push(body);
  }

  initGeometry (bufferGeometry) {
    const geometry = new Geometry().fromBufferGeometry(bufferGeometry);
    geometry.mergeVertices();

    const indexedBufferGeometry = this.createIndexedBufferGeometry(geometry);
    const idxVertices = indexedBufferGeometry.attributes.position.array;
    const vertices = bufferGeometry.attributes.position.array;
    const indices = indexedBufferGeometry.index.array;

    const numIdxVertices = idxVertices.length / 3;
    const numVertices = vertices.length / 3;

    bufferGeometry.ammoVertices = idxVertices;
    bufferGeometry.ammoIndices = indices;
    bufferGeometry.ammoIndexAssociation = [];

    for (let i = 0; i < numIdxVertices; i++) {
      const i3 = i * 3;
      const association = [];

      bufferGeometry.ammoIndexAssociation.push(association);

      for (let j = 0; j < numVertices; j++) {
        const j3 = j * 3;

        if (equalBufferVertices(idxVertices, i3, vertices, j3)) {
          association.push(j3);
        }
      }
    }
  }

  createIndexedBufferGeometry (geometry) {
    const numVertices = geometry.vertices.length;
    const numFaces = geometry.faces.length;

    const bufferGeometry = new BufferGeometry();
    const vertices = new Float32Array(numVertices * 3);
    const indices = new (numFaces * 3 > 65535 ? Uint32Array : Uint16Array)(numFaces * 3);

    for (let i = 0; i < numVertices; i++) {
      const p = geometry.vertices[i];
      const i3 = i * 3;

      vertices[i3] = p.x;
      vertices[i3 + 1] = p.y;
      vertices[i3 + 2] = p.z;
    }

    for (let i = 0; i < numFaces; i++) {
      const f = geometry.faces[i];
      const i3 = i * 3;

      indices[i3] = f.a;
      indices[i3 + 1] = f.b;
      indices[i3 + 2] = f.c;
    }

    bufferGeometry.setIndex(new BufferAttribute(indices, 1));
    bufferGeometry.addAttribute('position', new BufferAttribute(vertices, 3));

    return bufferGeometry;
  }

  // checkBodyMargin (shape) {
  //   if (this.margin !== MARGIN) {
  //     shape.setMargin(this.margin);
  //   }
  // }
}
