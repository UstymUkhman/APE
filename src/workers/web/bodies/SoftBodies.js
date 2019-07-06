import {
  FRICTION,
  STIFFNESS,
  RESTITUTION,
  VITERATIONS,
  PITERATIONS,
  SOFT_MARGIN,
  SOFT_DAMPING,
  SOFT_COLLISION,
  CCD_MOTION_THRESHOLD
} from '@/constants';

export default class SoftBodies {
  constructor (worker) {
    this.bodies = [];
    this.worker = worker;

    this.constants = {
      friction: FRICTION,
      margin: SOFT_MARGIN,
      stiffness: STIFFNESS,
      damping: SOFT_DAMPING,
      viterations: VITERATIONS,
      piterations: PITERATIONS,
      collisions: SOFT_COLLISION
    };

    worker.postMessage({action: 'initSoftBodies'});
  }

  addBody (mesh, mass, pressure) {
    this.worker.postMessage({
      action: 'addBody',

      params: {
        geometry: mesh.geometry,
        pressure: pressure,
        collider: 'Body',
        uuid: mesh.uuid,
        type: 'soft',
        mass: mass
      }
    });

    this.bodies.push(mesh);
  }

  setCcdSweptSphereRadius (mesh, radius = 0.5) {
    this.worker.postMessage({
      action: 'setCcdSweptSphereRadius',

      params: {
        uuid: mesh.uuid,
        radius: radius,
        type: 'soft'
      }
    });
  }

  setCcdMotionThreshold (mesh, threshold = CCD_MOTION_THRESHOLD) {
    this.worker.postMessage({
      action: 'setCcdMotionThreshold',

      params: {
        threshold: threshold,
        uuid: mesh.uuid,
        type: 'soft'
      }
    });
  }

  setRestitution (mesh, restitution = RESTITUTION) {
    this.worker.postMessage({
      action: 'setRestitution',

      params: {
        restitution: restitution,
        uuid: mesh.uuid,
        type: 'soft'
      }
    });
  }

  setFriction (mesh, friction = this.constants.friction) {
    this.worker.postMessage({
      action: 'setFriction',

      params: {
        friction: friction,
        uuid: mesh.uuid,
        type: 'soft'
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
        normal.array = bodies[i].normals;

        position.needsUpdate = true;
        normal.needsUpdate = true;
      }
    }
  }

  enable (mesh) {
    this.worker.postMessage({
      action: 'enableBody',

      params: {
        uuid: mesh.uuid,
        type: 'soft'
      }
    });
  }

  disable (mesh) {
    this.worker.postMessage({
      action: 'disableBody',

      params: {
        uuid: mesh.uuid,
        type: 'soft'
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
          type: 'soft'
        }
      });
    }
  }

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: 'soft'
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

  set friction (value) {
    this.constants.friction = value;
    this._updateConstants();
  }

  get friction () {
    return this.constants.friction;
  }

  set stiffness (value) {
    this.constants.stiffness = value;
    this._updateConstants();
  }

  get stiffness () {
    return this.constants.stiffness;
  }

  set damping (value) {
    this.constants.damping = value;
    this._updateConstants();
  }

  get damping () {
    return this.constants.damping;
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

  set collisions (value) {
    this.constants.collisions = value;
    this._updateConstants();
  }

  get collisions () {
    return this.constants.collisions;
  }
}
