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

  _createHeightField (props) {
    const width = props.size.widthSegments + 1;
    const depth = props.size.widthSegments + 1;
    // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
    const heightScale = 1;

    // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
    const upAxis = 1;

    // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
    const hdt = 'PHY_FLOAT';

    // Set this to your needs (inverts the triangles)
    const flipQuadEdges = false;

    // Creates height data buffer in Ammo heap
    const ammoHeightData = Ammo._malloc(4.0 * width * depth);

    // Copy the javascript height data array to the Ammo one.
    for (let i = 0, p1 = 0, p2 = 0; i < depth; i++) {
      for (let j = 0; j < width; j++, p1++, p2 += 4) {
        // Write 32-bit float data to memory
        Ammo.HEAPF32[ammoHeightData + p2 >> 2] = props.data[p1];
      }
    }

    // Creates the heightfield physics shape

    /* eslint-disable new-cap */
    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
      width,
      depth,

      ammoHeightData,

      heightScale,
      props.minHeight,
      props.maxHeight,

      upAxis,
      hdt,
      flipQuadEdges
    );

    // Set horizontal scale
    const scaleX = 100 / (width - 1); // terrainWidthExtents
    const scaleZ = 100 / (depth - 1); // terrainDepthExtents

    heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ));
    /* eslint-enable new-cap */

    return heightFieldShape;
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
