import { CONSTRAINT_THRESHOLD } from '@/constants';
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
    const id = this.uuids.indexOf(uuid);

    if (id > -1) {
      const constraint = this.constraints[id];
      this.world.removeConstraint(constraint);

      this.constraints.splice(id, 1);
      this.uuids.splice(id, 1);
      return true;
    }

    console.warn(`There\'s no \'${this.type}\' constraint with \'${uuid}\' UUID.`);
    return false;
  }

  getConstraintByUUID (uuid) {
    const index = this.uuids.indexOf(uuid);
    if (index > -1) return this.constraints[index];

    console.warn(`There\'s no \'${this.type}\' constraint with \'${uuid}\' UUID.`);
    return null;
  }

  setBreakingImpulseThreshold (uuid, threshold = CONSTRAINT_THRESHOLD) {
    const constraint = this.getConstraintByUUID(uuid);
    constraint.setBreakingImpulseThreshold(threshold);
  }

  get _uuid () {
    const uuid = _Math.generateUUID();
    this.uuids.push(uuid);
    return uuid;
  }
}
