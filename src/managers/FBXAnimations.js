// FBXAnimations Manager

import Logger from 'utils/Logger';
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
    this.clips = [];

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

    if (settings.name === 'walk') {
      this.clips.push(fbx.animations[0]);
      this.clips.push(fbx.animations[1]);
    }

    const action = fbx.mixer.clipAction(fbx.animations[0]);
    const duration = fbx.animations[0].duration * 1000;
    const speed = duration / action.timeScale;

    // console.log(fbx.animations);

    action.name = settings.name;

    if (settings.loop !== true) {
      action.clampWhenFinished = true;
      action.setLoop(settings.loop);
    }

    this.mixers.push(fbx.mixer);
    this.actions.push(action);

    if (settings.name === 'samba' && this.clips.length) {
      fbx.animations.push(this.clips[0]);
      fbx.animations.push(this.clips[1]);

      const act = fbx.mixer.clipAction(this.clips[0]);

      act.name = '__walk';

      if (settings.loop !== true) {
        act.clampWhenFinished = true;
        act.setLoop(settings.loop);
      }

      this.actions.push(act);
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
      fbx.mixer.addEventListener('loop', this.onAnimationLoop.bind(this));
    }

    if (typeof settings.onEnd === 'function') {
      fbx.mixer.addEventListener('finished', this.onAnimationEnd.bind(this));
    }

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
