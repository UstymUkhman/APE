// Rigid bodies parent class

import { Ammo } from 'core/Ammo';

import {
  MARGIN,
  FRICTION,
  ZERO_MASS,
  ONE_VECTOR3,
  RESTITUTION,
  LINEAR_DAMPING,
  ANGULAR_DAMPING
} from 'physics/constants';

export default class RigidBody {
  /**
   * @constructs RigidBody
   * @description - Initialize default parameters for rigid bodies
   */
  constructor () {
    this.margin = MARGIN;
    this.friction = FRICTION;
    this.restitution = RESTITUTION;
    this.linearFactor = ONE_VECTOR3;
    this.angularFactor = ONE_VECTOR3;
    this.linearDamping = LINEAR_DAMPING;
    this.angularDamping = ANGULAR_DAMPING;
  }

  /* eslint-disable new-cap */
  /**
   * @public
   * @description - Create box collider for a mesh
   * @param {Object} size - THREE.js Mesh.geometry.parameters
   * @returns {Object} - Ammo.js box shape
   */
  createBox (size) {
    const box = new Ammo.btBoxShape(new Ammo.btVector3(size.width / 2.0, size.height / 2.0, size.depth / 2.0));
    this._checkBodyMargin(box);
    return box;
  }

  /**
   * @public
   * @description - Create cylinder collider for a mesh
   * @param {Object} size - THREE.js Mesh.geometry.parameters
   * @returns {Object} - Ammo.js cylinder shape
   */
  createCylinder (size) {
    const cylinder = new Ammo.btCylinderShape(size.width, size.height / 2.0, size.depth / 2.0);
    this._checkBodyMargin(cylinder);
    return cylinder;
  }

  /**
   * @public
   * @description - Create capsule collider for a mesh
   * @param {Object} size - THREE.js Mesh.geometry.parameters
   * @returns {Object} - Ammo.js capsule shape
   */
  createCapsule (size) {
    const capsule = new Ammo.btCapsuleShape(size.width, size.height / 2.0);
    this._checkBodyMargin(capsule);
    return capsule;
  }

  /**
   * @public
   * @description - Create cone collider for a mesh
   * @param {Object} size - THREE.js Mesh.geometry.parameters
   * @returns {Object} - Ammo.js cone shape
   */
  createCone (size) {
    const cone = new Ammo.btConeShape(size.width, size.height / 2.0);
    this._checkBodyMargin(cone);
    return cone;
  }

  /**
   * @public
   * @description - Create sphere collider for a mesh
   * @param {Number} radius - THREE.js SphereGeometry/SphereBufferGeometry radius
   * @returns {Object} - Ammo.js sphere shape
   */
  createSphere (radius) {
    const sphere = new Ammo.btSphereShape(radius);
    this._checkBodyMargin(sphere);
    return sphere;
  }

  /**
   * @public
   * @description - Sets rigid body physics parameters
   * @param {Object} shape - Ammo.js shape collider
   * @param {Number} mass - THREE.js mesh's mass
   * @param {Object} position - THREE.js mesh.position
   * @param {Object} quaternion - THREE.js mesh.quaternion
   * @returns {Object} - Ammo.js rigid body
   */
  createRigidBody (shape, mass, position, quaternion) {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

    const motion = new Ammo.btDefaultMotionState(transform);
    const inertia = new Ammo.btVector3(0.0, 0.0, 0.0);

    if (mass > ZERO_MASS) {
      shape.calculateLocalInertia(mass, inertia);
    }

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, inertia));
    body.setLinearFactor(new Ammo.btVector3(this.linearFactor.x, this.linearFactor.y, this.linearFactor.z));
    body.setAngularFactor(new Ammo.btVector3(this.angularFactor.x, this.angularFactor.y, this.angularFactor.z));

    body.setDamping(this.linearDamping, this.angularDamping);
    body.setRestitution(this.restitution);
    body.setFriction(this.friction);
    return body;
  }
  /* eslint-enable new-cap */

  /**
   * @private
   * @description - Sets collider's margin if it's different from default
   * @default MARGIN - defined in physics/constants.js
   * @param {Object} shape - Ammo.js shape collider
   */
  _checkBodyMargin (shape) {
    if (this.margin !== MARGIN) {
      shape.setMargin(this.margin);
    }
  }
}
