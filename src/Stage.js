import RAF from 'managers/RAF';
import * as THREE from 'three/src/Three.js';
import FBXAnimations from 'managers/FBXAnimations';
const OrbitControls = require('three-orbit-controls')(THREE);

const WHITE = 0xFFFFFF;
const BLACK = 0x000000;
const GRAY = 0xA0A0A0;

export default class Stage {
  constructor (container = document.body) {
    this.container = container;
    this.setSize();

    this.createScene();
    this.createGround();
    this.createLights();
    this.createCamera();
    this.createAnimation();

    this.createRenderer();
    this.createControls();
    this.createEvents();

    RAF.add(this.render.bind(this));
  }

  createScene () {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(GRAY);
    this.scene.fog = new THREE.Fog(GRAY, 500, 1000);
  }

  createGround () {
    const ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({
        depthWrite: false,
        color: 0x999999
      })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(2000, 20, BLACK, BLACK);
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    this.scene.add(grid);
  }

  createLights () {
    const hemisphere = new THREE.HemisphereLight(WHITE, 0x444444);
    const directional = new THREE.DirectionalLight(WHITE);

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
    this.camera = new THREE.PerspectiveCamera(45, this.ratio, 1, 2000);
    this.camera.position.set(100, 200, 300);
  }

  createAnimation () {
    this.fbx = new FBXAnimations({
      name: 'samba',
      path: './animations/Dancing.fbx',
      onLoad: (fbx) => {
        this.scene.add(fbx);
      }
    });

    // const cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(10, 10, 10),
    //   new THREE.MeshBasicMaterial({
    //     color: BLACK
    //   })
    // );

    // this.fbx.animate(cube.position, 'z', 135);
    // this.scene.add(cube);
  }

  createRenderer () {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.container.appendChild(this.renderer.domElement);
  }

  createControls () {
    this.controls = new OrbitControls(this.camera);
    this.controls.target.set(0, 100, 0);
    this.controls.update();
  }

  createEvents () {
    window.addEventListener('resize', this.onResize.bind(this), false);
    document.addEventListener('click', () => {
      if (this.fbx.isPlaying('samba')) {
        this.fbx.pause('samba');
      } else {
        this.fbx.play('samba');
      }
    });
  }

  render () {
    this.fbx.update();
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
