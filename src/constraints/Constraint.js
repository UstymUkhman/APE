export default class Constraint {
  constructor (world, type) {
    this.type = type;
    this.world = world;
    this.constraints = [];
  }
}
