import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';

import Playground from 'demos/Playground';
// import PhysicsWorld from 'workers/PhysicsWorld';
import PhysicsWorld from 'PhysicsWorld';
import RAF from 'demos/RAF';

export default class RigidBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createDynamicBodies();
    this.createKinematicBodies();

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

    this._onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this._onKeyDown);

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

  onKeyDown (event) {
    const code = event.keyCode;

    switch (code) {
      case 87:
        this.kinematicBox.position.y += 1;
        break;

      case 83:
        this.kinematicBox.position.y -= 1;
        break;

      case 65:
        this.kinematicBox.position.x += 1;
        break;

      case 68:
        this.kinematicBox.position.x -= 1;
        break;
    }
  }

  update () {
    this.physics.update();
  }
}
