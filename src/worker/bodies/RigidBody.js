import assign from 'lodash/assign';
import find from 'lodash/find';

import {
  MARGIN,
  FRICTION,
  ONE_VECTOR3,
  RESTITUTION,
  LINEAR_DAMPING,
  ANGULAR_DAMPING
} from '@/constants';

export default class RigidBody {
  constructor (type, worker) {
    this.bodies = [];
    this.type = type;
    this.worker = worker;

    this.constants = {
      margin: MARGIN,
      friction: FRICTION,
      restitution: RESTITUTION,
      linearFactor: ONE_VECTOR3,
      angularFactor: ONE_VECTOR3,
      linearDamping: LINEAR_DAMPING,
      angularDamping: ANGULAR_DAMPING
    };
  }

  addBody (collider, mesh, additionalParams) {
    const params = {
      rotation: mesh.quaternion.clone(),
      position: mesh.position.clone(),
      size: mesh.geometry.parameters,
      uuid: mesh.uuid
    };

    const props = {
      collider: collider,
      type: this.type
    };

    assign(props, params, additionalParams);
    this.bodies.push(mesh);

    this.worker.postMessage({
      action: 'addBody',
      params: props
    });
  }

  setLinearFactor (mesh, factor) {
    this.worker.postMessage({
      action: 'setLinearFactor',

      params: {
        factor: factor,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setAngularFactor (mesh, factor) {
    this.worker.postMessage({
      action: 'setAngularFactor',

      params: {
        factor: factor,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setLinearVelocity (mesh, velocity) {
    this.worker.postMessage({
      action: 'setLinearVelocity',

      params: {
        velocity: velocity,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setAngularVelocity (mesh, velocity) {
    this.worker.postMessage({
      action: 'setAngularVelocity',

      params: {
        velocity: velocity,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  getBody (uuid) {
    return find(this.bodies, { uuid });
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

  set restitution (value) {
    this.constants.restitution = value;
    this._updateConstants();
  }

  get restitution () {
    return this.constants.restitution;
  }

  set linearFactor (value) {
    this.constants.linearFactor = value;
    this._updateConstants();
  }

  get linearFactor () {
    return this.constants.linearFactor;
  }

  set angularFactor (value) {
    this.constants.angularFactor = value;
    this._updateConstants();
  }

  get angularFactor () {
    return this.constants.angularFactor;
  }

  set linearDamping (value) {
    this.constants.linearDamping = value;
    this._updateConstants();
  }

  get linearDamping () {
    return this.constants.linearDamping;
  }

  set angularDamping (value) {
    this.constants.angularDamping = value;
    this._updateConstants();
  }

  get angularDamping () {
    return this.constants.angularDamping;
  }
}
