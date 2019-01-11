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
  constructor (physicWorld, controls) {
    super();

    this.wheels = [];
    this.steering = 0;
    this.controls = [];

    this.world = physicWorld;
    this.controls = controls;

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

  addChassis (mesh, mass) {
    const size = mesh.geometry.parameters;
    const shape = super.createBox(size);

    const position = mesh.position;
    const quaternion = mesh.quaternion;
    const body = super.createRigidBody(shape, mass, position, quaternion);

    body.setActivationState(DISABLE_DEACTIVATION);
    this.world.addRigidBody(body);

    /* eslint-disable new-cap */
    const vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(this.world);
    this.vehicle = new Ammo.btRaycastVehicle(this.vehicleTuning, body, vehicleRaycaster);
    /* eslint-enable new-cap */

    this.vehicle.setCoordinateSystem(0, 1, 2);
    this.world.addAction(this.vehicle);
    this.chassis = mesh;
  }

  addWheel (mesh, front) {
    const position = mesh.position;
    const radius = mesh.geometry.parameters.radiusTop;

    /* eslint-disable new-cap */
    const wheel = this.vehicle.addWheel(
      new Ammo.btVector3(position.x, position.y, position.z), this.wheelDirection,
      this.wheelAxis, this.suspensionRest, radius, this.vehicleTuning, front
    );
    /* eslint-enable new-cap */

    wheel.set_m_wheelsDampingCompression(this.suspensionCompression);
    wheel.set_m_wheelsDampingRelaxation(this.suspensionDamping);
    wheel.set_m_suspensionStiffness(this.suspensionStiffness);
    wheel.set_m_rollInfluence(this.rollInfluence);
    wheel.set_m_frictionSlip(this.frictionSlip);

    this.wheels.push(mesh);
  }

  update () {
    let engine = 0, breaks = 0;
    let transform, position, rotation;

    if (this.controls.accelerator) {
      if (this.speed < -1.0) breaks = this.breakForce;
      else engine = this.engineForce;
    }

    if (this.controls.brake) {
      if (this.speed > 1.0) breaks = this.breakForce;
      else engine = this.engineForce / -2;
    }

    if (this.controls.left && this.steering < this.steeringClamp) {
      this.steering += this.steeringStep;
    } else if (this.controls.right && this.steering > -this.steeringClamp) {
      this.steering -= this.steeringStep;
    } else {
      if (this.steering < -this.steeringStep) {
        this.steering += this.steeringStep;
      } else {
        if (this.steering > this.steeringStep) {
          this.steering -= this.steeringStep;
        } else {
          this.steering = 0.0;
        }
      }
    }

    this.applyControlForces(engine, breaks);

    for (let i = 0; i < this.wheels.length; i++) {
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

  applyControlForces (engine, breaks) {
    if (this.wheels.length === 4) {
      const frontBreaks = breaks * 1.5;

      this.vehicle.setSteeringValue(this.steering, 0);
      this.vehicle.setSteeringValue(this.steering, 1);

      this.vehicle.applyEngineForce(engine, 2);
      this.vehicle.applyEngineForce(engine, 3);

      this.vehicle.setBrake(frontBreaks, 0);
      this.vehicle.setBrake(frontBreaks, 1);
      this.vehicle.setBrake(breaks, 2);
      this.vehicle.setBrake(breaks, 3);
    } else if (this.wheels.length === 2) {
      this.vehicle.setSteeringValue(this.steering, 0);
      this.vehicle.applyEngineForce(engine, 1);

      this.vehicle.setBrake(breaks / 2, 0);
      this.vehicle.setBrake(breaks, 1);
    }
  }

  get speed () {
    return this.vehicle.getCurrentSpeedKmHour();
  }

  /* get wheels () {
    return this.vehicle.getNumWheels();
  } */
}
