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
// import { Vector3 } from 'three/src/math/Vector3';

import ThreeOrbitControls from 'three-orbit-controls';
import FBXAnimations from 'managers/FBXAnimations';
import PhysicWorld from 'physic/PhysicWorld';
import RAF from 'managers/RAF';
// import anime from 'animejs';

import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

import { CylinderGeometry } from 'three/src/geometries/CylinderGeometry';
import * as controls from 'controls/vehicleControls.json';

const OrbitControls = ThreeOrbitControls(THREE);

const WHITE = 0xFFFFFF;
const BLACK = 0x000000;
const GRAY = 0xA0A0A0;

export default class Stage {
  constructor (container = document.body) {
    this.physics = new PhysicWorld();
    this.container = container;
    this.fbx = null;
    this.setSize();

    this.createScene();
    this.createGround();
    this.createLights();
    this.createCamera();

    // this.createAnimation();
    this.createObjects();
    this.createVehicle();
    // this.createRaycaster();

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

  createAnimation () {
    this.steps = 0;

    this.fbxAnimation = new FBXAnimations([{
      path: './animations/Punching.fbx',
      name: 'punching' // ,
      // loop: true
    }, {
      path: './animations/Walking.fbx',
      name: 'walk',
      loop: true,
      play: true,

      onLoad: (fbx) => {
        this.scene.add(fbx);
      },

      onLoop: (fbx) => {
        fbx.position.z = ++this.steps * 135;

        if (this.steps === 5) {
          this.fbxAnimation.pause('walk');
        }
      },

      onEnd: (fbx) => {
        // const action = this.fbx.mixer.clipAction(this.fbx.animations[1]);

        // event.action.fadeOut(0.5);
        // action.fadeIn(0.5);
        // action.play();

        // anime({
        //   targets: this.fbx.position,
        //   easing: 'linear',
        //   duration: 500,
        //   z: 135.0
        // });
      }
    }]);

    // const cube = new Mesh(
    //   new BoxGeometry(10, 10, 10),
    //   new MeshBasicMaterial({
    //     color: BLACK
    //   })
    // );

    // this.scene.add(cube);
  }

  createObjects () {
    const cube1 = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({
        color: BLACK
      })
    );

    cube1.position.set(-0.5, 10, 0);

    const cube2 = cube1.clone();
    cube2.position.set(-2, 10, -5);

    const cube3 = cube2.clone();
    cube3.position.y = 20;

    // const cube4 = cube1.clone();
    // cube4.position.set(5, 1, 0);

    this.physics.dynamic.addBox(cube1, 5);
    this.physics.dynamic.addBox(cube2, 5);
    this.physics.dynamic.addBox(cube3, 5);
    // this.physics.kinematic.addBox(cube4);

    cube1.castShadow = true;
    cube2.castShadow = true;
    cube3.castShadow = true;
    // cube4.castShadow = true;

    this.scene.add(cube1);
    this.scene.add(cube2);
    this.scene.add(cube3);
    // this.scene.add(cube4);

    // this.cube = cube4;
  }

  createVehicle () {
    const wheelGeometry = new CylinderGeometry(0.4, 0.4, 0.3, 24, 1);
    const chassisGeometry = new BoxGeometry(1.8, 0.6, 4, 1, 1, 1);
    const material = new MeshPhongMaterial({ color: 0x990000 });

    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelMesh = new THREE.Mesh(wheelGeometry, material);
    const chassis = new Mesh(chassisGeometry, material);

    this.physics.vehicle.addVehicle(chassis, 800);
    this.scene.add(chassis);

    for (let i = 0; i < 4; i++) {
      const wheel = wheelMesh.clone();
      this.physics.vehicle.addWheel(wheel, i);
      this.scene.add(wheel);
    }
  }

  /* createRaycaster () {
    this.raycaster = new Raycaster();
    this.mouseVector = new Vector3();
  } */

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

    this.vehicleControls = {};

    for (const i in controls) {
      this.vehicleControls[i] = false;
    }
  }

  createEvents () {
    // controls
    window.addEventListener('resize', this.onResize.bind(this), false);
    /* document.addEventListener('keydown', (event) => {
      const position = this.cube.position;

      switch (event.keyCode) {
        case 38:
          this.cube.position.set(position.x, position.y, position.z + 0.5);
          break;

        case 37:
          this.cube.position.set(position.x + 0.5, position.y, position.z);
          break;

        case 39:
          this.cube.position.set(position.x - 0.5, position.y, position.z);
          break;

        case 40:
          this.cube.position.set(position.x, position.y, position.z - 0.5);
          break;
      }
    }, false); */

    document.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case 87:
          this.vehicleControls.accelerator = true;
          break;

        case 65:
          this.vehicleControls.left = true;
          break;

        case 68:
          this.vehicleControls.right = true;
          break;

        case 83:
          this.vehicleControls.brake = true;
          break;
      }
    }, false);

    document.addEventListener('keyup', (event) => {
      switch (event.keyCode) {
        case 87:
          this.vehicleControls.accelerator = false;
          break;

        case 65:
          this.vehicleControls.left = false;
          break;

        case 68:
          this.vehicleControls.right = false;
          break;

        case 83:
          this.vehicleControls.brake = false;
          break;
      }
    }, false);
  }

  /* onMouseMove (event) {
    event.preventDefault();

    const intersects = this.getIntersects(event.layerX, event.layerY);

    if (intersects.length > 0) {
      const res = intersects.filter(function (res) {
        return res && res.object;
      })[0];

      if (res && res.object) {
        console.log(res.object.name);
      }
    }
  }

  getIntersects (x, y) {
    x = (x / this.width) * 2 - 1;
    y = -(y / this.height) * 2 + 1;

    this.mouseVector.set(x, y, 0.5);
    this.raycaster.setFromCamera(this.mouseVector, this.camera);

    return this.raycaster.intersectObjects(this.scene.children);
  } */

  render () {
    this.physics.update(this.vehicleControls);
    // this.orbitControls.update();
    // this.fbxAnimation.update();
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
