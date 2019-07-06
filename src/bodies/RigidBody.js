import { Ammo, webWorker } from '@/utils';
import find from 'lodash/find';

import {
  MARGIN,
  FRICTION,
  ZERO_MASS,
  ACTIVE_TAG,
  ONE_VECTOR3,
  RESTITUTION,
  LINEAR_DAMPING,
  ANGULAR_DAMPING,
  DISABLE_SIMULATION,
  DISABLE_DEACTIVATION
} from '@/constants';

export default class RigidBody {
  constructor (world, type) {
    this.type = type;
    this.bodies = [];

    this.world = world;
    this.worker = webWorker();

    this.margin = MARGIN;
    this.friction = FRICTION;
    this.restitution = RESTITUTION;
    this.linearFactor = ONE_VECTOR3;
    this.angularFactor = ONE_VECTOR3;
    this.linearDamping = LINEAR_DAMPING;
    this.angularDamping = ANGULAR_DAMPING;

    /* eslint-disable new-cap */
    this.rotation = new Ammo.btQuaternion();
    this.transform = new Ammo.btTransform();
    /* eslint-enable new-cap */
  }

  _checkBodyMargin (shape) {
    if (this.margin !== MARGIN) {
      shape.setMargin(this.margin);
    }
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
  /* eslint-enable new-cap */

  getBodyByCollider (collider) {
    return find(this.bodies, { body: collider });
  }

  getBodyByUUID (uuid) {
    return find(this.bodies, { uuid: uuid });
  }

  getBodyInfo (collider, uuid) {
    const body = !collider ?
      this.getBodyByUUID(uuid) :
      this.getBodyByCollider(collider);

    return !body ? null : {
      uuid: body.uuid,
      type: this.type
    };
  }

  addCollision (bodyUUID, otherUUID) {
    const body = this.worker ? this.getBodyByUUID(bodyUUID) : bodyUUID;
    body.collisions.push(otherUUID);
  }

  getCollisions () {
    const collisions = [];

    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const body = this.bodies[b];

      if (body.collisions.length) {
        const collisionsInfo = { collisions: [...body.collisions] };

        if (this.worker) collisionsInfo.uuid = body.uuid;
        else collisionsInfo.body = body;

        collisions.push(collisionsInfo);
      }
    }

    return collisions;
  }

  resetCollisions () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      this.bodies[b].collisions = [];
    }
  }

  enable (mesh) {
    const kinematic = this.type === 'kinematic';
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      body.body.forceActivationState(kinematic ? DISABLE_DEACTIVATION : ACTIVE_TAG);
      this.world.addRigidBody(body.body);

      this.rotation.setValue(mesh.quaternion._x, mesh.quaternion._y, mesh.quaternion._z, mesh.quaternion._w);
      this.transform.getOrigin().setValue(mesh.position.x, mesh.position.y, mesh.position.z);
      this.transform.setRotation(this.rotation);

      if (kinematic) {
        const motionState = body.body.getMotionState();

        if (motionState) {
          motionState.setWorldTransform(this.transform);
        }
      }

      body.body.activate();
    }
  }

  disable (mesh) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      body.body.forceActivationState(DISABLE_SIMULATION);
      this.world.removeRigidBody(body.body);
    }
  }

  remove (mesh) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const index = this.bodies.indexOf(body);

      body.body.forceActivationState(DISABLE_SIMULATION);
      this.world.removeRigidBody(body.body);
      Ammo.destroy(body.body);

      this.bodies.splice(index, 1);
      return true;
    }

    return false;
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
