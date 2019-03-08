import { Scene } from 'three/src/scenes/Scene';
import { Color } from 'three/src/math/Color';
import { Fog } from 'three/src/scenes/Fog';

import { Mesh } from 'three/src/objects/Mesh';
import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { GridHelper } from 'three/src/helpers/GridHelper';

import { DirectionalLight } from 'three/src/lights/DirectionalLight';
// import { HemisphereLight } from 'three/src/lights/HemisphereLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

// import { Raycaster } from 'three/src/core/Raycaster';
import { Vector3 } from 'three/src/math/Vector3';

import ThreeOrbitControls from 'three-orbit-controls';
import PhysicsWorld from 'physics/PhysicsWorld';
import RAF from 'core/RAF';

import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { LineSegments } from 'three/src/objects/LineSegments';
import { Quaternion } from 'three/src/math/Quaternion';

import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
// import { DoubleSide } from 'three/src/constants.js';

const OrbitControls = ThreeOrbitControls(THREE);

const WHITE = 0xFFFFFF;
const BLACK = 0x000000;
const GRAY = 0xA0A0A0;

export default class Soft {
  constructor (container = document.body) {
    this.physics = new PhysicsWorld(true);
    this.container = container;
    this.setSize();

    this.createScene();
    this.createGround();
    this.createLights();
    this.createCamera();

    this.createObjects();

    this.createRenderer();
    this.createControls();
    this.createEvents();

    RAF.add(this.render.bind(this));
  }

  createScene () {
    this.scene = new Scene();
    this.scene.background = new Color(GRAY);
    this.scene.fog = new Fog(GRAY, 50, 100);
  }

  createGround () {
    const ground = new Mesh(
      new PlaneBufferGeometry(500, 500),
      new MeshPhongMaterial({
        depthWrite: false,
        color: 0x888888
      })
    );

    ground.receiveShadow = true;
    ground.rotateX(-Math.PI / 2);
    this.physics.static.friction = 2.5;
    this.physics.static.addPlane(ground);

    const grid = new GridHelper(500, 50, BLACK, BLACK);
    grid.material.transparent = true;
    grid.material.opacity = 0.2;

    this.scene.add(ground);
    this.scene.add(grid);
  }

  createLights () {
    const directional = new DirectionalLight(WHITE, 1);
    const ambient = new AmbientLight(WHITE);

    directional.shadow.camera.bottom = -10;
    directional.shadow.camera.right = 10;
    directional.shadow.camera.left = -10;
    directional.shadow.camera.top = 10;
    directional.castShadow = true;

    directional.position.set(-10, 10, 5);
    // hemisphere.position.set(0, 10, 0);

    directional.shadow.mapSize.x = 1024;
    directional.shadow.mapSize.y = 1024;

    directional.shadow.camera.near = 2;
    directional.shadow.camera.far = 50;

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  createCamera () {
    this.camera = new PerspectiveCamera(45, this.ratio, 1, 500);
    this.camera.position.set(0, 5, -25);
    this.camera.lookAt(0, 0, 0);
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

    const hingeIndex = this.physics.hinge.add(pylon, this.arm, axis, pinPivot, armPivot);

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

  createRenderer () {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.container.appendChild(this.renderer.domElement);
  }

  createControls () {
    this.orbitControls = new OrbitControls(this.camera);
    this.orbitControls.target.set(0, 0, 25);
    this.orbitControls.update();
  }

  createEvents () {
    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  render () {
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize () {
    this.setSize();
    this.camera.aspect = this.ratio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  setSize () {
    this.height = this.container.offsetHeight;
    this.width = this.container.offsetWidth;
    this.ratio = this.width / this.height;
  }
}
