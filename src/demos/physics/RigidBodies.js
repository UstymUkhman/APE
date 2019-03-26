import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';

import PhysicsWorld from 'physics/PhysicsWorld';
import Playground from 'demos/Playground';

export default class RigidBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createDynamicBodies();
    // this.createKinematicBodies();
  }

  initPhysics () {
    this.physics = new PhysicsWorld();

    this.physics.static.friction = 2.5;
    this.physics.fullCollisionReport = true;
    this.physics.static.addBox(this.ground);
    // this.physics.static.addPlane(this.ground);
    // this.physics.static.addHeightField(this.ground, this.minHeight, this.maxHeight);
  }

  createDynamicBodies () {
    const dynamicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    dynamicBox.castShadow = true;
    dynamicBox.position.x = 10;
    dynamicBox.position.y = 20;

    this.physics.dynamic.addBox(dynamicBox, 10);
    this.scene.add(dynamicBox);

    // const concaveBox = new Mesh(
    //   new BoxGeometry(5, 5, 5),
    //   new MeshPhongMaterial({
    //     color: 0x222222
    //   })
    // );

    // concaveBox.castShadow = true;
    // concaveBox.position.x = -7.5;
    // concaveBox.position.y = 25;

    // // this.physics.dynamic.addConcave(concaveBox, 10);
    // this.physics.dynamic.addBox(concaveBox, 10);
    // this.scene.add(concaveBox);

    // const convexBox = new Mesh(
    //   new BoxGeometry(5, 5, 5),
    //   new MeshPhongMaterial({
    //     color: 0x222222
    //   })
    // );

    // convexBox.castShadow = true;
    // convexBox.position.x = 7.5;
    // convexBox.position.y = 25;

    // // this.physics.dynamic.addConvex(convexBox, 10);
    // this.physics.dynamic.addBox(convexBox, 10);
    // this.scene.add(convexBox);
  }

  createKinematicBodies () {
    this.kinematicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    this.kinematicBox.castShadow = true;
    this.kinematicBox.position.y = 2.5;

    this.physics.kinematic.addBox(this.kinematicBox);
    this.scene.add(this.kinematicBox);

    this._onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this._onKeyDown);
  }

  onKeyDown (event) {
    const code = event.keyCode;

    switch (code) {
      case 87:
        this.kinematicBox.position.z += 1;
        break;

      case 83:
        this.kinematicBox.position.z -= 1;
        break;

      case 65:
        this.kinematicBox.position.x += 1;
        break;

      case 68:
        this.kinematicBox.position.x -= 1;
        break;
    }
  }
}
