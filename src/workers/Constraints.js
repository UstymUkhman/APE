import { CONSTRAINT_THRESHOLD } from '@/constants';
import { _Math } from 'three/src/math/Math.js';

export default class Constraints {
  constructor (type, worker) {
    this.type = type;
    this.worker = worker;
    this.worker.postMessage({action: `init${type}Constraints`});
  }

  add (props) {
    const uuid = this._uuid;

    this.worker.postMessage({
      action: 'addConstraint',

      params: {
        type: this.type,
        uuid: uuid,
        ...props
      }
    });

    return uuid;
  }

  setBreakingImpulseThreshold (uuid, threshold = CONSTRAINT_THRESHOLD) {
    this.worker.postMessage({
      action: 'setBreakingImpulseThreshold',

      params: {
        threshold: threshold,
        type: this.type,
        uuid: uuid
      }
    });
  }

  remove (uuid) {
    this.worker.postMessage({
      action: 'removeConstraint',

      params: {
        type: this.type,
        uuid: uuid
      }
    });
  }

  get _uuid () {
    return _Math.generateUUID();
  }
}
