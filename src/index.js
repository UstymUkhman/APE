import CollidedBodies from 'demos/physics/CollidedBodies';
// import RigidBodies from 'demos/physics/RigidBodies';
// import ConvexBreak from 'demos/physics/ConvexBreak';
// import ClothBody from 'demos/physics/ClothBody';
// import Break from 'demos/physics/Break';
// import Soft from 'demos/physics/Soft';

export default class SWAGE {
  static createStage () {
    return new CollidedBodies();
    // return new RigidBodies();
    // return new ClothBody();
    // return new ConvexBreak();
    // return new Soft();
    // return new Break();
  }
};
