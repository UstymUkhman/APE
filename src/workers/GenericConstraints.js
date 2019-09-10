import { Vector3 } from 'three/src/math/Vector3';
import Constraints from '@/workers/Constraints';

export default class GenericConstraints extends Constraints {
  constructor (worker) {
    super('Generic', worker);
  }

  addBody (bodyMesh, axis, position = new Vector3()) {
    return super.add({
      method: 'attachBody',
      body: bodyMesh.uuid,
      position: position,
      axis: axis
    });
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
