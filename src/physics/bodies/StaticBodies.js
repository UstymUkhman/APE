import RigidBody from 'physics/bodies/RigidBody';

export default class StaticBodies extends RigidBody {
  constructor (worker) {
    super('static', worker);
    worker.postMessage({action: 'initStaticBodies'});
  }

  addPlane (mesh) {
    super.addBody('Plane', mesh, {
      // Convert X-axis rotation to
      // Z-axis rotation in Ammo.js:
      z: mesh.rotation.x / -Math.PI * 2.0
    });
  }

  addBox (mesh) {
    super.addBody('Box', mesh);
  }

  addCylinder (mesh) {
    super.addBody('Cylinder', mesh);
  }

  addCapsule (mesh) {
    super.addBody('Capsule', mesh);
  }

  addCone (mesh) {
    super.addBody('Cone', mesh);
  }

  addSphere (mesh) {
    super.addBody('Sphere', mesh);
  }
}
