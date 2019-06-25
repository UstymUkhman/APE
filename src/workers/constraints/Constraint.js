export default class Constraint {
  constructor (world, type) {
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

  remove (index) {
    const constraint = this.constraints[index];
    if (!constraint) return false;

    this.world.removeConstraint(constraint);
    this.constraints[index] = null;
    return true;
  }

  getConstraint (index) {
    return this.constraints[index] || null;
  }
}
