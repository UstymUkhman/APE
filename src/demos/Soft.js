import { Scene } from 'three/src/scenes/Scene';
import { Color } from 'three/src/math/Color';
import { Fog } from 'three/src/scenes/Fog';

import { Mesh } from 'three/src/objects/Mesh';
import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { GridHelper } from 'three/src/helpers/GridHelper';

import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { HemisphereLight } from 'three/src/lights/HemisphereLight';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

// import { Raycaster } from 'three/src/core/Raycaster';
import { Vector3 } from 'three/src/math/Vector3';

import ThreeOrbitControls from 'three-orbit-controls';
import PhysicWorld from 'physics/PhysicWorld';
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
    this.physics = new PhysicWorld(true);
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
    const hemisphere = new HemisphereLight(WHITE, 0x444444);
    const directional = new DirectionalLight(WHITE);

    directional.shadow.camera.bottom = -100;
    directional.shadow.camera.right = 120;
    directional.shadow.camera.left = -120;
    directional.shadow.camera.top = 180;
    directional.castShadow = true;

    directional.position.set(0, 10, 10);
    hemisphere.position.set(0, 10, 0);

    this.scene.add(directional);
    this.scene.add(hemisphere);
  }

  createCamera () {
    this.camera = new PerspectiveCamera(45, this.ratio, 1, 500);
    this.camera.position.set(0, 5, -25);
    this.camera.lookAt(0, 0, 0);
  }

  createObjects () {
    const ballMass = 1.2;
    const ballRadius = 0.6;

    let quat = new Quaternion(0, 0, 0, 1);
    let pos = new Vector3(0, 0, 0);

    const ball = new Mesh(new SphereGeometry(ballRadius, 20, 20), new MeshPhongMaterial({ color: 0x202020 }));
    ball.position.set(-3, 2, 0);
    ball.receiveShadow = true;
    ball.castShadow = true;

    this.physics.dynamic.addSphere(ball, ballMass);
    this.scene.add(ball);

    const ropePos = new Vector3(0, 5, 0);
    const ropeNumSegments = 10;
    const ropeLength = 4;

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

    ropeGeometry.addAttribute('position', new BufferAttribute(new Float32Array(ropePositions), 3));
    ropeGeometry.setIndex(new BufferAttribute(new Uint16Array(ropeIndices), 1));
    ropeGeometry.computeBoundingSphere();

    const rope = new LineSegments(ropeGeometry, ropeMaterial);
    rope.receiveShadow = true;
    rope.castShadow = true;

    const armMass = 2;
    const armLength = 3;
    const pylonHeight = ropePos.y + ropeLength;
    const baseMaterial = new MeshPhongMaterial({ color: 0x606060 });

    pos.set(ropePos.x, 0.1, ropePos.z - armLength);
    quat.set(0, 0, 0, 1);

    const base = this.createParalellepiped(1, 0.2, 1, 1, pos, quat, baseMaterial);
    base.receiveShadow = true;
    base.castShadow = true;
    pos.set(ropePos.x, 0.5 * pylonHeight, ropePos.z - armLength);

    const pylon = this.createParalellepiped(0.4, pylonHeight, 0.4, 1, pos, quat, baseMaterial);
    pylon.receiveShadow = true;
    pylon.castShadow = true;
    pos.set(ropePos.x, pylonHeight + 0.2, ropePos.z - 0.5 * armLength);

    const arm = this.createParalellepiped(0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial);
    arm.receiveShadow = true;
    arm.castShadow = true;

    this.physics.rope.addBody(rope, ropeLength, 3.0);
    this.physics.rope.append(rope, arm);
    this.scene.add(rope);
  }

  createParalellepiped (sx, sy, sz, mass, pos, quat, material) {
    const threeObject = new Mesh(new BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    // var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    // shape.setMargin( margin );

    // createRigidBody( threeObject, shape, mass, pos, quat );

    this.physics.dynamic.createBox(threeObject, mass);
    threeObject.position.set(pos.x, pos.y, pos.z);
    this.scene.add(threeObject);
    return threeObject;
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
    this.physics.update();
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
