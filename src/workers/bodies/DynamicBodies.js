import RigidBody from 'workers/bodies/RigidBody';
import { ZERO_MASS } from 'physics/constants';
import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

export default class DynamicBodies extends RigidBody {
  constructor (world) {
    super();
    this.bodies = [];
    this.world = world;
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
    const triangles = [];

    for (let i = 0; i < props.geometry.faces.length; i++) {
      const face = props.geometry.faces[i];

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

  addSphere (props) {
    const sphere = this.createSphere(props.size.radius);
    this._addDynamicBody(props.uuid, sphere, props.position, props.rotation, props.mass);
  }

  _addDynamicBody (uuid, shape, position, quaternion, mass = ZERO_MASS) {
    const body = this.createRigidBody(shape, mass, position, quaternion);
    this.bodies.push({uuid: uuid, body: body});
    this.world.addRigidBody(body);
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

        // const linearVelocity = body.getLinearVelocity();
        // const angularVelocity = body.getAngularVelocity();

        update.push({
          // angularVelocity: { x: angularVelocity.x(), y: angularVelocity.y(), z: angularVelocity.z() },
          // linearVelocity: { x: linearVelocity.x(), y: linearVelocity.y(), z: linearVelocity.z() },
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

  remove (props) {
    const mesh = find(this.bodies, { uuid: props.uuid });
    const index = this.bodies.indexOf(mesh);

    if (mesh === -1) return false;

    this.world.removeRigidBody(mesh.body);
    Ammo.destroy(mesh.body);

    this.bodies.splice(index, 1);
    return true;
  }
}
