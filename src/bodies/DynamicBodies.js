import { Vector3 } from 'three/src/math/Vector3';
import { ZERO_MASS } from '@/constants';
import RigidBody from './RigidBody';

export default class DynamicBodies extends RigidBody {
  constructor (world) {
    super(world, 'dynamic');
    this.linearVelocity = new Vector3();
    this.angularVelocity = new Vector3();
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
    const faces = mesh.geometry.faces;
    const triangles = [];

    for (let f = 0, length = faces.length; f < length; f++) {
      const face = faces[f];

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
    }

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
    this.world.addRigidBody(body);

    this.bodies.push({
      type: 'dynamic',
      uuid: mesh.uuid,
      collisions: [],
      mesh: mesh,
      body: body
    });
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
      }
    }
  }

  activateAll () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const collider = this.bodies[b];

      this.world.removeRigidBody(collider.body);
      this.world.addRigidBody(collider.body);
      collider.body.activate();
    }
  }

  getAngularVelocity (mesh) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    const angularVelocity = body.getAngularVelocity();

    return this.angularVelocity.set(
      angularVelocity.x(),
      angularVelocity.y(),
      angularVelocity.z()
    );
  }

  getLinearVelocity (mesh) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    const linearVelocity = body.getLinearVelocity();

    return this.linearVelocity.set(
      linearVelocity.x(),
      linearVelocity.y(),
      linearVelocity.z()
    );
  }

  getGravity (mesh) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    return body.getGravity().length();
  }
}
