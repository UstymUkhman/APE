// import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from 'core/Ammo';

export default class StaticBodies {
  constructor () {
    this.mass = 0.0;
    this.staticBodies = [];

    /* if (this.body) {
      const velocity = this.body.getLinearVelocity();
      this.linearVelocity = new Vector3(velocity.x(), velocity.y(), velocity.z());
    } */
  }
}
