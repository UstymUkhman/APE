// PointerLock API manager

import Platform from 'utils/PlatformDetector';
import Logger from 'utils/Logger';

export default class PointerLock {
  /**
   * @constructs PointerLock
   * @description - Initialize PointerLock API manager class
   * @param {DOM Element} container - which locks mouse pointer
   * @param {function} [onLocked] - callback when the pointer is locked
   * @param {function} [onExit] - callback when the pointer is unlocked
   */
  constructor (container, onLocked = null, onExit = null) {
    this._container = container;
    this._onLock = onLocked;
    this._onExit = onExit;
    this._init();
  }

  /**
   * @private
   * @description - Unify PointerLock APIs if supported
   */
  _init () {
    const requestPointerLock =
      this._container.requestPointerLock ||
      this._container.mozRequestPointerLock ||
      this._container.webkitRequestPointerLock;

    document.exitPointerLock =
      document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

    if (requestPointerLock) {
      this.__onPointerLockChange = this._onPointerLockChange.bind(this);
      this.__onPointerLockError = this._onPointerLockError.bind(this);
      this.togglePointerLock = this._onPointerLockToggle.bind(this);

      this._container.requestPointerLock = requestPointerLock;
      this.addPointerLockListeners();
    } else {
      Logger.error(
        'This browser does not support PointerLock API:',
        'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API#Browser_compatibility'
      );
    }
  }

  /**
   * @private
   * @description - Add PointerLockChange & PointerLockError event listeners
   */
  addPointerLockListeners () {
    document.addEventListener('pointerlockchange', this.__onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', this.__onPointerLockChange, false);

    document.addEventListener('pointerlockerror', this.__onPointerLockError, false);
    document.addEventListener('mozpointerlockerror', this.__onPointerLockError, false);
    document.addEventListener('webkitpointerlockerror', this.__onPointerLockError, false);
  }

  /**
   * @private
   * @description - Remove PointerLockChange & PointerLockError event listeners
   */
  removePointerLockListeners () {
    document.removeEventListener('pointerlockchange', this.__onPointerLockChange, false);
    document.removeEventListener('mozpointerlockchange', this.__onPointerLockChange, false);

    document.removeEventListener('pointerlockerror', this.__onPointerLockError, false);
    document.removeEventListener('mozpointerlockerror', this.__onPointerLockError, false);
    document.removeEventListener('webkitpointerlockerror', this.__onPointerLockError, false);
  }

  /**
   * @private
   * @public [togglePointerLock]
   * @description - Call requestPointerLock and exitPointerLock events
   */
  _onPointerLockToggle () {
    if (!this.isLocked()) {
      this._container.requestPointerLock();
    } else {
      document.exitPointerLock();
    }
  }

  /**
   * @private
   * @description - Handle PointerLockChange event callbacks
   */
  _onPointerLockChange (event) {
    const isLocked = this.isLocked();
    Logger.info(`PointerLock API: mouse cursor is ${isLocked ? 'locked' : 'unlocked'}.`);

    if (isLocked && this._onLock) {
      this._onLock();
    } else if (this._onExit) {
      this._onExit();
    }
  }

  /**
   * @private
   * @description - Handle PointerLockError event callback
   */
  _onPointerLockError (event) {
    Logger.error('PointerLock API: Error occured on element:', this._container);
  }

  /**
   * @public
   * @description - Check if mouse pointer is currently locked
   * @returns {boolean}
   */
  isLocked () {
    return !!document.pointerLockElement || !!document.mozPointerLockElement;
  }

  /**
   * @public
   * @description - Remove all event listeners and destroy all references
   */
  destroy () {
    this.removePointerLockListeners();
    this._container = null;
    this._onLock = null;
    this._onExit = null;
  }

  /**
   * @static
   * @description - Check if bowser can handle Fullscreen API
   *                and PointerLock API events at once time
   * @returns {boolean}
   */
  static get isLockOnly () {
    return Platform.safari || Platform.edge || Platform.firefox;
  }
}
