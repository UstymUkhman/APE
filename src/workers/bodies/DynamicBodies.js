import { ZERO_MASS } from '@/constants';
import RigidBody from './RigidBody';
import Ammo from 'utils/Ammo';

export default class DynamicBodies extends RigidBody {
  constructor (world) {
    super(world, 'dynamic');
  }

  addBox (props) {
    const box = this.createBox(props.size);
    this._addDynamicBody(props.uuid, box, props.position, props.rotation, props.mass);
  }

  addCylinder (props) {
    const cylinder = this.createCylinder(props.size);
    this._addDynamicBody(props.uuid, cylinder, props.position, props.rotation, props.mass);
  }

  addCapsule (props) {
    const capsule = this.createCapsule(props.size);
    this._addDynamicBody(props.uuid, capsule, props.position, props.rotation, props.mass);
  }

  addCone (props) {
    const cone = this.createCone(props.size);
    this._addDynamicBody(props.uuid, cone, props.position, props.rotation, props.mass);
  }

  addConcave (props) {
    const vertices = props.geometry.vertices;
    const faces = props.geometry.faces;
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
    this._addDynamicBody(props.uuid, concave, props.position, props.rotation, props.mass);
  }

  addConvex (props) {
    const convex = this.createConvex(props.geometry.attributes.position.array);
    this._addDynamicBody(props.uuid, convex, props.position, props.rotation, props.mass);
  }

  addSphere (props) {
    const sphere = this.createSphere(props.size.radius);
    this._addDynamicBody(props.uuid, sphere, props.position, props.rotation, props.mass);
  }

  _addDynamicBody (uuid, shape, position, quaternion, mass = ZERO_MASS) {
    const body = this.createRigidBody(shape, mass, position, quaternion);
    this.bodies.push({uuid: uuid, body: body, collisions: []});
    this.world.addRigidBody(body);
  }

  /* eslint-disable new-cap */
  setLinearFactor (uuid, factor) {
    const body = this.getBodyByUUID(uuid).body;
    body.setLinearFactor(new Ammo.btVector3(factor.x, factor.y, factor.z));
  }

  setAngularFactor (uuid, factor) {
    const body = this.getBodyByUUID(uuid).body;
    body.setAngularFactor(new Ammo.btVector3(factor.x, factor.y, factor.z));
  }

  setLinearVelocity (uuid, velocity) {
    const body = this.getBodyByUUID(uuid).body;
    body.setLinearVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z));
    body.activate();
  }

  setAngularVelocity (uuid, velocity) {
    const body = this.getBodyByUUID(uuid).body;
    body.setAngularVelocity(new Ammo.btVector3(velocity.x, velocity.y, velocity.z));
    body.activate();
  }
  /* eslint-enable new-cap */

  activateAll () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const collider = this.bodies[b];

      this.world.removeRigidBody(collider.body);
      this.world.addRigidBody(collider.body);
      collider.body.activate();
    }
  }

  update (transform) {
    const update = [];

    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].body;
      const motionState = body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(transform);

        const origin = transform.getOrigin();
        const rotation = transform.getRotation();

        const linearVelocity = body.getLinearVelocity();
        const angularVelocity = body.getAngularVelocity();

        update.push({
          angularVelocity: { x: angularVelocity.x(), y: angularVelocity.y(), z: angularVelocity.z() },
          linearVelocity: { x: linearVelocity.x(), y: linearVelocity.y(), z: linearVelocity.z() },
          quaternion: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() },
          position: { x: origin.x(), y: origin.y(), z: origin.z() },
          uuid: this.bodies[i].uuid
        });
      }
    }

    self.postMessage({
      action: 'updateBodies',
      type: 'dynamic',
      bodies: update
    });
  }
}
