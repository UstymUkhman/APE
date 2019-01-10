import { ZERO_MASS } from 'physic/constants';
import RigidBody from 'physic/RigidBody';
import { Ammo } from 'core/Ammo';

export default class StaticBodies extends RigidBody {
  constructor (physicWorld) {
    super(physicWorld);
  }

  /* eslint-disable new-cap */
  addPlane (mesh) {
    // Convert X-axis rotation from
    // THREE.js to Z-axis rotation in Ammo.js:
    const z = mesh.rotation.x / -Math.PI * 2.0;
    const rotation = new Ammo.btVector3(0.0, 0.0, z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);

    this.checkBodyMargin(plane);
    this.addStaticBody(plane, mesh);
  }
  /* eslint-enable new-cap */

  addBox (mesh) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size);
    this.addStaticBody(box, mesh);
  }

  addCylinder (mesh) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size);
    this.addStaticBody(cylinder, mesh);
  }

  addCapsule (mesh) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size);
    this.addStaticBody(capsule, mesh);
  }

  addCone (mesh) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size);
    this.addStaticBody(cone, mesh);
  }

  addSphere (mesh) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size);
    this.addStaticBody(sphere, mesh);
  }

  addStaticBody (shape, mesh) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, ZERO_MASS, position, quaternion);

    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }
}
