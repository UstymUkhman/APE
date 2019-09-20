import RigidBodies from '@/bodies/RigidBodies';
import { ZERO_MASS } from '@/constants';
import { Ammo } from '@/utils';

export default class StaticBodies extends RigidBodies {
  constructor (world) {
    super(world, 'Static');
  }

  addPlane (mesh) {
    /* eslint-disable new-cap */
    const z = mesh.rotation.x / -Math.PI * 2.0;
    const rotation = new Ammo.btVector3(0.0, 0.0, z);
    const plane = new Ammo.btStaticPlaneShape(rotation, 0.0);
    /* eslint-enable new-cap */

    this._checkBodyMargin(plane);
    this._addStaticBody(mesh, plane);
  }

  addHeightField (mesh, minHeight, maxHeight) {
    const position = mesh.position.clone();
    const field = this._createHeightField(mesh, minHeight, maxHeight);
    position.y = (maxHeight + minHeight) / 2.0;

    this._checkBodyMargin(field);
    this._addStaticBody(mesh, field, position);
  }

  addBox (mesh) {
    const size = mesh.geometry.parameters;
    const box = this.createBox(size);
    this._addStaticBody(mesh, box);
  }

  addCylinder (mesh) {
    const size = mesh.geometry.parameters;
    const cylinder = this.createCylinder(size);
    this._addStaticBody(mesh, cylinder);
  }

  addCapsule (mesh) {
    const size = mesh.geometry.parameters;
    const capsule = this.createCapsule(size);
    this._addStaticBody(mesh, capsule);
  }

  addCone (mesh) {
    const size = mesh.geometry.parameters;
    const cone = this.createCone(size);
    this._addStaticBody(mesh, cone);
  }

  addSphere (mesh) {
    const size = mesh.geometry.parameters;
    const sphere = this.createSphere(size);
    this._addStaticBody(mesh, sphere);
  }

  _createHeightField (mesh, minHeight, maxHeight) {
    const vertices = mesh.geometry.attributes.position.array;
    const width = mesh.geometry.parameters.widthSegments + 1;
    const depth = mesh.geometry.parameters.widthSegments + 1;

    const data = Ammo._malloc(4.0 * width * depth);
    const heightData = [];

    for (let i = 0, length = vertices.length / 3; i < length; i++) {
      heightData.push(vertices[i * 3 + 1]);
    }

    for (let i = 0, p1 = 0, p2 = 0; i < depth; i++) {
      for (let j = 0; j < width; j++, p1++, p2 += 4) {
        Ammo.HEAPF32[data + p2 >> 2] = heightData[p1];
      }
    }

    /* eslint-disable new-cap */
    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
      width, depth, data, 1.0, minHeight, maxHeight, 1.0, 'PHY_FLOAT', false
    );

    heightFieldShape.setLocalScaling(
      new Ammo.btVector3(
        mesh.geometry.parameters.width / (width - 1),
        1.0,
        mesh.geometry.parameters.height / (depth - 1)
      )
    );

    return heightFieldShape;
    /* eslint-enable new-cap */
  }

  _addStaticBody (mesh, shape, customPosition = null) {
    const position = customPosition || mesh.position.clone();
    const quaternion = mesh.quaternion.clone();

    const body = this.createRigidBody(shape, ZERO_MASS, position, quaternion);
    this.world.addRigidBody(body, this.group, this.mask);

    this.bodies.push({
      uuid: mesh.uuid,
      collisions: [],
      type: 'Static',
      mesh: mesh,
      body: body
    });
  }
}
