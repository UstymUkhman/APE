// FBXAnimation base

import { AnimationMixer } from 'three/src/animation/AnimationMixer';
import { LoopOnce, LoopRepeat } from 'three/src/constants.js';

require('three/examples/js/loaders/FBXLoader.js');

export default class FBXAnimation {
  constructor (settings) {
    const loader = new THREE.FBXLoader();
    settings.play = settings.play || false;

    if (settings.shadows === undefined) {
      settings.shadows = true;
    }

    loader.load(
      settings.path,
      this.onLoad.bind(this, settings)
    );
  }

  onLoad (settings, fbx) {
    const loop = settings.loop ? LoopRepeat : LoopOnce;
    const mixer = new AnimationMixer(fbx);
    const animation = fbx.animations[0];

    this.action = mixer.clipAction(animation);
    this.action.name = settings.name;
    this.action.setLoop(loop);

    if (settings.loop !== true) {
      this.action.clampWhenFinished = true;
    }

    const duration = animation.duration * 1000;
    const speed = duration / this.action.timeScale;

    this.settings = {
      onLoad: settings.loadCallback || settings.onLoad,
      onLoop: settings.loopCallback || settings.onLoop,
      onEnd: settings.endCallback || settings.onEnd,
      isPlaying: settings.play,
      loop: settings.loop,
      name: settings.name,
      duration: duration,
      speed: speed
    };

    if (typeof this.settings.onLoad === 'function') {
      this.settings.onLoad(fbx, mixer);
    }

    if (typeof this.settings.onLoop === 'function') {
      mixer.addEventListener('loop', (event) => {
        this.settings.onLoop(fbx);
      });
    }

    if (typeof this.settings.onEnd === 'function') {
      mixer.addEventListener('finished', (event) => {
        this.settings.onEnd(fbx);
      });
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
      this.action.play();
    }
  }

  /* enable () {
    this.settings.isPlaying = false;
    this.action.enabled = true;
    this.action.paused = true;
  } */

  /* disable () {
    this.action.enabled = false;
    this.stop();
  } */

  play () {
    this.settings.isPlaying = true;
    this.action.paused = false;
    this.action.play();
  }

  pause (stop = false) {
    this.settings.isPlaying = false;
    this.action.paused = true;

    if (stop) {
      this.action.stop();
    }
  }

  stop () {
    this.pause(true);
  }

  set duration (duration) {
    this.settings.speed = duration / this.action.timeScale;
    this.action.setDuration(duration);
  }

  get duration () {
    return this.action.duration;
  }

  set repetitions (repetitions) {
    this.action.repetitions = repetitions;
  }

  get repetitions () {
    return this.action.repetitions;
  }

  get isPlaying () {
    return this.settings.isPlaying;
  }

  get name () {
    return this.settings.name;
  }
}
