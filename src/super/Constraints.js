import { _Math } from 'three/src/math/Math.js';
import { webWorker } from '@/utils';

export default class Constraints {
  constructor (world, type) {
    this.uuids = [];
    this.type = type;
    this.world = world;
    this.constraints = [];
    this.worker = webWorker();
  }

  add (constraint) {
    this.world.addConstraint(constraint, true);
    this.constraints.push(constraint);
    constraint.enableFeedback();
  }

  activateAll () {
    for (let c = 0, length = this.constraints.length; c < length; c++) {
      const constraint = this.constraints[c];

      this.world.removeConstraint(constraint);
      this.world.addConstraint(constraint);
      constraint.activate();
    }
  }

  remove (uuid) {
    const id = this.worker ? uuid : this.uuids.indexOf(uuid);

    if (id > -1) {
      if (!this.worker) this.uuids.splice(id, 1);
      const constraint = this.constraints[id];

      this.world.removeConstraint(constraint);
      this.constraints.splice(id, 1);
      return true;
    }

    return false;
  }

  getConstraintByUUID (uuid) {
    const index = this.uuids.indexOf(uuid);
    return index > -1 ? this.constraints[index] : null;
  }

  get _uuid () {
    const uuid = _Math.generateUUID();
    this.uuids.push(uuid);
    return uuid;
  }
}
