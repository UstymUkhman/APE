import FlexBodies from '@/workers/FlexBodies';

import {
  SOFT_MARGIN,
  SOFT_DAMPING,
  SOFT_FRICTION,
  SOFT_STIFFNESS,
  SOFT_COLLISION,
  SOFT_PITERATIONS,
  SOFT_VITERATIONS,
  SOFT_RESTITUTION,
  CCD_MOTION_THRESHOLD
} from '@/constants';

export default class SoftBodies extends FlexBodies {
  constructor (worker) {
    super('Soft', worker, {
      margin: SOFT_MARGIN,
      damping: SOFT_DAMPING,
      friction: SOFT_FRICTION,
      stiffness: SOFT_STIFFNESS,
      collisions: SOFT_COLLISION,
      piterations: SOFT_PITERATIONS,
      viterations: SOFT_VITERATIONS
    });
  }

  addBody (mesh, mass, pressure) {
    super.addBody(mesh, mass, {
      pressure: pressure
    });
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

  setRestitution (mesh, restitution = SOFT_RESTITUTION) {
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

  set collisions (value) {
    this.constants.collisions = value;
    this._updateConstants();
  }

  get collisions () {
    return this.constants.collisions;
  }
}
