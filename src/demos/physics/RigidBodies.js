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
    this.createKinematicBodies();
  }

  initPhysics () {
    this.physics = new PhysicsWorld();

    this.physics.static.friction = 2.5;
    this.physics.static.addPlane(this.ground);
  }

  createDynamicBodies () {
    const dynamicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    dynamicBox.castShadow = true;
    dynamicBox.position.x = -2.5;
    dynamicBox.position.y = 10;

    this.physics.dynamic.addBox(dynamicBox, 10);
    this.scene.add(dynamicBox);
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
  }
}