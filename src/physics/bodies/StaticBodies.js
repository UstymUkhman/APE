import RigidBody from 'physics/bodies/RigidBody';

export default class StaticBodies extends RigidBody {
  constructor (worker) {
    super('static', worker);
    this.worker.postMessage({action: 'initStaticBodies'});
  }

  addPlane (mesh) {
    super.addBody('Plane', mesh, {
      // Convert X-axis rotation to
      // Z-axis rotation in Ammo.js:
      z: mesh.rotation.x / -Math.PI * 2.0
    });
  }

  addHeightField (mesh, minHeight, maxHeight) {
    const vertices = mesh.geometry.attributes.position.array;
    const heightData = [];

    for (let i = 0, length = vertices.length / 3; i < length; i++) {
      heightData.push(vertices[i * 3 + 1]);
    }

    super.addBody('HeightField', mesh, {
      minHeight: minHeight,
      maxHeight: maxHeight,
      data: heightData
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

  remove (mesh) {
    const body = this.bodies.indexOf(mesh);

    if (body !== -1) {
      this.bodies.splice(body, 1);

      this.worker.postMessage({
        action: 'removeBody',

        params: {
          uuid: mesh.uuid,
          type: 'static'
        }
      });
    }
  }
}
