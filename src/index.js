// import CollidedBodies from 'demos/CollidedBodies';
// import ConvexBreak from 'demos/ConvexBreak';
// import RigidBodies from 'demos/RigidBodies';
import SoftBodies from 'demos/SoftBodies';
// import ClothBody from 'demos/ClothBody';
// import Break from 'demos/Break';

window.addEventListener('DOMContentLoaded', () => {
  // const demo = (window.location.hash || '#rigid_bodies').slice(1);

  /* eslint-disable no-new */
  // new CollidedBodies();
  // new RigidBodies();
  // new ConvexBreak();
  new SoftBodies();
  // new ClothBody();
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
