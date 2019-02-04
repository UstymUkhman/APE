// Physics bodies class manager

import PhysicsWorker from 'worker-loader!workers/PhysicsWorker.js';

// import KinematicBodies from 'physics/bodies/KinematicBodies';
// import DynamicBodies from 'physics/bodies/DynamicBodies';
import StaticBodies from 'physics/bodies/StaticBodies';
// import HingeBodies from 'physics/bodies/HingeBodies';
// import VehicleBody from 'physics/bodies/VehicleBody';

// import ClothBodies from 'physics/bodies/ClothBodies';
// import SoftBodies from 'physics/bodies/SoftBodies';
// import RopeBodies from 'physics/bodies/RopeBodies';

// import { Clock } from 'three/src/core/Clock';
import find from 'lodash/find';

export default class PhysicsWorld {
  /**
   * @constructs PhysicWorld
   * @description - Initialize physics for soft and rigid bodies
   * @param {bool} soft - if <true> creates soft/rigid dynamics world or discrete dynamics world otherwise
   */
  constructor (soft = false) {
    // this.clock = new Clock();
    this.bodies = [];
    this.worker = new PhysicsWorker();

    this._onMessage = this.onWorkerMessage.bind(this);
    this.worker.addEventListener('message', this._onMessage);

    this.worker.postMessage({
      action: 'init',
      params: [soft]
    });

    // this.soft = new SoftBodies();
    // this.rope = new RopeBodies();
    // this.cloth = new ClothBodies();

    // this.hinge = new HingeBodies();
    this.static = new StaticBodies(this.worker);
    // this.dynamic = new DynamicBodies();
    // this.kinematic = new KinematicBodies();
  }

  onWorkerMessage (event) {
    const action = event.data.action;
    this[action].call(this, event.data);
  }

  addBody (data) {
    const bodies = this[data.type].bodies;
    const mesh = find(bodies, { uuid: data.uuid });
    mesh.userData.physicsBody = data.body;
    console.log(mesh);

    // this.bodies.push({
    //   type: data.type,
    //   uuid: data.uuid,
    //   body: data.body
    // });
  }

  /**
   * @public
   * @description - Initialize and adds a vehicle body
   * @param {Object} mesh - vehicle chassis mesh
   * @param {number} mass - vehicle mass
   * @param {Object} controls - JSON-like vehicle controls
   * @param {Boolean} moto - if <true> vehicle will be treated as motorcycle
   * @returns {Object} - vehicle body
   */
  // addVehicle (mesh, mass, controls, moto = false) {
  //   const vehicle = new VehicleBody(this.world, controls, moto);
  //   vehicle.addChassis(mesh, mass);
  //   this.vehicles.push(vehicle);
  //   return vehicle;
  // }

  /**
   * @public
   * @description - Update physics world and bodies in requestAnimation loop
   */
  // update () {
  //   for (let i = 0; i < this.vehicles.length; i++) {
  //     this.vehicles[i].update();
  //   }

  //   this.kinematic.update(this.transform);
  //   this.dynamic.update(this.transform);

  //   const delta = this.clock.getDelta();
  //   this.world.stepSimulation(delta, 10);

  //   if (this.softWorld) {
  //     this.cloth.update();
  //     this.soft.update();
  //     this.rope.update();
  //   }
  // }
}
