import { lerp } from 'utils/lerp';

export default class LerpAnimation {
  constructor () {
    this.animations = [];
  }

  animateNumber (options) {
    this.animations.push({
      from: options.from || options.propriety[options.value],
      onComplete: options.onComplete || null,
      duration: options.duration,
      prop: options.propriety,
      value: options.value,
      isPlaying: false,
      to: options.to,
    });
  }

  // animateVector2 () {
      
  // }

  // animateVector3 () {
      
  // }

  play () {
    this.end = Date.now() + this.duration;

    for (let a in this.animations) {
      this.animations[a].isPlaying = true;
    }
  }

  pause () {
    for (let a in this.animations) {
      const val = this.animations[a].value;

      this.animations[a].from = this.animations[a].prop[val];
      this.animations[a].isPlaying = false;
    }
  }

  update () {
    for (let a = 0; a < this.animations.length && this.animations[a].isPlaying; a++) {
      const val = this.animations[a].value;
      this.animations[a].prop[val] = lerp(this.animations[a].from, this.animations[a].to, this.delta);

      if (this.delta === 0.0 && this.animations[a].onComplete) {
        this.animations[a].onComplete();
        break;
      }
    }
  }

  get delta () {
    const passed = this.end - Date.now();
    return (this.duration - Math.max(passed, 0)) / this.duration;
  }
}
