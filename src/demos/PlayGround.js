import { Scene } from 'three/src/scenes/Scene';
import { Color } from 'three/src/math/Color';
import { Fog } from 'three/src/scenes/Fog';

import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { GridHelper } from 'three/src/helpers/GridHelper';
import { Mesh } from 'three/src/objects/Mesh';

import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

import ThreeOrbitControls from 'three-orbit-controls';
import PhysicsWorld from 'physics/PhysicsWorld';
import RAF from 'core/RAF';

const OrbitControls = ThreeOrbitControls(THREE);

const WHITE = 0xFFFFFF;
const BLACK = 0x000000;
const GRAY = 0xA0A0A0;

export default class Soft {
  constructor (container = document.body) {
    this.physics = new PhysicsWorld();
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
    // this.physics.update();
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
