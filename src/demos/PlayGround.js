import { Scene } from 'three/src/scenes/Scene';
import { Color } from 'three/src/math/Color';
import { Fog } from 'three/src/scenes/Fog';

import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { GridHelper } from 'three/src/helpers/GridHelper';
import { Mesh } from 'three/src/objects/Mesh';

import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Object3D } from 'three/src/core/Object3D';
import { DoubleSide } from 'three/src/constants';
import { Vector3 } from 'three/src/math/Vector3';

import ThreeOrbitControls from 'three-orbit-controls';
import PhysicsWorld from 'physics/PhysicsWorld';
import RAF from 'core/RAF';

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
    // this.createHinge();
    this.createCloth();

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
      // new BoxGeometry(500, 500, 0.5),
      new MeshPhongMaterial({
        depthWrite: false,
        color: 0x888888
      })
    );

    ground.receiveShadow = true;
    ground.rotateX(-Math.PI / 2);
    this.physics.static.friction = 2.5;
    this.physics.static.addPlane(ground);
    // this.physics.kinematic.friction = 2.5;
    // this.physics.kinematic.addBox(ground);

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

    directional.position.set(-10, 10, 5);
    directional.castShadow = true;

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
    this.kinematicBox = new Mesh(
      new BoxGeometry(5, 5, 5),
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    const dynamicBox = this.kinematicBox.clone();
    const softBoxGeometry = new BufferGeometry().fromGeometry(
      new BoxGeometry(5, 5, 5, 20, 20, 20)
    );

    softBoxGeometry.translate(-2.5, 10, 0);
    this.kinematicBox.position.y = 2.5;
    dynamicBox.position.x = -2.5;
    dynamicBox.position.y = 10;

    const softBox = new Mesh(
      softBoxGeometry,
      new MeshPhongMaterial({
        color: 0x222222
      })
    );

    softBox.frustumCulled = false;
    softBox.receiveShadow = true;
    softBox.castShadow = true;

    // this.physics.soft.addBody(softBox, 5, 200);
    this.physics.kinematic.addBox(this.kinematicBox);
    // this.physics.dynamic.addBox(dynamicBox, 10);

    this.scene.add(this.kinematicBox);
    // this.scene.add(dynamicBox);
    // this.scene.add(softBox);
  }

  createHinge () {
    const material = new MeshPhongMaterial({ color: 0x606060 });
    const position = new Vector3(-3, 0.1, -5.5);
    const ropePosition = new Vector3(-3, 2, 0);

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

  createCloth () {
    const geometry = new PlaneBufferGeometry(5, 5, 25, 25);
    const position = new Vector3(-3, 10, 0);

    geometry.rotateY(Math.PI / 2.0);
    geometry.translate(position.x, position.y + 2.5, position.z - 2.5);

    const cloth = new Mesh(
      geometry,
      new MeshPhongMaterial({
        side: DoubleSide,
        color: 0x222222
      })
    );

    this.physics.cloth.addBody(cloth, 1);
    // this.physics.cloth.append(cloth, 25, this.arm);
    // this.physics.cloth.append(cloth, 0, this.arm);

    cloth.receiveShadow = true;
    cloth.castShadow = true;
    // this.scene.add(cloth);

    const obj = new Object3D();
    obj.rotation.y = Math.PI / 2;

    obj.add(cloth);
    this.scene.add(obj);
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

    // this._onKeyDown = this.onKeyDown.bind(this);
    // document.addEventListener('keydown', this._onKeyDown);
  }

  createEvents () {
    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  render () {
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
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
