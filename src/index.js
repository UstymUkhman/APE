import Swage from 'Swage';
// import Ammo from 'ammo.js';

import PointerLock from 'managers/PointerLock';

export default class SWAGE {
  static init () {
    const container = document.getElementById('container');
    this.pointer = new PointerLock(container, this.onChange.bind(this));
    container.addEventListener('click', this.pointer.lockPointer);

    // lock.onPointerLockChange

    // console.log(PointerLock.isLockOnly());
    return new Swage();
  }

  static onChange () {
    console.log('Pointer Lock Change', this.pointer.isLocked);
  }
};
