import RigidBodies from 'demos/physics/RigidBodies';
// import ClothBody from 'demos/physics/ClothBody';
// import Soft from 'demos/physics/Soft';

export default class SWAGE {
  static createStage () {
    return new RigidBodies();
    // return new ClothBody();
    // return new Soft();
  }
};
