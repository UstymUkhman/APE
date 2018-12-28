// FBXAnimations Manager

import isArray from 'lodash/isArray';
import findIndex from 'lodash/findIndex';

require('three/examples/js/loaders/FBXLoader.js');

export default class FBXAnimations {
  constructor (fbxAnimations) {
    const animations = isArray(fbxAnimations) ? fbxAnimations : [fbxAnimations];
    const loader = new THREE.FBXLoader();
    this.clock = new THREE.Clock();

    this.settings = [];
    this.actions = [];
    this.mixers = [];

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

    action.clampWhenFinished = true;
    action.setLoop(settings.loop);
    action.name = settings.name;

    this.mixers.push(fbx.mixer);
    this.actions.push(action);

    this.settings.push({
      isPlaying: settings.play,
      name: settings.name,
      duration: duration,
      speed: speed
    });

    if (typeof settings.onLoad === 'function') {
      settings.onLoad(fbx, action);
    }

    if (settings.shadows) {
      fbx.traverse((child) => {
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

  setDuration (name, duration) {
    const index = this.getAnimationIndex(name);

    this.settings[index].speed = duration / this.actions[index].timeScale;
    this.actions[index].setDuration(duration);
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

  update () {
    const delta = this.clock.getDelta();

    for (let m in this.mixers) {
      if (this.settings[m].isPlaying) {
        this.mixers[m].update(delta);
      }
    }
  }

  getAnimationIndex (name) {
    return findIndex(this.settings, {'name': name});
  }
}
