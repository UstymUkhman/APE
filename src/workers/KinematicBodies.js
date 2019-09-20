import RigidBodies from '@/workers/RigidBodies';

export default class KinematicBodies extends RigidBodies {
  constructor (worker) {
    super('Kinematic', worker);
    this.worker.postMessage({action: 'initKinematicBodies'});
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

  update () {
    const bodies = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const mesh = this.bodies[i];

      bodies.push({
        rotation: mesh.quaternion.clone(),
        position: mesh.position.clone(),
        uuid: mesh.uuid
      });
    }

    return bodies;
  }
}
