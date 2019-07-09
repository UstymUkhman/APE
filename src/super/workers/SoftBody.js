import {
  FRICTION,
  SOFT_DAMPING,
  SOFT_STIFFNESS,
  SOFT_COLLISION
} from '@/constants';

export default class SoftBody {
  constructor (type, worker, constants = null) {
    this.bodies = [];
    this.worker = worker;

    this.constants = constants;
    this.type = type.toLowerCase();
    this.worker.postMessage({action: `init${type}Bodies`});
  }

  addBody (mesh, mass, additionalParams = {}) {
    this.worker.postMessage({
      action: 'addBody',
      params: {
        geometry: mesh.geometry,
        ...additionalParams,
        collider: 'Body',
        uuid: mesh.uuid,
        type: this.type,
        mass: mass
      }
    });

    this.bodies.push(mesh);
  }

  setPiterations (mesh, piterations = this.constants.piterations) {
    this.worker.postMessage({
      action: 'setPiterations',

      params: {
        piterations: piterations,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setViterations (mesh, viterations = this.constants.viterations) {
    this.worker.postMessage({
      action: 'setViterations',

      params: {
        viterations: viterations,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setCollisions (mesh, collisions = SOFT_COLLISION) {
    this.worker.postMessage({
      action: 'setCollisions',

      params: {
        collisions: collisions,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setStiffness (mesh, stiffness = SOFT_STIFFNESS) {
    this.worker.postMessage({
      action: 'setStiffness',

      params: {
        stiffness: stiffness,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setPressure (mesh, pressure = 0) {
    this.worker.postMessage({
      action: 'setPressure',

      params: {
        pressure: pressure,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setFriction (mesh, friction = FRICTION) {
    this.worker.postMessage({
      action: 'setFriction',

      params: {
        friction: friction,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setDamping (mesh, damping = SOFT_DAMPING) {
    this.worker.postMessage({
      action: 'setDamping',

      params: {
        damping: damping,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setMargin (mesh, margin = this.constants.margin) {
    this.worker.postMessage({
      action: 'setMargin',

      params: {
        uuid: mesh.uuid,
        type: this.type,
        margin: margin
      }
    });
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
