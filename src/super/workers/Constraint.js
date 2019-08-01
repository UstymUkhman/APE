import { _Math } from 'three/src/math/Math.js';

export default class Constraint {
  constructor (type, worker) {
    this.uuids = [];
    this.worker = worker;
    this._constraints = 0;

    this.type = type.toLowerCase();
    this.worker.postMessage({action: `init${type}Constraints`});
  }

  add (props) {
    this.worker.postMessage({
      action: 'addConstraint',

      params: {
        type: this.type,
        ...props
      }
    });

    return this._uuid;
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
    const uuid = _Math.generateUUID();
    this.uuids.push(uuid);
    return uuid;
  }
}
