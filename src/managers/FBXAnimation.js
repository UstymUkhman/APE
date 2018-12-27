import { lerp } from 'utils/lerp';
require('three/examples/js/loaders/FBXLoader.js');

export default class FBXAnimation {
  constructor (path, onLoad, playOnLoad = false, shadows = true) {
    const loader = new THREE.FBXLoader();
    this.clock = new THREE.Clock();

    this.playing = false;
    this.objects = [];
    this.mixers = [];

    loader.load(path, (fbx) => {
      fbx.mixer = new THREE.AnimationMixer(fbx);
      this.mixers.push(fbx.mixer);

      this.action = fbx.mixer.clipAction(fbx.animations[0]);
      this.action.clampWhenFinished = true;
      this.action.setLoop(THREE.LoopOnce);

      this.duration = fbx.animations[0].duration * 1000;
      this.timeScale = this.action.timeScale;
      this.speed = this.duration / this.timeScale;

      if (typeof onLoad === 'function') {
        onLoad(fbx, this.action);
      }

      if (shadows) {
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }

      if (playOnLoad) {
        this.playing = true;
        this.action.play();
      }
    });
  }

  animate (propriety, value, to, from = null) {
    this.objects.push({
      from: from || propriety[value],
      prop: propriety,
      value: value,
      to: to
    });
  }

  setDuration (duration) {
    this.action.setDuration(duration);
  }

  play () {
    if (this.objects.length) {
      this.end = Date.now() + this.duration;
    }

    this.action.paused = false;
    this.playing = true;
    this.action.play();
  }

  pause () {
    this.action.paused = true;
    this.playing = false;

    for (let o in this.objects) {
      const val = this.objects[o].value;
      this.objects[o].from = this.objects[o].prop[val];
    }
  }

  stop () {
    this.action.stop();
    this.pause();
  }

  update () {
    const delta = this.clock.getDelta();

    if (this.playing) {
      for (let m in this.mixers) {
        this.mixers[m].update(delta);
      }

      for (let o in this.objects) {
        const val = this.objects[o].value;
        this.objects[o].prop[val] = lerp(this.objects[o].from, this.objects[o].to, this.delta);
      }
    }
  }

  get delta () {
    const passed = this.end - Date.now();
    return (this.duration - Math.max(passed, 0)) / this.duration;
  }

  isPlaying () {
    return this.playing;
  }
}
