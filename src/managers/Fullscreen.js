// Fullscreen API Manager

import PointerLock from 'managers/PointerLock';
import Logger from 'utils/Logger';

export default class Fullscreen {
  /*
   * @param {DOM Element} container - element that goes in fullscreen
   * @param {function} [onEnter] - callback when enter fullscreen
   * @param {function} [onExit] - callback when exit fullscreen
   * @param {boolean} [lock] - use PointerLock APIs when enter|exit fullscreen
   */
  constructor (container, onEnter = null, onExit = null, lock = false) {
    this.container = container;
    this.onEnter = onEnter;
    this.onExit = onExit;
    this.lock = lock;
    this.init();
  }

  /*
   * Unify Fullscreen API
   */
  init () {
    const requestFullscreen =
      this.container.requestFullscreen ||
      this.container.msRequestFullscreen ||
      this.container.mozRequestFullScreen ||
      this.container.webkitRequestFullscreen;

    document.exitFullscreen =
      document.exitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitCancelFullScreen;

    if (requestFullscreen) {
      if (this.lock && this.handlePointerLockEvent()) {
        this.toggleFullscreen = this.pointer.togglePointerLock.bind(this);
        return;
      }

      this._onFullscreenChange = this.onFullscreenChange.bind(this);
      this._onFullscreenError = this.onFullscreenError.bind(this);
      this.toggleFullscreen = this.onFullscreen.bind(this);

      this.container.requestFullscreen = requestFullscreen;
      this.addFullscreenListeners();
    } else {
      Logger.error(
        'This browser does not support Fullscreen API:',
        'https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API#Browser_compatibility'
      );
    }
  }

  /*
   * Call requestPointerLock and exitPointerLock events on requestFullscreen
   * and exitFullscreen if possible, otherwise use only PointerLock APIs
   * @returns {boolean} - check if browser support one event at a time
   */
  handlePointerLockEvent () {
    const lockOnly = PointerLock.isLockOnly;

    if (lockOnly) {
      Logger.warn(
        'This browser can\'t handle both Fullscreen and PointerLock on single event.',
        'You should call separately `toggleFullscreen` and `togglePointerLock` or use only PointerLock Manager.'
      );
      this.pointer = new PointerLock(this.container, this.onEnter, this.onExit);
    } else {
      this.pointer = new PointerLock(this.container);
    }

    return lockOnly;
  }

  /*
   * Add FullscreenChange & FullscreenError event listeners
   */
  addFullscreenListeners () {
    document.addEventListener('webkitfullscreenchange', this._onFullscreenChange, false);
    document.addEventListener('mozfullscreenchange', this._onFullscreenChange, false);
    document.addEventListener('msfullscreenchange', this._onFullscreenChange, false);
    document.addEventListener('fullscreenchange', this._onFullscreenChange, false);

    document.addEventListener('webkitfullscreenerror', this._onFullscreenError, false);
    document.addEventListener('mozfullscreenerror', this._onFullscreenError, false);
    document.addEventListener('msfullscreenerror', this._onFullscreenError, false);
    document.addEventListener('fullscreenerror', this._onFullscreenError, false);
  }

  /*
   * Remove FullscreenChange & FullscreenError event listeners
   */
  removeFullscreenListeners () {
    document.removeEventListener('webkitfullscreenchange', this._onFullscreenChange, false);
    document.removeEventListener('mozfullscreenchange', this._onFullscreenChange, false);
    document.removeEventListener('msfullscreenchange', this._onFullscreenChange, false);
    document.removeEventListener('fullscreenchange', this._onFullscreenChange, false);

    document.removeEventListener('webkitfullscreenerror', this._onFullscreenError, false);
    document.removeEventListener('mozfullscreenerror', this._onFullscreenError, false);
    document.removeEventListener('msfullscreenerror', this._onFullscreenError, false);
    document.removeEventListener('fullscreenerror', this._onFullscreenError, false);

    // Destroy PointerLock event listeners if its APIs were used:
    if (this.pointer) this.pointer.destroy();
  }

  /*
   * requestFullscreen and exitFullscreen events
   */
  onFullscreen () {
    if (!this.isFullscreen()) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

    if (this.lock) {
      this.pointer.onPointerLock();
    }
  }

  /*
   * Handle FullscreenChange event callbacks
   */
  onFullscreenChange (event) {
    const isFullscreen = this.isFullscreen();
    Logger.info(`Fullscreen API: ${isFullscreen ? 'entered in' : 'exited from'} fullscreen mode.`);

    if (isFullscreen && this.onEnter) {
      this.onEnter();
    } else if (this.onExit) {
      this.onExit();
    }
  }

  /*
   * Handle FullscreenError event
   */
  onFullscreenError (event) {
    Logger.error('Fullscreen API: Error occured on element:', this.container);
  }

  /*
   * Check if container is currently in fullscreen
   * @returns {boolean}
   */
  isFullscreen () {
    return !!document.webkitFullscreenElement ||
      !!document.mozFullScreenElement ||
      !!document.msFullscreenElement ||
      !!document.fullscreenElement;
  }

  /*
   * Remove all event listeners and destroy all references
   */
  destroy () {
    this.removeFullscreenListeners();
    delete this.pointer;

    this.container = null;
    this.onEnter = null;
    this.onExit = null;
  }
}
