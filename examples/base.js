var scene, camera, ground;

(function () {
  var renderer, stats, controls;
  var width, height, ratio;

  var BLACK = 0x000000;
  var WHITE = 0xFFFFFF;
  var GRAY  = 0xA0A0A0;

  function createScene () {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(GRAY);
    scene.fog = new THREE.Fog(GRAY, 50, 500);
  }

  function createCamera (rotate) {
    camera = new THREE.PerspectiveCamera(45, ratio, 1, 500);    

    if (rotate) {
      camera.position.set(15, 10, 0);
      camera.lookAt(-20, 0, 0);
    } else {
      camera.position.set(0, 15, -50);
      camera.lookAt(0, 0, 0);
    }
  }

  function createLights () {
    const directional = new THREE.DirectionalLight(WHITE, 1);
    const ambient = new THREE.AmbientLight(WHITE);

    directional.position.set(-10, 10, 5);
    directional.castShadow = true;

    directional.shadow.camera.bottom = -10;
    directional.shadow.camera.right = 10;
    directional.shadow.camera.left = -10;
    directional.shadow.camera.top = 10;

    directional.shadow.mapSize.x = 1024;
    directional.shadow.mapSize.y = 1024;

    directional.shadow.camera.near = 2;
    directional.shadow.camera.far = 50;

    scene.add(directional);
    scene.add(ambient);
  }

  function createGround () {
    ground = new THREE.Mesh(
      new THREE.BoxGeometry(500, 500, 1),
      new THREE.MeshPhongMaterial({
        depthWrite: false,
        color: 0x888888
      })
    );

    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(500, 50, BLACK, BLACK);
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    scene.add(grid);
  }

  function createRenderer () {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    renderer.setSize(width, height);

    document.body.appendChild(renderer.domElement);
  }

  function createControls () {
    controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function createStats () {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.domElement);
  }

  function render () {
    stats.begin();
    renderer.render(scene, camera);
    
    stats.end();
    requestAnimationFrame(render);
  }

  function onResize () {
    height = window.innerHeight;
    width = window.innerWidth;
    ratio = width / height;

    camera.aspect = ratio;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('DOMContentLoaded', () => {
    var rotate = window.location.href.includes('raycaster');
    window.addEventListener('resize', onResize, false);

    height = window.innerHeight;
    width = window.innerWidth;
    ratio = width / height;

    createScene();
    createCamera(rotate);
    createLights();
    createGround();

    createRenderer();
    createStats();

    if (!rotate) createControls();
    requestAnimationFrame(render);
  });
})();
