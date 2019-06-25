import { SphereBufferGeometry } from 'three/src/geometries/SphereGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';

import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { LineSegments } from 'three/src/objects/LineSegments';
import { Quaternion } from 'three/src/math/Quaternion';
import { Vector3 } from 'three/src/math/Vector3';
import { Mesh } from 'three/src/objects/Mesh';

import PhysicsWorld from 'worker/PhysicsWorld';
import Playground from 'demos/Playground';

export default class SoftBodies extends Playground {
  constructor () {
    super();

    this.initPhysics();
    this.createObjects();
    this.createSoftObjects();
  }

  initPhysics () {
    this.physics = new PhysicsWorld(true);
    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);
  }

  createObjects () {
    const material = new MeshPhongMaterial({ color: 0x606060 });
    const ropePosition = new Vector3(-3, 2, 0);
    let position = new Vector3(-3, 0.1, -5.5);

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

    let quat = new Quaternion(0, 0, 0, 1);
    let pos = new Vector3(0, 0, 0);

    const ballRadius = 0.6;
    const ballMass = 1.2;

    const ball = new Mesh(new SphereGeometry(ballRadius, 20, 20), new MeshPhongMaterial({ color: 0x202020 }));
    pos.set(-3, 2, 0);
    quat.set(0, 0, 0, 1);
    ball.position.set(pos.x, pos.y, pos.z);
    ball.quaternion.set(quat.x, quat.y, quat.z, quat.w);
    ball.receiveShadow = true;
    ball.castShadow = true;

    this.physics.dynamic.addSphere(ball, ballMass);
    // this.physics.kinematic.addSphere(ball, ballMass);
    this.scene.add(ball);

    const ropePos = ball.position.clone();
    const ropeNumSegments = 20;
    const ropeLength = 8;

    let ropeMaterial = new LineBasicMaterial({ color: 0x000000 });
    let segmentLength = ropeLength / ropeNumSegments;
    let ropeGeometry = new BufferGeometry();
    let ropePositions = [];
    let ropeIndices = [];

    for (let i = 0; i < ropeNumSegments + 1; i++) {
      ropePositions.push(ropePos.x, ropePos.y + i * segmentLength, ropePos.z);
    }

    for (let i = 0; i < ropeNumSegments;) {
      ropeIndices.push(i, ++i);
    }

    ropeGeometry.setIndex(new BufferAttribute(new Uint16Array(ropeIndices), 1));
    ropeGeometry.addAttribute('position', new BufferAttribute(new Float32Array(ropePositions), 3));
    ropeGeometry.computeBoundingSphere();

    const rope = new LineSegments(ropeGeometry, ropeMaterial);
    rope.receiveShadow = true;
    rope.castShadow = true;
    this.scene.add(rope);

    position = ropePos.clone();
    position.y += 0.1;

    this.physics.rope.addBody(rope, ropeLength, 0.5, position);

    this.physics.rope.append(rope, this.arm);
    this.physics.rope.append(rope, ball, false);

    window.addEventListener('keydown', event => {
      switch (event.keyCode) {
        case 81:
          this.physics.hinge.update(hingeIndex, 1);
          // ball.position.z += 1;
          break;

        case 65:
          this.physics.hinge.update(hingeIndex, -1);
          // ball.position.z -= 1;
          break;
      }
    }, false);

    window.addEventListener('keyup', () => {
      this.physics.hinge.update(hingeIndex, 0);
    }, false);
  }

  createSoftObjects () {
    const sphereGeometry = new SphereBufferGeometry(3, 20, 20);
    const boxGeometry = new BufferGeometry().fromGeometry(
      new BoxGeometry(2, 2, 2, 4, 4, 20)
    );

    sphereGeometry.translate(2.5, 15, 0);
    boxGeometry.translate(5, 10, 0);

    const softSphere = new Mesh(sphereGeometry,
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    const softBox = new Mesh(boxGeometry,
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    this.physics.soft.addBody(softSphere, 10, 80);
    this.physics.soft.addBody(softBox, 10, 100);

    softSphere.castShadow = true;
    softBox.castShadow = true;

    this.scene.add(softSphere);
    this.scene.add(softBox);
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
}
