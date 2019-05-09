import 'three/examples/js/QuickHull';
import 'three/examples/js/ConvexObjectBreaker';
import 'three/examples/js/geometries/ConvexGeometry';

const VECTOR_ZERO = new THREE.Vector3(0.0, 0.0, 0.0);
import Playground from 'demos/Playground';
import Physics from 'physics/World';
import RAF from 'core/RAF';

export default class Break extends Playground {
  constructor () {
    super();

    this.now = Date.now();
    this.vec3 = new THREE.Vector3();
    this.vec3 = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    this.quat = new THREE.Quaternion();

    this.initPhysics();
    this.createObjects();
    this.createUserShot();

    this._update = this.update.bind(this);
    RAF.add(this._update);
  }

  initPhysics () {
    this.physics = new Physics();
    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);

    // this.physics.fullCollisionReport = true;
    this.convexBreaker = new THREE.ConvexObjectBreaker();
    // this.physics.onCollision = this.onCollision.bind(this);
  }

  createObjects () {
    // Tower 1
    this.vec3.set(-8, 5.5, 0);
    this.quat.set(0, 0, 0, 1);

    this.createBufferMesh(
      new THREE.Vector3(4, 10, 4),
      this.vec3, this.quat,
      0xB03014, 1000
    );

    // Tower 2
    this.vec3.set(8, 5.5, 0);
    this.quat.set(0, 0, 0, 1);

    this.createBufferMesh(
      new THREE.Vector3(4, 10, 4),
      this.vec3, this.quat,
      0xB03214, 1000
    );

    // Bridge
    this.vec3.set(0, 10.7, 0);
    this.quat.set(0, 0, 0, 1);

    this.createBufferMesh(
      new THREE.Vector3(14, 0.4, 3),
      this.vec3, this.quat,
      0xB3B865, 100
    );

    // Stones
    this.quat.set(0, 0, 0, 1);

    for (let i = 0; i < 8; i++) {
      const z = 15 * (0.5 - i / 9);
      this.vec3.set(0, 2.5, z);

      this.createBufferMesh(
        new THREE.Vector3(2, 4, 0.3),
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
    this.createMeshDebris(mesh, 860);
  }

  createBufferMesh (size, position, rotation, color, mass) {
    const mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(size.x, size.y, size.z),
      new THREE.MeshPhongMaterial({ color: color })
    );

    mesh.position.copy(position);
    mesh.quaternion.copy(rotation);

    this.createMeshDebris(mesh, mass);
  }

  createMeshDebris (mesh, mass) {
    if (mass > 50) {
      this.convexBreaker.prepareBreakableObject(
        mesh, mass, VECTOR_ZERO, VECTOR_ZERO, true
      );
    }

    this.physics.dynamic.addConvex(mesh, mass);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add(mesh);
  }

  onCollision (thisBody, otherBody, contacts) {
    const now = Date.now();
    if (now < (this.now + 1000)) return;

    const impulse = contacts[0] ? contacts[0].impulse : 0;
    const isBall = otherBody.type === 'dynamic';
    const userData = thisBody.mesh.userData;

    if (isBall && userData.breakable && impulse > 500) {
      const normal = contacts[0].normal;
      const point = thisBody.collisionPoint;

      this.vec3.set(point.x, point.y, point.z);
      this.normal.set(normal.x, normal.y, normal.z);

      const debris = this.convexBreaker.subdivideByImpact(
        thisBody.mesh, this.vec3, this.normal, 1, 2, 1.5
      );

      for (let i = 0; i < debris.length; i++) {
        this.createMeshDebris(debris[i], debris[i].userData.mass);
      }

      this.physics.dynamic.remove(thisBody.mesh);
      this.scene.remove(thisBody.mesh);
      this.now = now;
    }
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

    this.raycaster.setFromCamera(this.ballPosition, this.camera);
    this.vec3.copy(this.raycaster.ray.direction);
    this.vec3.add(this.raycaster.ray.origin);
    this.quat.set(0, 0, 0, 1);

    ball.position.copy(this.vec3);
    ball.quaternion.copy(this.quat);

    this.scene.add(ball);
    this.physics.dynamic.addSphere(ball, 50);

    this.vec3.copy(this.raycaster.ray.direction);
    this.vec3.multiplyScalar(50);

    this.physics.dynamic.setLinearVelocity(ball, this.vec3);

    setTimeout(() => {
      this.physics.dynamic.remove(ball);
      this.scene.remove(ball);
    }, 5000);
  }

  update () {
    this.physics.update();
  }
}
