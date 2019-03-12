// Rigid bodies class manager

import RigidBody from 'physics/bodies/RigidBody';
import find from 'lodash/find';

export default class DynamicBodies extends RigidBody {
  constructor (worker) {
    super('dynamic', worker);

    this.bodies = [];
    this.worker = worker;
    worker.postMessage({action: 'initDynamicBodies'});
  }

  addBox (mesh, mass) {
    super.addBody('Box', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  addCylinder (mesh, mass) {
    super.addBody('Cylinder', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  addCapsule (mesh, mass) {
    super.addBody('Capsule', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  addCone (mesh, mass) {
    super.addBody('Cone', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  addSphere (mesh, mass) {
    super.addBody('Sphere', mesh, { mass: mass });
    this.bodies.push(mesh);
  }

  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = find(this.bodies, { uuid: bodies[i].uuid });
      const quaternion = bodies[i].quaternion;
      const position = bodies[i].position;

      if (body) {
        body.position.set(position.x, position.y, position.z);
        body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      }
    }
  }

  remove (mesh) {
    const body = this.bodies.indexOf(mesh);

    if (body !== -1) {
      this.bodies.splice(body, 1);

      this.worker.postMessage({
        action: 'removeBody',

        params: {
          uuid: mesh.uuid,
          type: 'dynamic'
        }
      });
    }
  }
}
