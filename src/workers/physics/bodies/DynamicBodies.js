import RigidBody from './RigidBody';
import { ZERO_MASS } from 'physics/constants';

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
    const triangles = [];

    props.geometry.faces.forEach((face) => {
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

  activateAll () {
    this.bodies.forEach((collider) => {
      this.world.removeRigidBody(collider.body);
      this.world.addRigidBody(collider.body);
      collider.body.activate();
    });
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
