import { Vector3 } from 'three/src/math/Vector3';
import assign from 'lodash/assign';
import find from 'lodash/find';

import {
  MARGIN,
  FRICTION,
  ONE_VECTOR3,
  RESTITUTION,
  LINEAR_DAMPING,
  ANGULAR_DAMPING,
  CCD_MOTION_THRESHOLD
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

  setLinearFactor (mesh, factor = ONE_VECTOR3) {
    this.worker.postMessage({
      action: 'setLinearFactor',

      params: {
        factor: factor,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setAngularFactor (mesh, factor = ONE_VECTOR3) {
    this.worker.postMessage({
      action: 'setAngularFactor',

      params: {
        factor: factor,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setLinearVelocity (mesh, velocity = new Vector3()) {
    this.worker.postMessage({
      action: 'setLinearVelocity',

      params: {
        velocity: velocity,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setAngularVelocity (mesh, velocity = new Vector3()) {
    this.worker.postMessage({
      action: 'setAngularVelocity',

      params: {
        velocity: velocity,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  applyTorque (mesh, torque = new Vector3()) {
    this.worker.postMessage({
      action: 'applyTorque',

      params: {
        torque: torque,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  applyForce (mesh, force = new Vector3(), offset = new Vector3()) {
    this.worker.postMessage({
      action: 'applyForce',

      params: {
        force: force,
        offset: offset,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  applyCentralForce (mesh, force = new Vector3()) {
    this.worker.postMessage({
      action: 'applyCentralForce',

      params: {
        force: force,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  applyImpulse (mesh, impulse = new Vector3(), offset = new Vector3()) {
    this.worker.postMessage({
      action: 'applyImpulse',

      params: {
        impulse: impulse,
        offset: offset,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  applyCentralImpulse (mesh, impulse = new Vector3()) {
    this.worker.postMessage({
      action: 'applyCentralImpulse',

      params: {
        impulse: impulse,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setCcdSweptSphereRadius (mesh, radius = 0.5) {
    this.worker.postMessage({
      action: 'setCcdSweptSphereRadius',

      params: {
        radius: radius,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setCcdMotionThreshold (mesh, threshold = CCD_MOTION_THRESHOLD) {
    this.worker.postMessage({
      action: 'setCcdMotionThreshold',

      params: {
        threshold: threshold,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setRestitution (mesh, restitution = RESTITUTION) {
    this.worker.postMessage({
      action: 'setRestitution',

      params: {
        restitution: restitution,
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

  setDamping (mesh, linear = LINEAR_DAMPING, angular = ANGULAR_DAMPING) {
    this.worker.postMessage({
      action: 'setDamping',

      params: {
        linear: linear,
        angular: angular,
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
