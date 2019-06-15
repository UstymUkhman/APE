import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { Mesh } from 'three/src/objects/Mesh';

import Playground from 'demos/Playground';
import PhysicsWorld from 'PhysicsWorld';
import RAF from 'utils/RAF';

const START_COLLISION = 0x009200;
const END_COLLISION = 0x920000;
const NO_COLLISION = 0x222222;

export default class CollidedBodies extends Playground {
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
    this.physics.collisionReport = true;

    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);

    // this.physics.onCollision = this.onCollision.bind(this);
    this.physics.onCollisionEnd = this.onCollisionEnd.bind(this);
    this.physics.onCollisionStart = this.onCollisionStart.bind(this);
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
    document.addEventListener('keydown', this._onKeyDown, false);
  }

  onCollisionStart (thisObject, otherObject, contacts) {
    console.log('onCollisionStart', thisObject.type, otherObject.type);
    const staticCollision = thisObject.type === 'static' || otherObject.type === 'static';

    if (!staticCollision) {
      otherObject.mesh.material.color.setHex(START_COLLISION);
      thisObject.mesh.material.color.setHex(START_COLLISION);
    }
  }

  onCollision (thisObject, otherObject, contacts) {
    console.log('onCollision', thisObject.type, otherObject.type);
  }

  onCollisionEnd (thisObject, otherObject, contacts) {
    console.log('onCollisionEnd', thisObject.type, otherObject.type);
    const staticCollision = thisObject.type === 'static' || otherObject.type === 'static';

    if (!staticCollision) {
      otherObject.mesh.material.color.setHex(END_COLLISION);
      thisObject.mesh.material.color.setHex(END_COLLISION);
    }
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

  update () {
    this.physics.update();
  }
}
