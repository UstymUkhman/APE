import Constraints from '@/super/workers/Constraints';
import { Vector3 } from 'three/src/math/Vector3';

export default class ConeTwistConstraints extends Constraints {
  constructor (worker) {
    super('ConeTwist', worker);
  }

  addBodies (body0, body1, axis0, axis1, position0 = new Vector3(), position1 = new Vector3()) {
    return super.add({
      method: 'attachBodies',
      position0: position0,
      position1: position1,
      body0: body0.uuid,
      body1: body1.uuid,
      axis0: axis0,
      axis1: axis1
    });
  }
}
