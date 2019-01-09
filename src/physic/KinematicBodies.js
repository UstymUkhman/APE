import { KINEMATIC_COLLISION, DISABLE_DEACTIVATION } from './constants';
import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from 'core/Ammo';

export default class KinematicBodies {
  constructor () {
    this.mass = 0.0;
    this.kinematicBodies = [];
    this.ammoQuat = new Ammo.btQuaternion();

    this.displacement = new Vector3(0.0, 0.0, 0.0);
    this.linearVelocity = new Vector3(0.0, 0.0, 0.0);
    this.angularVelocity = new Vector3(0.0, 0.0, 0.0);
  }

  createBody () {
    // ...
    // body.setCollisionFlags(body.getCollisionFlags() | KINEMATIC_COLLISION);
    // body.setActivationState(DISABLE_DEACTIVATION);
  }

  update () {
    // for (let i = 0; i < this.rigidBodies.length; i++) {
    //   const body = this.rigidBodies[i].userData.physicsBody;
    //   const motion = body.getMotionState();

    //   if (motion) {
    //     motion.getWorldTransform(this.transform);

    //     const origin = this.transform.getOrigin();
    //     const rotation = this.transform.getRotation();

    //     this.rigidBodies[i].position.set(origin.x(), origin.y(), origin.z());
    //     this.rigidBodies[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    //   }
    // }

    // var body = this.body;

    // if (body) {
    //     var pos = THREEMesh.getPosition();
    //     var rot = THREEMesh.getRotation();

    //     var transform = body.getWorldTransform();
    //     transform.getOrigin().setValue(pos.x, pos.y, pos.z);

    //     this.ammoQuat.setValue(rot.x, rot.y, rot.z, rot.w);
    //     transform.setRotation(this.ammoQuat);

    //     // update the motion state for kinematic bodies
    //     if (this.isKinematic()) {
    //         var motionState = this.body.getMotionState();
    //         if (motionState) {
    //             motionState.setWorldTransform(transform);
    //         }
    //     }

    //     body.activate();
    // }
  }

  // Call every frame:
  // _updateKinematic (dt) {
  //     this.displacement.copy(this.linearVelocity).scale(dt);
  //     this.entity.translate(this.displacement);

  //     this.displacement.copy(this.angularVelocity).scale(dt);
  //     this.entity.rotate(this.displacement.x, this.displacement.y, this.displacement.z);
      
  //     if (this.body.getMotionState()) {
  //         var pos = this.entity.getPosition();
  //         var rot = this.entity.getRotation();

  //         ammoTransform.getOrigin().setValue(pos.x, pos.y, pos.z);
  //         ammoQuat.setValue(rot.x, rot.y, rot.z, rot.w);
  //         ammoTransform.setRotation(ammoQuat);
  //         this.body.getMotionState().setWorldTransform(ammoTransform);
  //     }
  // }
}
