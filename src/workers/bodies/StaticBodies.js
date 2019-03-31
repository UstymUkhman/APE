import { ZERO_MASS, DISABLE_DEACTIVATION } from 'physics/constants';
import RigidBody from 'workers/bodies/RigidBody';
import { Ammo } from 'core/Ammo';

export default class StaticBodies extends RigidBody {
  constructor (world) {
    super(world);
  }

  addPlane (props) {
    /* eslint-disable new-cap */
    const rotation = new Ammo.btVector3(0.0, 0.0, props.z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);
    /* eslint-enable new-cap */

    this._checkBodyMargin(plane);
    this._addStaticBody(props.uuid, plane, props.position, props.rotation);
  }

  addHeightField (props) {
    const position = props.position;
    const field = this._createHeightField(props);
    position.y = (props.maxHeight + props.minHeight) / 2.0;

    this._checkBodyMargin(field);
    this._addStaticBody(props.uuid, field, position, props.rotation);
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

  _createHeightField (props) {
    const width = props.size.widthSegments + 1;
    const depth = props.size.widthSegments + 1;
    const data = Ammo._malloc(4.0 * width * depth);

    for (let i = 0, p1 = 0, p2 = 0; i < depth; i++) {
      for (let j = 0; j < width; j++, p1++, p2 += 4) {
        Ammo.HEAPF32[data + p2 >> 2] = props.data[p1];
      }
    }

    /* eslint-disable new-cap */
    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
      width, depth, data, 1.0, props.minHeight, props.maxHeight, 1.0, 'PHY_FLOAT', false
    );

    heightFieldShape.setLocalScaling(
      new Ammo.btVector3(
        props.size.width / (width - 1),
        1.0,
        props.size.height / (depth - 1)
      )
    );

    return heightFieldShape;
    /* eslint-enable new-cap */
  }

  _addStaticBody (uuid, shape, position, quaternion) {
    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    this.bodies.push({uuid: uuid, body: body, colliding: false});
    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body);
  }

  getCollisionStatus (body) {
    const collider = this.getBodyByCollider(body);

    if (collider) {
      const status = super.getCollisionStatus(collider.colliding);
      collider.colliding = true;

      return {
        collisionFunction: status,
        uuid: collider.uuid,
        type: 'static'
      };
    }

    return null;
  }
}
