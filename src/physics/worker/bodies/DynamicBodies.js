// Rigid bodies class manager

import RigidBody from './RigidBody';

export default class DynamicBodies extends RigidBody {
  constructor (worker) {
    super('dynamic', worker);
    this.worker.postMessage({action: 'initDynamicBodies'});
  }

  addBox (mesh, mass) {
    super.addBody('Box', mesh, { mass: mass });
  }

  addCylinder (mesh, mass) {
    super.addBody('Cylinder', mesh, { mass: mass });
  }

  addCapsule (mesh, mass) {
    super.addBody('Capsule', mesh, { mass: mass });
  }

  addCone (mesh, mass) {
    super.addBody('Cone', mesh, { mass: mass });
  }

  addConcave (mesh, mass) {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    super.addBody('Concave', mesh, {
      geometry: mesh.geometry,
      mass: mass
    });
  }

  addConvex (mesh, mass) {
    super.addBody('Convex', mesh, {
      geometry: mesh.geometry,
      mass: mass
    });
  }

  addSphere (mesh, mass) {
    super.addBody('Sphere', mesh, { mass: mass });
  }

  update (bodies) {
    for (let i = 0; i < bodies.length; i++) {
      // const body = this.getBody(bodies[i].uuid);
      const body = this.bodies[i];

      if (body && body.uuid === bodies[i].uuid) {
        const position = bodies[i].position;
        const quaternion = bodies[i].quaternion;

        body.position.set(position.x, position.y, position.z);
        body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      }

      // if (body) {
      //   body.position.set(position.x, position.y, position.z);
      //   body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      // }
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
