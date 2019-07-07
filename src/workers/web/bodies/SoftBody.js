import assign from 'lodash/assign';

export default class SoftBody {
  constructor (type, worker, constants = null) {
    this.bodies = [];
    this.worker = worker;

    this.constants = constants;
    this.type = type.toLowerCase();
    this.worker.postMessage({action: `init${type}Bodies`});
  }

  addBody (mesh, mass, additionalParams = {}) {
    const params = {
      geometry: mesh.geometry,
      collider: 'Body',
      uuid: mesh.uuid,
      type: this.type,
      mass: mass
    };

    assign(params, additionalParams);

    this.worker.postMessage({
      action: 'addBody',
      params: params
    });

    this.bodies.push(mesh);
  }

  enable (mesh) {
    this.worker.postMessage({
      action: 'enableBody',

      params: {
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  disable (mesh) {
    this.worker.postMessage({
      action: 'disableBody',

      params: {
        uuid: mesh.uuid,
        type: this.type
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
          type: this.type
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

  set piterations (value) {
    this.constants.piterations = value;
    this._updateConstants();
  }

  get piterations () {
    return this.constants.piterations;
  }

  set viterations (value) {
    this.constants.viterations = value;
    this._updateConstants();
  }

  get viterations () {
    return this.constants.viterations;
  }

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: this.type
      }
    });
  }
}
