import { Vector3 } from 'three/src/math/Vector3';
import SoftBody from './SoftBody';

import {
  ROPE_MARGIN,
  ROPE_VITERATIONS,
  ROPE_PITERATIONS
} from '@/constants';

export default class RopeBodies extends SoftBody {
  constructor (worker) {
    super('Rope', worker, {
      margin: ROPE_MARGIN,
      piterations: ROPE_PITERATIONS,
      viterations: ROPE_VITERATIONS
    });
  }

  addBody (mesh, mass, length, position = new Vector3()) {
    super.addBody(mesh, mass, {
      position: position,
      length: length
    });
  }

  append (mesh, target, top = true, influence = 1) {
    const ropeTop = mesh.geometry.attributes.position.array.length / 3 - 1;

    this.worker.postMessage({
      action: 'appendRope',
      params: {
        position: top ? ropeTop : 0.0,
        influence: influence,
        target: target.uuid,
        uuid: mesh.uuid
      }
    });
  }

  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = this.bodies[i];

      if (body && body.uuid === bodies[i].uuid) {
        const position = body.geometry.attributes.position;
        position.array = bodies[i].positions;
        position.needsUpdate = true;
      }
    }
  }
}
