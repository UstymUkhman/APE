import { ZERO_MASS, CCD_MOTION_THRESHOLD } from '@/constants';
import { Vector3 } from 'three/src/math/Vector3';
import RigidBody from './RigidBody';
import { Ammo } from '@/utils';

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

  /* eslint-disable new-cap */
  setLinearFactor (mesh, factor = this.linearFactor) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setLinearFactor(new Ammo.btVector3(factor.x, factor.y, factor.z));
    body.activate();
  }

  setAngularFactor (mesh, factor = this.angularFactor) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setAngularFactor(new Ammo.btVector3(factor.x, factor.y, factor.z));
    body.activate();
  }

  setLinearVelocity (mesh, velocity = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setLinearVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z));
    body.activate();
  }

  setAngularVelocity (mesh, velocity = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setAngularVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z));
    body.activate();
  }

  applyTorque (mesh, torque = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.applyTorque(new Ammo.btVector3(torque.x, torque.y, torque.z));
    body.activate();
  }

  applyForce (mesh, force = new Vector3(), offset = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;

    body.applyForce(
      new Ammo.btVector3(force.x, force.y, force.z),
      new Ammo.btVector3(offset.x, offset.y, offset.z)
    );

    body.activate();
  }

  applyCentralForce (mesh, force = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.applyCentralForce(new Ammo.btVector3(force.x, force.y, force.z));
    body.activate();
  }

  applyImpulse (mesh, impulse = new Vector3(), offset = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;

    body.applyImpulse(
      new Ammo.btVector3(impulse.x, impulse.y, impulse.z),
      new Ammo.btVector3(offset.x, offset.y, offset.z)
    );

    body.activate();
  }

  applyCentralImpulse (mesh, impulse = new Vector3()) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.applyCentralImpulse(new Ammo.btVector3(impulse.x, impulse.y, impulse.z));
    body.activate();
  }
  /* eslint-enable new-cap */

  setCcdSweptSphereRadius (mesh, radius = 0.5) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setCcdSweptSphereRadius(radius);
    body.activate();
  }

  setCcdMotionThreshold (mesh, threshold = CCD_MOTION_THRESHOLD) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setCcdMotionThreshold(threshold);
    body.activate();
  }

  setRestitution (mesh, restitution = this.restitution) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setRestitution(restitution);
    body.activate();
  }

  setFriction (mesh, friction = this.friction) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setFriction(friction);
    body.activate();
  }

  setDamping (mesh, linear = this.linearDamping, angular = this.angularDamping) {
    const body = this.getBodyByUUID(mesh.uuid).body;
    body.setDamping(linear, angular);
    body.activate();
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
