import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
// import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';

import PhysicsWorld from 'physics/PhysicsWorld';
import Playground from 'demos/Playground';

export default class RigidBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createDynamicBodies();
    this.createKinematicBodies();
  }

  initPhysics () {
    this.physics = new PhysicsWorld();

    this.physics.static.friction = 2.5;
    this.physics.collisionReport = true;
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
    dynamicBox.position.y = 15;

    this.physics.dynamic.addBox(dynamicBox, 10);
    this.scene.add(dynamicBox);

    dynamicBox.onCollisionStart = (otherMesh, otherMeshType, contacts) => {
      console.log('onCollisionStart', contacts);
    };

    dynamicBox.onCollision = (otherMesh, otherMeshType, contacts) => {
      console.log('onCollision', contacts);
    };

    dynamicBox.onCollisionEnd = (otherMesh, otherMeshType, contacts) => {
      console.log('onCollisionEnd', contacts);
    };
  }

  createKinematicBodies () {
    this.kinematicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    this.kinematicBox.castShadow = true;
    this.kinematicBox.position.y = 5;

    this.physics.kinematic.addBox(this.kinematicBox);
    this.scene.add(this.kinematicBox);

    this._onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this._onKeyDown);
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
}
