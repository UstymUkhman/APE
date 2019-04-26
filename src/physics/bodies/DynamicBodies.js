import RigidBody from './RigidBody';
import { ZERO_MASS } from 'physics/constants';

export default class DynamicBodies extends RigidBody {
  constructor (world) {
    super(world, 'dynamic');
  }

  addBox (mesh, mass) {
    const size = mesh.geometry.parameters;
    const box = this.createBox(size);
    this._addDynamicBody(mesh, box, mass);
  }

  addCylinder (mesh, mass) {
    const size = mesh.geometry.parameters;
    const cylinder = this.createCylinder(size);
    this._addDynamicBody(mesh, cylinder, mass);
  }

  addCapsule (mesh, mass) {
    const size = mesh.geometry.parameters;
    const capsule = this.createCapsule(size);
    this._addDynamicBody(mesh, capsule, mass);
  }

  addCone (mesh, mass) {
    const size = mesh.geometry.parameters;
    const cone = this.createCone(size);
    this._addDynamicBody(mesh, cone, mass);
  }

  addConcave (mesh, mass) {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    const vertices = mesh.geometry.vertices;
    const triangles = [];

    mesh.geometry.faces.forEach((face) => {
      triangles.push([{
        x: vertices[face.a].x,
        y: vertices[face.a].y,
        z: vertices[face.a].z
      }, {
        x: vertices[face.b].x,
        y: vertices[face.b].y,
        z: vertices[face.b].z
      }, {
        x: vertices[face.c].x,
        y: vertices[face.c].y,
        z: vertices[face.c].z
      }]);
    });

    const concave = this.createConcave(triangles);
    this._addDynamicBody(mesh, concave, mass);
  }

  addConvex (mesh, mass) {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    const convex = this.createConvex(mesh.geometry.attributes.position.array);
    this._addDynamicBody(mesh, convex, mass);
  }

  addSphere (mesh, mass) {
    const radius = mesh.geometry.parameters.radius;
    const sphere = this.createSphere(radius);
    this._addDynamicBody(mesh, sphere, mass);
  }

  _addDynamicBody (mesh, shape, mass = ZERO_MASS) {
    const position = mesh.position.clone();
    const quaternion = mesh.quaternion.clone();

    const body = this.createRigidBody(shape, mass, position, quaternion);
    // this.bodies.push({uuid: uuid, body: body, collisions: []});
    this.bodies.push({uuid: mesh.uuid, mesh: mesh, body: body});
    this.world.addRigidBody(body);
  }

  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].body;
      const mesh = this.bodies[i].mesh;
      const motionState = body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(transform);

        const origin = transform.getOrigin();
        const rotation = transform.getRotation();

        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

        // const linearVelocity = body.getLinearVelocity();
        // const angularVelocity = body.getAngularVelocity();

        // { x: linearVelocity.x(), y: linearVelocity.y(), z: linearVelocity.z() }
        // { x: angularVelocity.x(), y: angularVelocity.y(), z: angularVelocity.z() }
      }
    }
  }

  activateAll () {
    this.bodies.forEach((collider) => {
      this.world.removeRigidBody(collider.body);
      this.world.addRigidBody(collider.body);
      collider.body.activate();
    });
  }
}
