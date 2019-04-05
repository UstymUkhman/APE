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
  }

  initPhysics () {
    this.physics = new PhysicsWorld();
    this.physics.static.friction = 5.0;
    this.physics.static.addBox(this.ground);

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
  }

  createMeshDebris (mesh, mass) {
    this.physics.dynamic.addConvex(mesh, mass);
    this.scene.add(mesh);

    // var btVecUserData = new Ammo.btVector3(0, 0, 0);
    // btVecUserData.threeObject = mesh;
    // body.setUserPointer(btVecUserData);
  }
}
