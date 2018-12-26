import Swage from 'Swage';
// import Ammo from 'ammo.js';

import PointerLock from 'managers/PointerLock';

export default class SWAGE {
  static init () {
    const container = document.getElementById('container');
    this.pointer = new PointerLock(container, () => {
      console.log('========= Pointer Locked');
    }, () => {
      console.log('========= Pointer Unlocked');
    });

    container.addEventListener('click', this.pointer.togglePointerLock);
    return new Swage();
  }
};
