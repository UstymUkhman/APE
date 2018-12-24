// requestAnimationFrame Manager

class RAF {
  /*
   * Create RAF Manager on import
   */
  constructor() {
    this.update = this.update.bind(this);
    this.listeners = [];
    this.frame = null;
    this.update();
  }

  /*
   * Add new function to call every frame
   */
  add(listener) {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener);
    }
  }

  /*
   * Update all functions every frame
   */
  update() {
    this.listeners.forEach((listener) => { listener(); });
    this.frame = requestAnimationFrame(this.update);
  }

  /*
   * Remove passed function from being called every frame
   */
  remove(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) this.listeners.splice(index, 1);
    if (!this.listeners.length) this.cancel();
  }

  /*
   * Remove all functions and stop requestAnimationFrame loop
   */
  cancel() {
    cancelAnimationFrame(this.frame);
    this.listeners = [];
  }
}

// Export RAF Manager so it's already initialized
export default new RAF();
