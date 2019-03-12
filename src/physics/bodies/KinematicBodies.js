import RigidBody from 'physics/bodies/RigidBody';

export default class KinematicBodies extends RigidBody {
  constructor (worker) {
    super('kinematic', worker);

    this.bodies = [];
    this.worker = worker;
    worker.postMessage({action: 'initKinematicBodies'});
  }

  addBox (mesh) {
    super.addBody('Box', mesh);
    this.bodies.push(mesh);
  }

  addCylinder (mesh) {
    super.addBody('Cylinder', mesh);
    this.bodies.push(mesh);
  }

  addCapsule (mesh) {
    super.addBody('Capsule', mesh);
    this.bodies.push(mesh);
  }

  addCone (mesh) {
    super.addBody('Cone', mesh);
    this.bodies.push(mesh);
  }

  addSphere (mesh) {
    super.addBody('Sphere', mesh);
    this.bodies.push(mesh);
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

  remove (mesh) {
    const body = this.bodies.indexOf(mesh);

    if (body !== -1) {
      this.bodies.splice(body, 1);

      this.worker.postMessage({
        action: 'removeBody',

        params: {
          type: 'kinematic',
          uuid: mesh.uuid
        }
      });
    }
  }
}
