import { _Math } from 'three/src/math/Math.js';

export default class Constraint {
  constructor (world, type) {
    this.uuids = [];
    this.type = type;
    this.world = world;
    this.constraints = [];
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
    const index = this.uuids.indexOf(uuid);

    if (index > -1) {
      const constraint = this.constraints[index];
      this.world.removeConstraint(constraint);
      this.constraints.splice(index, 1);
      this.uuids.splice(index, 1);
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
