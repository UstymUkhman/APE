import { Vector3 } from 'three/src/math/Vector3';
import Constraint from './Constraint.js';

export default class PointConstraints extends Constraint {
  constructor (worker) {
    super('Point', worker);
  }

  addBody (bodyMesh, position = new Vector3()) {
    return super.add({
      method: 'attachBody',
      body: bodyMesh.uuid,
      position: position
    });
  }

  addBodies (body0, body1, position0 = new Vector3(), position1 = new Vector3()) {
    return super.add({
      method: 'attachBodies',
      position0: position0,
      position1: position1,
      body0: body0.uuid,
      body1: body1.uuid
    });
  }
}
