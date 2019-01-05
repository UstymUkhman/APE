// https://en.blender.org/uploads/9/95/Dev-Physics-bullet-documentation.pdf

import { Quaternion } from 'three/src/math/Quaternion';
import { Vector3 } from 'three/src/math/Vector3';
import { Clock } from 'three/src/core/Clock';

import Ammo from 'Ammo.js';

const GRAVITY = -9.81;
const DISABLE_DEACTIVATION = 4.0;

// const ZERO_VECTOR3 = new Vector3(0.0, 0.0, 0.0);
const ZERO_QUATERNION = new Quaternion(0.0, 0.0, 0.0, 1.0);

export default class Physics {
  constructor () {
    this.bullets = [];
    this.rigidBodies = [];
    this.clock = new Clock();

    Ammo().then((Ammo) => {
      this.Ammo = Ammo;
      this.initAmmo();
    });
  }

  /* eslint-disable new-cap */
  initAmmo () {
    const broadphase = new this.Ammo.btDbvtBroadphase();
    const solver = new this.Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new this.Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new this.Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new this.Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    this.world.setGravity(new this.Ammo.btVector3(0.0, GRAVITY, 0.0));
    this.transform = new this.Ammo.btTransform();

    // Ray Collision:
    // this.rays = [];

    // this.intersectionPoint = null;
    // this.intersectionNormal = null;

    // this.tempVRayDest = new this.Ammo.btVector3();
    // this.tempVRayOrigin = new this.Ammo.btVector3();

    // this.closestRayResultCallback = new this.Ammo.ClosestRayResultCallback(this.tempVRayOrigin, this.tempVRayDest);
  }

  initGround (ground) {
    this.addBoxBody(ground, 0.0, 2.5);
    this.rigidBodies = this.rigidBodies.slice(0, -1);
  }

  addBoxBody (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const box = new this.Ammo.btBoxShape(new this.Ammo.btVector3(
      size.width / 2.0, size.height / 2.0, size.depth / 2.0
    ));

    if (margin !== 0.04) box.setMargin(margin);
    this.addRigidBody(box, mesh, mass, friction);
  }

  addSphereBody (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const sphere = new this.Ammo.btSphereShape(size.width / 2.0);
    this.addRigidBody(sphere, mesh, mass, friction);
  }

  // Not tested:
  addCapsuleBody (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const capsule = new this.Ammo.btCapsuleShape(size.height / 2.0);
    this.addRigidBody(capsule, mesh, mass, friction);
  }

  // Not tested:
  addCylinderBody (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const cylinder = new this.Ammo.btCylinderShape(size.height / 2.0);
    this.addRigidBody(cylinder, mesh, mass, friction);
  }

  // Not tested:
  addConeBody (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const cone = new this.Ammo.btConeShape(size.height / 2.0);
    this.addRigidBody(cone, mesh, mass, friction);
  }

  addRigidBody (body, mesh, mass, friction) {
    mesh.userData.physicsBody = this.initRigidBody(body, mesh.position, mass, friction);
    mesh.quaternion.copy(ZERO_QUATERNION);
    mesh.position.copy(mesh.position);
    this.rigidBodies.push(mesh);
  }

  initRigidBody (shape, position, mass, friction) {
    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new this.Ammo.btQuaternion(ZERO_QUATERNION.x, ZERO_QUATERNION.y, ZERO_QUATERNION.z, ZERO_QUATERNION.w));

    const defaultInertia = new this.Ammo.btVector3(0.0, 0.0, 0.0);
    const motion = new this.Ammo.btDefaultMotionState(transform);
    shape.calculateLocalInertia(mass, defaultInertia);

    const body = new this.Ammo.btRigidBody(new this.Ammo.btRigidBodyConstructionInfo(mass, motion, shape, defaultInertia));
    body.setActivationState(DISABLE_DEACTIVATION);
    body.setFriction(friction);

    this.world.addRigidBody(body);
    return body;
  }
  /* eslint-enable new-cap */

  update () {
    this.updateBullets();
    this.updateRigidBodies();

    const delta = this.clock.getDelta();
    this.world.stepSimulation(delta, 10);
  }

  updateBullets () {
    for (let i = 0; i < this.bullets.length; i++) {
      const rayVector = new Vector3();

      rayVector.copy(this.bulletRay).applyMatrix4(this.bullets[i].matrixWorld);
      this.castPhysicsRay(this.bullets[i].position, rayVector);
    }
  }

  updateRigidBodies () {
    for (let i = 0; i < this.rigidBodies.length; i++) {
      const body = this.rigidBodies[i].userData.physicsBody;
      const motion = body.getMotionState();

      if (motion) {
        motion.getWorldTransform(this.transform);

        const origin = this.transform.getOrigin();
        const rotation = this.transform.getRotation();

        this.rigidBodies[i].position.set(origin.x(), origin.y(), origin.z());
        this.rigidBodies[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }
  }
}
