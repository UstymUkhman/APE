import { Vector3 } from 'three/src/math/Vector3';
import findIndex from 'lodash/findIndex';

import find from 'lodash/find';
import Ammo from 'utils/Ammo';

import {
  MARGIN,
  FRICTION,
  ZERO_MASS,
  ONE_VECTOR3,
  RESTITUTION,
  LINEAR_DAMPING,
  ANGULAR_DAMPING
} from '@/constants';

export default class RigidBody {
  constructor (world, type) {
    this.type = type;
    this.bodies = [];
    this.world = world;

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

    for (let t = 0, length = triangles.length; t < length; t++) {
      const triangle = triangles[t];

      vec1.setX(triangle[0].x);
      vec1.setY(triangle[0].y);
      vec1.setZ(triangle[0].z);

      vec2.setX(triangle[1].x);
      vec2.setY(triangle[1].y);
      vec2.setZ(triangle[1].z);

      vec3.setX(triangle[2].x);
      vec3.setY(triangle[2].y);
      vec3.setZ(triangle[2].z);

      mesh.addTriangle(vec1, vec2, vec3, true);
    }

    const concave = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
    this._checkBodyMargin(concave);
    return concave;
  }

  createConvex (coords) {
    const convex = new Ammo.btConvexHullShape();
    const vec = new Ammo.btVector3(0.0, 0.0, 0.0);

    for (let i = 0, last = coords.length - 3; i < coords.length; i += 3) {
      vec.setValue(coords[i], coords[i + 1], coords[i + 2]);
      convex.addPoint(vec, i >= last);
    }

    this._checkBodyMargin(convex);
    return convex;
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

  setLinearFactor (mesh, factor = ONE_VECTOR3) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setLinearFactor(new Ammo.btVector3(factor.x, factor.y, factor.z));
    body.activate();
  }

  setAngularFactor (mesh, factor = ONE_VECTOR3) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setAngularFactor(new Ammo.btVector3(factor.x, factor.y, factor.z));
    body.activate();
  }

  setLinearVelocity (mesh, velocity = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setLinearVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z));
    body.activate();
  }

  setAngularVelocity (mesh, velocity = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setAngularVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z));
    body.activate();
  }
  /* eslint-enable new-cap */

  setRestitution (mesh, restitution = RESTITUTION) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setRestitution(restitution);
    body.activate();
  }

  setFriction (mesh, friction = FRICTION) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setFriction(friction);
    body.activate();
  }

  setDamping (mesh, linear = LINEAR_DAMPING, angular = ANGULAR_DAMPING) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setDamping(linear, angular);
    body.activate();
  }

  /* eslint-disable new-cap */
  applyTorque (mesh, torque = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.applyTorque(new Ammo.btVector3(torque.x, torque.y, torque.z));
    body.activate();
  }

  applyForce (mesh, force = new Vector3(), offset = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;

    body.applyForce(
      new Ammo.btVector3(force.x, force.y, force.z),
      new Ammo.btVector3(offset.x, offset.y, offset.z)
    );

    body.activate();
  }

  applyCentralForce (mesh, force = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.applyCentralForce(new Ammo.btVector3(force.x, force.y, force.z));
    body.activate();
  }

  applyImpulse (mesh, impulse = new Vector3(), offset = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;

    body.applyImpulse(
      new Ammo.btVector3(impulse.x, impulse.y, impulse.z),
      new Ammo.btVector3(offset.x, offset.y, offset.z)
    );

    body.activate();
  }

  applyCentralImpulse (mesh, impulse = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.applyCentralImpulse(new Ammo.btVector3(impulse.x, impulse.y, impulse.z));
    body.activate();
  }
  /* eslint-enable new-cap */

  getBodyByCollider (collider) {
    return find(this.bodies, { body: collider });
  }

  getBodyByUUID (uuid) {
    return find(this.bodies, { uuid: uuid });
  }

  addCollision (body, otherUUID) {
    body.collisions.push(otherUUID);
  }

  getCollisions () {
    const collisions = [];

    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const body = this.bodies[b];

      if (body.collisions.length) {
        collisions.push({
          collisions: [...body.collisions],
          body: body
        });
      }
    }

    return collisions;
  }

  resetCollisions () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      this.bodies[b].collisions = [];
    }
  }

  remove (mesh) {
    const index = findIndex(this.bodies, { uuid: mesh.uuid });

    if (index > -1) {
      const body = this.bodies[index].body;
      this.world.removeRigidBody(body);
      Ammo.destroy(body);

      this.bodies.splice(index, 1);
      return true;
    }

    return false;
  }

  _checkBodyMargin (shape) {
    if (this.margin !== MARGIN) {
      shape.setMargin(this.margin);
    }
  }
}
