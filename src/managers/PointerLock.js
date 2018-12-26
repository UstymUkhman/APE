// PointerLock API Manager

import Platform from 'utils/PlatformDetector';
import Logger from 'utils/Logger';

export default class PointerLock {
  constructor (container) {
    this.container = container;
    this.init();
  }

  /*
   * Unify PointerLock API
   */
  init () {
    const requestPointerLock =
      this.container.requestPointerLock ||
      this.container.mozRequestPointerLock ||
      this.container.webkitRequestPointerLock;

    document.exitPointerLock =
      document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

    if (requestPointerLock) {
      this._onPointerLockChange = this.onPointerLockChange.bind(this);
      this._onPointerLockError = this.onPointerLockError.bind(this);
      this.lockPointer = this.onPointerLock.bind(this);

      this.container.requestPointerLock = requestPointerLock;
      this.addPointerLockListeners();
    } else {
      Logger.error(
        'This browser does not support PointerLock API:',
        'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API#Browser_compatibility'
      );
    }
  }

  /*
   * Add PointerLockChange & PointerLockError events listeners
   */
  addPointerLockListeners () {
    document.addEventListener('pointerlockchange', this._onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', this._onPointerLockChange, false);

    document.addEventListener('pointerlockerror', this._onPointerLockError, false);
    document.addEventListener('mozpointerlockerror', this._onPointerLockError, false);
    document.addEventListener('webkitpointerlockerror', this._onPointerLockError, false);
  }

  /*
   * Remove PointerLockChange & PointerLockError event listeners
   */
  removePointerLockListeners () {
    document.removeEventListener('pointerlockchange', this._onPointerLockChange, false);
    document.removeEventListener('mozpointerlockchange', this._onPointerLockChange, false);

    document.removeEventListener('pointerlockerror', this._onPointerLockError, false);
    document.removeEventListener('mozpointerlockerror', this._onPointerLockError, false);
    document.removeEventListener('webkitpointerlockerror', this._onPointerLockError, false);
  }

  onPointerLock () {
    this.container.requestPointerLock();
  }

  /*
   * Handle PointerLockChange event
   */
  onPointerLockChange (event) {
    // console.log('change', this, this.container);
    console.log('pointerlockchange', document.pointerLockElement, document.mozPointerLockElement);
  }

  /*
   * Handle PointerLockError event
   */
  onPointerLockError (event) {
    Logger.error('PointerLock API: Error occured on element:', this.container);
  }

  /*
   * Check if mouse pointer is currently locked
   * @returns {boolean}
   */
  isLocked () {
    const lockElement = document.pointerLockElement || document.mozPointerLockElement;
    return this.container === lockElement;
  }

  /*
   * Check if bowser can handle Fullscreen API
   * and PointerLock API in single event
   * @returns {boolean}
   */
  static isLockOnly () {
    return Platform.safari || Platform.edge || Platform.firefox;
  }
}
