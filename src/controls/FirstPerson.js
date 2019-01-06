// FirstPerson Mode Controls

// Based on three.js PointerLockControls:
// https://threejs.org/examples/js/controls/PointerLockControls.js

// import { Raycaster } from 'three/src/core/Raycaster';
import { Object3D } from 'three/src/core/Object3D';
import { Clock } from 'three/src/core/Clock';

import { Vector3 } from 'three/src/math/Vector3';
import { Euler } from 'three/src/math/Euler';

import * as controls from './playerControls.json';
import PointerLock from 'managers/PointerLock';

const PI_2 = Math.PI / 2;

export default class FirstPerson {
  constructor (camera, container, height = 1.75) {
    // this.raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, height);
    this.rotation = new Euler(0, 0, 0, 'YXZ');
    this.direction = new Vector3(0, 0, -1);
    this.velocity = new Vector3();

    this.pitch = new Object3D();
    this.yaw = new Object3D();
    this.clock = new Clock();

    this.yaw.position.y = height;
    this.normalHeight = height;
    this.verticalLock = PI_2;
    this.enabled = false;
    this.speed = 0.002;

    this.move = {
      backward: false,
      forward: false,
      right: false,
      left: false,
      jump: false,
      run: 1.0
    };

    this.pitch.add(camera);
    this.yaw.add(this.pitch);

    this.addControlsListeners();

    this.enable = () => this.pointer.togglePointerLock();
    this.disable = () => this.pointer.togglePointerLock();

    this.pointer = new PointerLock(container, this.onEnabled.bind(this), this.onDisabled.bind(this));
  }

  addControlsListeners () {
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    document.addEventListener('keyup', this.onKeyUp.bind(this), false);
  }

  removeControlsListeners () {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.removeEventListener('keydown', this.onKeyDown.bind(this), false);
    document.removeEventListener('keyup', this.onKeyUp.bind(this), false);
  }

  onMouseMove (event) {
    if (!this.enabled) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yaw.rotation.y -= movementX * this.speed;
    this.pitch.rotation.x -= movementY * this.speed;
    this.pitch.rotation.x = Math.max(-this.verticalLock, Math.min(this.verticalLock, this.pitch.rotation.x));
  }

  onKeyDown (event) {
    this.keyHandler(event.keyCode, true);

    if (event.keyCode === controls.jump.code && !this.move.jump) {
      this.velocity.y = controls.jump.step;
      this.move.jump = true;
    }
  }

  onKeyUp (event) {
    this.keyHandler(event.keyCode, false);
  }

  keyHandler (code, pressed) {
    switch (code) {
      case controls.run.code:
        this.move.run = pressed ? controls.run.speed : 1.0;
        break;

      case controls.forward.code:
        this.move.forward = pressed;
        break;

      case controls.backward.code:
        this.move.backward = pressed;
        break;

      case controls.left.code:
        this.move.left = pressed;
        break;

      case controls.right.code:
        this.move.right = pressed;
        break;
    }
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

  update (/* objects */) {
    const delta = this.clock.getDelta();
    if (!this.enabled) return;

    // Set correct y position when on object:
    /* this.raycaster.ray.origin.copy(this.yaw.position);
    this.raycaster.ray.origin.y -= this.normalHeight; */

    let x = 0;
    let y = 0;
    let z = 0;

    this.velocity.x -= this.velocity.x * controls.horizontalSpeed * delta;
    this.velocity.z -= this.velocity.z * controls.verticalSpeed * delta;
    this.velocity.y -= 9.8 * controls.jump.speed * delta;

    if (this.move.backward) z = controls.backward.step * delta;
    if (this.move.forward) z = controls.forward.step * -delta;
    if (this.move.right) x = controls.right.step * delta;
    if (this.move.left) x = controls.left.step * -delta;

    // Set correct y position when on object:
    /* if (this.raycaster.intersectObjects(objects).length) {
      this.velocity.y = Math.max(0, this.velocity.y);
    } */

    this.velocity.x += x * this.move.run;
    this.velocity.z += z * this.move.run;

    x = this.velocity.x * delta;
    y = this.velocity.y * delta;
    z = this.velocity.z * delta;

    this.yaw.translateX(x);
    this.yaw.translateY(y);
    this.yaw.translateZ(z);

    if (this.yaw.position.y < this.normalHeight) {
      this.yaw.position.y = this.normalHeight;
      this.move.jump = false;
      this.velocity.y = 0;
    }
  }

  destroy () {
    this.removeControlsListeners();
    this.enabled = false;
  }
}
