// FBXAnimations Manager

import Logger from 'utils/Logger';
import isArray from 'lodash/isArray';
import findIndex from 'lodash/findIndex';

require('three/examples/js/loaders/FBXLoader.js');

export default class FBXAnimations {
  constructor (fbxAnimations) {
    const animations = isArray(fbxAnimations) ? fbxAnimations : [fbxAnimations];
    const loader = new THREE.FBXLoader();

    this.total = animations.length;
    this.clock = new THREE.Clock();
    this.mixer = null;
    this.loaded = 0;
    this.fbx = null;

    this.animations = [];
    this.settings = [];
    this.actions = [];

    for (let a in animations) {
      animations[a].loop = animations[a].loop || THREE.LoopOnce;
      animations[a].play = animations[a].play || false;

      if (animations[a].shadows === undefined) {
        animations[a].shadows = true;
      }

      loader.load(animations[a].path,
        this.onLoad.bind(this, animations[a])
      );
    }
  }

  onLoad (settings, fbx) {
    fbx.mixer = new THREE.AnimationMixer(fbx);

    const action = fbx.mixer.clipAction(fbx.animations[0]);
    const duration = fbx.animations[0].duration * 1000;
    const speed = duration / action.timeScale;

    if (settings.loop !== true) {
      action.clampWhenFinished = true;
      action.setLoop(settings.loop);
    }

    this.animations.push(fbx.animations[0]);
    action.name = settings.name;
    this.actions.push(action);
    this.loaded++;

    if (this.loaded === this.total) {
      this.fbx.animations = this.animations;
    }

    if (this.loaded === 1) {
      this.mixer = fbx.mixer;
      this.fbx = fbx;
    }

    this.settings.push({
      isPlaying: settings.play,
      onLoop: settings.onLoop,
      onEnd: settings.onEnd,
      loop: settings.loop,
      name: settings.name,
      duration: duration,
      speed: speed
    });

    if (typeof settings.onLoop === 'function') {
      this.fbx.mixer.addEventListener('loop', this.onAnimationLoop.bind(this));
    }

    if (typeof settings.onEnd === 'function') {
      this.fbx.mixer.addEventListener('finished', this.onAnimationEnd.bind(this));
    }

    if (typeof settings.onLoad === 'function') {
      settings.onLoad(this.fbx, action);
    }

    if (settings.shadows) {
      this.fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    if (settings.play) {
      action.play();
    }
  }

  enable (name) {
    const index = this.getAnimationIndex(name);

    this.settings[index].isPlaying = false;
    this.actions[index].enabled = true;
    this.actions[index].paused = true;
  }

  disable (name) {
    const index = this.getAnimationIndex(name);

    this.actions[index].enabled = false;
    this.stop(name);
  }

  play (name) {
    const index = this.getAnimationIndex(name);

    this.settings[index].isPlaying = true;
    this.actions[index].paused = false;
    this.actions[index].play();
  }

  pause (name, stop = false) {
    const index = this.getAnimationIndex(name);

    this.settings[index].isPlaying = false;
    this.actions[index].paused = true;

    if (stop) {
      this.actions[index].stop();
    }
  }

  stop (name) {
    this.pause(name, true);
  }

  stopAll () {
    for (let s in this.settings) {
      this.settings[s].isPlaying = false;
      this.actions[s].paused = true;
      this.actions[s].stop();
    }
  }

  isPlaying (name) {
    const index = this.getAnimationIndex(name);
    return this.settings[index].isPlaying;
  }

  setDuration (name, duration) {
    const index = this.getAnimationIndex(name);

    this.settings[index].speed = duration / this.actions[index].timeScale;
    this.actions[index].setDuration(duration);
  }

  setRepetitions (name, repetitions) {
    const index = this.getAnimationIndex(name);
    this.actions[index].repetitions = repetitions;
  }

  onAnimationLoop (event) {
    const name = event.action.name;
    const index = this.getAnimationIndex(name);

    Logger.info(`FBXAnimations Manager: \"${name}\" animation restarted loop with callback.`);

    if (this.settings[index] && typeof this.settings[index].onLoop === 'function') {
      this.settings[index].onLoop(event);
    }
  }

  onAnimationEnd (event) {
    const name = event.action.name;
    const index = this.getAnimationIndex(name);

    Logger.info(`FBXAnimations Manager: \"${name}\" animation ended with callback.`);

    // if (this.settings[index].loop === THREE.LoopOnce) {
    //   this.stop(name);
    // }

    if (typeof this.settings[index].onEnd === 'function') {
      this.settings[index].onEnd(event);
    }
  }

  update () {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
  }

  getAnimationIndex (name) {
    return findIndex(this.settings, {'name': name});
  }
}
