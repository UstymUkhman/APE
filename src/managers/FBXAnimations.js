// FBXAnimations Manager

import { Clock } from 'three/src/core/Clock';

import FBXAnimation from 'core/FBXAnimation';
import findIndex from 'lodash/findIndex';

export default class FBXAnimations {
  constructor (animations) {
    this.totalAnimations = animations.length;
    this.clock = new Clock();

    this.loadedAnimations = 0;
    this.animations = [];

    this.mixer = null;
    this.fbx = null;

    for (let a in animations) {
      const animation = animations[a];

      animation.loopCallback = this._onLoop.bind(this, animation.onLoop);
      animation.loadCallback = this._onLoad.bind(this, animation.onLoad);
      // animation.endCallback = this._onEnd.bind(this, animation.onEnd);

      this.animations.push(new FBXAnimation(animation));
    }
  }

  _onLoad (onLoad, fbx, mixer) {
    if (!this.loadedAnimations) {
      this.mixer = mixer;
      this.fbx = fbx;
    }

    if (typeof onLoad === 'function') {
      onLoad(this.fbx);
    }

    this.loadedAnimations++;

    // if (this.loadedAnimations === this.totalAnimations) {
    //   this.animationsLoadedCallback();
    // }
  }

  _onLoop (onLoop, fbx) {
    if (typeof onLoop === 'function') {
      onLoop(this.fbx);
    }
  }

  _onEnd (onEnd, fbx) {
    if (typeof onEnd === 'function') {
      onEnd(this.fbx);
    }
  }

  play (name) {
    const index = this.getAnimationIndex(name);
    this.animations[index].play();
  }

  pause (name) {
    const index = this.getAnimationIndex(name);
    this.animations[index].pause();
  }

  update () {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
  }

  getAnimationIndex (name) {
    return findIndex(this.animations, {'name': name});
  }

  get model () {
    return this.fbx;
  }
}
