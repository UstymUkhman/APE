import { _Math } from 'three/src/math/Math.js';

export default class Constraint {
  constructor (type, worker) {
    this.uuids = [];
    this.worker = worker;
    this._constraints = 0;

    this.type = type.charAt(0).toLowerCase() + type.slice(1);
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
    const index = this.uuids.indexOf(uuid);

    if (index > -1) {
      this.worker.postMessage({
        action: 'removeConstraint',

        params: {
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

  get _uuid () {
    const uuid = _Math.generateUUID();
    this.uuids.push(uuid);
    return uuid;
  }
}
