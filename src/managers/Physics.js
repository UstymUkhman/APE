import { Quaternion } from 'three/src/math/Quaternion';
import { Vector3 } from 'three/src/math/Vector3';
import Ammo from 'ammo.js';

const GRAVITY = -9.81;
const DISABLE_DEACTIVATION = 4.0;

const ZERO_VECTOR3 = new Vector3(0.0, 0.0, 0.0);
const ZERO_QUATERNION = new Quaternion(0.0, 0.0, 0.0, 1.0);

export default class Physics {
  constructor () {
    Ammo().then((Ammo) => this.init(Ammo));
  }

  init (Ammo) {
    this.transformAUX = new Ammo.btTransform();
    this.rigidBodies = [];

    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

    this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    this.world.setGravity(new Ammo.btVector3(0.0, GRAVITY, 0.0));

    // Ray Collision:
    // this.rays = [];

    // this.intersectionPoint = null;
    // this.intersectionNormal = null;

    // this.tempVRayDest = new Ammo.btVector3();
    // this.tempVRayOrigin = new Ammo.btVector3();

    // this.closestRayResultCallback = new Ammo.ClosestRayResultCallback(this.tempVRayOrigin, this.tempVRayDest);
  }

  initGround (ground) {
    this.addBoxBody(ground, 0.0, 2.5);
    this.rigidBodies = this.rigidBodies.slice(0, -1);
  }

  addBoxBody (mesh, mass, friction = 1.0, margin = 0.04) {
    const box = new Ammo.btBoxShape(new Ammo.btVector3(
      mesh.scale.x, mesh.scale.y, mesh.scale.z
    ));

    if (margin !== 0.04) box.setMargin(margin);
    this.addRigidBody(box, mesh, mass, friction);
  }

  addSphereBody (mesh, mass, friction = 1.0) {
    const sphere = new Ammo.btSphereShape(size);
    this.addRigidBody(sphere, mesh, mass, friction);
  }

  // Not tested:
  addCapsuleBody (mesh, mass, friction = 1.0) {
    const capsule = new Ammo.btCapsuleShape(size);
    this.addRigidBody(capsule, mesh, mass, friction);
  }

  // Not tested:
  addCylinderBody (mesh, mass, friction = 1.0) {
    const cylinder = new Ammo.btCylinderShape(size);
    this.addRigidBody(cylinder, mesh, mass, friction);
  }

  // Not tested:
  addConeBody (mesh, mass, friction = 1.0) {
    const cone = new Ammo.btConeShape(size);
    this.addRigidBody(cone, mesh, mass, friction);
  }

  addRigidBody (body, mesh, mass, friction) {
    mesh.userData.physicsBody = this.initRigidBody(body, mesh.position, mass, friction);
    mesh.quaternion.copy(ZERO_QUATERNION);
    mesh.position.copy(mesh.position);
    this.rigidBodies.push(mesh);
  }

  initRigidBody (shape, position, mass, friction) {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(ZERO_QUATERNION.x, ZERO_QUATERNION.y, ZERO_QUATERNION.z, ZERO_QUATERNION.w));

    const defaultInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
    const motion = new Ammo.btDefaultMotionState(transform);
    shape.calculateLocalInertia(mass, defaultInertia);

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, defaultInertia));
    body.setActivationState(DISABLE_DEACTIVATION);
    body.setFriction(friction);

    this.world.addRigidBody(body);
    return body;
  }
}
