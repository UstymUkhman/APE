import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { CylinderGeometry } from 'three/src/geometries/CylinderGeometry';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

import { DoubleSide } from 'three/src/constants';
import { Vector3 } from 'three/src/math/Vector3';
import { Mesh } from 'three/src/objects/Mesh';

import Playground from 'demos/Playground';
import APE from 'workers/APE';
// import RAF from 'demos/RAF';
// import APE from 'APE';

export default class RigidBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createDynamicBodies();
    this.createKinematicBodies();
    this.createRaycaster();

    this.createHinge();
    this.createCloth();

    // this._update = this.update.bind(this);
    // RAF.add(this._update);
  }

  initPhysics () {
    APE.init(true);
    APE.Static.friction = 5.0;
    APE.Static.addBox(this.ground);
  }

  createDynamicBodies () {
    const dynamicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    dynamicBox.castShadow = true;
    dynamicBox.position.y = 15;

    APE.Dynamic.addBox(dynamicBox, 10);
    this.scene.add(dynamicBox);

    // setTimeout(() => {
    //   console.log('Dynamic disable');
    //   APE.dynamic.disable(dynamicBox);
    // }, 3000);

    // setTimeout(() => {
    //   console.log('Dynamic enable');
    //   APE.dynamic.enable(dynamicBox);
    // }, 10000);
  }

  createKinematicBodies () {
    this.kinematicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    this.kinematicBox.castShadow = true;
    this.kinematicBox.position.x = 2.5;
    this.kinematicBox.position.y = 5;

    APE.Kinematic.addBox(this.kinematicBox);
    this.scene.add(this.kinematicBox);

    // this._onKeyDown = this.onKeyDown.bind(this);
    // document.addEventListener('keydown', this._onKeyDown);

    // setTimeout(() => {
    //   console.log('Kinematic disable');
    //   APE.Kinematic.disable(this.kinematicBox);
    // }, 3000);

    // setTimeout(() => {
    //   console.log('Kinematic enable');
    //   APE.Kinematic.enable(this.kinematicBox);
    // }, 10000);

    // setTimeout(() => {
    //   console.log('Static disable');
    //   APE.Static.disable(this.ground);
    // }, 5000);
  }

  createRaycaster () {
    this.fly = new Mesh(
      new SphereGeometry(1, 20, 20),
      new MeshPhongMaterial({ color: 0x222222 })
    );

    this.fly.receiveShadow = true;
    this.fly.castShadow = true;

    this.fly.rotation.x = Math.PI;
    this.fly.position.z = -10;
    this.fly.position.y = 5;

    this.scene.add(this.fly);

    this.ray = new Vector3(0, 0, -6);
    const length = this.ray.length();

    const geometry = new CylinderGeometry(0.2, 0.2, length, 8);

    geometry.translate(0, -0.5 * length, 0);
    geometry.rotateX(-Math.PI * 0.5);
    geometry.lookAt(this.ray);

    const cylinder = new Mesh(geometry,
      new MeshPhongMaterial({
        color: 0x00CC00
      })
    );

    this.rayTarget = new Vector3();
    cylinder.receiveShadow = true;
    cylinder.castShadow = true;
    this.fly.add(cylinder);

    this._onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this._onKeyDown);
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

    APE.Hinge.addBodies(
      pylon, this.arm, axis,
      pinPivot, armPivot
    );

    // window.addEventListener('keydown', event => {
    //   switch (event.keyCode) {
    //     case 81:
    //       APE.Hinge.update(hingeIndex, 1);
    //       break;

    //     case 65:
    //       APE.Hinge.update(hingeIndex, -1);
    //       break;
    //   }
    // }, false);

    // window.addEventListener('keyup', () => {
    //   APE.Hinge.update(hingeIndex, 0);
    // }, false);
  }

  createMesh (sx, sy, sz, mass, pos, material) {
    const mesh = new Mesh(new BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    mesh.position.set(pos.x, pos.y, pos.z);

    if (mass) {
      APE.Dynamic.addBox(mesh, mass);
    } else {
      APE.Static.addBox(mesh);
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
    APE.Cloth.addBody(cloth, 1, position);
    APE.Cloth.append(cloth, 25, this.arm);
    APE.Cloth.append(cloth, 0, this.arm);

    cloth.receiveShadow = true;
    cloth.castShadow = true;
    this.scene.add(cloth);

    // Rotated:
    // APE.Cloth.addBody(cloth, 1);

    // const obj = new Object3D();
    // obj.rotation.y = Math.PI / 2;

    // obj.add(cloth);
    // this.scene.add(obj);

    // setTimeout(() => {
    //   console.log('Cloth disable');
    //   APE.Cloth.disable(cloth);
    // }, 10000);

    // setTimeout(() => {
    //   console.log('Cloth enable');
    //   APE.Cloth.enable(cloth);
    // }, 18000);
  }

  onKeyDown (event) {
    const code = event.keyCode;

    switch (code) {
      case 87:
        // this.kinematicBox.position.y += 1;
        this.fly.position.z += 0.5;
        break;

      case 83:
        // this.kinematicBox.position.y -= 1;
        this.fly.position.z -= 0.5;
        break;

      case 65:
        // this.kinematicBox.position.x += 1;
        this.fly.position.x += 0.5;
        break;

      case 68:
        // this.kinematicBox.position.x -= 1;
        this.fly.position.x -= 0.5;
        break;
    }
  }

  update () {
    this.rayTarget.copy(this.ray).applyMatrix4(this.fly.matrixWorld);
    const hit = APE.Raycaster.cast(this.fly.position, this.rayTarget);

    APE.update();
    console.log(hit);
  }
}
