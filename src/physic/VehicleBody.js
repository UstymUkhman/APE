import RigidBody from 'physic/RigidBody';
import { Ammo } from 'core/Ammo';

import {
  BREAK_FORCE,
  ENGINE_FORCE,
  FRICTION_SLIP,
  STEERING_STEP,
  STEERING_CLAMP,
  ROLL_INFLUENCE,
  SUSPENSION_REST,
  SUSPENSION_DAMPING,
  DISABLE_DEACTIVATION,
  SUSPENSION_STIFFNESS,
  SUSPENSION_COMPRESSION
} from 'physic/constants';

export default class VehicleBody extends RigidBody {
  constructor (physicWorld) {
    super();

    this.wheels = [];
    this.steering = 0;
    this.vehicle = null;
    this.world = physicWorld;

    this.breakForce = BREAK_FORCE;
    this.engineForce = ENGINE_FORCE;
    this.steeringStep = STEERING_STEP;
    this.steeringClamp = STEERING_CLAMP;

    this.frictionSlip = FRICTION_SLIP;
    this.rollInfluence = ROLL_INFLUENCE;
    this.suspensionRest = SUSPENSION_REST;
    this.suspensionDamping = SUSPENSION_DAMPING;
    this.suspensionStiffness = SUSPENSION_STIFFNESS;
    this.suspensionCompression = SUSPENSION_COMPRESSION;

    /* eslint-disable new-cap */
    this.vehicleTuning = new Ammo.btVehicleTuning();
    this.wheelAxis = new Ammo.btVector3(-1.0, 0.0, 0.0);
    this.wheelDirection = new Ammo.btVector3(0.0, -1.0, 0.0);
    /* eslint-enable new-cap */
  }

  addVehicle (mesh, mass) {
    const size = mesh.geometry.parameters;
    const shape = super.createBox(size);

    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, mass, position, quaternion);

    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body);

    /* eslint-disable new-cap */
    const vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(this.world);
    const vehicle = new Ammo.btRaycastVehicle(this.vehicleTuning, body, vehicleRaycaster);
    /* eslint-enable new-cap */

    vehicle.setCoordinateSystem(0, 1, 2);
    this.world.addAction(vehicle);

    this.vehicle = vehicle;
    this.chassis = mesh;
  }

  setWheel (wheelPosition, wheelRadius, front) {
    const wheel = this.vehicle.addWheel(
      wheelPosition, this.wheelDirection, this.wheelAxis,
      this.suspensionRest, wheelRadius, this.vehicleTuning, front
    );

    wheel.set_m_wheelsDampingCompression(this.suspensionCompression);
    wheel.set_m_wheelsDampingRelaxation(this.suspensionDamping);
    wheel.set_m_suspensionStiffness(this.suspensionStiffness);
    wheel.set_m_rollInfluence(this.rollInfluence);
    wheel.set_m_frictionSlip(this.frictionSlip);
  }

  // For 4 wheels
  addWheel (mesh, index) {
    const front = index < 2;
    const z = front ? 1.7 : -1;
    const width = mesh.geometry.parameters.radiusTop;
    const x = (index === 1 || index === 2) ? -1.0 : 1.0;

    /* eslint-disable new-cap */
    this.setWheel(new Ammo.btVector3(x, 0.3, z), width, front);
    /* eslint-enable new-cap */
    this.wheels.push(mesh);
  }

  // steer () {
  // }

  update (car) {
    let engineForce = 0;
    let breakingForce = 0;

    if (car.accelerator) {
      if (this.speed < -1.0) breakingForce = this.breakForce;
      else engineForce = this.engineForce;
    }

    if (car.brake) {
      if (this.speed > 1.0) breakingForce = this.breakForce;
      else engineForce = this.engineForce / -2;
    }

    if (car.left && this.steering < this.steeringClamp) {
      this.steering += this.steeringStep;
    } else if (car.right && this.steering > -this.steeringClamp) {
      this.steering -= this.steeringStep;
    } else {
      if (this.steering < -this.steeringStep) {
        this.steering += this.steeringStep;
      } else {
        if (this.steering > this.steeringStep) {
          this.steering -= this.steeringStep;
        } else {
          this.steering = 0;
        }
      }
    }

    this.vehicle.applyEngineForce(engineForce, 2); // Back Left
    this.vehicle.applyEngineForce(engineForce, 3); // Back Right

    this.vehicle.setBrake(breakingForce / 2, 0); // Front Left
    this.vehicle.setBrake(breakingForce / 2, 1); // Front Right
    this.vehicle.setBrake(breakingForce, 2); // Back Left
    this.vehicle.setBrake(breakingForce, 3); // Back Right

    this.vehicle.setSteeringValue(this.steering, 0); // Front Left
    this.vehicle.setSteeringValue(this.steering, 1); // Front Right

    let transform, position, rotation;
    const wheels = this.vehicle.getNumWheels(); // this.wheels.length

    for (let i = 0; i < wheels; i++) {
      this.vehicle.updateWheelTransform(i, true);
      transform = this.vehicle.getWheelTransformWS(i);

      position = transform.getOrigin();
      rotation = transform.getRotation();

      this.wheels[i].position.set(position.x(), position.y(), position.z());
      this.wheels[i].quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }

    transform = this.vehicle.getChassisWorldTransform();

    position = transform.getOrigin();
    rotation = transform.getRotation();

    this.chassis.position.set(position.x(), position.y(), position.z());
    this.chassis.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
  }

  get speed () {
    return this.vehicle.getCurrentSpeedKmHour();
  }
}
