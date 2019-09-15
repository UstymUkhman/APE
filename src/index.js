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

// const MASKS = { };
const GROUPS = { };

Object.keys(CONSTANTS).map((constant, value) => {
  const group = !constant.indexOf('GROUP_');
  if (group) GROUPS[constant] = value;

  // const mask = !constant.indexOf('MASK_');
  // if (mask) MASKS[constant] = value;
});

const APE = {
  Physics: function (soft = false, gravity = APE.GRAVITY) {
    const path = APE.USE_WORKER ? '/workers' : '';
    const World = require(`.${path}/PhysicsWorld`).default;

    return new World(soft, gravity);
  },

  USE_WORKER: true,
  // ...MASKS
  ...GROUPS
};

module.exports = APE;
