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
  createBox (size) {
    const box = new Ammo.btBoxShape(new Ammo.btVector3(size.width / 2.0, size.height / 2.0, size.depth / 2.0));
    this._checkBodyMargin(box);
    return box;
  }

  createCylinder (size) {
    const cylinder = new Ammo.btCylinderShape(size.width, size.height / 2.0, size.depth / 2.0);
    this._checkBodyMargin(cylinder);
    return cylinder;
  }

  createCapsule (size) {
    const capsule = new Ammo.btCapsuleShape(size.width, size.height / 2.0);
    this._checkBodyMargin(capsule);
    return capsule;
  }

  createCone (size) {
    const cone = new Ammo.btConeShape(size.width, size.height / 2.0);
    this._checkBodyMargin(cone);
    return cone;
  }

  createConcave (triangles) {
    const mesh = new Ammo.btTriangleMesh();

    const vec1 = new Ammo.btVector3(0.0, 0.0, 0.0);
    const vec2 = new Ammo.btVector3(0.0, 0.0, 0.0);
    const vec3 = new Ammo.btVector3(0.0, 0.0, 0.0);

    for (let i = 0; i < triangles.length; i++) {
      vec1.setX(triangles[i][0].x);
      vec1.setY(triangles[i][0].y);
      vec1.setZ(triangles[i][0].z);

      vec2.setX(triangles[i][1].x);
      vec2.setY(triangles[i][1].y);
      vec2.setZ(triangles[i][1].z);

      vec3.setX(triangles[i][2].x);
      vec3.setY(triangles[i][2].y);
      vec3.setZ(triangles[i][2].z);

      mesh.addTriangle(vec1, vec2, vec3, true);
    }

    const concave = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
    this._checkBodyMargin(concave);
    return concave;
  }

  createSphere (radius) {
    const sphere = new Ammo.btSphereShape(radius);
    this._checkBodyMargin(sphere);
    return sphere;
  }

  createRigidBody (shape, mass, position, quaternion) {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quaternion._x, quaternion._y, quaternion._z, quaternion._w));

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

  _checkBodyMargin (shape) {
    if (this.margin !== MARGIN) {
      shape.setMargin(this.margin);
    }
  }

  set constants (values) {
    for (const constant in values) {
      this[constant] = values[constant];
    }
  }

  get constants () {
    return {
      angularDamping: this.angularDamping,
      linearDamping: this.linearDamping,
      angularFactor: this.angularFactor,
      linearFactor: this.linearFactor,
      restitution: this.restitution,
      friction: this.friction,
      margin: this.margin
    };
  }
}
