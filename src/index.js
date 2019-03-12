// import PlayGround from 'demos/PlayGround';
// import RigidBodies from 'demos/physics/RigidBodies';
import Soft from 'demos/physics/Soft';

export default class SWAGE {
  static createStage () {
    // return new PlayGround();
    // return new RigidBodies();
    return new Soft();
  }
};
