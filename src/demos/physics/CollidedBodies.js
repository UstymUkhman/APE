import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';

import PhysicsWorld from 'physics/PhysicsWorld';
import Playground from 'demos/Playground';

const KINEMATIC_COLLISION = 0x920000;
const STATIC_COLLISION = 0x009200;
const NO_COLLISION = 0x222222;

export default class CollidedBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createDynamicBodies();
    this.createKinematicBodies();
  }

  initPhysics () {
    this.physics = new PhysicsWorld();
    this.physics.collisionReport = true;

    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);
  }

  createDynamicBodies () {
    const dynamicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: NO_COLLISION
      })
    );

    dynamicBox.position.x = -4.0;
    dynamicBox.position.y = 25.0;
    dynamicBox.castShadow = true;

    dynamicBox.onCollisionStart = (otherMesh, otherMeshType, contacts) => {
      const staticCollision = otherMeshType === 'static';
      const collisionColor = staticCollision ? STATIC_COLLISION : KINEMATIC_COLLISION;

      dynamicBox.material.color.setHex(collisionColor);

      if (!staticCollision) {
        otherMesh.material.color.setHex(STATIC_COLLISION);
      }
    };

    dynamicBox.onCollisionEnd = (otherMesh, otherMeshType, contacts) => {
      const staticCollision = otherMeshType === 'static';
      dynamicBox.material.color.setHex(NO_COLLISION);

      if (!staticCollision) {
        otherMesh.material.color.setHex(NO_COLLISION);
      }
    };

    this.physics.dynamic.addBox(dynamicBox, 10);
    this.scene.add(dynamicBox);
  }

  createKinematicBodies () {
    this.kinematicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: NO_COLLISION
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
        this.kinematicBox.position.y += 0.5;
        break;

      case 83:
        this.kinematicBox.position.y -= 0.5;
        break;

      case 65:
        this.kinematicBox.position.x += 0.5;
        break;

      case 68:
        this.kinematicBox.position.x -= 0.5;
        break;
    }
  }
}
