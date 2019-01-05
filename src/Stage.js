import { Scene } from 'three/src/scenes/Scene';
import { Color } from 'three/src/math/Color';
import { Fog } from 'three/src/scenes/Fog';

import { Mesh } from 'three/src/objects/Mesh';
// import { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { GridHelper } from 'three/src/helpers/GridHelper';

import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { HemisphereLight } from 'three/src/lights/HemisphereLight';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

// import ThreeOrbitControls from 'three-orbit-controls';
import FBXAnimations from 'managers/FBXAnimations';
import FirstPerson from 'controls/FirstPerson';
import Physics from 'managers/Physics';
import RAF from 'managers/RAF';
// import anime from 'animejs';

// const OrbitControls = ThreeOrbitControls(THREE);

import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

const WHITE = 0xFFFFFF;
const BLACK = 0x000000;
const GRAY = 0xA0A0A0;

export default class Stage {
  constructor (container = document.body) {
    this.physics = new Physics();
    this.container = container;
    this.fbx = null;
    this.setSize();

    this.createScene();
    this.createGround();
    this.createLights();
    this.createCamera();
    // this.createAnimation();

    this.createObjects();

    // this.createRaycaster();
    this.createRenderer();
    this.createControls();
    this.createEvents();

    RAF.add(this.render.bind(this));
  }

  createScene () {
    this.scene = new Scene();
    this.scene.background = new Color(GRAY);
    this.scene.fog = new Fog(GRAY, 500, 1000);
  }

  createGround () {
    const ground = new Mesh(
      new BoxGeometry(2000, 1, 2000, 1, 1, 1),
      new MeshPhongMaterial({
        depthWrite: false,
        color: 0x999999
      })
    );

    ground.rotation.x = -Math.PI / 2;
    this.physics.initGround(ground);
    ground.receiveShadow = true;

    const grid = new GridHelper(2000, 20, BLACK, BLACK);
    grid.material.transparent = true;
    grid.material.opacity = 0.2;

    this.scene.add(ground);
    this.scene.add(grid);
  }

  createLights () {
    const hemisphere = new HemisphereLight(WHITE, 0x444444);
    const directional = new DirectionalLight(WHITE);

    directional.position.set(0, 200, 100);
    hemisphere.position.set(0, 200, 0);

    directional.shadow.camera.bottom = -100;
    directional.shadow.camera.right = 120;
    directional.shadow.camera.left = -120;
    directional.shadow.camera.top = 180;
    directional.castShadow = true;

    this.scene.add(directional);
    this.scene.add(hemisphere);
  }

  createCamera () {
    this.camera = new PerspectiveCamera(45, this.ratio, 1, 2000);
    // this.camera.position.set(100, 200, 500);
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
    const cube = new Mesh(
      new BoxGeometry(20, 20, 20),
      new MeshBasicMaterial({
        color: BLACK
      })
    );

    cube.position.set(20, 100, -200);

    const cube2 = cube.clone();
    cube2.position.set(-20, 100, -150);

    const cube3 = cube2.clone();
    cube3.position.y = 20;

    this.physics.addBoxBody(cube, 5);
    this.physics.addBoxBody(cube2, 5);
    this.physics.addBoxBody(cube3, 5);

    cube.castShadow = true;
    cube2.castShadow = true;
    cube3.castShadow = true;

    this.scene.add(cube);
    this.scene.add(cube2);
    this.scene.add(cube3);
  }

  createRaycaster () {
    // this.raycaster = new Raycaster();
    // this.mouseVector = new Vector3();
  }

  createRenderer () {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.container.appendChild(this.renderer.domElement);
  }

  createControls () {
    this.controls = new FirstPerson(this.camera, this.container);
    this.scene.add(this.controls.yawObject);
    this.controls.verticalLock = 0.5;

    // this.controls = new OrbitControls(this.camera);
    // this.controls.target.set(0, 100, 0);
    // this.controls.update();
  }

  createEvents () {
    window.addEventListener('resize', this.onResize.bind(this), false);
    this.container.addEventListener('click', this.controls.enable, false);
  }

  // onMouseMove (event) {
  //   event.preventDefault();

  //   const intersects = this.getIntersects(event.layerX, event.layerY);

  //   if (intersects.length > 0) {
  //     var res = intersects.filter(function (res) {
  //       return res && res.object;
  //     })[0];

  //     if (res && res.object) {
  //       console.log(res.object.name);
  //     }
  //   }
  // }

  // getIntersects (x, y) {
  //   x = (x / this.width) * 2 - 1;
  //   y = -(y / this.height) * 2 + 1;

  //   this.mouseVector.set(x, y, 0.5);
  //   this.raycaster.setFromCamera(this.mouseVector, this.camera);

  //   return this.raycaster.intersectObject(this.fbx, true);
  // }

  render () {
    this.physics.update();
    this.controls.update();
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
