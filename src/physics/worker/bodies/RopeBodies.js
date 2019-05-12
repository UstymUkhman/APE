import { Vector3 } from 'three/src/math/Vector3';

import {
  ROPE_MARGIN,
  ROPE_VITERATIONS,
  ROPE_PITERATIONS
} from 'physics/constants';

export default class RopeBodies {
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = {
      margin: ROPE_MARGIN,
      viterations: ROPE_VITERATIONS,
      piterations: ROPE_PITERATIONS
    };

    worker.postMessage({action: 'initRopeBodies'});
  }

  addBody (mesh, length, mass, position = new Vector3()) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        geometry: mesh.geometry,
        position: position,
        collider: 'Body',
        uuid: mesh.uuid,
        length: length,
        type: 'rope',
        mass: mass
      }
    });

    this.bodies.push(mesh);
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

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: 'rope'
      }
    });
  }

  remove (mesh) {
    const body = this.bodies.indexOf(mesh);

    if (body !== -1) {
      this.bodies.splice(body, 1);

      this.worker.postMessage({
        action: 'removeBody',

        params: {
          uuid: mesh.uuid,
          type: 'rope'
        }
      });
    }
  }

  set margin (value) {
    this.constants.margin = value;
    this._updateConstants();
  }

  get margin () {
    return this.constants.margin;
  }

  set viterations (value) {
    this.constants.viterations = value;
    this._updateConstants();
  }

  get viterations () {
    return this.constants.viterations;
  }

  set piterations (value) {
    this.constants.piterations = value;
    this._updateConstants();
  }

  get piterations () {
    return this.constants.piterations;
  }
}
