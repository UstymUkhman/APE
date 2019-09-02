import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { CylinderGeometry } from 'three/src/geometries/CylinderGeometry';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

import { Vector3 } from 'three/src/math/Vector3';
import { Mesh } from 'three/src/objects/Mesh';

import Playground from 'demos/Playground';
// import PhysicsWorld from 'worker/PhysicsWorld';
import PhysicsWorld from 'PhysicsWorld';
import RAF from 'demos/RAF';

export default class RigidBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createDynamicBodies();
    this.createKinematicBodies();
    this.createPhysicsRayCaster();

    this._update = this.update.bind(this);
    RAF.add(this._update);
  }

  initPhysics () {
    this.physics = new PhysicsWorld();
    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);
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

    this.physics.dynamic.addBox(dynamicBox, 10);
    this.scene.add(dynamicBox);

    // setTimeout(() => {
    //   console.log('Dynamic disable');
    //   this.physics.dynamic.disable(dynamicBox);
    // }, 3000);

    // setTimeout(() => {
    //   console.log('Dynamic enable');
    //   this.physics.dynamic.enable(dynamicBox);
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

    this.physics.kinematic.addBox(this.kinematicBox);
    this.scene.add(this.kinematicBox);

    // this._onKeyDown = this.onKeyDown.bind(this);
    // document.addEventListener('keydown', this._onKeyDown);

    // setTimeout(() => {
    //   console.log('Kinematic disable');
    //   this.physics.kinematic.disable(this.kinematicBox);
    // }, 3000);

    // setTimeout(() => {
    //   console.log('Kinematic enable');
    //   this.physics.kinematic.enable(this.kinematicBox);
    // }, 10000);

    // setTimeout(() => {
    //   console.log('Static disable');
    //   this.physics.static.disable(this.ground);
    // }, 5000);
  }

  createPhysicsRayCaster () {
    this.fly = new Mesh(
      new SphereGeometry(1, 20, 20),
      new MeshPhongMaterial({ color: 0x222222 })
    );

    this.fly.receiveShadow = true;
    this.fly.castShadow = true;

    this.fly.rotation.x = Math.PI;
    // this.fly.rotation.y = 0.35;
    this.fly.position.z = -10;
    this.fly.position.y = 5;

    this.scene.add(this.fly);

    this.ray = new THREE.Vector3(0, 0, -6);
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
    const hit = this.physics.ray.cast(this.fly.position, this.rayTarget);

    this.physics.update();
    // console.log(hit);
  }
}
