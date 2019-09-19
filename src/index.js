// // import CollidedBodies from 'demos/CollidedBodies';
// // import ConvexBreak from 'demos/ConvexBreak';
// import RigidBodies from 'demos/RigidBodies';
// // import SoftBodies from 'demos/SoftBodies';
// // import ClothBody from 'demos/ClothBody';
// // import Break from 'demos/Break';

// window.addEventListener('DOMContentLoaded', () => {
//   // const demo = (window.location.hash || '#rigid_bodies').slice(1);

//   /* eslint-disable no-new */
//   // new CollidedBodies();
//   new RigidBodies();
//   // new ConvexBreak();
//   // new SoftBodies();
//   // new ClothBody();
//   // new Break();
//   /* eslint-enable no-new */
// });

const PhysicsWorker = require('worker-loader?name=../build/worker.js&inline=true!workers/PhysicsWorker.js');

const ConeTwistConstraints = require('@/workers/ConeTwistConstraints').default;
const GenericConstraints = require('@/workers/GenericConstraints').default;
const SliderConstraints = require('@/workers/SliderConstraints').default;
const HingeConstraints = require('@/workers/HingeConstraints').default;
const PointConstraints = require('@/workers/PointConstraints').default;

const KinematicBodies = require('@/workers/KinematicBodies').default;
const DynamicBodies = require('@/workers/DynamicBodies').default;
const StaticBodies = require('@/workers/StaticBodies').default;
const ClothBodies = require('@/workers/ClothBodies').default;
const SoftBodies = require('@/workers/SoftBodies').default;
const RopeBodies = require('@/workers/RopeBodies').default;

const PhysicsRay = require('@/workers/PhysicsRay').default;
const World = require('./workers/PhysicsWorld').default;
const CONSTANTS = require('./constants');

// const GROUPS = { };
const MASKS = { };

for (const constant in CONSTANTS) {
  const value = CONSTANTS[constant];

  // if (!constant.indexOf('GROUP_')) {
  //   GROUPS[constant] = value;
  // }

  if (!constant.indexOf('MASK_')) {
    MASKS[constant] = value;
  }
}

const APE = {
  Physics: function (soft = false, gravity = APE.GRAVITY) {
    APE.__world = new World(soft, gravity, APE.__worker);
    return APE.__world;
  },

  Raycaster: function () {
    const raycaster = new PhysicsRay(APE.__worker);
    APE.__world.setPhysicsRay(raycaster);
    return raycaster;
  },

  ConeTwist: function () {
    return new ConeTwistConstraints(APE.__worker);
  },

  Generic: function () {
    return new GenericConstraints(APE.__worker);
  },

  Slider: function () {
    return new SliderConstraints(APE.__worker);
  },

  Hinge: function () {
    return new HingeConstraints(APE.__worker);
  },

  Point: function () {
    return new PointConstraints(APE.__worker);
  },

  Kinematic: function () {
    const bodies = new KinematicBodies(APE.__worker);
    APE.__world.setBodyType('kinematic', bodies);
    return bodies;
  },

  Dynamic: function () {
    const bodies = new DynamicBodies(APE.__worker);
    APE.__world.setBodyType('dynamic', bodies);
    return bodies;
  },

  Static: function () {
    const bodies = new StaticBodies(APE.__worker);
    APE.__world.setBodyType('static', bodies);
    return bodies;
  },

  Cloth: function () {
    const bodies = new ClothBodies(APE.__worker);
    APE.__world.setBodyType('cloth', bodies);
    return bodies;
  },

  Soft: function () {
    const bodies = new SoftBodies(APE.__worker);
    APE.__world.setBodyType('soft', bodies);
    return bodies;
  },

  Rope: function () {
    const bodies = new RopeBodies(APE.__worker);
    APE.__world.setBodyType('rope', bodies);
    return bodies;
  },

  __worker: new PhysicsWorker(),
  GRAVITY: CONSTANTS.GRAVITY,
  __world: null,
  // ...GROUPS,
  ...MASKS
};

module.exports = APE;
