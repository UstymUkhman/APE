import { Vector3 } from 'three/src/math/Vector3';
import { SOFT_MARGIN } from 'physics/constants';

export default class ClothBodies {
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = { margin: SOFT_MARGIN };
    worker.postMessage({action: 'initClothBodies'});
  }

  addBody (mesh, mass, position = new Vector3(0, 0, 0)) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        geometry: mesh.geometry,
        position: position,
        collider: 'Body',
        uuid: mesh.uuid,
        type: 'cloth',
        mass: mass
      }
    });

    this.bodies.push(mesh);
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

  remove (mesh) {
    const body = this.bodies.indexOf(mesh);

    if (body !== -1) {
      this.bodies.splice(body, 1);

      this.worker.postMessage({
        action: 'removeBody',

        params: {
          uuid: mesh.uuid,
          type: 'cloth'
        }
      });
    }
  }

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: 'cloth'
      }
    });
  }

  set margin (value) {
    this.constants.margin = value;
    this._updateConstants();
  }

  get margin () {
    return this.constants.margin;
  }
}
