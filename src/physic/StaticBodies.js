import { ZERO_MASS } from 'physic/constants';
import RigidBody from 'physic/RigidBody';
import { Ammo } from 'core/Ammo';

export default class StaticBodies extends RigidBody {
  constructor (physicWorld) {
    super(physicWorld);
  }

  /* eslint-disable new-cap */
  addPlane (mesh, friction = 2.5) {
    // Convert X-axis rotation from
    // THREE.js to Z-axis rotation in Ammo.js:
    const z = mesh.rotation.x / -Math.PI * 2.0;
    const rotation = new Ammo.btVector3(0.0, 0.0, z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);

    this.addStaticBody(plane, mesh, friction);
  }
  /* eslint-enable new-cap */

  addBox (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size, friction, margin);
    this.addStaticBody(box, mesh, friction);
  }

  addCylinder (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size, friction, margin);
    this.addStaticBody(cylinder, mesh, friction);
  }

  addCapsule (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size, friction, margin);
    this.addStaticBody(capsule, mesh, friction);
  }

  addCone (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size, friction, margin);
    this.addStaticBody(cone, mesh, friction);
  }

  addSphere (mesh, mass, friction = 1.0, margin = 0.04) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size, friction, margin);
    this.addStaticBody(sphere, mesh, friction);
  }

  addStaticBody (shape, mesh, friction) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, ZERO_MASS, friction, position, quaternion);

    // mesh.quaternion.copy(quaternion);
    // mesh.position.copy(position);

    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }
}
