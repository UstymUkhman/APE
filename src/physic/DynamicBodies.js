// https://github.com/playcanvas/engine/blob/18bdc36d108031beca3fbfab948feb911eea2159/src/framework/components/rigid-body/component.js#L135
// https://en.blender.org/uploads/9/95/Dev-Physics-bullet-documentation.pdf
// https://github.com/lo-th/Ammo.lab/blob/gh-pages/src/ammo/rigidBody.js

import RigidBody from 'physic/RigidBody';

export default class DynamicBodies extends RigidBody {
  constructor (physicWorld) {
    super(physicWorld);
  }

  addBox (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size, friction, margin);
    this.addDynamicBody(box, mesh, mass, friction);
  }

  addCylinder (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size, friction, margin);
    this.addDynamicBody(cylinder, mesh, mass, friction);
  }

  addCapsule (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size, friction, margin);
    this.addDynamicBody(capsule, mesh, mass, friction);
  }

  addCone (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size, friction, margin);
    this.addDynamicBody(cone, mesh, mass, friction);
  }

  addSphere (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size, friction, margin);
    this.addDynamicBody(sphere, mesh, mass, friction);
  }

  addDynamicBody (shape, mesh, mass, friction) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, mass, friction, position, quaternion);

    // mesh.quaternion.copy(quaternion);
    // mesh.position.copy(position);

    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }

  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].userData.physicsBody;
      body.getMotionState().getWorldTransform(transform);

      const origin = transform.getOrigin();
      const rotation = transform.getRotation();

      this.bodies[i].position.set(origin.x(), origin.y(), origin.z());
      this.bodies[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
  }
}
