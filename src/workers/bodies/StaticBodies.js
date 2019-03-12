import { ZERO_MASS, DISABLE_DEACTIVATION } from 'physics/constants';
import RigidBody from 'workers/bodies/RigidBody';
import { Ammo } from 'core/Ammo';
import find from 'lodash/find';

export default class StaticBodies extends RigidBody {
  constructor (world) {
    super();
    this.bodies = [];
    this.world = world;
  }

  addPlane (props) {
    /* eslint-disable new-cap */
    const rotation = new Ammo.btVector3(0.0, 0.0, props.z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);
    /* eslint-enable new-cap */

    this._checkBodyMargin(plane);
    this._addStaticBody(props.uuid, plane, props.position, props.rotation);
  }

  addBox (props) {
    const box = this.createBox(props.size);
    this._addStaticBody(props.uuid, box, props.position, props.rotation);
  }

  addCylinder (props) {
    const cylinder = this.createCylinder(props.size);
    this._addStaticBody(props.uuid, cylinder, props.position, props.rotation);
  }

  addCapsule (props) {
    const capsule = this.createCapsule(props.size);
    this._addStaticBody(props.uuid, capsule, props.position, props.rotation);
  }

  addCone (props) {
    const cone = this.createCone(props.size);
    this._addStaticBody(props.uuid, cone, props.position, props.rotation);
  }

  addSphere (props) {
    const sphere = this.createSphere(props.size);
    this._addStaticBody(props.uuid, sphere, props.position, props.rotation);
  }

  _addStaticBody (uuid, shape, position, quaternion) {
    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    body.setActivationState(DISABLE_DEACTIVATION);
    this.bodies.push({uuid: uuid, body: body});
    this.world.addRigidBody(body);
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
