import { Vector3 } from 'three/src/math/Vector3';
import SoftBody from '@/super/workers/SoftBody';

import {
  CLOTH_MARGIN,
  CLOTH_PITERATIONS,
  CLOTH_VITERATIONS
} from '@/constants';

export default class ClothBodies extends SoftBody {
  constructor (worker) {
    super('Cloth', worker, {
      margin: CLOTH_MARGIN,
      piterations: CLOTH_PITERATIONS,
      viterations: CLOTH_VITERATIONS
    });
  }

  addBody (mesh, mass, position = new Vector3(0, 0, 0)) {
    super.addBody(mesh, mass, {
      position: position
    });
  }

  append (mesh, point, target, influence = 0.5) {
    this.worker.postMessage({
      action: 'appendCloth',

      params: {
        influence: influence,
        target: target.uuid,
        uuid: mesh.uuid,
        point: point
      }
    });
  }

  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = this.bodies[i];

      if (body && body.uuid === bodies[i].uuid) {
        const position = body.geometry.attributes.position;
        const normal = body.geometry.attributes.normal;

        position.array = bodies[i].positions;
        position.needsUpdate = true;
        normal.needsUpdate = true;

        body.geometry.computeVertexNormals();
      }
    }
  }
}
