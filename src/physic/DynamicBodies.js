import RigidBody from 'physic/RigidBody';

export default class DynamicBodies extends RigidBody {
  constructor (physicWorld) {
    super();

    this.bodies = [];
    this.world = physicWorld;
  }

  addBox (mesh, mass) {
    const size = mesh.geometry.parameters;
    const box = super.createBox(size);
    this.addDynamicBody(box, mesh, mass);
  }

  addCylinder (mesh, mass) {
    const size = mesh.geometry.parameters;
    const cylinder = super.createCylinder(size);
    this.addDynamicBody(cylinder, mesh, mass);
  }

  addCapsule (mesh, mass) {
    const size = mesh.geometry.parameters;
    const capsule = super.createCapsule(size);
    this.addDynamicBody(capsule, mesh, mass);
  }

  addCone (mesh, mass) {
    const size = mesh.geometry.parameters;
    const cone = super.createCone(size);
    this.addDynamicBody(cone, mesh, mass);
  }

  addSphere (mesh, mass) {
    const size = mesh.geometry.parameters;
    const sphere = super.createSphere(size);
    this.addDynamicBody(sphere, mesh, mass);
  }

  addDynamicBody (shape, mesh, mass) {
    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, mass, position, quaternion);

    // body.setActivationState(DISABLE_DEACTIVATION);
    mesh.userData.physicsBody = body;
    this.world.addRigidBody(body);
    this.bodies.push(mesh);
  }

  update (transform) {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i].userData.physicsBody;
      const motionState = body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(transform);

        const origin = transform.getOrigin();
        const rotation = transform.getRotation();

        this.bodies[i].position.set(origin.x(), origin.y(), origin.z());
        this.bodies[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    }
  }
}
