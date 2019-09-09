import Constraints from '@/super/workers/Constraints';
import { Vector3 } from 'three/src/math/Vector3';
import { HINGE_FORCE } from '@/constants';

export default class HingeConstraints extends Constraints {
  constructor (worker) {
    super('Hinge', worker);
    this.constants = { force: HINGE_FORCE };
  }

  addBody (bodyMesh, axis, pivot = new Vector3()) {
    return super.add({
      method: 'hingeBody',
      body: bodyMesh.uuid,
      pivot: pivot,
      axis: axis
    });
  }

  addBodies (pinMesh, armMesh, axis, pinPivot = new Vector3(), armPivot = new Vector3()) {
    return super.add({
      method: 'hingeBodies',
      pinPivot: pinPivot,
      armPivot: armPivot,
      pin: pinMesh.uuid,
      arm: armMesh.uuid,
      axis: axis
    });
  }

  update (uuid, direction) {
    const index = this.uuids.indexOf(uuid);

    if (index > -1) {
      this.worker.postMessage({
        action: 'updateConstraints',

        params: {
          direction: direction,
          type: this.type,
          index: index
        }
      });
    } else {
      console.warn(
        `There\'s no \'${this.type}\' constraint with \'${uuid}\' UUID.`
      );
    }
  }
}
