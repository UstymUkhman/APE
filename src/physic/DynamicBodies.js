// https://github.com/playcanvas/engine/blob/18bdc36d108031beca3fbfab948feb911eea2159/src/framework/components/rigid-body/component.js#L135
// https://en.blender.org/uploads/9/95/Dev-Physics-bullet-documentation.pdf
// https://github.com/lo-th/Ammo.lab/blob/gh-pages/src/ammo/rigidBody.js

import { GRAVITY, DISABLE_DEACTIVATION } from './constants';
import { Ammo } from 'core/Ammo';

export default class bodies {
  constructor (physicWorld) {
    this.world = physicWorld;
    this.bodies = [];
  }

  /* eslint-disable new-cap */
  addPlane (mesh, mass = 0.0, friction = 2.5) {
    // Convert X-axis rotation from
    // THREE.js to Z-axis rotation in Ammo.js:
    const z = mesh.rotation.x / -Math.PI * 2.0;
    const rotation = new Ammo.btVector3(0.0, 0.0, z);

    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);
    this.addRigidBody(plane, mesh, mass, friction);
  }

  addBox (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const box = new Ammo.btBoxShape(new Ammo.btVector3(
      size.width / 2.0, size.height / 2.0, size.depth / 2.0
    ));

    if (margin !== 0.04) box.setMargin(margin);
    this.addRigidBody(box, mesh, mass, friction);
  }

  addCylinder (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const cylinder = new Ammo.btCylinderShape(size.width, size.height / 2.0, size.depth / 2.0);
    this.addRigidBody(cylinder, mesh, mass, friction);
  }

  addCapsule (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const capsule = new Ammo.btCapsuleShape(size.width, size.height / 2.0);
    this.addRigidBody(capsule, mesh, mass, friction);
  }

  addCone (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const cone = new Ammo.btConeShape(size.width, size.height / 2.0);
    this.addRigidBody(cone, mesh, mass, friction);
  }

  addSphere (mesh, mass, friction = 1.0) {
    const size = mesh.geometry.parameters;
    const sphere = new Ammo.btSphereShape(size.width / 2.0);
    this.addRigidBody(sphere, mesh, mass, friction);
  }

  addRigidBody (shape, mesh, mass, friction) {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
    transform.setRotation(new Ammo.btQuaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w));

    const defaultInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
    const motion = new Ammo.btDefaultMotionState(transform);
    shape.calculateLocalInertia(mass, defaultInertia);

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, defaultInertia));
    body.setActivationState(DISABLE_DEACTIVATION);
    body.setFriction(friction);

    // mesh.quaternion.copy(mesh.quaternion);
    // mesh.position.copy(mesh.position);
    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }
  /* eslint-enable new-cap */

  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].userData.physicsBody;
      const motion = body.getMotionState();

      if (motion) {
        motion.getWorldTransform(transform);

        const origin = transform.getOrigin();
        const rotation = transform.getRotation();

        this.bodies[i].position.set(origin.x(), origin.y(), origin.z());
        this.bodies[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }
  }
}
