/**
 * RAF - requestAnimationFrame loop class manager
 * Allows to add/udpate/remove functions to/in/from requestAnimationFrame loop
 * It's also possible to remove all functions and stop the main loop
 */

class RAF {
  /**
   * @constructs RAF
   * @description - Initialize main requestAnimationFrame loop and listeners array to call on every frame update
   */
  constructor () {
    this.update = this.update.bind(this);
    this.listeners = [];
    this.frame = null;
    this.length = 0;
    this.update();
  }

  /**
   * @public
   * @description - Add new listener to call every frame
   * @param {function} listener - function to add to requestAnimationFrame loop
   */
  add (listener) {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener);
      this.length++;
    }
  }

  /**
   * @public
   * @description - Update all listeners every frame
   */
  update () {
    for (let l = 0; l < this.length; l++) {
      this.listeners[l]();
    }

    this.frame = requestAnimationFrame(this.update);
  }

  /**
   * @public
   * @description - Remove passed listener from being called every frame
   * @param {function} listener - function to remove from requestAnimationFrame loop
   */
  remove (listener) {
    const index = this.listeners.indexOf(listener);

    if (index > -1) {
      this.listeners.splice(index, 1);
      this.length--;
    }

    if (!this.length) {
      this.cancel();
    }
  }

  /**
   * @public
   * @description - Remove all listeners and stop requestAnimationFrame loop
   */
  cancel () {
    cancelAnimationFrame(this.frame);
    this.listeners = [];
    this.length = 0;
  }
}

export default new RAF();
