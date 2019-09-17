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
    // const path = APE.USE_WORKER ? '/workers' : '';
    // const World = require(`.${path}/PhysicsWorld`).default;

    const World = require('./workers/PhysicsWorld').default;
    return new World(soft, gravity);
  },

  // ...GROUPS,
  ...MASKS
};

module.exports = APE;
