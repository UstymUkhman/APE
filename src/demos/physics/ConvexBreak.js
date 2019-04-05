import 'three/examples/js/QuickHull';
import 'three/examples/js/ConvexObjectBreaker';
import 'three/examples/js/geometries/ConvexGeometry';

import PhysicsWorld from 'physics/PhysicsWorld';
import Playground from 'demos/Playground';

export default class ConvexBreak extends Playground {
  constructor () {
    super();

    this.vec3 = new THREE.Vector3();
    this.quat = new THREE.Quaternion();

    this.initPhysics();
    this.createObjects();
    this.createUserShot();
  }

  initPhysics () {
    this.physics = new PhysicsWorld();
    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);
    this.physics.fullCollisionReport = true;

    // console.log('ground UUID', this.ground.uuid);
    this.convexBreaker = new THREE.ConvexObjectBreaker();
  }

  createObjects () {
    // Tower 1
    this.vec3.set(-8, 5.5, 0);
    this.quat.set(0, 0, 0, 1);

    this.createBufferMesh(
      new THREE.Vector3(2, 5, 2),
      this.vec3, this.quat,
      0xB03014, 1000
    );

    // Tower 2
    this.vec3.set(8, 5.5, 0);
    this.quat.set(0, 0, 0, 1);

    this.createBufferMesh(
      new THREE.Vector3(2, 5, 2),
      this.vec3, this.quat,
      0xB03214, 1000
    );

    // Bridge
    this.vec3.set(0, 10.7, 0);
    this.quat.set(0, 0, 0, 1);

    this.createBufferMesh(
      new THREE.Vector3(7, 0.2, 1.5),
      this.vec3, this.quat,
      0xB3B865, 100
    );

    // Stones
    this.quat.set(0, 0, 0, 1);

    for (let i = 0; i < 8; i++) {
      const z = 15 * (0.5 - i / 9);
      this.vec3.set(0, 2.5, z);

      this.createBufferMesh(
        new THREE.Vector3(1, 2, 0.15),
        this.vec3, this.quat,
        0xB0B0B0, 120
      );
    }

    // Mountain
    const mountainSize = new THREE.Vector3(4, 5, 4);

    const mesh = new THREE.Mesh(
      new THREE.ConvexBufferGeometry([
        new THREE.Vector3(mountainSize.x, -mountainSize.y, mountainSize.z),
        new THREE.Vector3(-mountainSize.x, -mountainSize.y, mountainSize.z),
        new THREE.Vector3(mountainSize.x, -mountainSize.y, -mountainSize.z),
        new THREE.Vector3(-mountainSize.x, -mountainSize.y, -mountainSize.z),
        new THREE.Vector3(0, mountainSize.y, 0)
      ]),
      new THREE.MeshPhongMaterial({ color: 0xB03814 })
    );

    this.quat.set(0, 0, 0, 1);
    this.vec3.set(5, mountainSize.y + 0.5, -10);

    mesh.position.copy(this.vec3);
    mesh.quaternion.copy(this.quat);

    this.convexBreaker.prepareBreakableObject(
      mesh, 860, new THREE.Vector3(), new THREE.Vector3(), true
    );

    this.createMeshDebris(mesh, 860);
    // console.log('mountain UUID', mesh.uuid);
    mesh.onCollisionEnd = this.onCollisionEnd.bind(this);
    mesh.onCollisionStart = this.onCollisionStart.bind(this);
  }

  createBufferMesh (halfSize, position, rotation, color, mass) {
    const mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(halfSize.x * 2, halfSize.y * 2, halfSize.z * 2),
      new THREE.MeshPhongMaterial({ color: color })
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(position);
    mesh.quaternion.copy(rotation);

    this.convexBreaker.prepareBreakableObject(
      mesh, mass, new THREE.Vector3(), new THREE.Vector3(), true
    );

    this.createMeshDebris(mesh, mass);
    // mesh.onCollisionEnd = this.onCollisionEnd.bind(this);
    // mesh.onCollisionStart = this.onCollisionStart.bind(this);
  }

  createMeshDebris (mesh, mass) {
    this.physics.dynamic.addConvex(mesh, mass);
    this.scene.add(mesh);

    // var btVecUserData = new Ammo.btVector3(0, 0, 0);
    // btVecUserData.threeObject = mesh;
    // body.setUserPointer(btVecUserData);
  }

  onCollisionStart (thisBody, otherBody, contacts) {
    console.log('onCollisionStart', thisBody, otherBody, contacts);

    // if (type !== 'static' && contact.impulse > 250.0) {
    //   // const distance = contact.distance;
    //   const impulse = contact.impulse;
    //   // const normal = contact.normal;

    //   console.log('impulse', impulse, this);

    //   // const debris = this.convexBreaker.subdivideByImpact(threeObject0, impact, normal, 1, 2, 1.5);

    //   // for (let i = 0; i < debris.length; i++) {
    //   //   this.createMeshDebris(debris[i], mass);
    //   // }

    //   // objectsToRemove[numObjectsToRemove++] = threeObject0;
    //   // userData0.collided = true;
    // }
  }

  onCollisionEnd (thisBody, otherBody, contacts) {
    console.log('onCollisionEnd', thisBody, otherBody, contacts);
  }

  createUserShot () {
    this.ball = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.25, 14, 10),
      new THREE.MeshPhongMaterial({ color: 0x202020 })
    );

    this.ball.castShadow = true;
    this.ball.receiveShadow = true;

    this.raycaster = new THREE.Raycaster();
    this._shotBall = this.shotBall.bind(this);
    this.ballPosition = new THREE.Vector2(0.0, 0.0);
    document.addEventListener('keyup', this._shotBall, false);
  }

  shotBall () {
    const ball = this.ball.clone();
    console.log('ball UUID', ball.uuid);

    this.raycaster.setFromCamera(this.ballPosition, this.camera);
    this.vec3.copy(this.raycaster.ray.direction);
    this.vec3.add(this.raycaster.ray.origin);
    this.quat.set(0, 0, 0, 1);

    ball.position.copy(this.vec3);
    ball.quaternion.copy(this.quat);

    this.scene.add(ball);
    this.physics.dynamic.addSphere(ball, 35);

    this.vec3.copy(this.raycaster.ray.direction);
    this.vec3.multiplyScalar(50);

    this.physics.dynamic.setLinearVelocity(ball, this.vec3);
    ball.onCollisionEnd = this.onCollisionEnd.bind(this);
    ball.onCollisionStart = this.onCollisionStart.bind(this);
  }
}
