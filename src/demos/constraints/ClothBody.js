import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

import { DoubleSide } from 'three/src/constants';
import { Vector3 } from 'three/src/math/Vector3';
import { Mesh } from 'three/src/objects/Mesh';

import Playground from 'demos/Playground';
import PhysicsWorld from 'PhysicsWorld';
import RAF from 'demos/RAF';

export default class ClothBody extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createHinge();
    this.createCloth();

    this._update = this.update.bind(this);
    RAF.add(this._update);
  }

  initPhysics () {
    this.physics = new PhysicsWorld(true);
    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);
  }

  createHinge () {
    const material = new MeshPhongMaterial({ color: 0x606060 });
    const position = new Vector3(-3, 0.1, -5.5);
    const ropePosition = new Vector3(-3, 2, 0);

    const pylonHeight = 10;
    const armLength = 5.5;

    const base = this.createMesh(1, 0.2, 1, 0, position, material);
    position.set(ropePosition.x, 0.5 * pylonHeight, ropePosition.z - armLength);

    base.receiveShadow = true;
    base.castShadow = true;

    const pylon = this.createMesh(0.5, pylonHeight, 0.5, 0, position, material);
    position.set(ropePosition.x, pylonHeight, ropePosition.z - 0.5 * armLength);

    pylon.receiveShadow = true;
    pylon.castShadow = true;

    this.arm = this.createMesh(0.5, 0.5, armLength + 0.5, 2.0, position, material);

    this.arm.receiveShadow = true;
    this.arm.castShadow = true;

    const armPivot = {x: 0.0, y: -0.2, z: -armLength * 0.5};
    const pinPivot = {x: 0.0, y: pylonHeight * 0.5, z: 0.0};
    const axis = {x: 0, y: 1, z: 0};

    const hingeIndex = this.physics.hinge.addBodies(
      pylon, this.arm, axis,
      pinPivot, armPivot
    );

    window.addEventListener('keydown', event => {
      switch (event.keyCode) {
        case 81:
          this.physics.hinge.update(hingeIndex, 1);
          break;

        case 65:
          this.physics.hinge.update(hingeIndex, -1);
          break;
      }
    }, false);

    window.addEventListener('keyup', () => {
      this.physics.hinge.update(hingeIndex, 0);
    }, false);
  }

  createMesh (sx, sy, sz, mass, pos, material) {
    const mesh = new Mesh(new BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    mesh.position.set(pos.x, pos.y, pos.z);

    if (mass) {
      this.physics.dynamic.addBox(mesh, mass);
    } else {
      this.physics.static.addBox(mesh);
    }

    this.scene.add(mesh);
    return mesh;
  }

  createCloth () {
    const geometry = new PlaneBufferGeometry(5, 5, 25, 25);
    const position = new Vector3(-3, 5, 0);

    // Appended to hinge:
    geometry.rotateY(Math.PI / 2.0);
    geometry.translate(position.x, position.y + 2.5, position.z - 2.5);

    const cloth = new Mesh(
      geometry,
      new MeshPhongMaterial({
        side: DoubleSide,
        color: 0x222222
      })
    );

    // Appended to hinge:
    this.physics.cloth.addBody(cloth, 1, position);
    this.physics.cloth.append(cloth, 25, this.arm);
    this.physics.cloth.append(cloth, 0, this.arm);

    cloth.receiveShadow = true;
    cloth.castShadow = true;
    this.scene.add(cloth);

    // Rotated:
    // this.physics.cloth.addBody(cloth, 1);

    // const obj = new Object3D();
    // obj.rotation.y = Math.PI / 2;

    // obj.add(cloth);
    // this.scene.add(obj);
  }

  update () {
    this.physics.update();
  }
}
