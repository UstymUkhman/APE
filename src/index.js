// import CollidedBodies from 'demos/collisions/CollidedBodies';
// import ConvexBreak from 'demos/collisions/ConvexBreak';
// import Break from 'demos/collisions/Break';

import ClothBody from 'demos/constraints/ClothBody';
// import RigidBodies from 'demos/bodies/RigidBodies';
// import SoftBodies from 'demos/bodies/SoftBodies';

window.addEventListener('DOMContentLoaded', () => {
  // const demo = (window.location.hash || '#rigid_bodies').slice(1);

  /* eslint-disable no-new */
  // new RigidBodies();
  // new ConvexBreak();
  // new SoftBodies();
  new ClothBody();
  // new Break();

  // switch (demo) {
  //   case 'collided_bodies':
  //     new CollidedBodies();
  //     break;

  //   case 'convex_break':
  //     new ConvexBreak();
  //     break;

  //   case 'rigid_bodies':
  //     new RigidBodies();
  //     break;

  //   case 'cloth_body':
  //     new ClothBody();
  //     break;

  //   case 'soft_bodies':
  //     new SoftBodies();
  //     break;

  //   case 'break':
  //     new Break();
  //     break;
  // }
  /* eslint-enable no-new */
});
