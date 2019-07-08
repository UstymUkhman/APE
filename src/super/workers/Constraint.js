export default class Constraint {
  constructor (type, worker) {
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

    return this._constraints++;
  }

  remove (index) {
    this.worker.postMessage({
      action: 'removeConstraint',

      params: {
        type: this.type,
        index: index
      }
    });
  }
}
