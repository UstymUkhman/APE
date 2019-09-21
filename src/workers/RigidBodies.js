import { Vector3 } from 'three/src/math/Vector3';
import { getBodyGroup } from '@/utils';
import { MASK_ALL } from '@/constants';
import find from 'lodash.find';

import {
  RIGID_MARGIN,
  RIGID_FRICTION,
  RIGID_RESTITUTION,
  RIGID_LINEAR_DAMPING,
  RIGID_ANGULAR_DAMPING
} from '@/constants';

const VECTOR1 = new Vector3(1.0, 1.0, 1.0);

export default class RigidBodies {
  constructor (type, worker) {
    this.bodies = [];
    this.type = type;
    this.worker = worker;

    this.constants = {
      mask: MASK_ALL,
      margin: RIGID_MARGIN,
      linearFactor: VECTOR1,
      angularFactor: VECTOR1,
      friction: RIGID_FRICTION,
      group: getBodyGroup(type),
      restitution: RIGID_RESTITUTION,
      linearDamping: RIGID_LINEAR_DAMPING,
      angularDamping: RIGID_ANGULAR_DAMPING
    };
  }

  addBody (collider, mesh, additionalParams = {}) {
    this.worker.postMessage({
      action: 'addBody',
      params: {
        rotation: mesh.quaternion.clone(),
        position: mesh.position.clone(),
        size: mesh.geometry.parameters,
        ...additionalParams,
        collider: collider,
        uuid: mesh.uuid,
        type: this.type
      }
    });

    this.bodies.push(mesh);
  }

  getBody (uuid) {
    return find(this.bodies, { uuid });
  }

  enable (mesh) {
    this.worker.postMessage({
      action: 'enableBody',

      params: {
        quaternion: mesh.quaternion.clone(),
        position: mesh.position.clone(),
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

  _updateConstants () {
    this.worker.postMessage({
      action: 'updateConstants',
      params: {
        constants: this.constants,
        type: this.type
      }
    });
  }

  set mask (mask) {
    this.constants.mask = mask;
    this._updateConstants();
  }

  get mask () {
    return this.constants.mask;
  }

  set group (group) {
    this.constants.group = group;
    this._updateConstants();
  }

  get group () {
    return this.constants.group;
  }

  set margin (margin) {
    this.constants.margin = margin;
    this._updateConstants();
  }

  get margin () {
    return this.constants.margin;
  }

  set friction (friction) {
    this.constants.friction = friction;
    this._updateConstants();
  }

  get friction () {
    return this.constants.friction;
  }

  set restitution (restitution) {
    this.constants.restitution = restitution;
    this._updateConstants();
  }

  get restitution () {
    return this.constants.restitution;
  }

  set linearFactor (linearFactor) {
    this.constants.linearFactor = linearFactor;
    this._updateConstants();
  }

  get linearFactor () {
    return this.constants.linearFactor;
  }

  set angularFactor (angularFactor) {
    this.constants.angularFactor = angularFactor;
    this._updateConstants();
  }

  get angularFactor () {
    return this.constants.angularFactor;
  }

  set linearDamping (linearDamping) {
    this.constants.linearDamping = linearDamping;
    this._updateConstants();
  }

  get linearDamping () {
    return this.constants.linearDamping;
  }

  set angularDamping (angularDamping) {
    this.constants.angularDamping = angularDamping;
    this._updateConstants();
  }

  get angularDamping () {
    return this.constants.angularDamping;
  }
}
