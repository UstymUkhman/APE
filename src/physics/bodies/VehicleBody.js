// Vehicle body class manager

import RigidBody from 'physics/bodies/RigidBody';
import Ammo from 'core/Ammo';

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
} from 'physics/constants';

export default class VehicleBody extends RigidBody {
  /**
   * @extends RigidBody
   * @constructs VehicleBody
   * @description - Initialize vehicle body physics
   * @param {Object} physicWorld - Ammo.js soft/rigid or discrete dynamics world
   * @param {Object} controls - JSON-like player driving controls
   * @param {Boolean} moto - if <true> vehicle will be treated as motorcycle
   */
  constructor (physicWorld, controls, moto) {
    super();

    this.wheels = [];
    this.steering = 0;

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

    if (moto) {
      this._applySpeedForces = this._applyMotoSpeedForces.bind(this);
      this._applySteerForces = this._applyMotoSteerForces.bind(this);
    } else {
      this._applySpeedForces = this._applyCarSpeedForces.bind(this);
      this._applySteerForces = this._applyCarSteerForces.bind(this);
    }
  }

  /**
   * @public
   * @description - Add vehicle chassis collider
   * @param {Object} mesh - THREE.js chassis mesh
   * @param {Number} mass - chassis's mass
   */
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

  /**
   * @public
   * @description - Add vehicle wheel collider
   * @param {Object} mesh - THREE.js wheel mesh
   * @param {Boolean} front - if <true> mesh is treated as front wheel
   */
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

  /**
   * @public
   * @description - Update vehicle body in requestAnimation loop
   */
  update () {
    let transform, position, rotation;

    this._calculateSpeedForces();
    this._calculateSteerForces();

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

  /**
   * @private
   * @description - Calculate vehicle speed in requestAnimation loop
   */
  _calculateSpeedForces () {
    let engine = 0, breaks = 0;

    if (this.controls.accelerator) {
      if (this.speed < -1.0) breaks = this.breakForce;
      else engine = this.engineForce;
    }

    if (this.controls.brake) {
      if (this.speed > 1.0) breaks = this.breakForce;
      else engine = this.engineForce / -2;
    }

    let frontBreaks = breaks * 1.5;

    if (this.controls.handbreak) {
      breaks = this.breakForce * 10.0;
      frontBreaks = 0.0;
      engine = 0.0;
    }

    this._applySpeedForces(engine, frontBreaks, breaks);
  }

  /**
   * @private
   * @description - Set moto speed in requestAnimation loop
   */
  _applyMotoSpeedForces (engine, frontBreaks, breaks) {
    this.vehicle.applyEngineForce(engine, 1);
    this.vehicle.setBrake(frontBreaks, 0);
    this.vehicle.setBrake(breaks, 1);
  }

  /**
   * @private
   * @description - Set car speed in requestAnimation loop
   */
  _applyCarSpeedForces (engine, frontBreaks, breaks) {
    this.vehicle.applyEngineForce(engine, 2);
    this.vehicle.applyEngineForce(engine, 3);

    this.vehicle.setBrake(frontBreaks, 0);
    this.vehicle.setBrake(frontBreaks, 1);
    this.vehicle.setBrake(breaks, 2);
    this.vehicle.setBrake(breaks, 3);
  }

  /**
   * @private
   * @description - Calculate vehicle direction in requestAnimation loop
   */
  _calculateSteerForces () {
    if (this.controls.right && this.steering > -this.steeringClamp) {
      this.steering -= this.steeringStep;
    } else if (this.controls.left && this.steering < this.steeringClamp) {
      this.steering += this.steeringStep;
    } else if (this.steering < -this.steeringStep) {
      this.steering += this.steeringStep;
    } else if (this.steering > this.steeringStep) {
      this.steering -= this.steeringStep;
    } else {
      this.steering = 0.0;
    }

    this._applySteerForces();
  }

  /**
   * @private
   * @description - Set moto direction in requestAnimation loop
   */
  _applyMotoSteerForces () {
    this.vehicle.setSteeringValue(this.steering, 0);
  }

  /**
   * @private
   * @description - Set car direction in requestAnimation loop
   */
  _applyCarSteerForces () {
    this.vehicle.setSteeringValue(this.steering, 0);
    this.vehicle.setSteeringValue(this.steering, 1);
  }

  /**
   * @public
   * @description - Get current vehicle speed in kilometers per hour
   * @returns {Number}
   */
  get speed () {
    return this.vehicle.getCurrentSpeedKmHour();
  }

  /**
   * @public
   * @description - Get number of wheels attached to vehicle
   * @returns {Number}
   */
  get wheelsNumber () {
    return this.vehicle.getNumWheels();
  }
}
