// Fullscreen API manager

import PointerLock from 'managers/PointerLock';
import Logger from 'utils/Logger';

export default class Fullscreen {
  /*
   * @constructs Fullscreen
   * @description - Initialize Fullscreen API manager class
   * @param {DOM Element} container - element that goes in fullscreen
   * @param {function} [onEnter] - callback when enter fullscreen
   * @param {function} [onExit] - callback when exit fullscreen
   * @param {boolean} [lock] - use PointerLock APIs when enter|exit fullscreen
   */
  constructor (container, onEnter = null, onExit = null, lock = true) {
    this._container = container;
    this._onEnter = onEnter;
    this._onExit = onExit;
    this._lock = lock;
    this._init();
  }

  /**
   * @private
   * @description - Unify Fullscreen APIs if supported
   */
  _init () {
    const requestFullscreen =
      this._container.requestFullscreen ||
      this._container.msRequestFullscreen ||
      this._container.mozRequestFullScreen ||
      this._container.webkitRequestFullscreen;

    document.exitFullscreen =
      document.exitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitCancelFullScreen;

    if (requestFullscreen) {
      if (this._lock && this._handlePointerLockEvent()) {
        this.toggleFullscreen = this._pointer.togglePointerLock.bind(this);
        return;
      }

      this.__onFullscreenChange = this._onFullscreenChange.bind(this);
      this.__onFullscreenError = this._onFullscreenError.bind(this);
      this.toggleFullscreen = this._onToggleFullscreen.bind(this);

      this._container.requestFullscreen = requestFullscreen;
      this._addFullscreenListeners();
    } else {
      Logger.error(
        'This browser does not support Fullscreen API:',
        'https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API#Browser_compatibility'
      );
    }
  }

  /**
   * @private
   * @description - Call requestPointerLock and exitPointerLock events on requestFullscreen
   *                and exitFullscreen if possible, otherwise use only PointerLock APIs
   * @returns {boolean} - <true> if browser supports one event at a time
   */
  _handlePointerLockEvent () {
    const lockOnly = PointerLock.isLockOnly;

    if (lockOnly) {
      this._pointer = new PointerLock(this._container, this._onEnter, this._onExit);

      Logger.warn(
        'This browser can\'t handle both Fullscreen and PointerLock on single event.',
        'You should call separately `toggleFullscreen` and `togglePointerLock` or use only PointerLock Manager.'
      );
    } else {
      this._pointer = new PointerLock(this._container);
    }

    return lockOnly;
  }

  /**
   * @private
   * @description - Add FullscreenChange & FullscreenError event listeners
   */
  _addFullscreenListeners () {
    document.addEventListener('webkitfullscreenchange', this.__onFullscreenChange, false);
    document.addEventListener('mozfullscreenchange', this.__onFullscreenChange, false);
    document.addEventListener('msfullscreenchange', this.__onFullscreenChange, false);
    document.addEventListener('fullscreenchange', this.__onFullscreenChange, false);

    document.addEventListener('webkitfullscreenerror', this.__onFullscreenError, false);
    document.addEventListener('mozfullscreenerror', this.__onFullscreenError, false);
    document.addEventListener('msfullscreenerror', this.__onFullscreenError, false);
    document.addEventListener('fullscreenerror', this.__onFullscreenError, false);
  }

  /**
   * @private
   * @description - Remove FullscreenChange & FullscreenError event listeners
   */
  _removeFullscreenListeners () {
    document.removeEventListener('webkitfullscreenchange', this.__onFullscreenChange, false);
    document.removeEventListener('mozfullscreenchange', this.__onFullscreenChange, false);
    document.removeEventListener('msfullscreenchange', this.__onFullscreenChange, false);
    document.removeEventListener('fullscreenchange', this.__onFullscreenChange, false);

    document.removeEventListener('webkitfullscreenerror', this.__onFullscreenError, false);
    document.removeEventListener('mozfullscreenerror', this.__onFullscreenError, false);
    document.removeEventListener('msfullscreenerror', this.__onFullscreenError, false);
    document.removeEventListener('fullscreenerror', this.__onFullscreenError, false);

    // Destroy PointerLock event listeners if its APIs were used:
    if (this._pointer) this._pointer.destroy();
  }

  /**
   * @private
   * @public [toggleFullscreen]
   * @description - Call requestFullscreen and exitFullscreen functions
   */
  _onToggleFullscreen () {
    if (!this.isFullscreen()) {
      this._container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

    if (this._lock) {
      this._pointer.onPointerLock();
    }
  }

  /**
   * @private
   * @description - Handle FullscreenChange event callbacks
   * @param {Object} event
   */
  _onFullscreenChange (event) {
    const isFullscreen = this.isFullscreen();
    Logger.info(`Fullscreen API: ${isFullscreen ? 'entered in' : 'exited from'} fullscreen mode.`);

    if (isFullscreen && this._onEnter) {
      this._onEnter();
    } else if (this._onExit) {
      this._onExit();
    }
  }

  /**
   * @private
   * @description - Handle FullscreenError event callback
   * @param {Object} event
   */
  _onFullscreenError (event) {
    Logger.error('Fullscreen API: Error occured on element:', this._container);
  }

  /**
   * @public
   * @description - Check if container is currently in fullscreen
   * @returns {boolean}
   */
  isFullscreen () {
    return !!document.webkitFullscreenElement ||
      !!document.mozFullScreenElement ||
      !!document.msFullscreenElement ||
      !!document.fullscreenElement;
  }

  /**
   * @public
   * @description - Remove all event listeners and destroy all references
   */
  destroy () {
    this._removeFullscreenListeners();
    delete this._pointer;

    this._container = null;
    this._onEnter = null;
    this._onExit = null;
  }
}
