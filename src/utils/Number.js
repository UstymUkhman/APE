/**
 * @description - smooth Hermite interpolation function
 * @param {number} from - lower edge of the Hermite function
 * @param {number} to - upper edge of the Hermite function
 * @param {number} value - source value for interpolation
 * @returns {number} current value of interpolation
 */
const smoothstep = (from, to, value) => {
  return Math.max(0, Math.min(1, (value - from) / (to - from)));
};

/**
 * @description - random number in range
 * @param {number} min - lower edge bound (inclusive)
 * @param {number} max - upper edge bound (exclusive)
 * @returns {number} random number
 */
const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * @description - constrain a value in range
 * @param {number} value - value to constrain
 * @param {number} min @default 0 - lower edge bound
 * @param {number} max @default 1 - upper edge bound
 * @returns {number} new value constrained in given range
 */
const clamp = (value, min = 0, max = 1) => {
  return Math.max(min, Math.min(value, max));
};

/**
 * @description - lerp interpolation function
 * @param {number} from - start value of interpolation
 * @param {number} to - target value of interpolation
 * @param {number} delta - value between 0 and 1 of interpolation
 * @returns {number} current value of interpolation
 */
const lerp = (from, to, delta) => {
  return from + delta * (to - from);
};

/**
 * @description - map a value in range
 * @param {number} value - number to map
 * @param {number} min @default 0 - lower edge bound
 * @param {number} max @default 1 - upper edge bound
 * @returns {number} new value in given range
 */
const map = (value, min = 0, max = 1) => {
  return clamp((value - min) / (max - min), 0, 1);
};

/**
 * @description - linear interpolation function
 * @param {number} from - start value of interpolation
 * @param {number} to - target value of interpolation
 * @param {number} delta - value between 0 and 1 of interpolation
 * @returns {number} current value of interpolation
 */
const mix = (from, to, delta) => {
  return from * (1 - delta) + to * delta;
};

export {
  smoothstep,
  random,
  clamp,
  lerp,
  map,
  mix
};
