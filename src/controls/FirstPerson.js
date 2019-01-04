// FirstPerson Mode Controls

// Based on three.js PointerLockControls:
// https://threejs.org/examples/js/controls/PointerLockControls.js

import { Object3D } from 'three/src/core/Object3D';
import { Vector3 } from 'three/src/math/Vector3';
import { Euler } from 'three/src/math/Euler';

import PointerLock from 'managers/PointerLock';

const PI_2 = Math.PI / 2;

export default class FirstPerson {
  constructor (camera, container, height = 10) {
    this.rotation = new Euler(0, 0, 0, 'YXZ');
    this.direction = new Vector3(0, 0, -1);

    this.pitch = new Object3D();
    this.yaw = new Object3D();

    this.yaw.position.y = height;
    this.verticalLock = PI_2;
    this.enabled = false;
    this.speed = 0.002;

    this.pitch.add(camera);
    this.yaw.add(this.pitch);

    this.enable = () => this.pointer.togglePointerLock();
    this.disable = () => this.pointer.togglePointerLock();

    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.pointer = new PointerLock(container, this.onEnabled.bind(this), this.onDisabled.bind(this));
  }

  onMouseMove (event) {
    if (!this.enabled) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yaw.rotation.y -= movementX * this.speed;
    this.pitch.rotation.x -= movementY * this.speed;
    this.pitch.rotation.x = Math.max(-this.verticalLock, Math.min(this.verticalLock, this.pitch.rotation.x));
  }

  onEnabled () {
    this.enabled = true;

    if (this.activated) {
      this.activated();
    }
  }

  onDisabled () {
    this.enabled = false;

    if (this.deactivated) {
      this.deactivated();
    }
  }

  get currentDirection () {
    const currentDirection = new Vector3().normalize();

    this.rotation.set(this.pitch.rotation.x, this.yaw.rotation.y, 0);
    currentDirection.copy(this.direction).applyEuler(this.rotation);
    return currentDirection;
  }

  get yawObject () {
    return this.yaw;
  }

  destroy () {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.enabled = false;
  }
}
