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

import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
// import { SphereBufferGeometry } from 'three/src/geometries/SphereGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

import { DoubleSide } from 'three/src/constants.js';

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
    const boxGeometry = new BoxGeometry(1, 1, 5, 4, 4, 20);
    // const sphereGeometry = new SphereBufferGeometry(1.5, 40, 25);

    // sphereGeometry.translate(0, 25, 0);
    // boxGeometry.translate(0, 10, 0);

    // const sphere = new THREE.Mesh(sphereGeometry, new MeshPhongMaterial({ color: 0xFF0000 }));
    const box = new Mesh(boxGeometry, new MeshPhongMaterial({ color: 0xFFFF00 }));

    box.rotation.set(0, Math.PI / 2, 0);
    box.position.set(0, 5, 0);

    // this.physics.soft.addBody(sphere, 15, 200);
    this.physics.dynamic.addBox(box, 15);

    // sphere.frustumCulled = false;
    // sphere.receiveShadow = true;
    // sphere.castShadow = true;

    box.frustumCulled = false;
    box.receiveShadow = true;
    box.castShadow = true;

    // this.scene.add(sphere);
    this.scene.add(box);

    const width = 4.0;
    const height = 3.0;

    // var clothWidth = 4;
    // var clothHeight = 3;
    // var clothNumSegmentsZ = clothWidth * 5;
    // var clothNumSegmentsY = clothHeight * 5;
    const clothPos = new Vector3(0, 10, 2);

    const material = new MeshLambertMaterial({ color: 0xA0A0A0, side: DoubleSide });
    const geometry = new PlaneBufferGeometry(width, height, width * 5, height * 5);

    // geometry.rotateY(Math.PI * 0.5);
    geometry.translate(clothPos.x, clothPos.y + height * 0.5, clothPos.z - width * 0.5);

    const cloth = new Mesh(geometry, material);

    // cloth.position.set(0, 10, 0);
    this.physics.cloth.addBody(cloth, 0.9, clothPos);

    cloth.receiveShadow = true;
    cloth.castShadow = true;
    this.scene.add(cloth);
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
