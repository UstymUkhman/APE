import { CCD_MOTION_THRESHOLD } from '@/constants';
import { Vector3 } from 'three/src/math/Vector3';
import RigidBody from './RigidBody';

export default class DynamicBodies extends RigidBody {
  constructor (worker) {
    super('dynamic', worker);
    this.worker.postMessage({action: 'initDynamicBodies'});
  }

  addBox (mesh, mass) {
    super.addBody('Box', mesh, { mass: mass });
  }

  addCylinder (mesh, mass) {
    super.addBody('Cylinder', mesh, { mass: mass });
  }

  addCapsule (mesh, mass) {
    super.addBody('Capsule', mesh, { mass: mass });
  }

  addCone (mesh, mass) {
    super.addBody('Cone', mesh, { mass: mass });
  }

  addConcave (mesh, mass) {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    super.addBody('Concave', mesh, {
      geometry: mesh.geometry,
      mass: mass
    });
  }

  addConvex (mesh, mass) {
    super.addBody('Convex', mesh, {
      geometry: mesh.geometry,
      mass: mass
    });
  }

  addSphere (mesh, mass) {
    super.addBody('Sphere', mesh, { mass: mass });
  }

  setLinearFactor (mesh, factor = this.constants.linearFactor) {
    this.worker.postMessage({
      action: 'setLinearFactor',

      params: {
        factor: factor,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setAngularFactor (mesh, factor = this.constants.angularFactor) {
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

  setRestitution (mesh, restitution = this.constants.restitution) {
    this.worker.postMessage({
      action: 'setRestitution',

      params: {
        restitution: restitution,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setFriction (mesh, friction = this.constants.friction) {
    this.worker.postMessage({
      action: 'setFriction',

      params: {
        friction: friction,
        uuid: mesh.uuid,
        type: this.type
      }
    });
  }

  setDamping (mesh, linear = this.constants.linearDamping, angular = this.constants.angularDamping) {
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

  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = this.bodies[i];

      if (body && body.uuid === bodies[i].uuid) {
        const position = bodies[i].position;
        const quaternion = bodies[i].quaternion;

        body.position.set(position.x, position.y, position.z);
        body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      }
    }
  }
}
