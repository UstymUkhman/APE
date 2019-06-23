import CollidedBodies from 'demos/collisions/CollidedBodies';
import ConvexBreak from 'demos/collisions/ConvexBreak';
// import Break from 'demos/collisions/Break';

import RigidBodies from 'demos/bodies/RigidBodies';
// import ClothBody from 'demos/bodies/ClothBody';
// import Soft from 'demos/bodies/Soft';

export default class APE {
  static startDemo (demo) {
    // return new CollidedBodies();
    // return new ConvexBreak();
    // return new Break();

    // return new RigidBodies();
    // return new ClothBody();
    // return new Soft();

    switch (demo) {
      case 'rigid_bodies':
        return new RigidBodies();

      case 'convex_break':
        return new ConvexBreak();
    }

    return new CollidedBodies();
  }
};
